"""
FlockIQ — WhatsApp Dispatcher
File: apps/api/whatsapp/dispatcher.py
Version: v3.0 | June 2026
Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md (FR-WHATSAPP-DEMO-001)
Task: WHATSAPP-001
"""

import os
from datetime import datetime, date
from typing import Optional, Dict, Any
from dataclasses import dataclass
import hashlib
import structlog
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from supabase import create_client, Client as SupabaseClient

logger = structlog.get_logger()

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Twilio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize Supabase client (service role for admin operations)
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


@dataclass
class PredictionResult:
    """Prediction result from ML model"""
    p10: float
    p50: float
    p90: float
    confidence: float
    model_version: str
    staleness_flag: bool
    predicted_at: str
    drivers: list[Dict[str, Any]]


@dataclass
class SellSignal:
    """Sell signal for farmer recommendation"""
    signal: str  # 'SELL_NOW', 'HOLD', 'SELL_SOON'
    signal_strength: float
    optimal_window_start: str
    optimal_window_end: str
    profit_estimate: float


def generate_idempotency_key(customer_id: str, message_date: date) -> str:
    """
    Generate idempotency key for rate limiting.
    Format: customer_id + date (YYYY-MM-DD)
    """
    return f"{customer_id}_{message_date.isoformat()}"


def embed_watermark(customer_id: str, message: str) -> str:
    """
    Embed steganographic watermark in message metadata for IP audit trail.
    Uses zero-width characters to encode customer_id hash.
    """
    # Hash customer_id
    customer_hash = hashlib.sha256(customer_id.encode()).hexdigest()[:8]
    
    # Convert to binary and encode as zero-width characters
    # This is a simple implementation - production would use more sophisticated steganography
    watermark_chars = {
        '0': '\u200B',  # Zero-width space
        '1': '\u200C',  # Zero-width non-joiner
        '2': '\u200D',  # Zero-width joiner
        '3': '\uFEFF',  # Zero-width no-break space
    }
    
    watermark = ''.join(watermark_chars.get(c, '') for c in customer_hash)
    
    # Embed watermark at end of message
    return f"{message}{watermark}"


def get_signal_text_hindi(signal: str) -> str:
    """Convert signal enum to Hindi text"""
    signal_map = {
        'SELL_NOW': 'आज बेचें',
        'HOLD': 'रुकें',
        'SELL_SOON': 'जल्द बेचें',
    }
    return signal_map.get(signal, signal)


def get_mandi_name_hindi(mandi: str) -> str:
    """Convert mandi slug to Hindi name"""
    mandi_map = {
        'gorakhpur': 'गोरखपुर',
        'deoria': 'देवरिया',
        'basti': 'बस्ती',
        'kushinagar': 'कुशीनगर',
        'maharajganj': 'महाराजगंज',
    }
    return mandi_map.get(mandi, mandi)


async def check_rate_limit(customer_id: str) -> bool:
    """
    Check if customer has already received a message today.
    Rate limiting: max 1 message per customer per day
    """
    try:
        today = date.today()
        idempotency_key = generate_idempotency_key(customer_id, today)
        
        # Check if message already sent today
        response = supabase.table('whatsapp_delivery_log').select('*').eq('idempotency_key', idempotency_key).execute()
        data = response.data
        
        if data:
            logger.info("rate_limit_hit", customer_id=customer_id, idempotency_key=idempotency_key)
            return False
        
        return True
    except Exception as e:
        logger.error("rate_limit_check_failed", error=str(e), customer_id=customer_id)
        # Fail open - allow message if rate limit check fails
        return True


async def log_delivery(
    customer_id: str,
    phone: str,
    message_sid: str,
    status: str,
    idempotency_key: str,
    prediction: PredictionResult,
    sell_signal: SellSignal
) -> None:
    """
    Log delivery receipt to whatsapp_delivery_log table.
    """
    try:
        supabase.table('whatsapp_delivery_log').insert({
            'customer_id': customer_id,
            'phone': phone,
            'message_sid': message_sid,
            'status': status,
            'idempotency_key': idempotency_key,
            'prediction_data': {
                'p50': prediction.p50,
                'p10': prediction.p10,
                'p90': prediction.p90,
                'confidence': prediction.confidence,
                'model_version': prediction.model_version,
            },
            'sell_signal_data': {
                'signal': sell_signal.signal,
                'signal_strength': sell_signal.signal_strength,
                'profit_estimate': sell_signal.profit_estimate,
            },
            'sent_at': datetime.utcnow().isoformat(),
        }).execute()
        
        logger.info("delivery_logged", customer_id=customer_id, message_sid=message_sid, status=status)
    except Exception as e:
        logger.error("delivery_log_failed", error=str(e), customer_id=customer_id)


