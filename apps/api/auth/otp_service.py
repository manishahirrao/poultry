"""
PoultryPulse AI — OTP Authentication Service
File: apps/api/auth/otp_service.py
Reference: TRD v1.0 §5.1 (/api/v1/auth/otp-request, /api/v1/auth/otp-verify)
"""

import os
import random
import hashlib
import bcrypt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from supabase import Client

logger = logging.getLogger(__name__)

# Mock Twilio client for now
class MockTwilioClient:
    def send_message(self, to: str, body: str):
        logger.info(f"TWILIO MOCK: Sending '{body}' to {to}")
        return True

twilio_client = MockTwilioClient()

def hash_phone_number(phone_number: str) -> str:
    """Hash phone number using SHA-256 + salt per DPDP compliance."""
    salt = os.getenv("PHONE_HASH_SALT", "default_poultry_salt")
    return hashlib.sha256(f"{phone_number}{salt}".encode()).hexdigest()

def generate_otp() -> str:
    """Generate 6-digit OTP."""
    return str(random.randint(100000, 999999))

def hash_otp(otp: str) -> str:
    """Hash OTP using bcrypt before storing."""
    return bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()

def verify_otp_hash(otp: str, hashed_otp: str) -> bool:
    """Verify an OTP against its hash."""
    return bcrypt.checkpw(otp.encode(), hashed_otp.encode())

async def request_otp(phone_number: str, supabase: Client) -> Dict[str, Any]:
    """
    Process OTP request:
    1. Validate format
    2. Hash phone
    3. Generate and hash OTP
    4. Store in Supabase with TTL
    5. Send via Twilio
    """
    if not phone_number.startswith("+") or len(phone_number) < 10:
        raise ValueError("Invalid phone format. Must include country code followed by digits.")
        
    phone_hash = hash_phone_number(phone_number)
    otp = generate_otp()
    hashed_otp = hash_otp(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    try:
        # Check rate limit (3 per hour) - Simplified check
        # ...
        
        # Store in DB
        # Table 'otp_requests' needs to exist or use a similar mechanism
        # Upsert by phone_hash
        response = supabase.table('otp_requests').upsert({
            'phone_hash': phone_hash,
            'otp_hash': hashed_otp,
            'expires_at': expires_at.isoformat()
        }).execute()
        
        # Send SMS
        message = f"{otp} is your PoultryPulse AI login code. Valid for 10 minutes. Do not share this with anyone."
        twilio_client.send_message(phone_number, message)
        
        logger.info(f"OTP requested for hashed phone {phone_hash[:8]}...")
        return {"status": "success", "message": "OTP sent successfully"}
        
    except Exception as e:
        logger.error(f"OTP request failed: {str(e)}")
        raise

async def verify_otp(phone_number: str, otp: str, device_fp: str, supabase: Client) -> Dict[str, Any]:
    """
    Verify OTP and return customer info if valid.
    """
    phone_hash = hash_phone_number(phone_number)
    
    try:
        # Fetch OTP record
        response = supabase.table('otp_requests').select('*').eq('phone_hash', phone_hash).execute()
        
        if not response.data:
            return {"valid": False, "error": "No active OTP found"}
            
        record = response.data[0]
        
        # Check expiry
        expires_at = datetime.fromisoformat(record['expires_at'])
        if datetime.utcnow() > expires_at:
            return {"valid": False, "error": "OTP expired"}
            
        # Verify hash
        if not verify_otp_hash(otp, record['otp_hash']):
            return {"valid": False, "error": "Invalid OTP"}
            
        # Delete OTP record after successful use
        supabase.table('otp_requests').delete().eq('phone_hash', phone_hash).execute()
        
        # Fetch or create customer
        cust_response = supabase.table('customers').select('*').eq('phone_hash', phone_hash).execute()
        
        device_fp_hash = hashlib.sha256(device_fp.encode()).hexdigest()
        
        if cust_response.data:
            customer = cust_response.data[0]
            # Update device fingerprint if changed
            if customer.get('device_fingerprint_hash') != device_fp_hash:
                supabase.table('customers').update({'device_fingerprint_hash': device_fp_hash}).eq('id', customer['id']).execute()
            
            logger.info(f"Successful login for customer {customer['id']}")
            return {
                "valid": True, 
                "customer_id": customer['id'], 
                "tier": customer.get('tier', 'free'),
                "device_fp_hash": device_fp_hash,
                "is_new": False
            }
        else:
            # Create new customer placeholder
            # Real creation might happen via an onboarding endpoint later
            logger.info(f"New customer detected, pending onboarding")
            return {
                "valid": True,
                "customer_id": None,
                "phone_hash": phone_hash,
                "device_fp_hash": device_fp_hash,
                "is_new": True
            }
            
    except Exception as e:
        logger.error(f"OTP verification failed: {str(e)}")
        raise
