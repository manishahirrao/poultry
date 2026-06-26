from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
# Assuming a standard Supabase dependency injection from main
from security.supabase_client import get_supabase

router = APIRouter()

# Market standard commission for high-ticket software field sales in India:
# 10% on the upfront collection (Setup)
# 5% on recurring monthly collections (Renewals)
UPFRONT_COMMISSION_RATE = 0.10
RECURRING_COMMISSION_RATE = 0.05
STANDARD_MONTHLY_TARGET = 500000  # 5 Lakhs INR

@router.get("/admin/sales/leaderboard")
async def get_sales_leaderboard(supabase = Depends(get_supabase)):
    """Admin-only endpoint to aggregate sales performance for all agents."""
    # 1. Ensure caller is Admin
    # Bypassed: RBAC is handled by Next.js middleware
    # user_response = supabase.auth.get_user()
    # if not user_response or not user_response.user:
    #     raise HTTPException(status_code=401, detail="User not authenticated")
    
    # 2. Fetch all license keys generated this month
    # In a real app, you'd filter by current month. For demo, we fetch all.
    keys_resp = supabase.table('license_keys').select('*').execute()
    keys = keys_resp.data
    
    # 3. Aggregate data per agent
    leaderboard = {}
    
    for key in keys:
        agent_id = key.get('sales_agent_id')
        if not agent_id:
            continue
            
        if agent_id not in leaderboard:
            # Fetch agent name (simulate join)
            agent_resp = supabase.table('customers').select('name').eq('id', agent_id).execute()
            agent_name = agent_resp.data[0]['name'] if agent_resp.data else "Unknown Agent"
            
            leaderboard[agent_id] = {
                "agent_id": agent_id,
                "agent_name": agent_name,
                "keys_generated": 0,
                "keys_activated": 0,
                "total_revenue": 0,
                "commission_owed": 0,
                "target_progress_pct": 0
            }
            
        leaderboard[agent_id]["keys_generated"] += 1
        
        # Only count revenue and commission if the key was activated (or if paid upfront)
        # Assuming payment is collected when key is generated
        amount = key.get('payment_amount', 0)
        leaderboard[agent_id]["total_revenue"] += amount
        
        # Calculate Commission
        # If it's the 1 Lakh setup, 10%. If it's a 5k renewal, 5%.
        if amount >= 100000:
            leaderboard[agent_id]["commission_owed"] += (amount * UPFRONT_COMMISSION_RATE)
        else:
            leaderboard[agent_id]["commission_owed"] += (amount * RECURRING_COMMISSION_RATE)
            
        if key.get('is_used'):
            leaderboard[agent_id]["keys_activated"] += 1

    # 4. Finalize calculations (conversion rate, target progress)
    results = []
    for agent_id, stats in leaderboard.items():
        stats["conversion_rate"] = round((stats["keys_activated"] / stats["keys_generated"]) * 100, 1) if stats["keys_generated"] > 0 else 0
        stats["target_progress_pct"] = min(100, round((stats["total_revenue"] / STANDARD_MONTHLY_TARGET) * 100, 1))
        results.append(stats)
        
    # Sort by highest revenue
    results.sort(key=lambda x: x['total_revenue'], reverse=True)
    
    return {"status": "success", "leaderboard": results}


@router.get("/sales/my-renewals")
async def get_my_renewals(supabase = Depends(get_supabase)):
    """Agent-only endpoint to fetch upcoming renewals for their customers."""
    # Bypassed: RBAC is handled by Next.js middleware
    # In production, extract agent_id from a JWT/cookie header
    # For now, return all renewals (admin view)
    agent_id = None  # Will fetch all if no agent filter
    
    # 1. Fetch activated keys (optionally filtered by agent)
    query = supabase.table('license_keys') \
        .select('activated_by_user_id, plan_name') \
        .eq('is_used', True)
    if agent_id:
        query = query.eq('sales_agent_id', agent_id)
    keys_resp = query.execute()
        
    if not keys_resp.data:
        return {"status": "success", "renewals": []}
        
    customer_ids = [k['activated_by_user_id'] for k in keys_resp.data if k.get('activated_by_user_id')]
    
    # 2. Fetch those customers' subscriptions
    if not customer_ids:
        return {"status": "success", "renewals": []}
        
    subs_resp = supabase.table('subscriptions') \
        .select('user_id, status, expires_at, customers(name, phone)') \
        .in_('user_id', customer_ids) \
        .execute()
        
    renewals = []
    now = datetime.utcnow()
    warning_threshold = now + timedelta(days=5) # 5 days until expiry
    
    for sub in subs_resp.data:
        expires_at = datetime.fromisoformat(sub['expires_at'].replace('Z', '+00:00')) if sub.get('expires_at') else None
        
        days_remaining = (expires_at - now).days if expires_at else 0
        
        status_flag = "healthy"
        if expires_at and expires_at < now:
            status_flag = "expired"
        elif expires_at and expires_at <= warning_threshold:
            status_flag = "warning"
            
        customer_info = sub.get('customers', {})
        
        renewals.append({
            "customer_id": sub['user_id'],
            "customer_name": customer_info.get('name', 'Unknown Farmer'),
            "phone": customer_info.get('phone', 'N/A'),
            "status": sub['status'],
            "expires_at": sub['expires_at'],
            "days_remaining": days_remaining,
            "status_flag": status_flag
        })
        
    # Sort so expired and warning are at the top
    renewals.sort(key=lambda x: x['days_remaining'])
    
    return {"status": "success", "renewals": renewals}
