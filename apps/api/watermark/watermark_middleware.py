"""
PoultryPulse AI — Watermarking Middleware
File: apps/api/watermark/watermark_middleware.py
Reference: TRD v1.0 §6.1
FastAPI middleware to apply ZWC and numeric watermarks to all outbound prediction JSONs.
"""

import json
import logging
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from .zwc_encoder import apply_text_watermark
from .numeric_perturbation import apply_numeric_watermark_to_prediction

logger = logging.getLogger(__name__)

class WatermarkMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Only apply to prediction endpoints and successful responses
        if request.url.path.startswith("/v1/predict") and response.status_code == 200:
            try:
                # Need to read the response body to modify it
                body = [section async for section in response.body_iterator]
                body_str = b"".join(body).decode()
                prediction_data = json.loads(body_str)
                
                # Get customer ID and device fingerprint from request state (set by AuthMiddleware)
                # Fallback to anonymous if not set (should not happen in prod for protected routes)
                customer_id = getattr(request.state, "customer_id", "ANON")
                device_fp = getattr(request.state, "device_fp", "0000")
                timestamp_hour = int(datetime.utcnow().timestamp() / 3600)
                date_str = datetime.utcnow().strftime("%Y-%m-%d")
                
                # 1. Apply Numeric Watermark
                watermarked_data = apply_numeric_watermark_to_prediction(
                    prediction_data, 
                    customer_id, 
                    date_str
                )
                
                # 2. Apply Text Watermark (ZWC) to drivers
                if 'drivers' in watermarked_data:
                    for driver in watermarked_data['drivers']:
                        if 'description_hi' in driver:
                            driver['description_hi'] = apply_text_watermark(
                                driver['description_hi'],
                                customer_id,
                                timestamp_hour,
                                device_fp
                            )
                            
                # Re-serialize
                watermarked_body = json.dumps(watermarked_data).encode()
                
                # Create a new response
                new_response = Response(
                    content=watermarked_body,
                    status_code=response.status_code,
                    headers=dict(response.headers)
                )
                # Update Content-Length
                new_response.headers['Content-Length'] = str(len(watermarked_body))
                
                # Add Watermark Token header (TRD §5.1)
                new_response.headers['X-Watermark-Token'] = f"{customer_id}-{timestamp_hour}"
                
                logger.info(
                    "watermark_applied", 
                    customer_id=customer_id, 
                    path=request.url.path
                )
                
                return new_response
                
            except Exception as e:
                logger.error(f"Failed to apply watermark: {str(e)}")
                # If watermarking fails, return original response or error?
                # TRD says "The watermark must be applied to 100% of predictions. No exceptions."
                # So we should probably fail securely.
                return Response("Internal Error: Watermarking Failed", status_code=500)
                
        return response
