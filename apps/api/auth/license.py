from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import string
import random
import uuid
# Assuming a standard Supabase dependency injection from main
from security.supabase_client import get_supabase

router = APIRouter()

class GenerateLicenseRequest(BaseModel):
    agent_id: str
    plan_name: str
    payment_method: str
    payment_amount: float
    payment_reference: Optional[str] = None
    validity_days: int = 30

class ValidateLicenseRequest(BaseModel):
    key_code: str
    phone: str

class ActivateLicenseRequest(BaseModel):
    key_code: str

def generate_key_code() -> str:
    # Generates a random FLOCK-XXXX-XXXX key
    part1 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"FLOCK-{part1}-{part2}"

@router.post("/admin/licenses/generate")
async def generate_license(req: GenerateLicenseRequest, supabase = Depends(get_supabase)):
    """Admin/Agent endpoint to generate a new offline license key."""
    key_code = generate_key_code()
    
    data = {
        "key_code": key_code,
        "sales_agent_id": req.agent_id,
        "plan_name": req.plan_name,
        "payment_method": req.payment_method,
        "payment_amount": req.payment_amount,
        "payment_reference": req.payment_reference,
        "validity_days": req.validity_days
    }
    
    response = supabase.table('license_keys').insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to generate key")
        
    return {"status": "success", "key_code": key_code, "id": response.data[0]['id']}

@router.post("/auth/validate-license")
async def validate_license(req: ValidateLicenseRequest, supabase = Depends(get_supabase)):
    """Step 1 of frontend activation: Ensure key is valid before sending OTP."""
    response = supabase.table('license_keys').select('*').eq('key_code', req.key_code).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="License key not found")
        
    key_data = response.data[0]
    
    if key_data['is_used']:
        raise HTTPException(status_code=400, detail="This license key has already been used")
        
    return {"status": "valid", "plan": key_data['plan_name']}

@router.post("/auth/activate-license")
async def activate_license(req: ActivateLicenseRequest, request: Request, supabase = Depends(get_supabase)):
    """Step 2 of frontend activation: Actually bind the key to the logged in user."""
    # NOTE: This endpoint assumes the user is authenticated via Supabase middleware.
    # The Bearer token in headers proves they passed OTP.
    
    # Extract token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ")[1]
    
    # 1. Fetch current logged-in user from Supabase context
    try:
        user_response = supabase.auth.get_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"User authentication failed: {str(e)}")
        
    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="User not authenticated")
        
    user_id = user_response.user.id
    phone = user_response.user.phone
    
    # 2. Get the key
    response = supabase.table('license_keys').select('*').eq('key_code', req.key_code).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="License key not found")
        
    key_data = response.data[0]
    if key_data['is_used']:
        raise HTTPException(status_code=400, detail="This license key has already been used")
        
    # 3. Mark key as used
    now = datetime.utcnow()
    supabase.table('license_keys').update({
        'is_used': True,
        'activated_by_user_id': user_id,
        'activated_at': now.isoformat()
    }).eq('id', key_data['id']).execute()
    
    # 4. Provision or update the Subscription table
    expires_at = now + timedelta(days=key_data['validity_days'])
    
    # Check if sub exists
    sub_resp = supabase.table('subscriptions').select('*').eq('user_id', user_id).execute()
    if sub_resp.data:
        # Update existing
        supabase.table('subscriptions').update({
            'status': 'active',
            'plan_name': key_data['plan_name'],
            'expires_at': expires_at.isoformat()
        }).eq('user_id', user_id).execute()
    else:
        # Create new
        supabase.table('subscriptions').insert({
            'user_id': user_id,
            'status': 'active',
            'plan_name': key_data['plan_name'],
            'expires_at': expires_at.isoformat()
        }).execute()
        
    # 5. Ensure customer record exists
    cust_resp = supabase.table('customers').select('id').eq('id', user_id).execute()
    if not cust_resp.data:
        # Create a default customer record for the new user
        supabase.table('customers').insert({
            'id': user_id,
            'phone': phone,
            'name': 'Farmer',
            'segment': 'S1', # Default to standard farmer
            'role': 'user',
            'plan': key_data['plan_name'],
            'subscription_expires_at': expires_at.isoformat(),
            'district': 'unknown'
        }).execute()
        
    # 6. Generate and save device token for spoof protection (P0 Fix)
    device_token = str(uuid.uuid4())
    supabase.auth.admin.update_user_by_id(
        user_id,
        {"user_metadata": {"device_token": device_token}}
    )
        
    return {"status": "success", "message": "License activated successfully", "device_token": device_token}