async def dispatch_daily_forecast(
    customer_id: str,
    prediction: PredictionResult,
    sell_signal: SellSignal
) -> Dict[str, Any]:
    """
    Dispatch daily forecast via Twilio WhatsApp API.
    
    Message template (Hindi):
    "🐔 आज का भाव — {{mandi}}
    
    ₹{{p50}}/kg (₹{{p10}}–₹{{p90}} संभावित)
    
    संकेत: {{signal_text}}
    
    कारण: {{driver_1}}
    
    —PoultryPulse AI"
    
    Args:
        customer_id: Customer ID from Supabase
        prediction: Prediction result from ML model
        sell_signal: Sell signal recommendation
    
    Returns:
        Dict with message_sid, status, and delivery info
    """
    try:
        # Fetch customer details
        response = supabase.table('customers').select('*').eq('id', customer_id).single().execute()
        data = response.data
        
        if not data:
            raise ValueError(f"Customer not found: {customer_id}")
        
        customer = data[1][0] if isinstance(data, tuple) and len(data) > 1 else data
        phone = customer.get('phone')
        mandi = customer.get('mandi', 'gorakhpur')
        
        if not phone:
            raise ValueError(f"Customer has no phone number: {customer_id}")
        
        # Check rate limit
        if not await check_rate_limit(customer_id):
            return {
                "status": "skipped",
                "reason": "rate_limit_exceeded",
                "message": "Customer already received message today"
            }
        
        # Generate idempotency key
        idempotency_key = generate_idempotency_key(customer_id, date.today())
        
        # Build Hindi message
        mandi_hi = get_mandi_name_hindi(mandi)
        signal_text = get_signal_text_hindi(sell_signal.signal)
        driver_1 = prediction.drivers[0].get('description_hi', 'मांग बढ़ी') if prediction.drivers else 'मांग बढ़ी'
        
        message = f"""🐔 आज का भाव — {mandi_hi}

₹{prediction.p50}/kg (₹{prediction.p10}–₹{prediction.p90} संभावित)

संकेत: {signal_text}

कारण: {driver_1}

—PoultryPulse AI"""
        
        # Embed steganographic watermark
        watermarked_message = embed_watermark(customer_id, message)
        
        # Send via Twilio WhatsApp
        message_obj = twilio_client.messages.create(
            body=watermarked_message,
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:+91{phone}"
        )
        
        # Log delivery
        await log_delivery(
            customer_id=customer_id,
            phone=phone,
            message_sid=message_obj.sid,
            status="queued",
            idempotency_key=idempotency_key,
            prediction=prediction,
            sell_signal=sell_signal
        )
        
        logger.info(
            "whatsapp_dispatched",
            customer_id=customer_id,
            phone=phone,
            message_sid=message_obj.sid,
            mandi=mandi,
            p50=prediction.p50,
            signal=sell_signal.signal
        )
        
        return {
            "status": "success",
            "message_sid": message_obj.sid,
            "customer_id": customer_id,
            "phone": phone,
            "mandi": mandi,
            "idempotency_key": idempotency_key
        }
        
    except TwilioRestException as e:
        logger.error("twilio_error", error=str(e), customer_id=customer_id)
        return {
            "status": "failed",
            "error": str(e),
            "customer_id": customer_id
        }
    except Exception as e:
        logger.error("dispatch_failed", error=str(e), customer_id=customer_id)
        return {
            "status": "failed",
            "error": str(e),
            "customer_id": customer_id
        }


