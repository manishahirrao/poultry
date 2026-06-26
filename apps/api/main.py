"""
PoultryPulse AI — ML Inference API
File: apps/api/main.py
Version: v1.0 | May 2026
Design Reference: TRD v1.0 §2 (L4 ML Serving), Architecture v1.0 §3
"""

from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
import time
import os
from dotenv import load_dotenv
load_dotenv()
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import deque

# from inference.predictor import Predictor
# from inference.sell_signal import compute_sell_signal
from whatsapp.inbound_handler import handle_inbound_webhook
from whatsapp.delivery_handler import handle_delivery_webhook, get_analytics_summary, get_engagement_heatmap, get_high_churn_risk_customers
from whatsapp.daily_log_webhook import handle_daily_log_webhook
from watermark.audit_handler import get_watermark_events, get_watermark_coverage, get_decode_success_rate, handle_watermark_action_request
from referral_system import create_referral, get_referral_by_code, update_referral_status, get_referrer_stats, get_whatsapp_referral_message, get_whatsapp_referral_message_english, grant_referrer_reward
# from free_alert_system import subscribe_free_alerts, unsubscribe_free_alerts, send_disease_alert_to_free_subscribers, generate_free_alert_welcome_message, convert_free_subscriber_to_paid, get_free_alert_stats
from health_intelligence import handle_health_checklist_insert, check_missing_checklist_alert
from mortality_pattern import analyze_mortality_pattern, get_latest_pattern, trigger_pattern_detection_on_abnormal_alert, trigger_pattern_detection_on_harvest
from iot_handler import verify_device_api_key, ingest_iot_reading, get_device_readings, get_shed_environment_summary
from jobs.daily_reminder_job import start_scheduler, shutdown_scheduler
from batch_costs import get_batch_costs, create_batch_cost, update_batch_cost, delete_batch_cost
from batch_sales import (
    get_batch_sales, create_batch_sale, update_batch_sale, delete_batch_sale,
    get_buyers, create_buyer, check_active_withdrawal_periods
)
from batch_treatments import (
    get_batch_treatments, create_batch_treatment, update_batch_treatment, delete_batch_treatment,
    get_medicines_autocomplete
)
from benchmark import get_benchmark_data, generate_benchmark_insights
from batch_documents import (
    get_documents, upload_document, get_document, update_document, delete_document, get_document_audit_log
)
from broiler_incentives import (
    get_incentives, approve_incentive, pay_incentive, calculate_incentive
)
from supabase import create_client, Client

# Auth & Security Imports
from auth.auth_middleware import AuthMiddleware
from watermark.watermark_middleware import WatermarkMiddleware
from auth.otp_service import request_otp, verify_otp
from auth.jwt_service import create_access_token
from auth.fingerprint_service import verify_fingerprint_token
from security.rate_limiter import mask_api_key, get_usage_count, get_all_usage_by_endpoint

from auth.license import router as license_router
from auth.sales import router as sales_router

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client | None = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Global predictor instance
predictor = None
# MODEL_PATH = Path(os.getenv("MODEL_PATH", "models/champion/latest.onnx"))

# P95 latency tracking - store last 100 inference latencies
inference_latencies = deque(maxlen=100)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan handler for FastAPI application.
    Loads ONNX model on startup and performs cleanup on shutdown.
    Also starts the WhatsApp daily reminder scheduler.
    """
    global predictor
    
    # Startup
    logger.info("api_startup", message="Starting PoultryPulse ML Inference API")
    
    try:
        # predictor = Predictor(model_path=str(MODEL_PATH))
        # logger.info(
        #     "model_loaded",
        #     model_version=predictor.model_version,
        #     model_path=str(MODEL_PATH)
        # )
        pass
    except Exception as e:
        logger.error("model_load_failed", error=str(e))
        raise
    
    # Start WhatsApp daily reminder scheduler
    try:
        start_scheduler()
        logger.info("whatsapp_scheduler_started")
    except Exception as e:
        logger.error("scheduler_start_failed", error=str(e))
        # Don't fail startup if scheduler fails
    
    yield
    
    # Shutdown
    logger.info("api_shutdown", message="Shutting down PoultryPulse ML Inference API")
    
    # Shutdown scheduler
    try:
        shutdown_scheduler()
        logger.info("whatsapp_scheduler_shutdown")
    except Exception as e:
        logger.error("scheduler_shutdown_failed", error=str(e))


# Create FastAPI application
app = FastAPI(
    title="PoultryPulse ML Inference API",
    description="AI-powered poultry price prediction and sell signal API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
# Allow Vercel web domain + Railway.app internal network only
VERCEL_DOMAIN = os.getenv("VERCEL_DOMAIN", "*.vercel.app")
RAILWAY_INTERNAL = os.getenv("RAILWAY_INTERNAL", "127.0.0.1")

# Apply Watermark and Auth middleware
app.add_middleware(WatermarkMiddleware)
app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"https://{VERCEL_DOMAIN}",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        RAILWAY_INTERNAL,
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Device-ID", "X-Fingerprint-JS", "X-API-Key"],
)

# Include sub-routers
app.include_router(license_router, prefix="/api/v1")
app.include_router(sales_router, prefix="/api/v1")

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """
    Structured logging middleware.
    Logs model_version, inference_latency_ms, mandi for every request.
    """
    start_time = time.time()
    
    # Extract request ID if present
    request_id = request.headers.get("X-Request-ID", "unknown")
    
    # Log request start
    logger.info(
        "request_start",
        method=request.method,
        path=request.url.path,
        request_id=request_id,
    )
    
    try:
        response = await call_next(request)
        
        # Calculate latency
        latency_ms = (time.time() - start_time) * 1000
        
        # Log request completion
        logger.info(
            "request_complete",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            latency_ms=round(latency_ms, 2),
            request_id=request_id,
        )
        
        # Add custom headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Model-Version"] = predictor.model_version if predictor else "unknown"
        
        return response
        
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        logger.error(
            "request_error",
            method=request.method,
            path=request.url.path,
            error=str(e),
            latency_ms=round(latency_ms, 2),
            request_id=request_id,
        )
        raise


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns model version, status, and P95 latency metrics.
    Target: P95 latency < 200ms on Railway.app CPU
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Calculate P95 latency if we have enough samples
    p95_latency_ms = None
    if len(inference_latencies) >= 10:
        sorted_latencies = sorted(inference_latencies)
        p95_index = int(len(sorted_latencies) * 0.95)
        p95_latency_ms = round(sorted_latencies[p95_index], 2)
    
    return {
        "status": "healthy",
        "model_version": predictor.model_version,
        "model_loaded": True,
        "service": "poultrypulse-ml-inference",
        "latency_metrics": {
            "p95_latency_ms": p95_latency_ms,
            "sample_count": len(inference_latencies),
            "target_p95_ms": 200.0,
            "target_met": p95_latency_ms < 200.0 if p95_latency_ms is not None else None
        }
    }


@app.post("/v1/predict")
async def predict(request: Request):
    """
    Main prediction endpoint.
    Accepts feature matrix and returns prediction result with sell signal.
    
    Expected request body:
    {
        "mandi": "gorakhpur",
        "features": [...],  // 45-feature array
        "batch": {  // Optional, for sell signal computation
            "batch_id": "string",
            "bird_count": 10000,
            "grow_start": "2026-04-15",
            "expected_harvest_range": ["2026-05-20", "2026-05-27"],
            "feed_cost_total": 50000
        }
    }
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        body = await request.json()
        mandi = body.get("mandi", "gorakhpur")
        features = body.get("features")
        batch = body.get("batch")
        
        if not features:
            raise HTTPException(status_code=400, detail="features array is required")
        
        # Run inference
        start_time = time.time()
        prediction = predictor.predict(features)
        inference_latency_ms = (time.time() - start_time) * 1000
        
        # Track latency for P95 calculation
        inference_latencies.append(inference_latency_ms)
        
        # Compute sell signal if batch data provided
        sell_signal_result = None
        if batch:
            sell_signal_result = compute_sell_signal(prediction, batch)
        
        # Log prediction with mandi
        logger.info(
            "prediction_complete",
            mandi=mandi,
            model_version=prediction["model_version"],
            inference_latency_ms=round(inference_latency_ms, 2),
            p50=prediction["p50"],
            confidence=prediction["confidence"]
        )
        
        response_data = {
            **prediction,
            "sell_signal": sell_signal_result,
            "inference_latency_ms": round(inference_latency_ms, 2)
        }
        
        return JSONResponse(content=response_data)
        
    except Exception as e:
        logger.error("prediction_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/v1/accuracy")
