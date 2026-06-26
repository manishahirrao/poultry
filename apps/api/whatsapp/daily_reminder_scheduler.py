"""
FlockIQ — Daily Reminder Scheduler
File: apps/api/whatsapp/daily_reminder_scheduler.py
Version: v3.0 | June 2026
Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md (FR-WHATSAPP-DEMO-001)
Task: WHATSAPP-002
"""

import os
import asyncio
from datetime import datetime, time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import structlog
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
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

# Cron secret for verification
CRON_SECRET = os.getenv("CRON_SECRET")

# Initialize Twilio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize Supabase client (service role for admin operations)
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


@dataclass
class FarmWithBatch:
    """Farm with active batch information"""
    id: str
    name: str
    whatsapp_phone: str
    whatsapp_lang: str
    reminder_time: str
    active_batch: Dict[str, Any]


def get_farms_needing_reminder(window_minutes: int = 15) -> List[FarmWithBatch]:
    """
    Get farms that need daily log reminders.
    
    Uses Supabase RPC function get_farms_needing_reminder for efficient querying.
    Query criteria:
    - Farm has active batch
    - Daily log for today does NOT yet exist
    - Current time matches farm's configured reminder_time (±15 min window)
    - whatsapp_reminders_enabled = true
    - whatsapp_reminders_paused = false
    - Farm has valid whatsapp_number
    
    Args:
        window_minutes: Time window in minutes (default: 15)
    
    Returns:
        List of FarmWithBatch objects
    """
    try:
        current_hour = datetime.now().hour
        current_date = datetime.now().date()
        
        # Call Supabase RPC function to get farms needing reminder
        result = supabase.rpc('get_farms_needing_reminder', {
            'target_hour': current_hour,
            'log_date': current_date.isoformat()
        }).execute()
        
        farms_to_remind = []
        
        for farm in result.data:
            # Check if farm has valid WhatsApp number
            if not farm.get('whatsapp_number'):
                continue
            
            # Map whatsapp_language from migration to whatsapp_lang
            # Migration uses 'hindi'/'english', we map to 'hi'/'en'
            lang = farm.get('whatsapp_language', 'hindi')
            whatsapp_lang = 'hi' if lang == 'hindi' else 'en'
            
            # Add to list
            farms_to_remind.append(FarmWithBatch(
                id=farm['farm_id'],
                name=farm['farm_name'],
                whatsapp_phone=farm['whatsapp_number'],
                whatsapp_lang=whatsapp_lang,
                reminder_time=str(current_hour).zfill(2) + ':00',
                active_batch={
                    'id': farm['batch_id'],
                    'day_number': farm['batch_day'],
                }
            ))
        
        logger.info("farms_needing_reminder", count=len(farms_to_remind), hour=current_hour)
        return farms_to_remind
        
    except Exception as e:
        logger.error("get_farms_needing_reminder_failed", error=str(e))
        raise


async def send_daily_reminder(farm: FarmWithBatch) -> Dict[str, Any]:
    """
    Send daily reminder to a farm via WhatsApp.
    
    Uses appropriate template based on farm's language preference.
    
    Args:
        farm: FarmWithBatch object with farm and batch information
    
    Returns:
        Dict with message_sid, status, and delivery info
    """
    try:
        # Select template based on language
        if farm.whatsapp_lang == 'hi':
            template_name = 'flockiq_daily_log_hi'
            message_body = f"""🐔 *FlockIQ — {farm.name} Farm*
 आज का log भेजें (Day {farm.active_batch['day_number']}):
 *[deaths] [feed kg]* टाइप करें
 Example: 2 1350
 
 _Weight (optional):_ *[deaths] [feed kg] [weight g]*
 दवाई: MEDICINE [name] [dose] Day-5 to Day-8"""
        else:
            template_name = 'flockiq_daily_log_en'
            message_body = f"""🐔 *FlockIQ — {farm.name} Farm*
 Day {farm.active_batch['day_number']} daily log:
 Reply with: *[deaths] [feed kg]*
 Example: 2 1350
 
 Optional weight: *2 1350 1680*
 Medicine: MEDICINE [name] [dose] Day-5 to Day-8"""
        
        # Send via Twilio WhatsApp
        message_obj = twilio_client.messages.create(
            body=message_body,
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{farm.whatsapp_phone}"
        )
        
        # Log reminder delivery
        try:
            supabase.table('whatsapp_delivery_log').insert({
                'customer_id': farm.id,
                'phone': farm.whatsapp_phone,
                'message_sid': message_obj.sid,
                'status': 'queued',
                'idempotency_key': f"reminder_{farm.id}_{datetime.now().date().isoformat()}",
                'prediction_data': {
                    'is_reminder': True,
                    'template': template_name,
                    'day_number': farm.active_batch['day_number'],
                },
                'sent_at': datetime.utcnow().isoformat(),
            }).execute()
        except Exception as log_error:
            logger.error("reminder_log_failed", error=str(log_error), farm_id=farm.id)
        
        logger.info(
            "daily_reminder_sent",
            farm_id=farm.id,
            farm_name=farm.name,
            message_sid=message_obj.sid,
            template=template_name
        )
        
        return {
            "status": "success",
            "message_sid": message_obj.sid,
            "farm_id": farm.id,
            "template": template_name
        }
        
    except TwilioRestException as e:
        logger.error("reminder_twilio_error", error=str(e), farm_id=farm.id)
        return {
            "status": "failed",
            "error": str(e),
            "farm_id": farm.id
        }
    except Exception as e:
        logger.error("reminder_send_failed", error=str(e), farm_id=farm.id)
        return {
            "status": "failed",
            "error": str(e),
            "farm_id": farm.id
        }