async def dispatch_welcome_signal(customer_id: str, phone: str, mandi: str = 'gorakhpur') -> Dict[str, Any]:
    """
    Dispatch immediate welcome signal after WhatsApp verification.
    This provides instant value delivery instead of waiting 24 hours.
    
    Message template (Hindi):
    "🐔 PoultryPulse AI में आपका स्वागत है!
    
    आपका WhatsApp verify हो गया है।
    
    अभी sample signal देखें:
    📍 {{mandi}}
    💰 भाव: ₹{{sample_price}}/kg
    📈 संकेत: {{sample_signal}}
    
    कल सुबह 6:30 AM से आपको daily signal मिलेगा।
    
    —PoultryPulse AI"
    
    Args:
        customer_id: Customer ID from Supabase
        phone: Customer phone number
        mandi: Customer's mandi location
    
    Returns:
        Dict with message_sid, status, and delivery info
    """
    try:
        # Generate idempotency key for welcome signal
        idempotency_key = f"welcome_{customer_id}_{datetime.utcnow().date().isoformat()}"
        
        # Build Hindi welcome message
        mandi_hi = get_mandi_name_hindi(mandi)
        sample_price = "95"  # Sample price for welcome
        sample_signal = "HOLD"  # Sample signal
        
        message = f"""🐔 PoultryPulse AI में आपका स्वागत है!

आपका WhatsApp verify हो गया है।

अभी sample signal देखें:
📍 {mandi_hi}
💰 भाव: ₹{sample_price}/kg
📈 संकेत: {get_signal_text_hindi(sample_signal)}

कल सुबह 6:30 AM से आपको daily signal मिलेगा।

—PoultryPulse AI"""
        
        # Embed steganographic watermark
        watermarked_message = embed_watermark(customer_id, message)
        
        # Send via Twilio WhatsApp
        message_obj = twilio_client.messages.create(
            body=watermarked_message,
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:+91{phone}"
        )
        
        # Log welcome signal delivery
        try:
            supabase.table('whatsapp_delivery_log').insert({
                'customer_id': customer_id,
                'phone': phone,
                'message_sid': message_obj.sid,
                'status': 'queued',
                'idempotency_key': idempotency_key,
                'prediction_data': {
                    'p50': sample_price,
                    'is_welcome_signal': True,
                },
                'sell_signal_data': {
                    'signal': sample_signal,
                },
                'sent_at': datetime.utcnow().isoformat(),
            }).execute()
        except Exception as log_error:
            logger.error("welcome_signal_log_failed", error=str(log_error), customer_id=customer_id)
        
        logger.info(
            "welcome_signal_dispatched",
            customer_id=customer_id,
            phone=phone,
            message_sid=message_obj.sid,
            mandi=mandi
        )
        
        return {
            "status": "success",
            "message_sid": message_obj.sid,
            "customer_id": customer_id,
            "phone": phone,
            "mandi": mandi,
            "idempotency_key": idempotency_key
        }
        
    except TwilioRestException as e:
        logger.error("welcome_signal_twilio_error", error=str(e), customer_id=customer_id)
        return {
            "status": "failed",
            "error": str(e),
            "customer_id": customer_id
        }
    except Exception as e:
        logger.error("welcome_signal_dispatch_failed", error=str(e), customer_id=customer_id)
        return {
            "status": "failed",
            "error": str(e),
            "customer_id": customer_id
        }


async def dispatch_batch_forecast(predictions: list[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Dispatch forecasts to multiple customers in batch.
    Useful for daily scheduled job.
    
    Args:
        predictions: List of dicts with customer_id, prediction, sell_signal
    
    Returns:
        Dict with success_count, failure_count, and results
    """
    results = []
    success_count = 0
    failure_count = 0
    
    for item in predictions:
        customer_id = item['customer_id']
        prediction = PredictionResult(**item['prediction'])
        sell_signal = SellSignal(**item['sell_signal'])
        
        result = await dispatch_daily_forecast(customer_id, prediction, sell_signal)
        results.append(result)
        
        if result['status'] == 'success':
            success_count += 1
        else:
            failure_count += 1
    
    logger.info(
        "batch_dispatch_complete",
        total=len(predictions),
        success_count=success_count,
        failure_count=failure_count
    )
    
    return {
        "total": len(predictions),
        "success_count": success_count,
        "failure_count": failure_count,
        "results": results
    }