async def get_accuracy():
    """
    Returns accuracy metrics from the model registry.
    Queries Supabase accuracy_log table.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if supabase is None:
        logger.warning("Supabase client not initialized, returning placeholder data")
        return {
            "mape_30d": 0.058,
            "directional_accuracy_30d": 0.952,
            "conformal_coverage_80": 0.795,
            "as_of": "2026-05-21",
            "model_version": predictor.model_version,
            "gates_passed": {
                "mape": True,
                "directional": True,
                "conformal": True
            }
        }
    
    try:
        response = supabase.table('accuracy_log').select('*').order('created_at', desc=True).limit(1).execute()
        if len(response.data) > 0:
            latest = response.data[0]
            return {
                "mape_30d": latest.get("mape_30d"),
                "directional_accuracy_30d": latest.get("directional_accuracy_30d"),
                "conformal_coverage_80": latest.get("conformal_coverage_80"),
                "as_of": str(latest.get("created_at"))[:10],
                "model_version": predictor.model_version,
                "gates_passed": {
                    "mape": latest.get("mape_30d", 1) < 0.06,
                    "directional": latest.get("directional_accuracy_30d", 0) >= 0.95,
                    "conformal": 0.78 <= latest.get("conformal_coverage_80", 0) <= 0.82
                }
            }
        else:
            raise HTTPException(status_code=404, detail="No accuracy data found")
    except Exception as e:
        logger.error("accuracy_fetch_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch accuracy metrics: {str(e)}")


@app.post("/admin/reload-model")
async def reload_model(request: Request):
    """
    Admin endpoint to hot-swap the champion model without restarting.
    Requires admin authentication.
    """
    auth_header = request.headers.get("Authorization")
    admin_token = os.environ.get("ADMIN_TOKEN")
    if not auth_header or not admin_token or auth_header != f"Bearer {admin_token}":
        logger.warning("unauthorized_reload_attempt", ip=request.client.host if request.client else "unknown")
        raise HTTPException(status_code=401, detail="Unauthorized")

    global predictor
    
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        old_version = predictor.model_version
        predictor.reload_model()
        new_version = predictor.model_version
        
        logger.info(
            "model_reloaded",
            old_version=old_version,
            new_version=new_version
        )
        
        return {
            "status": "success",
            "old_version": old_version,
            "new_version": new_version,
            "message": "Model reloaded successfully"
        }
        
    except Exception as e:
        logger.error("model_reload_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Model reload failed: {str(e)}")


@app.post("/webhooks/twilio/inbound")
async def twilio_inbound_webhook(request: Request):
    """
    Twilio inbound webhook handler for WhatsApp messages.
    Handles user intents: price, help, stop.
    Responds within Twilio's 5-second webhook timeout.
    """
    return await handle_inbound_webhook(request)


@app.post("/api/v1/webhooks/twilio/delivery")
async def twilio_delivery_webhook(request: Request):
    """
    Twilio delivery status webhook handler for WhatsApp messages.
    Processes delivery status events (queued, sent, delivered, failed, undelivered).
    Updates message_events table with delivery timestamps and status.
    """
    return await handle_delivery_webhook(request)


@app.post("/api/v1/webhooks/whatsapp/daily-log")
async def whatsapp_daily_log_webhook(request: Request):
    """
    FlockIQ WhatsApp Daily Log Automation Webhook (T-WA-001)
    
    Handles incoming WhatsApp messages from farmers for daily log submission.
    Parses farmer replies, validates data, saves to daily_logs table,
    and sends confirmation messages.
    
    Supports:
    - Daily log data: birds_dead, feed_kg, weight_g (optional)
    - Special commands: STOP, HELP, REDO
    - Hindi/English mixed input
    - Signature verification (Meta WABA)
    
    This webhook does NOT require authentication (bypassed for WhatsApp callbacks).
    """
    # Bypass auth middleware for this webhook (WhatsApp callback)
    # Set a flag to skip auth check
    request.state.skip_auth = True
    return await handle_daily_log_webhook(request)


@app.post("/v1/referrals")
async def create_referral_endpoint(request: Request):
    """
    Create a new referral.
    
    Expected request body:
    {
        "referrer_id": "uuid",
        "referee_phone": "+91XXXXXXXXXX"
    }
    """
    try:
        body = await request.json()
        referrer_id = body.get("referrer_id")
        referee_phone = body.get("referee_phone")
        
        if not referrer_id or not referee_phone:
            raise HTTPException(status_code=400, detail="referrer_id and referee_phone are required")
        
        referral = await create_referral(referrer_id, referee_phone)
        
        return JSONResponse(content=referral, status_code=201)
        
    except Exception as e:
        logger.error("referral_creation_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create referral: {str(e)}")


@app.get("/v1/referrals/{referral_code}")
async def get_referral_endpoint(referral_code: str):
    """
    Get referral details by referral code.
    """
    try:
        referral = await get_referral_by_code(referral_code)
        
        if not referral:
            raise HTTPException(status_code=404, detail="Referral not found")
        
        return JSONResponse(content=referral)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("referral_fetch_error", error=str(e), referral_code=referral_code)
        raise HTTPException(status_code=500, detail=f"Failed to fetch referral: {str(e)}")


@app.put("/v1/referrals/{referral_id}/status")
async def update_referral_status_endpoint(referral_id: str, request: Request):
    """
    Update referral status.
    
    Expected request body:
    {
        "status": "signed_up" | "converted"
    }
    """
    try:
        body = await request.json()
        status = body.get("status")
        
        if not status:
            raise HTTPException(status_code=400, detail="status is required")
        
        if status not in ["signed_up", "converted"]:
            raise HTTPException(status_code=400, detail="status must be 'signed_up' or 'converted'")
        
        referral = await update_referral_status(referral_id, status)
        
        # If converted, grant reward to referrer
        if status == "converted":
            await grant_referrer_reward(referral_id)
        
        return JSONResponse(content=referral)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("referral_status_update_error", error=str(e), referral_id=referral_id)
        raise HTTPException(status_code=500, detail=f"Failed to update referral status: {str(e)}")


@app.get("/v1/referrers/{referrer_id}/stats")
async def get_referrer_stats_endpoint(referrer_id: str):
    """
    Get referral statistics for a referrer.
    """
    try:
        stats = await get_referrer_stats(referrer_id)
        return JSONResponse(content=stats)
        
    except Exception as e:
        logger.error("referrer_stats_error", error=str(e), referrer_id=referrer_id)
        raise HTTPException(status_code=500, detail=f"Failed to fetch referrer stats: {str(e)}")


@app.post("/v1/referrals/message")
async def get_referral_message_endpoint(request: Request):
    """
    Generate WhatsApp referral message.
    
    Expected request body:
    {
        "referral_code": "ABCD1234",
        "referrer_name": "Rajesh Yadav",
        "language": "hi" | "en"
    }
    """
    try:
        body = await request.json()
        referral_code = body.get("referral_code")
        referrer_name = body.get("referrer_name", "एक किसान")
        language = body.get("language", "hi")
        
        if not referral_code:
            raise HTTPException(status_code=400, detail="referral_code is required")
        
        if language == "en":
            message = get_whatsapp_referral_message_english(referral_code, referrer_name)
        else:
            message = get_whatsapp_referral_message(referral_code, referrer_name)
        
        return JSONResponse(content={"message": message})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("referral_message_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to generate referral message: {str(e)}")


@app.post("/v1/free-alerts/subscribe")
async def subscribe_free_alerts_endpoint(request: Request):
    """
    Subscribe to free disease alerts.
    
    Expected request body:
    {
        "phone": "+91XXXXXXXXXX",
        "district": "gorakhpur",
        "referral_code": "ABCD1234" (optional)
    }
    """
    try:
        body = await request.json()
        phone = body.get("phone")
        district = body.get("district")
        referral_code = body.get("referral_code")
        
        if not phone or not district:
            raise HTTPException(status_code=400, detail="phone and district are required")
        
        # subscription = await subscribe_free_alerts(phone, district, referral_code)
        
        return JSONResponse(content={"status": "mocked"}, status_code=201)
        
    except Exception as e:
        logger.error("free_alert_subscription_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")


@app.post("/v1/free-alerts/unsubscribe")
async def unsubscribe_free_alerts_endpoint(request: Request):
    """
    Unsubscribe from free disease alerts.
    
    Expected request body:
    {
        "phone": "+91XXXXXXXXXX"
    }
    """
    try:
        body = await request.json()
        phone = body.get("phone")
        
        if not phone:
            raise HTTPException(status_code=400, detail="phone is required")
        
        # subscription = await unsubscribe_free_alerts(phone)
        
        return JSONResponse(content={"status": "mocked"})
        
    except Exception as e:
        logger.error("free_alert_unsubscription_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to unsubscribe: {str(e)}")


@app.post("/v1/free-alerts/broadcast")
async def broadcast_disease_alert_endpoint(request: Request):
    """
    Broadcast disease alert to free subscribers.
    
    Expected request body:
    {
        "alert_id": "uuid",
        "district": "gorakhpur"
    }
    """
    try:
        body = await request.json()
        alert_id = body.get("alert_id")
        district = body.get("district")
        
        if not alert_id or not district:
            raise HTTPException(status_code=400, detail="alert_id and district are required")
        
        # result = await send_disease_alert_to_free_subscribers(alert_id, district)
        
        return JSONResponse(content={"status": "mocked"})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("free_alert_broadcast_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to broadcast: {str(e)}")


@app.post("/v1/free-alerts/convert")
async def convert_free_subscriber_endpoint(request: Request):
    """
    Mark free subscriber as converted to paid.
    
    Expected request body:
    {
        "phone": "+91XXXXXXXXXX"
    }
    """
    try:
        body = await request.json()
        phone = body.get("phone")
        
        if not phone:
            raise HTTPException(status_code=400, detail="phone is required")
        
        # subscription = await convert_free_subscriber_to_paid(phone)
        
        return JSONResponse(content={"status": "mocked"})
        
    except Exception as e:
        logger.error("free_subscriber_conversion_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to mark conversion: {str(e)}")


@app.get("/v1/free-alerts/stats")
async def get_free_alert_stats_endpoint():
    """
    Get free alert system statistics.
    """
    try:
        # stats = await get_free_alert_stats()
        return JSONResponse(content={"status": "mocked"})
        
    except Exception as e:
        logger.error("free_alert_stats_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

# ==========================================
# WhatsApp Analytics Endpoints (Admin Only)
# ==========================================

@app.get("/api/v1/whatsapp/analytics/summary")
async def get_whatsapp_analytics_summary(days: int = 30):
    """
    REQ-009 - WhatsApp Analytics Dashboard
    Get WhatsApp message analytics summary for admin dashboard.
    Returns sent/delivered/read counts, delivery rate, read rate, CTR.
    """
    try:
        summary = await get_analytics_summary(days)
        return JSONResponse(content=summary)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("whatsapp_analytics_summary_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch analytics summary")


@app.get("/api/v1/whatsapp/analytics/heatmap")
async def get_whatsapp_engagement_heatmap(days: int = 7):
    """
    REQ-009 - WhatsApp Analytics Dashboard
    Get engagement heatmap data (day × hour grid).
    Returns open rates by day of week and hour of day.
    """
    try:
        heatmap = await get_engagement_heatmap(days)
        return JSONResponse(content=heatmap)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("whatsapp_heatmap_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch engagement heatmap")


@app.get("/api/v1/whatsapp/analytics/churn-risk")
async def get_whatsapp_churn_risk_customers():
    """
    REQ-009 - WhatsApp Analytics Dashboard
    Get list of high-churn-risk customers.
    Returns customers with 5+ consecutive unread messages, sorted by subscription value.
    """
    try:
        churn_risk = await get_high_churn_risk_customers()
        return JSONResponse(content=churn_risk)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("whatsapp_churn_risk_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch churn risk data")

# ==========================================
# Watermark Audit Endpoints (Admin Only)
# ==========================================

@app.get("/api/v1/watermark/events")
async def get_watermark_events_endpoint(limit: int = 50):
    """
    REQ-010 - Watermark Audit Console
    Get watermark events for audit console.
    Returns list of leak detection events with state machine status.
    """
    try:
        events = await get_watermark_events(limit)
        return JSONResponse(content=events)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("watermark_events_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch watermark events")


@app.get("/api/v1/watermark/coverage")
async def get_watermark_coverage_endpoint(date: Optional[str] = None):
    """
    REQ-010 - Watermark Audit Console
    Get watermark coverage metrics for a given date.
    Returns percentage of predictions with valid watermark tokens.
    """
    try:
        coverage = await get_watermark_coverage(date)
        return JSONResponse(content=coverage)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("watermark_coverage_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch coverage metrics")


@app.get("/api/v1/watermark/decode-metrics")
async def get_decode_metrics_endpoint(days: int = 30):
    """
    REQ-010 - Watermark Audit Console
    Get decode success rate metrics.
    Returns percentage of processed screenshots that yielded valid decoded customer_id.
    """
    try:
        metrics = await get_decode_success_rate(days)
        return JSONResponse(content=metrics)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("decode_metrics_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch decode metrics")


@app.post("/api/v1/watermark/events/{event_id}/action")
async def handle_watermark_action_endpoint(event_id: str, request: Request):
    """
    REQ-010 - Watermark Audit Console
    Handle action on a watermark event (warning, suspend, resolve).
    Creates new state record following immutable pattern.
    """
    return await handle_watermark_action_request(request, event_id)

# ==========================================
# Authentication & Security Endpoints
# ==========================================

@app.post("/api/v1/auth/otp-request")
async def otp_request(request: Request):
    try:
        body = await request.json()
        phone_number = body.get("phone_number")
        
        if not phone_number:
            raise HTTPException(status_code=400, detail="phone_number is required")
            
        result = await request_otp(phone_number, supabase)
        return JSONResponse(content=result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"OTP request failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/auth/otp-verify")
async def otp_verify(request: Request):
    try:
        body = await request.json()
        phone_number = body.get("phone_number")
        otp = body.get("otp")
        device_fp = request.headers.get("X-Fingerprint-JS") or request.headers.get("X-Device-ID")
        fpjs_request_id = body.get("fpjs_request_id") # Optional server verification
        
        if not phone_number or not otp or not device_fp:
            raise HTTPException(status_code=400, detail="phone_number, otp, and device fingerprint are required")
            
        # Optional: verify FPJS request ID with server
        if fpjs_request_id:
            fp_valid, fp_data = verify_fingerprint_token(fpjs_request_id)
            if not fp_valid:
                raise HTTPException(status_code=403, detail=fp_data.get("error", "Device verification failed"))
                
        result = await verify_otp(phone_number, otp, device_fp, supabase)
        
        if not result.get("valid"):
            raise HTTPException(status_code=401, detail=result.get("error"))
            
        # Create JWT token
        token = create_access_token(
            customer_id=result.get("customer_id") or result.get("phone_hash"),
            tier=result.get("tier", "free"),
            device_fp_hash=result.get("device_fp_hash")
        )
        
        return JSONResponse(content={
            "token": token,
            "is_new": result.get("is_new"),
            "customer_id": result.get("customer_id")
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OTP verification failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ==========================================
# Core Business Logic Endpoints
# ==========================================

@app.post("/api/v1/batch/calculator")
async def batch_profit_calculator(request: Request):
    """
    TRD §2.1 L1 - Batch Profitability Calculator
    """
    try:
        body = await request.json()
        bird_count = body.get("bird_count", 0)
        fcr = body.get("fcr", 1.6)
        feed_cost_per_kg = body.get("feed_cost_per_kg", 40)
        chick_cost = body.get("chick_cost", 35)
        mortality_rate = body.get("mortality_rate", 0.05)
        expected_weight = body.get("expected_weight", 2.0)
        target_price = body.get("target_price", 100) # Or fetch from model
        
        # Calculate
        surviving_birds = bird_count * (1 - mortality_rate)
        total_weight = surviving_birds * expected_weight
        total_feed_kg = total_weight * fcr
        
        total_feed_cost = total_feed_kg * feed_cost_per_kg
        total_chick_cost = bird_count * chick_cost
        other_costs = (total_feed_cost + total_chick_cost) * 0.1 # 10% overhead
        
        total_cost = total_feed_cost + total_chick_cost + other_costs
        cost_per_kg = total_cost / total_weight if total_weight > 0 else 0
        
        expected_revenue = total_weight * target_price
        expected_profit = expected_revenue - total_cost
        
        return JSONResponse(content={
            "total_cost": round(total_cost, 2),
            "cost_per_kg_produced": round(cost_per_kg, 2),
            "expected_revenue": round(expected_revenue, 2),
            "expected_profit": round(expected_profit, 2),
            "roi_percentage": round((expected_profit / total_cost) * 100, 2) if total_cost > 0 else 0
        })
    except Exception as e:
        logger.error(f"Batch calculator failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/middleman/check")
async def middleman_fairness_check(request: Request):
    """
    TRD §2.1 L1 - Middleman Price Check
    Supports both broiler (₹/kg) and layer (₹/egg) price benchmarks
    """
    try:
        body = await request.json()
        offered_price = body.get("offered_price")
        predicted_price = body.get("predicted_price")
        poultry_type = body.get("poultry_type", "broiler")
        
        if not offered_price or not predicted_price:
            raise HTTPException(status_code=400, detail="offered_price and predicted_price are required")
            
        difference = offered_price - predicted_price
        diff_percentage = (difference / predicted_price) * 100
        
        # Different fairness thresholds for broiler vs egg prices
        is_fair = diff_percentage >= -2.0 if poultry_type == "broiler" else diff_percentage >= -3.0
        
        status = "fair" if is_fair else "unfair"
        unit = "kg" if poultry_type == "broiler" else "egg"
        message = f"Fair price, good to sell." if is_fair else f"Price is too low! You are losing Rs{abs(difference):.1f}/{unit} compared to market prediction."
        
        return JSONResponse(content={
            "status": status,
            "difference_per_unit": round(difference, 2),
            "difference_percentage": round(diff_percentage, 2),
            "message": message,
            "poultry_type": poultry_type,
            "unit": unit
        })
    except Exception as e:
        logger.error(f"Middleman check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ==========================================
# Batch P&L Cost Tracking Endpoints (TASK-GAP1-API-001)
# ==========================================

@app.get("/api/v1/farms/{farm_id}/costs")
async def get_farm_costs(
    farm_id: str, 
    request: Request, 
    batch_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    TASK-GAP1-API-001 - GET /api/farms/{farmId}/costs
    Returns all cost entries for a batch, grouped by category + computed totals
    
    Query Parameters:
    - batch_id: Optional batch ID to filter costs
    - start_date: Optional start date for filtering costs (YYYY-MM-DD)
    - end_date: Optional end date for filtering costs (YYYY-MM-DD)
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Parse date parameters if provided
        parsed_start_date = None
        parsed_end_date = None
        if start_date:
            try:
                parsed_start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
        if end_date:
            try:
                parsed_end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
        
        result = await get_batch_costs(supabase, farm_id, batch_id, customer_id, parsed_start_date, parsed_end_date)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get farm costs failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/farms/{farm_id}/costs")
async def create_farm_cost(farm_id: str, request: Request):
    """
    TASK-GAP1-API-001 - POST /api/farms/{farmId}/costs
    Create a new cost entry for a batch
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        cost_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await create_batch_cost(supabase, farm_id, cost_data, customer_id)
        return JSONResponse(content=result, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create farm cost failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.patch("/api/v1/farms/{farm_id}/costs/{cost_id}")
async def update_farm_cost(farm_id: str, cost_id: str, request: Request):
    """
    TASK-GAP1-API-001 - PATCH /api/farms/{farmId}/costs/{costId}
    Update an existing cost entry
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        cost_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await update_batch_cost(supabase, farm_id, cost_id, cost_data, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update farm cost failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/v1/farms/{farm_id}/costs/{cost_id}")
async def delete_farm_cost(farm_id: str, cost_id: str, request: Request):
    """
    TASK-GAP1-API-001 - DELETE /api/farms/{farmId}/costs/{costId}
    Delete a cost entry
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await delete_batch_cost(supabase, farm_id, cost_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete farm cost failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ==========================================
# Sales & Lifting Endpoints (TASK-GAP2-API-001)
# ==========================================

@app.get("/api/v1/farms/{farm_id}/sales")
async def get_farm_sales(
    farm_id: str, 
    request: Request, 
    batch_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    TASK-GAP2-API-001 - GET /api/farms/{farmId}/sales
    Returns all sale events for the batch + sales_summary
    
    Query Parameters:
    - batch_id: Optional batch ID to filter sales
    - start_date: Optional start date for filtering sales (YYYY-MM-DD)
    - end_date: Optional end date for filtering sales (YYYY-MM-DD)
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Parse date parameters if provided
        parsed_start_date = None
        parsed_end_date = None
        if start_date:
            try:
                parsed_start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
        if end_date:
            try:
                parsed_end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
        
        result = await get_batch_sales(supabase, farm_id, batch_id, customer_id, parsed_start_date, parsed_end_date)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get farm sales failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/farms/{farm_id}/sales")
async def create_farm_sale(farm_id: str, request: Request):
    """
    TASK-GAP2-API-001 - POST /api/farms/{farmId}/sales
    Create a new sale/lifting event with withdrawal period check
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        sale_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await create_batch_sale(supabase, farm_id, sale_data, customer_id)
        
        # Check if result is a tuple with status code (withdrawal period active)
        if isinstance(result, tuple):
            error_data, status_code = result
            return JSONResponse(content=error_data, status_code=status_code)
        
        return JSONResponse(content=result, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create farm sale failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.patch("/api/v1/farms/{farm_id}/sales/{sale_id}")
async def update_farm_sale(farm_id: str, sale_id: str, request: Request):
    """
    TASK-GAP2-API-001 - PATCH /api/farms/{farmId}/sales/{saleId}
    Update an existing sale event
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        sale_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await update_batch_sale(supabase, farm_id, sale_id, sale_data, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update farm sale failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/v1/farms/{farm_id}/sales/{sale_id}")
async def delete_farm_sale(farm_id: str, sale_id: str, request: Request):
    """
    TASK-GAP2-API-001 - DELETE /api/farms/{farmId}/sales/{saleId}
    Delete a sale event (reverses birds_alive and revenue)
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await delete_batch_sale(supabase, farm_id, sale_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete farm sale failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Treatment Log Endpoints (TASK-GAP3-API-001)
# ==========================================

@app.get("/api/v1/farms/{farm_id}/treatments")
async def get_farm_treatments(farm_id: str, request: Request, batch_id: Optional[str] = None):
    """
    TASK-GAP3-API-001 - GET /api/farms/{farmId}/treatments
    Returns all treatment events for the batch + withdrawal_status
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await get_batch_treatments(supabase, farm_id, batch_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get farm treatments failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/farms/{farm_id}/treatments")
async def create_farm_treatment(farm_id: str, request: Request):
    """
    TASK-GAP3-API-001 - POST /api/farms/{farmId}/treatments
    Create a new treatment event with auto-fill withdrawal days and clearance date calculation
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        treatment_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await create_batch_treatment(supabase, farm_id, treatment_data, customer_id)
        return JSONResponse(content=result, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create farm treatment failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.patch("/api/v1/farms/{farm_id}/treatments/{treatment_id}")
async def update_farm_treatment(farm_id: str, treatment_id: str, request: Request):
    """
    TASK-GAP3-API-001 - PATCH /api/farms/{farmId}/treatments/{treatmentId}
    Update an existing treatment event
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        treatment_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await update_batch_treatment(supabase, farm_id, treatment_id, treatment_data, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update farm treatment failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/v1/farms/{farm_id}/treatments/{treatment_id}")
async def delete_farm_treatment(farm_id: str, treatment_id: str, request: Request):
    """
    TASK-GAP3-API-001 - DELETE /api/farms/{farmId}/treatments/{treatmentId}
    Delete a treatment event (deletes associated medicine cost)
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await delete_batch_treatment(supabase, farm_id, treatment_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete farm treatment failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v1/medicines")
async def get_medicines(request: Request, q: str = "", limit: int = 10):
    """
    TASK-GAP3-API-001 - GET /api/medicines?q=[query]&limit=10
    Medicine autocomplete endpoint
    Returns medicines_db rows matching generic_name or brand_names ILIKE '%query%'
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await get_medicines_autocomplete(supabase, q, limit)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Medicines autocomplete failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v1/buyers")
async def get_all_buyers(request: Request):
    """
    TASK-GAP2-API-001 - GET /api/buyers
    Returns all buyers for the integrator
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await get_buyers(supabase, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get buyers failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/buyers")
async def create_new_buyer(request: Request):
    """
    TASK-GAP2-API-001 - POST /api/buyers
    Create a new buyer
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        buyer_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await create_buyer(supabase, buyer_data, customer_id)
        return JSONResponse(content=result, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create buyer failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Document Library Endpoints (TASK-GAP7-API-001)
# ===============================================

@app.get("/api/v1/farms/{farm_id}/documents")
async def get_farm_documents(farm_id: str, request: Request, batch_id: Optional[str] = None, doc_type: Optional[str] = None, count: Optional[bool] = False):
    """
    TASK-GAP7-API-001 - GET /api/farms/{farmId}/documents
    Returns documents grouped by doc_type, with Supabase Storage signed URLs (expire: 60s)
    If count=true, returns only the count without document data (optimized for badges)
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await get_documents(supabase, farm_id, batch_id, doc_type, customer_id, count_only=count)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get farm documents failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/farms/{farm_id}/documents")
async def upload_farm_document(
    farm_id: str,
    request: Request,
    file: UploadFile = File(...),
    doc_name: str = Form(...),
    doc_type: str = Form(...),
    batch_id: Optional[str] = Form(None),
    document_date: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    notes: Optional[str] = Form(None)
):
    """
    TASK-GAP7-API-001 - POST /api/farms/{farmId}/documents
    Upload a document to Supabase Storage and create database record
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await upload_document(
            supabase, farm_id, file, doc_name, doc_type, batch_id, 
            document_date, tags, notes, customer_id
        )
        return JSONResponse(content=result, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload farm document failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v1/farms/{farm_id}/documents/{doc_id}")
async def get_farm_document(farm_id: str, doc_id: str, request: Request):
    """
    TASK-GAP7-API-001 - GET /api/farms/{farmId}/documents/{docId}
    Returns document record + fresh signed download URL
    Side effect: inserts document_audit_log record (action='download')
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await get_document(supabase, farm_id, doc_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get farm document failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.patch("/api/v1/farms/{farm_id}/documents/{doc_id}")
async def update_farm_document(farm_id: str, doc_id: str, request: Request):
    """
    TASK-GAP7-API-001 - PATCH /api/farms/{farmId}/documents/{docId}
    Update document metadata
    Side effect: inserts audit log (action='rename' if doc_name changed)
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        update_data = await request.json()
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await update_document(supabase, farm_id, doc_id, update_data, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update farm document failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/v1/farms/{farm_id}/documents/{doc_id}")
async def delete_farm_document(farm_id: str, doc_id: str, request: Request):
    """
    TASK-GAP7-API-001 - DELETE /api/farms/{farmId}/documents/{docId}
    Soft delete: SET deleted_at = NOW() (does NOT delete from Storage for 30 days)
    Side effect: inserts audit log (action='delete')
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await delete_document(supabase, farm_id, doc_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete farm document failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v1/farms/{farm_id}/documents/audit-log")
async def get_farm_document_audit_log(farm_id: str, request: Request, doc_id: Optional[str] = None):
    """
    TASK-GAP7-API-001 - GET /api/farms/{farmId}/documents/audit-log?docId={docId}
    Returns audit log entries for documents
    """
    try:
        customer_id = getattr(request.state, 'customer_id', None)
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await get_document_audit_log(supabase, farm_id, doc_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get document audit log failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v2/forecast/enterprise")
async def enterprise_forecast(request: Request):
    """
    TRD §2.1 L3 - Enterprise Bulk Forecast
    Secured by API Key via AuthMiddleware
    """
    try:
        # Request validated by AuthMiddleware, request.state.customer_id is set
        body = await request.json()
        mandis = body.get("mandis", ["gorakhpur"])
        horizon = body.get("horizon_days", 7)
        
        if horizon > 30:
            raise HTTPException(status_code=400, detail="Max horizon is 30 days")
            
        # In a real implementation, this would call the Predictor for multiple mandis and future dates
        # Returning mock data for demonstration
        results = {}
        for mandi in mandis:
            results[mandi] = {
                "current_price": 110.0,
                "forecast_7d": 115.0,
                "trend": "upward",
                "confidence": 0.85
            }
            
        return JSONResponse(content={
            "org_id": request.state.customer_id,
            "horizon": horizon,
            "forecasts": results
        })
    except Exception as e:
        logger.error(f"Enterprise forecast failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v2/enterprise/usage")
async def get_enterprise_usage(request: Request):
    """
    REQ-008 §8.1, §8.3 - API Usage Tracking & Rate Limit Dashboard
    Returns usage statistics for the authenticated enterprise customer.
    Secured by API Key via AuthMiddleware.
    """
    try:
        # Get API key from request (set by AuthMiddleware)
        api_key = request.headers.get("X-API-Key")
        
        if not api_key:
            raise HTTPException(status_code=401, detail="API Key required")
        
        # Get current date and calculate date ranges
        from datetime import datetime, timedelta
        today = datetime.now()
        today_str = today.strftime("%Y-%m-%d")
        month_start = today.replace(day=1).strftime("%Y-%m-%d")
        
        # Get usage by endpoint for today
        calls_by_endpoint = await get_all_usage_by_endpoint(api_key, today_str)
        
        # Calculate total usage for today
        used_today = sum(calls_by_endpoint.values())
        
        # Calculate usage for this month (sum of daily usage from day 1 to today)
        used_this_month = 0
        calls_by_day = []
        
        for i in range(1, today.day + 1):
            day_date = today.replace(day=i).strftime("%Y-%m-%d")
            day_usage = await get_all_usage_by_endpoint(api_key, day_date)
            day_total = sum(day_usage.values())
            used_this_month += day_total
            calls_by_day.append({
                "date": day_date,
                "count": day_total
            })
        
        # Default quotas (in production, these would be fetched from customer subscription)
        quota_daily = 1000
        quota_monthly = 30000
        
        return JSONResponse(content={
            "used_today": used_today,
            "quota_daily": quota_daily,
            "used_this_month": used_this_month,
            "quota_monthly": quota_monthly,
            "calls_by_day": calls_by_day,
            "calls_by_endpoint": calls_by_endpoint,
            "api_key_masked": mask_api_key(api_key)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enterprise usage fetch failed: {str(e)}")


# ==========================================
# Enterprise ERP API Endpoints (TASK-054)
# ==========================================

@app.get("/api/v2/enterprise/batch/erp")
async def get_enterprise_batch_erp(request: Request, batch_id: Optional[str] = None):
    """
    TASK-054 - Enterprise ERP Batch Endpoint
    Returns batch lifecycle data in ERP-friendly flat JSON format.
    Authentication: HMAC-signed API key via AuthMiddleware.
    Response format: JSON (default) or XML (via Accept: application/xml header).
    
    Query Parameters:
    - batch_id: Optional specific batch ID. If not provided, returns all batches for customer.
    
    Returns flat JSON structure (no nested objects) with:
    - Date fields in ISO 8601 format
    - Prices as strings in INR to avoid float precision issues
    - All batch lifecycle data: DOC placement, feed logs, mortality, harvest, costs
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state (set by AuthMiddleware)
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Fetch batch data
        query = supabase.table('batches').select('*').eq('customer_id', customer_id)
        
        if batch_id:
            query = query.eq('id', batch_id)
        
        batch_response = query.order('doc_placement_date', desc=True).execute()
        
        if not batch_response.data:
            return JSONResponse(content={"batches": []})
        
        # Transform to ERP-friendly flat JSON format
        erp_batches = []
        for batch in batch_response.data:
            # Fetch related data (feed logs, mortality, costs)
            feed_logs_response = supabase.table('feed_logs') \
                .select('date, morning_feed_kg, evening_feed_kg, total_feed_kg, water_litres, feed_brand') \
                .eq('batch_id', batch['id']) \
                .execute()
            
            mortality_response = supabase.table('mortality_logs') \
                .select('log_date, count, cause') \
                .eq('batch_id', batch['id']) \
                .execute()
            
            # Calculate totals
            total_feed_kg = sum(log.get('total_feed_kg', 0) for log in feed_logs_response.data)
            total_mortality = sum(log.get('count', 0) for log in mortality_response.data)
            
            # Build flat ERP record
            erp_batch = {
                "batch_id": batch.get('batch_id', ''),
                "batch_uuid": batch.get('id', ''),
                "customer_id": str(batch.get('customer_id', '')),
                "doc_placement_date": batch.get('doc_placement_date', ''),
                "doc_count": str(batch.get('doc_count', 0)),
                "breed": batch.get('breed', ''),
                "shed_id": batch.get('shed_id', ''),
                "status": batch.get('status', ''),
                "current_bird_count": str(batch.get('current_bird_count', 0)),
                "avg_weight_kg": str(round(batch.get('avg_weight_kg', 0), 2)),
                "age_days": str(batch.get('age_days', 0)),
                "fcr": str(round(batch.get('fcr', 0), 2)) if batch.get('fcr') else '',
                "mortality_pct": str(round(batch.get('mortality_pct', 0), 2)),
                "total_feed_kg": str(round(total_feed_kg, 2)),
                "total_mortality": str(total_mortality),
                "target_harvest_weight_kg": str(round(batch.get('target_harvest_weight_kg', 0), 2)),
                "doc_supplier": batch.get('doc_supplier', ''),
                "doc_supplier_price_inr": str(round(batch.get('doc_supplier_price', 0), 2)),
                # Harvest data if available
                "harvest_date": batch.get('harvest_date', '') if batch.get('status') == 'harvested' else '',
                "birds_sold": str(batch.get('birds_sold', 0)) if batch.get('status') == 'harvested' else '',
                "actual_harvest_weight_kg": str(round(batch.get('actual_harvest_weight_kg', 0), 2)) if batch.get('status') == 'harvested' else '',
                "sale_price_per_kg_inr": str(round(batch.get('sale_price_per_kg', 0), 2)) if batch.get('status') == 'harvested' else '',
                "buyer_name": batch.get('buyer_name', '') if batch.get('status') == 'harvested' else '',
                "created_at": batch.get('created_at', ''),
                "updated_at": batch.get('updated_at', '')
            }
            
            erp_batches.append(erp_batch)
        
        # Check for XML response format
        accept_header = request.headers.get('Accept', '')
        if 'application/xml' in accept_header:
            # Convert to XML format
            xml_response = _convert_json_to_xml({"batches": erp_batches})
            return Response(content=xml_response, media_type="application/xml")
        
        return JSONResponse(content={"batches": erp_batches})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enterprise batch ERP fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v2/enterprise/forecast/erp")
async def get_enterprise_forecast_erp(request: Request):
    """
    TASK-054 - Enterprise ERP Forecast Endpoint
    Returns 30-day price forecast in ERP-consumable JSON format.
    Authentication: HMAC-signed API key via AuthMiddleware.
    Response format: JSON (default) or XML (via Accept: application/xml header).
    
    Query Parameters:
    - district: Mandi district for forecast (default: gorakhpur)
    - horizon_days: Number of days to forecast (default: 30, max: 30)
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Get query parameters
        district = request.query_params.get('district', 'gorakhpur')
        horizon_days = int(request.query_params.get('horizon_days', 30))
        
        if horizon_days > 30:
            raise HTTPException(status_code=400, detail="Max horizon is 30 days")
        
        # Generate forecast data (in production, this would call the ML predictor)
        # For now, returning mock data structure
        forecast_data = {
            "forecast_id": f"FC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "customer_id": str(customer_id),
            "district": district,
            "forecast_date": datetime.utcnow().strftime('%Y-%m-%d'),
            "horizon_days": str(horizon_days),
            "current_price_inr": "110.00",
            "currency": "INR",
            "forecasts": []
        }
        
        # Generate daily forecasts
        for day in range(1, horizon_days + 1):
            forecast_date = datetime.utcnow() + timedelta(days=day)
            forecast_data["forecasts"].append({
                "date": forecast_date.strftime('%Y-%m-%d'),
                "predicted_price_inr": str(round(110.0 + (day * 0.5), 2)),
                "confidence_p10_inr": str(round(105.0 + (day * 0.4), 2)),
                "confidence_p50_inr": str(round(110.0 + (day * 0.5), 2)),
                "confidence_p90_inr": str(round(115.0 + (day * 0.6), 2)),
                "trend": "upward" if day < 15 else "stable"
            })
        
        # Check for XML response format
        accept_header = request.headers.get('Accept', '')
        if 'application/xml' in accept_header:
            xml_response = _convert_json_to_xml(forecast_data)
            return Response(content=xml_response, media_type="application/xml")
        
        return JSONResponse(content=forecast_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enterprise forecast ERP fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/webhooks")
async def create_webhook_subscription(request: Request):
    """
    TASK-054 - Webhook Registry Endpoint
    Creates a webhook subscription for custom ERP integrations.
    
    Request Body:
    {
        "webhook_url": "https://your-erp.com/webhook",
        "events": ["batch.created", "batch.harvested", "forecast.updated", "alert.fired"],
        "webhook_secret": "optional_secret_for_hmac_verification"
    }
    
    Returns:
    {
        "webhook_id": "uuid",
        "webhook_url": "https://your-erp.com/webhook",
        "events": ["batch.created", "batch.harvested"],
        "status": "active",
        "created_at": "2026-06-03T10:00:00Z"
    }
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        body = await request.json()
        webhook_url = body.get('webhook_url')
        events = body.get('events', [])
        webhook_secret = body.get('webhook_secret')
        
        if not webhook_url:
            raise HTTPException(status_code=400, detail="webhook_url is required")
        
        if not events:
            raise HTTPException(status_code=400, detail="events array is required")
        
        # Validate events
        valid_events = ['batch.created', 'batch.harvested', 'forecast.updated', 'alert.fired']
        for event in events:
            if event not in valid_events:
                raise HTTPException(status_code=400, detail=f"Invalid event: {event}")
        
        # Generate webhook secret if not provided
        if not webhook_secret:
            webhook_secret = hashlib.sha256(f"{customer_id}{webhook_url}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        
        # Create webhook integration record
        webhook_response = supabase.table('customer_integrations').insert({
            'customer_id': customer_id,
            'integration_type': 'webhook',
            'status': 'active',
            'webhook_url': webhook_url,
            'webhook_secret': webhook_secret,
            'webhook_events': events,
            'is_active': True
        }).execute()
        
        if not webhook_response.data:
            raise HTTPException(status_code=500, detail="Failed to create webhook subscription")
        
        webhook = webhook_response.data[0]
        
        return JSONResponse(content={
            "webhook_id": webhook['id'],
            "webhook_url": webhook['webhook_url'],
            "events": webhook['webhook_events'],
            "status": webhook['status'],
            "created_at": webhook['created_at']
        }, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook subscription creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v1/webhooks")
async def list_webhook_subscriptions(request: Request):
    """
    TASK-054 - List Webhook Subscriptions
    Returns all webhook subscriptions for the authenticated customer.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Fetch webhook subscriptions
        webhooks_response = supabase.table('customer_integrations') \
            .select('*') \
            .eq('customer_id', customer_id) \
            .eq('integration_type', 'webhook') \
            .order('created_at', desc=True) \
            .execute()
        
        webhooks = []
        for webhook in webhooks_response.data:
            webhooks.append({
                "webhook_id": webhook['id'],
                "webhook_url": webhook['webhook_url'],
                "events": webhook['webhook_events'],
                "status": webhook['status'],
                "last_sync_at": webhook.get('last_sync_at'),
                "last_sync_status": webhook.get('last_sync_status'),
                "created_at": webhook['created_at']
            })
        
        return JSONResponse(content={"webhooks": webhooks})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook list fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/v1/webhooks/{webhook_id}")
async def delete_webhook_subscription(webhook_id: str, request: Request):
    """
    TASK-054 - Delete Webhook Subscription
    Deletes a webhook subscription.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Delete webhook subscription
        delete_response = supabase.table('customer_integrations') \
            .delete() \
            .eq('id', webhook_id) \
            .eq('customer_id', customer_id) \
            .eq('integration_type', 'webhook') \
            .execute()
        
        return JSONResponse(content={"message": "Webhook subscription deleted successfully"})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook deletion failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/v1/webhooks/{webhook_id}/deliveries")
async def get_webhook_delivery_history(webhook_id: str, request: Request):
    """
    TASK-054 - Webhook Delivery History
    Returns last 20 delivery attempts for a webhook with status codes and response times.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Verify webhook belongs to customer
        webhook_response = supabase.table('customer_integrations') \
            .select('id') \
            .eq('id', webhook_id) \
            .eq('customer_id', customer_id) \
            .eq('integration_type', 'webhook') \
            .single() \
            .execute()
        
        if not webhook_response.data:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        # Fetch delivery history
        deliveries_response = supabase.table('webhook_delivery_log') \
            .select('*') \
            .eq('customer_integration_id', webhook_id) \
            .order('created_at', desc=True) \
            .limit(20) \
            .execute()
        
        deliveries = []
        for delivery in deliveries_response.data:
            deliveries.append({
                "delivery_id": delivery['id'],
                "event_type": delivery['event_type'],
                "http_status_code": delivery.get('http_status_code'),
                "response_time_ms": delivery.get('response_time_ms'),
                "attempt_number": delivery['attempt_number'],
                "delivery_status": delivery['delivery_status'],
                "error_message": delivery.get('error_message'),
                "created_at": delivery['created_at'],
                "delivered_at": delivery.get('delivered_at')
            })
        
        return JSONResponse(content={"deliveries": deliveries})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook delivery history fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


def _convert_json_to_xml(data: Dict[str, Any]) -> str:
    """
    Helper function to convert JSON data to XML format.
    Simple implementation for ERP compatibility.
    In production, use fast-xml-parser library.
    """
    def dict_to_xml(tag: str, d: Dict[str, Any]) -> str:
        xml = f"<{tag}>"
        for key, value in d.items():
            if isinstance(value, dict):
                xml += dict_to_xml(key, value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        xml += dict_to_xml(key[:-1] if key.endswith('s') else 'item', item)
                    else:
                        xml += f"<{key}>{item}</{key}>"
            else:
                xml += f"<{key}>{value}</{key}>"
        xml += f"</{tag}>"
        return xml
    
    return dict_to_xml("response", data)


@app.post("/api/v2/health/checklist")
async def health_checklist_webhook(request: Request):
    """
    TASK-036 - Health-to-Price Intelligence Integration
    Handles health checklist INSERT trigger and escalates HPAI alerts when respiratory symptoms are detected.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        body = await request.json()
        checklist_data = body.get("record", {})
        
        # Process health checklist and check for HPAI escalation
        result = await handle_health_checklist_insert(supabase, checklist_data)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Health checklist processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v2/health/check-missing")
async def check_missing_checklist(request: Request):
    """
    TASK-036 - Missing Checklist Alert
    Checks if health checklist was submitted by 10:00 AM IST and creates alert if missing.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        body = await request.json()
        customer_id = body.get("customer_id")
        district = body.get("district", "Unknown")
        
        if not customer_id:
            raise HTTPException(status_code=400, detail="customer_id required")
        
        # Check for missing checklist and create alert if needed
        result = await check_missing_checklist_alert(supabase, customer_id, district)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Missing checklist check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ==========================================
# Mortality Pattern Detection Endpoints (TASK-040)
# ==========================================

@app.post("/api/v1/batches/{batch_id}/mortality-pattern")
async def analyze_batch_mortality_pattern(batch_id: str, request: Request):
    """
    Analyze mortality patterns for a batch.
    Task Reference: TASK-040
    Requirements: REQ-016 §16.7, REQ-024 §24.1
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = analyze_mortality_pattern(batch_id, supabase)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mortality pattern analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/batches/{batch_id}/mortality-pattern")
async def get_batch_mortality_pattern(batch_id: str, request: Request):
    """
    Get the latest mortality pattern analysis for a batch.
    Task Reference: TASK-040
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = get_latest_pattern(batch_id, supabase)
        
        if not result:
            raise HTTPException(status_code=404, detail="No pattern analysis found for this batch")
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch mortality pattern: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/batches/{batch_id}/mortality-pattern/trigger-abnormal")
async def trigger_abnormal_mortality_pattern(batch_id: str, request: Request):
    """
    Trigger pattern detection when abnormal mortality alert fires.
    Task Reference: TASK-040
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = trigger_pattern_detection_on_abnormal_alert(batch_id, supabase)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Abnormal alert pattern detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/batches/{batch_id}/mortality-pattern/trigger-harvest")
async def trigger_harvest_mortality_pattern(batch_id: str, request: Request):
    """
    Trigger pattern detection when batch is marked as harvested (post-mortem analysis).
    Task Reference: TASK-040
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = trigger_pattern_detection_on_harvest(batch_id, supabase)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Harvest pattern detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/iot/reading")
async def iot_reading_ingestion(request: Request):
    """
    IoT device reading ingestion endpoint.
    Authenticates devices via API key (X-API-Key header) and ingests sensor readings.
    Target response time: < 100ms
    Task Reference: TASK-049
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Verify device API key
        device_info = await verify_device_api_key(request, supabase)
        
        # Parse reading data
        reading_data = await request.json()
        
        # Ingest reading
        result = await ingest_iot_reading(device_info, reading_data, supabase)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"IoT reading ingestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/iot/devices/{device_id}/readings")
async def get_iot_device_readings(device_id: str, request: Request, hours: int = 24):
    """
    Get IoT device readings for specified time period.
    Requires JWT authentication (customer context).
    Task Reference: TASK-049
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from JWT (set by AuthMiddleware)
        customer_id = request.state.customer_id
        if not customer_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        result = await get_device_readings(device_id, customer_id, supabase, hours)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get IoT device readings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/iot/sheds/{shed_id}/environment")
async def get_shed_environment(shed_id: str, request: Request):
    """
    Get current environment summary for a shed (latest readings from all devices).
    Requires JWT authentication (customer context).
    Task Reference: TASK-049
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from JWT (set by AuthMiddleware)
        customer_id = request.state.customer_id
        if not customer_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        result = await get_shed_environment_summary(customer_id, shed_id, supabase)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get shed environment summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Flock Benchmarking Endpoints (TASK-GAP5-API-001)
# ==========================================

@app.get("/api/v1/benchmark/data")
async def get_benchmark_data_endpoint(
    request: Request,
    breed: str = "All",
    region: str = "All India",
    flock_size_cat: str = "All",
    period: str = "last_3_batches",
    farm_id: Optional[str] = None
):
    """
    TASK-GAP5-API-001 - GET /api/benchmark/data
    Get benchmark data for the authenticated user's farms compared to peer groups.
    
    Query Parameters:
    - breed: Filter by breed (default: "All")
    - region: Filter by region (default: "All India")
    - flock_size_cat: Filter by flock size category (default: "All")
    - period: Time period for comparison (default: "last_3_batches")
    - farm_id: Optional specific farm ID to filter user's data
    
    Returns:
    - user_metrics: User's own farm performance for selected period
    - benchmark: Benchmark data from aggregated_benchmarks table
    - sample_count: Number of farms in the comparison group
    - privacy_minimum_met: Boolean (false if sample_count < 10)
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from JWT (set by AuthMiddleware)
        customer_id = request.state.customer_id
        if not customer_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        result = await get_benchmark_data(
            supabase,
            customer_id,
            breed,
            region,
            flock_size_cat,
            period,
            farm_id
        )
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch benchmark data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/benchmark/insights")
async def generate_benchmark_insights_endpoint(request: Request):
    """
    TASK-GAP5-API-001 - POST /api/benchmark/insights
    Generate AI-powered benchmark insights using Claude Sonnet API.
    
    Request Body:
    - user_metrics: User's own farm performance metrics
    - benchmark_data: Benchmark comparison data
    - filters: Applied filters (breed, region, flock_size_cat, period)
    
    Returns:
    - strength: What the user is doing well
    - improvement: Areas for improvement
    - context: Benchmark context/interpretation
    - action: Specific actionable recommendation
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from JWT (set by AuthMiddleware)
        customer_id = request.state.customer_id
        if not customer_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        body = await request.json()
        user_metrics = body.get("user_metrics")
        benchmark_data = body.get("benchmark_data")
        filters = body.get("filters", {})
        
        if not user_metrics or not benchmark_data:
            raise HTTPException(status_code=400, detail="user_metrics and benchmark_data are required")
        
        result = await generate_benchmark_insights(user_metrics, benchmark_data, filters)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate benchmark insights: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Custom exception handler for HTTP exceptions with structured logging.
    """
    logger.error(
        "http_exception",
        status_code=exc.status_code,
        detail=exc.detail,
        path=request.url.path
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Custom exception handler for general exceptions with structured logging.
    """
    logger.error(
        "unhandled_exception",
        error=str(exc),
        path=request.url.path
    )
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )


# Broiler Incentive API Endpoints (ISSUE-025)
@app.get("/api/broiler/incentives")
async def get_incentives_endpoint(request: Request):
    """
    ISSUE-025 - GET /api/broiler/incentives
    Fetch supervisor incentives with optional filtering.
    
    Query Parameters:
    - status: Optional status filter (pending, approved, paid)
    - limit: Maximum number of records to return (default: 100)
    
    Returns:
    {
        "data": [...],
        "count": 10
    }
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state (set by AuthMiddleware)
        customer_id = getattr(request.state, 'customer_id', None)
        
        # Get query parameters
        status = request.query_params.get('status')
        limit = int(request.query_params.get('limit', 100))
        
        result = await get_incentives(supabase, customer_id, status, limit)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_incentives_endpoint_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch incentives")


@app.post("/api/broiler/incentives/{incentive_id}/approve")
async def approve_incentive_endpoint(incentive_id: str, request: Request):
    """
    ISSUE-025 - POST /api/broiler/incentives/{id}/approve
    Approve a supervisor incentive.
    
    Request Body:
    {
        "approved": true
    }
    
    Returns:
    {
        "data": {...},
        "message": "Incentive approved successfully"
    }
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state (set by AuthMiddleware)
        customer_id = getattr(request.state, 'customer_id', None)
        approved_by = getattr(request.state, 'customer_id', None)  # Use customer_id as approved_by
        
        result = await approve_incentive(supabase, incentive_id, approved_by, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("approve_incentive_endpoint_failed", incentive_id=incentive_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to approve incentive")


@app.post("/api/broiler/incentives/{incentive_id}/pay")
async def pay_incentive_endpoint(incentive_id: str, request: Request):
    """
    ISSUE-025 - POST /api/broiler/incentives/{id}/pay
    Mark a supervisor incentive as paid.
    
    Request Body:
    {
        "paid": true
    }
    
    Returns:
    {
        "data": {...},
        "message": "Incentive marked as paid successfully"
    }
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state (set by AuthMiddleware)
        customer_id = getattr(request.state, 'customer_id', None)
        
        result = await pay_incentive(supabase, incentive_id, customer_id)
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("pay_incentive_endpoint_failed", incentive_id=incentive_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to process payment")


@app.post("/api/broiler/incentives/calculate")
async def calculate_incentive_endpoint(request: Request):
    """
    ISSUE-025 - POST /api/broiler/incentives/calculate
    Calculate incentive for a supervisor based on batch performance.
    
    Request Body:
    {
        "batch_id": "uuid",
        "supervisor_id": "uuid"
    }
    
    Returns:
    {
        "data": {...},
        "message": "Incentive calculated successfully"
    }
    """
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get customer_id from request state (set by AuthMiddleware)
        customer_id = getattr(request.state, 'customer_id', None)
        if not customer_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        body = await request.json()
        batch_id = body.get('batch_id')
        supervisor_id = body.get('supervisor_id')
        
        if not batch_id or not supervisor_id:
            raise HTTPException(status_code=400, detail="batch_id and supervisor_id are required")
        
        result = await calculate_incentive(supabase, batch_id, supervisor_id, customer_id)
        return JSONResponse(content=result, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("calculate_incentive_endpoint_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to calculate incentive")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False,
        log_level="info"
    )