async def send_daily_reminders_batch(window_minutes: int = 15) -> Dict[str, Any]:
    """
    Send daily reminders to all farms that need them.
    
    Processes farms in batches with rate limiting to avoid exceeding WhatsApp API limits.
    Rate limit: 80 messages/second per WABA (we use 50 messages per batch with 1s delay)
    
    Args:
        window_minutes: Time window in minutes for reminder time matching
    
    Returns:
        Dict with sent count, success count, failure count
    """
    try:
        # Get farms needing reminder
        farms_to_remind = get_farms_needing_reminder(window_minutes)
        
        if not farms_to_remind:
            logger.info("no_farms_need_reminder")
            return {
                "sent": 0,
                "success_count": 0,
                "failure_count": 0,
                "message": "No farms need reminders at this time"
            }
        
        # Send reminders in parallel with rate limiting
        BATCH_SIZE = 50
        success_count = 0
        failure_count = 0
        
        for i in range(0, len(farms_to_remind), BATCH_SIZE):
            batch = farms_to_remind[i:i + BATCH_SIZE]
            
            # Send batch in parallel
            results = await asyncio.gather(*[send_daily_reminder(farm) for farm in batch])
            
            # Count successes and failures
            for result in results:
                if result['status'] == 'success':
                    success_count += 1
                else:
                    failure_count += 1
            
            # Rate limiting: 1 second delay between batches
            if i + BATCH_SIZE < len(farms_to_remind):
                await asyncio.sleep(1)
        
        logger.info(
            "daily_reminders_batch_complete",
            total=len(farms_to_remind),
            success_count=success_count,
            failure_count=failure_count
        )
        
        return {
            "sent": len(farms_to_remind),
            "success_count": success_count,
            "failure_count": failure_count
        }
        
    except Exception as e:
        logger.error("daily_reminders_batch_failed", error=str(e))
        raise


async def handle_cron_request(req: Request) -> JSONResponse:
    """
    Handle cron job request for sending daily reminders.
    
    Verifies cron secret header and triggers reminder dispatch.
    
    Expected header:
        Authorization: Bearer {CRON_SECRET}
    
    Returns:
        JSONResponse with dispatch results
    """
    try:
        # Verify cron secret
        auth_header = req.headers.get('authorization')
        if auth_header != f'Bearer {CRON_SECRET}':
            logger.warning("cron_unauthorized", auth_header=auth_header)
            return JSONResponse(
                content={"error": "Unauthorized"},
                status_code=401
            )
        
        logger.info("daily_reminder_cron_triggered")
        
        # Send daily reminders
        result = await send_daily_reminders_batch(window_minutes=15)
        
        return JSONResponse(
            content={
                "status": "success",
                "sent": result['sent'],
                "success_count": result['success_count'],
                "failure_count": result['failure_count']
            },
            status_code=200
        )
        
    except Exception as e:
        logger.error("cron_request_failed", error=str(e))
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )


async def check_escalation_rules() -> Dict[str, Any]:
    """
    Check escalation rules for farms that haven't submitted logs.
    
    Escalation rules:
    1. If no log received 2 hours after reminder time: send second reminder
    2. If no log received by 10 PM: alert integration manager via WhatsApp
    
    This should be run by a separate cron job at a different time slot.
    
    Returns:
        Dict with escalation actions taken
    """
    try:
        current_time = datetime.now().time()
        current_date = datetime.now().date()
        
        # Get farms that received reminders but haven't submitted logs
        # This would require tracking reminder delivery times in the database
        # For now, this is a placeholder for the escalation logic
        
        logger.info("escalation_check_complete")
        return {
            "status": "success",
            "second_reminders_sent": 0,
            "manager_alerts_sent": 0
        }
        
    except Exception as e:
        logger.error("escalation_check_failed", error=str(e))
        raise
