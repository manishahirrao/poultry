"""
PoultryPulse AI — JWT Service
File: apps/api/auth/jwt_service.py
Reference: TRD v1.0 §5.1, §7.1
Generates and validates JWTs for API authentication.
"""

import os
import jwt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")
ALGORITHM = "HS256"

def create_access_token(customer_id: str, tier: str, device_fp_hash: str) -> str:
    """
    Create a JWT token valid for 7 days.
    Payload includes customer_id, tier, and device_fp_hash.
    """
    expire = datetime.utcnow() + timedelta(days=7)
    
    payload = {
        "sub": customer_id,
        "tier": tier,
        "device_fp_hash": device_fp_hash,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str, current_device_fp_hash: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Verify the JWT token and check device binding.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        
        # Check device binding
        token_device_fp_hash = payload.get("device_fp_hash")
        if token_device_fp_hash != current_device_fp_hash:
            logger.warning("device_fingerprint_mismatch", 
                           customer_id=payload.get("sub"))
            return False, {"error": "Device mismatch. Please log in again."}
            
        return True, payload
        
    except jwt.ExpiredSignatureError:
        logger.info("jwt_expired")
        return False, {"error": "Token expired"}
    except jwt.InvalidTokenError as e:
        logger.error(f"jwt_invalid: {str(e)}")
        return False, {"error": "Invalid token"}
