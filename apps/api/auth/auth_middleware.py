"""
PoultryPulse AI — Auth Middleware
File: apps/api/auth/auth_middleware.py
Reference: TRD v1.0 §7.1
FastAPI middleware to validate JWTs and device fingerprints on protected routes.
"""

import hashlib
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from .jwt_service import verify_access_token

logger = logging.getLogger(__name__)

# Routes that don't require authentication
PUBLIC_ROUTES = [
    "/docs",
    "/redoc",
    "/openapi.json",
    "/health",
    "/api/v1/auth/otp-request",
    "/api/v1/auth/otp-verify",
    "/api/v1/auth/validate-license",
    "/webhooks/twilio/inbound",
    "/api/v1/webhooks/whatsapp/daily-log"  # T-WA-001: WhatsApp Daily Log Automation
]

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow CORS preflight requests to pass through
        if request.method == "OPTIONS":
            return await call_next(request)
            
        path = request.url.path
        
        # Check if route is public
        is_public = False
        for public_route in PUBLIC_ROUTES:
            if path.startswith(public_route):
                is_public = True
                break
                
        if is_public:
            return await call_next(request)
            
        # Enterprise routes use API keys (HMAC signature)
        if path.startswith("/v2/") or path.startswith("/api/v2/"):
            # Mocking enterprise API key check
            # In a real app, this would verify the HMAC signature per TRD §7.1
            api_key = request.headers.get("X-API-Key")
            if not api_key:
                return JSONResponse({"error": "Missing API Key"}, status_code=401)
            # Add org info to state
            request.state.customer_id = "ENT-123" 
            return await call_next(request)
            
        # Standard routes use JWT
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse({"error": "Missing or invalid Authorization header"}, status_code=401)
            
        token = auth_header.split(" ")[1]
        
        device_token = request.headers.get("X-Device-Token") or request.headers.get("X-Fingerprint-JS")
        if not device_token:
            return JSONResponse({"error": "Missing device token"}, status_code=400)
            
        # Verify JWT using Supabase
        from security.supabase_client import get_supabase
        try:
            supabase = get_supabase()
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                return JSONResponse({"error": "Invalid or expired token"}, status_code=401)
                
            # Verify device token spoofing (P0 Fix)
            stored_device_token = user_response.user.user_metadata.get("device_token")
            if stored_device_token and device_token != stored_device_token:
                logger.warning(f"Device token mismatch for user {user_response.user.id}")
                return JSONResponse({"error": "Invalid device binding"}, status_code=403)
                
            payload = {
                "sub": user_response.user.id,
                "tier": "free", # Can be extended to fetch actual tier if needed
                "device_fp_hash": hashlib.sha256(device_token.encode()).hexdigest()
            }
            is_valid = True
        except Exception as e:
            logger.error(f"Supabase auth validation failed: {str(e)}")
            is_valid = False
            payload = {"error": "Unauthorized"}
        
        if not is_valid:
            return JSONResponse({"error": payload.get("error", "Unauthorized")}, status_code=401)
            
        # Add auth info to request state for use in route handlers and other middleware (like watermarking)
        request.state.customer_id = payload.get("sub")
        request.state.tier = payload.get("tier")
        request.state.device_fp = device_token
        
        return await call_next(request)
