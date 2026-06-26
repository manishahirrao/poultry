"""
PoultryPulse AI — Re-engagement Email System
File: apps/api/email/reengagement.py
Version: v1.0 | May 2026
Description: Send re-engagement emails for users who don't complete onboarding
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import structlog
from supabase import create_client, Client as SupabaseClient

logger = structlog.get_logger()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client (service role for admin operations)
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_onboarding_abandoners(hours_since_start: int = 24) -> list[Dict[str, Any]]:
    """
    Get users who started onboarding but didn't complete it within specified hours.
    
    Args:
        hours_since_start: Hours to look back for abandoned onboarding
    
    Returns:
        List of customers with incomplete onboarding
    """
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_since_start)
        
        # Query customers who:
        # 1. Have onboarding_step set (started onboarding)
        # 2. Don't have onboarding_completed_at (didn't complete)
        # 3. Started onboarding more than X hours ago
        # 4. Haven't received a re-engagement email recently
        
        response = supabase.table('customers').select('*').eq('onboarding_completed_at', None).not_('onboarding_step', 'is', None).gte('created_at', cutoff_time.isoformat()).execute()
        data = response.data
        
        # Filter out customers who already received re-engagement email recently
        # This would require an email_log table, for now we'll return all
        return data if data else []
        
    except Exception as e:
        logger.error("failed_to_get_abandoners", error=str(e))
        return []


def send_reengagement_email(customer_id: str, email: str, current_step: str) -> Dict[str, Any]:
    """
    Send re-engagement email to user who abandoned onboarding.
    
    Args:
        customer_id: Customer ID from Supabase
        email: Customer email address
        current_step: The step they abandoned on
    
    Returns:
        Dict with status and delivery info
    """
    try:
        # Determine email content based on abandoned step
        email_content = get_email_content_for_step(current_step)
        
        # In production, this would integrate with an email service like SendGrid, AWS SES, etc.
        # For now, we'll log the email content
        logger.info(
            "reengagement_email_sent",
            customer_id=customer_id,
            email=email,
            current_step=current_step,
            subject=email_content['subject'],
        )
        
        # Log email delivery to email_log table (would need to create this table)
        # For now, we'll just return success
        return {
            "status": "success",
            "customer_id": customer_id,
            "email": email,
            "current_step": current_step,
        }
        
    except Exception as e:
        logger.error("failed_to_send_reengagement_email", error=str(e), customer_id=customer_id)
        return {
            "status": "failed",
            "error": str(e),
            "customer_id": customer_id
        }


def get_email_content_for_step(step: str) -> Dict[str, str]:
    """
    Get email content based on the step where user abandoned.
    
    Args:
        step: The onboarding step where user abandoned
    
    Returns:
        Dict with subject and body content
    """
    # Map steps to email content
    step_content = {
        'OB-01': {
            'subject': '🐔 आपका setup अधूरा है — PoultryPulse AI',
            'body': '''नमस्ते!

आपने PoultryPulse AI की शुरुआत की थी लेकिन setup पूरा नहीं हुआ।

बस 2 मिनट में आपका free trial setup हो जाएगा:
• आपकी farm की location
• Flock size
• Plan selection

कल सुबह 6:30 AM से आपको daily price signal मिलना शुरू हो जाएगा।

Setup पूरा करें: [LINK]

— PoultryPulse AI Team'''
        },
        'OB-02': {
            'subject': '🐔 आपका plan चुना नहीं — PoultryPulse AI',
            'body': '''नमस्ते!

आपने अपनी farm की details भर दीं लेकिन plan confirm नहीं किया।

14 दिन का free trial — कोई credit card नहीं:
• Daily WhatsApp sell signal (6:30 AM)
• 7-day price forecast
• Disease alerts

Plan confirm करें: [LINK]

— PoultryPulse AI Team'''
        },
        'OB-03': {
            'subject': '🐔 WhatsApp verify करें — PoultryPulse AI',
            'body': '''नमस्ते!

आपका almost setup हो गया है, बस WhatsApp verify बाकी है।

WhatsApp verify करने पर आपको:
• अभी welcome signal मिलेगा
• कल सुबह 6:30 AM से daily signal मिलना शुरू हो जाएगा

WhatsApp verify करें: [LINK]

— PoultryPulse AI Team'''
        },
    }
    
    # Default content for unknown steps
    default_content = {
        'subject': '🐔 आपका setup अधूरा है — PoultryPulse AI',
        'body': '''नमस्ते!

आपने PoultryPulse AI की शुरुआत की थी लेकिन setup पूरा नहीं हुआ।

बस 2 मिनट में आपका free trial setup हो जाएगा।

Setup पूरा करें: [LINK]

— PoultryPulse AI Team'''
    }
    
    return step_content.get(step, default_content)


async def process_abandoned_onboarding(hours_since_start: int = 24) -> Dict[str, Any]:
    """
    Process all users who abandoned onboarding and send re-engagement emails.
    
    Args:
        hours_since_start: Hours to look back for abandoned onboarding
    
    Returns:
        Dict with processing results
    """
    try:
        abandoners = get_onboarding_abandoners(hours_since_start)
        
        if not abandoners:
            logger.info("no_abandoners_found", hours_since_start=hours_since_start)
            return {
                "status": "success",
                "total": 0,
                "sent": 0,
                "failed": 0,
            }
        
        results = []
        sent_count = 0
        failed_count = 0
        
        for customer in abandoners:
            customer_id = customer.get('id')
            email = customer.get('email')  # Would need to add email field to customers table
            current_step = customer.get('onboarding_step', 'OB-01')
            
            if not email:
                logger.warning("customer_no_email", customer_id=customer_id)
                failed_count += 1
                continue
            
            result = send_reengagement_email(customer_id, email, current_step)
            results.append(result)
            
            if result['status'] == 'success':
                sent_count += 1
            else:
                failed_count += 1
        
        logger.info(
            "reengagement_processing_complete",
            total=len(abandoners),
            sent=sent_count,
            failed=failed_count
        )
        
        return {
            "status": "success",
            "total": len(abandoners),
            "sent": sent_count,
            "failed": failed_count,
            "results": results
        }
        
    except Exception as e:
        logger.error("reengagement_processing_failed", error=str(e))
        return {
            "status": "failed",
            "error": str(e)
        }


# Scheduled job function (would be called by a cron job or task scheduler)
async def scheduled_reengagement_job():
    """
    Scheduled job to send re-engagement emails.
    Should be called daily to check for abandoned onboarding.
    """
    logger.info("starting_scheduled_reengagement_job")
    
    # Check for users who abandoned 24 hours ago
    result_24h = await process_abandoned_onboarding(hours_since_start=24)
    
    # Check for users who abandoned 48 hours ago (second reminder)
    result_48h = await process_abandoned_onboarding(hours_since_start=48)
    
    logger.info(
        "scheduled_reengagement_job_complete",
        result_24h=result_24h,
        result_48h=result_48h
    )
    
    return {
        "24h": result_24h,
        "48h": result_48h
    }
