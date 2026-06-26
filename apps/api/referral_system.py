"""
PoultryPulse AI — Referral System
File: apps/api/referral_system.py
Version: v1.0 | May 2026
Marketing Initiative #1: WhatsApp Referral Program
"""

import os
import secrets
import string
from typing import Dict, Any, Optional
from fastapi import HTTPException
from supabase import create_client, Client as SupabaseClient
import structlog

logger = structlog.get_logger()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def generate_referral_code(length: int = 8) -> str:
    """Generate a unique 8-character referral code"""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


async def create_referral(referrer_id: str, referee_phone: str) -> Dict[str, Any]:
    """
    Create a new referral entry.
    
    Args:
        referrer_id: UUID of the referrer (customer)
        referee_phone: Phone number of the referee (will be hashed)
    
    Returns:
        Dictionary with referral details including referral code
    """
    try:
        # Hash referee phone for DPDP compliance
        import hashlib
        referee_phone_hash = hashlib.sha256(referee_phone.encode()).hexdigest()
        
        # Generate unique referral code
        referral_code = generate_referral_code()
        
        # Check if referral code already exists (collision)
        existing = supabase.table('referrals').select('*').eq('referral_code', referral_code).execute()
        if existing.data:
            # Regenerate if collision
            referral_code = generate_referral_code()
        
        # Create referral record
        referral_data = {
            'referrer_id': referrer_id,
            'referee_phone_hash': referee_phone_hash,
            'referral_code': referral_code,
            'status': 'pending'
        }
        
        result = supabase.table('referrals').insert(referral_data).execute()
        
        logger.info("referral_created", referrer_id=referrer_id, referral_code=referral_code)
        
        return result.data[0] if result.data else referral_data
        
    except Exception as e:
        logger.error("referral_creation_failed", error=str(e), referrer_id=referrer_id)
        raise HTTPException(status_code=500, detail=f"Failed to create referral: {str(e)}")


async def get_referral_by_code(referral_code: str) -> Optional[Dict[str, Any]]:
    """Fetch referral details by referral code"""
    try:
        result = supabase.table('referrals').select('*').eq('referral_code', referral_code).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error("referral_fetch_failed", error=str(e), referral_code=referral_code)
        return None


async def update_referral_status(referral_id: str, status: str) -> Dict[str, Any]:
    """
    Update referral status.
    
    Args:
        referral_id: UUID of the referral
        status: New status ('signed_up', 'converted')
    
    Returns:
        Updated referral record
    """
    try:
        update_data = {'status': status}
        
        if status == 'converted':
            update_data['converted_at'] = 'NOW()'
        
        result = supabase.table('referrals').update(update_data).eq('id', referral_id).execute()
        
        logger.info("referral_status_updated", referral_id=referral_id, status=status)
        
        return result.data[0] if result.data else {}
        
    except Exception as e:
        logger.error("referral_status_update_failed", error=str(e), referral_id=referral_id)
        raise HTTPException(status_code=500, detail=f"Failed to update referral: {str(e)}")


async def get_referrer_stats(referrer_id: str) -> Dict[str, Any]:
    """
    Get referral statistics for a referrer.
    
    Args:
        referrer_id: UUID of the referrer
    
    Returns:
        Dictionary with referral stats (total, signed_up, converted, rewards)
    """
    try:
        # Get all referrals for this referrer
        result = supabase.table('referrals').select('*').eq('referrer_id', referrer_id).execute()
        
        referrals = result.data if result.data else []
        
        stats = {
            'total_referrals': len(referrals),
            'signed_up': len([r for r in referrals if r['status'] == 'signed_up']),
            'converted': len([r for r in referrals if r['status'] == 'converted']),
            'pending': len([r for r in referrals if r['status'] == 'pending']),
            'total_rewards_earned': sum([r['reward_earned'] for r in referrals])
        }
        
        return stats
        
    except Exception as e:
        logger.error("referrer_stats_fetch_failed", error=str(e), referrer_id=referrer_id)
        raise HTTPException(status_code=500, detail=f"Failed to fetch referrer stats: {str(e)}")


def get_whatsapp_referral_message(referral_code: str, referrer_name: str = "एक किसान") -> str:
    """
    Generate WhatsApp referral message in Hindi.
    
    Args:
        referral_code: Unique referral code
        referrer_name: Name of the referrer (default: "एक किसान" = "a farmer")
    
    Returns:
        Hindi WhatsApp message ready to share
    """
    message = f"""🐔 PoultryPulse AI — 7 दिन पहले भाव जानें!

{referrer_name} ने आपको PoultryPulse AI recommend किया है।

✅ आपको मिलेगा:
• 14 दिन का extended trial (मुफ़्त)
• 7 दिन का भाव अनुमान
• Daily WhatsApp signal (सुबह 6:30 बजे)
• HPAI disease alerts

🎁 रेफर कोड: {referral_code}

साइन अप करें: https://poultrypulse.ai/signup?ref={referral_code}

---
🐔 PoultryPulse AI — Know Before You Sell
95%+ सटीकता • WhatsApp पर मिलता है"""

    return message


def get_whatsapp_referral_message_english(referral_code: str, referrer_name: str = "a farmer") -> str:
    """
    Generate WhatsApp referral message in English (alternative).
    
    Args:
        referral_code: Unique referral code
        referrer_name: Name of the referrer
    
    Returns:
        English WhatsApp message ready to share
    """
    message = f"""🐔 PoultryPulse AI — Know Broiler Prices 7 Days Ahead!

{referrer_name} recommends PoultryPulse AI.

✅ You get:
• 14-day extended trial (FREE)
• 7-day price forecast
• Daily WhatsApp signal (6:30 AM)
• HPAI disease alerts

🎁 Referral code: {referral_code}

Sign up: https://poultrypulse.ai/signup?ref={referral_code}

---
🐔 PoultryPulse AI — Know Before You Sell
95%+ accuracy • Delivered on WhatsApp"""

    return message


async def grant_referrer_reward(referral_id: str) -> Dict[str, Any]:
    """
    Grant reward to referrer when referee converts.
    
    Args:
        referral_id: UUID of the referral
    
    Returns:
        Updated referral record with reward
    """
    try:
        # Get referral details
        referral = await get_referral_by_code_or_id(referral_id)
        if not referral:
            raise HTTPException(status_code=404, detail="Referral not found")
        
        # Get reward configuration
        reward_config = supabase.table('referral_rewards').select('*').eq('reward_type', 'conversion').eq('is_active', True).execute()
        
        if not reward_config.data:
            logger.warning("no_active_reward_config", referral_id=referral_id)
            return referral
        
        reward_amount = reward_config.data[0]['reward_amount']
        
        # Update referral with reward
        update_data = {
            'reward_earned': reward_amount,
            'reward_given': True
        }
        
        result = supabase.table('referrals').update(update_data).eq('id', referral_id).execute()
        
        logger.info("referrer_reward_granted", referral_id=referral_id, reward_amount=reward_amount)
        
        return result.data[0] if result.data else referral
        
    except Exception as e:
        logger.error("referrer_reward_grant_failed", error=str(e), referral_id=referral_id)
        raise HTTPException(status_code=500, detail=f"Failed to grant reward: {str(e)}")


async def get_referral_by_code_or_id(identifier: str) -> Optional[Dict[str, Any]]:
    """Fetch referral by code or ID"""
    try:
        # Try by code first
        result = supabase.table('referrals').select('*').eq('referral_code', identifier).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        # Try by ID
        result = supabase.table('referrals').select('*').eq('id', identifier).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error("referral_lookup_failed", error=str(e), identifier=identifier)
        return None
