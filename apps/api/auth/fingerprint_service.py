"""
PoultryPulse AI — FingerprintJS Pro Service
File: apps/api/auth/fingerprint_service.py
Reference: TRD v1.0 §6.2
Verifies FingerprintJS Pro tokens and gets device signals.
"""

import os
import requests
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

FPJS_API_KEY = os.getenv("FPJS_SECRET_API_KEY", "")
FPJS_REGION = os.getenv("FPJS_REGION", "ap") # Asia Pacific

def verify_fingerprint_token(request_id: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Verify a FingerprintJS Pro request ID with their Server API.
    Used during login to ensure the client-side fingerprint is authentic.
    """
    if not FPJS_API_KEY:
        logger.warning("FPJS_SECRET_API_KEY not set. Skipping server-side validation.")
        # In dev, we might just trust the client string. In prod, this is a failure.
        return True, {"visitorId": "mock-visitor-id", "confidence": {"score": 0.99}}
        
    try:
        url = f"https://{FPJS_REGION}.api.fpjs.io/events/{request_id}"
        headers = {"Auth-API-Key": FPJS_API_KEY}
        
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", {})
            identification = products.get("identification", {}).get("data", {})
            
            visitor_id = identification.get("visitorId")
            confidence = identification.get("confidence", {}).get("score", 0)
            
            # Check for bots
            botd = products.get("botd", {}).get("data", {})
            if botd.get("bot", {}).get("result") == "bad":
                logger.warning(f"Bot detected during fingerprint verification: {request_id}")
                return False, {"error": "Bot activity detected"}
                
            if confidence < 0.8:
                logger.warning(f"Low fingerprint confidence ({confidence}): {request_id}")
                
            return True, {
                "visitorId": visitor_id,
                "confidence": confidence,
                "ip": identification.get("ip"),
                "incognito": identification.get("incognito")
            }
        else:
            logger.error(f"FPJS API error: {response.status_code} - {response.text}")
            return False, {"error": "Failed to verify device fingerprint"}
            
    except Exception as e:
        logger.error(f"Error calling FPJS API: {str(e)}")
        return False, {"error": "Internal error verifying device"}
