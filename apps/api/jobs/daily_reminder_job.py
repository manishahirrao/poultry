"""
PoultryPulse AI — Daily Reminder Job
File: apps/api/jobs/daily_reminder_job.py
Version: v1.0 | June 2026
Purpose: Cron job that sends daily WhatsApp reminders to farmers at configured time
Requirements: REQ-WA-002 (Daily Reminder Scheduling), T-WA-003 (Daily Reminder Cron Job)
"""

import os
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional
from pytz import timezone
import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
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

# Timezone
IST = timezone('Asia/Kolkata')

# Initialize Twilio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize Supabase client (service role for admin operations)
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_ist_hour(utc_datetime: datetime) -> int:
    """
    Convert UTC datetime to IST hour.
    
    Args:
        utc_datetime: UTC datetime
    
    Returns:
        Hour in IST (0-23)
    """
    utc_datetime = utc_datetime.replace(tzinfo=timezone('UTC'))
    ist_datetime = utc_datetime.astimezone(IST)
    return ist_datetime.hour


def calculate_batch_day(placement_date: date, target_date: date) -> int:
    """
    Calculate batch day number from placement date.
    
    Args:
        placement_date: Date when batch was placed
        target_date: Date to calculate day number for (default: today)
    
    Returns:
        Day number (integer)
    """
    return (target_date - placement_date).days


def format_date_hindi(date_obj: date) -> str:
    """
    Format date in Hindi format.
    
    Args:
        date_obj: Date object
    
    Returns:
        Formatted date string in Hindi
    """
    # Simple format: DD/MM/YYYY
    return date_obj.strftime('%d/%m/%Y')


def build_reminder_message(
    farm_name: str,
    date_str: str,
    day_number: int,
    language: str = 'hindi'
) -> str:
    """
    Build reminder message in Hindi or English.
    
    Args:
        farm_name: Name of the farm
        date_str: Date string
        day_number: Batch day number
        language: 'hindi' or 'english'
    
    Returns:
        Formatted message string
    """
    if language == 'hindi':
        return f"""🐔 FlockIQ — {farm_name} आज का लॉग ({date_str}, Day {day_number})

Namaste! Aaj ka data bhejein:
Format: [mri hui murgiyan] [khaana kg] [wazn gm (optional)]

Example: 2 1250 1680
(matlab: 2 murgiyan mri, 1250 kg khaana, 1680 gm wazn)

Agar sab theek: 0 1250

FlockIQ — Aapke Farm ka Digital Saathi 🌱"""
    else:
        return f"""🐔 FlockIQ — {farm_name} Daily Log ({date_str}, Day {day_number})

Hi! Please send today's data:
Format: [birds dead] [feed kg] [weight gm (optional)]

Example: 2 1250 1680

If all good: 0 1250

FlockIQ — Your Farm's Digital Partner 🌱"""


async def check_today_log_exists(farm_id: str, log_date: date) -> bool:
    """
    Check if today's log already exists for a farm.
    
    Args:
        farm_id: Farm UUID
        log_date: Date to check
    
    Returns:
        True if log exists, False otherwise
    """
    try:
        result = supabase.table('daily_logs').select('id').eq('farm_id', farm_id).eq('log_date', log_date.isoformat()).execute()
        return len(result.data) > 0
    except Exception as e:
        logger.error("check_today_log_failed", error=str(e), farm_id=farm_id)
        return False


async def log_reminder_sent(
    farm_id: str,
    batch_id: str,
    phone_number: str,
    message_type: str = 'daily_reminder',
    day_number: Optional[int] = None,
    message_content: Optional[str] = None,
    twilio_message_sid: Optional[str] = None,
    delivery_status: str = 'queued',
    error_message: Optional[str] = None
) -> None:
    """
    Log sent reminder to whatsapp_reminders table.
    
    Args:
        farm_id: Farm UUID
        batch_id: Batch UUID
        phone_number: Phone number sent to
        message_type: Type of message (daily_reminder, follow_up, test)
        day_number: Batch day number
        message_content: Message content
        twilio_message_sid: Twilio message SID
        delivery_status: Delivery status
        error_message: Error message if failed
    """
    try:
        supabase.table('whatsapp_reminders').insert({
            'farm_id': farm_id,
            'batch_id': batch_id,
            'sent_at': datetime.utcnow().isoformat(),
            'message_type': message_type,
            'day_number': day_number,
            'message_content': message_content,
            'phone_number': phone_number,
            'delivery_status': delivery_status,
            'twilio_message_sid': twilio_message_sid,
            'error_message': error_message,
        }).execute()
        
        logger.info(
            "reminder_logged",
            farm_id=farm_id,
            batch_id=batch_id,
            message_type=message_type,
            delivery_status=delivery_status
        )
    except Exception as e:
        logger.error("reminder_log_failed", error=str(e), farm_id=farm_id)


async def send_whatsapp_message(
    phone_number: str,
    message: str
) -> Dict[str, Any]:
    """
    Send WhatsApp message via Twilio.
    
    Args:
        phone_number: Phone number (without country code)
        message: Message content
    
    Returns:
        Dict with status and message_sid
    """
    try:
        # Format phone number for WhatsApp
        whatsapp_to = f"whatsapp:+91{phone_number}"
        
        message_obj = twilio_client.messages.create(
            body=message,
            from_=TWILIO_WHATSAPP_FROM,
            to=whatsapp_to
        )
        
        logger.info(
            "whatsapp_sent",
            phone=phone_number,
            message_sid=message_obj.sid,
            status=message_obj.status
        )
        
        return {
            "status": "success",
            "message_sid": message_obj.sid,
            "twilio_status": message_obj.status
        }
    except TwilioRestException as e:
        logger.error("twilio_error", error=str(e), phone=phone_number)
        return {
            "status": "failed",
            "error": str(e)
        }
    except Exception as e:
        logger.error("whatsapp_send_failed", error=str(e), phone=phone_number)
        return {
            "status": "failed",
            "error": str(e)
        }


async def send_daily_reminders() -> Dict[str, Any]:
    """
    Send daily WhatsApp reminders to farms whose reminder time matches current hour.
    This function is called by the scheduler every hour.
    
    Returns:
        Dict with summary of reminders sent
    """
    now = datetime.utcnow()
    current_hour_ist = get_ist_hour(now)
    today = now.date()
    
    logger.info(
        "daily_reminder_job_started",
        current_hour_ist=current_hour_ist,
        today=today.isoformat()
    )
    
    try:
        # Fetch farms needing reminder for this hour
        # Using the database function we created in the migration
        result = supabase.rpc('get_farms_needing_reminder', {
            'target_hour': current_hour_ist,
            'log_date': today.isoformat()
        }).execute()
        
        farms = result.data
        
        if not farms:
            logger.info("no_farms_need_reminder", hour=current_hour_ist)
            return {
                "status": "success",
                "hour": current_hour_ist,
                "farms_processed": 0,
                "reminders_sent": 0,
                "reminders_failed": 0
            }
        
        logger.info("farms_to_process", count=len(farms), hour=current_hour_ist)
        
        sent_count = 0
        failed_count = 0
        
        for farm in farms:
            farm_id = farm['farm_id']
            farm_name = farm['farm_name']
            whatsapp_number = farm['whatsapp_number']
            whatsapp_language = farm.get('whatsapp_language', 'hindi')
            batch_id = farm['batch_id']
            batch_day = farm['batch_day']
            placement_date = farm['placement_date']
            batch_status = farm['batch_status']
            
            # Skip if batch is not active
            if batch_status != 'active':
                logger.info("skip_batch_not_active", farm_id=farm_id, batch_status=batch_status)
                continue
            
            # Calculate batch day if not provided
            if batch_day is None and placement_date:
                batch_day = calculate_batch_day(placement_date, today)
            
            # Build reminder message
            message = build_reminder_message(
                farm_name=farm_name,
                date_str=format_date_hindi(today),
                day_number=batch_day or 0,
                language=whatsapp_language
            )
            
            # Send WhatsApp message
            send_result = await send_whatsapp_message(whatsapp_number, message)
            
            if send_result['status'] == 'success':
                # Log successful reminder
                await log_reminder_sent(
                    farm_id=farm_id,
                    batch_id=batch_id,
                    phone_number=whatsapp_number,
                    message_type='daily_reminder',
                    day_number=batch_day,
                    message_content=message,
                    twilio_message_sid=send_result.get('message_sid'),
                    delivery_status='queued'
                )
                sent_count += 1
                logger.info("reminder_sent_success", farm_id=farm_id, farm_name=farm_name)
            else:
                # Log failed reminder
                await log_reminder_sent(
                    farm_id=farm_id,
                    batch_id=batch_id,
                    phone_number=whatsapp_number,
                    message_type='daily_reminder',
                    day_number=batch_day,
                    message_content=message,
                    delivery_status='failed',
                    error_message=send_result.get('error')
                )
                failed_count += 1
                logger.error("reminder_sent_failed", farm_id=farm_id, farm_name=farm_name, error=send_result.get('error'))
        
        logger.info(
            "daily_reminder_job_completed",
            hour=current_hour_ist,
            farms_processed=len(farms),
            reminders_sent=sent_count,
            reminders_failed=failed_count
        )
        
        return {
            "status": "success",
            "hour": current_hour_ist,
            "farms_processed": len(farms),
            "reminders_sent": sent_count,
            "reminders_failed": failed_count
        }
        
    except Exception as e:
        logger.error("daily_reminder_job_error", error=str(e))
        return {
            "status": "error",
            "error": str(e),
            "hour": current_hour_ist
        }


async def send_follow_up_reminders() -> Dict[str, Any]:
    """
    Send follow-up reminders at 8 PM IST for farms that didn't respond to initial reminder.
    This is a separate job that runs at 8 PM IST.
    
    Returns:
        Dict with summary of follow-up reminders sent
    """
    now = datetime.utcnow()
    current_hour_ist = get_ist_hour(now)
    today = now.date()
    
    logger.info(
        "follow_up_reminder_job_started",
        current_hour_ist=current_hour_ist,
        today=today.isoformat()
    )
    
    # Only run at 8 PM IST (20:00)
    if current_hour_ist != 20:
        logger.info("skip_follow_up_not_8pm", hour=current_hour_ist)
        return {
            "status": "skipped",
            "reason": "Not 8 PM IST",
            "hour": current_hour_ist
        }
    
    try:
        # Find farms that received a daily reminder today but haven't submitted log yet
        # and haven't received a follow-up yet
        result = supabase.table('whatsapp_reminders').select('*').eq('sent_at::date', today.isoformat()).eq('message_type', 'daily_reminder').execute()
        
        today_reminders = result.data
        
        if not today_reminders:
            logger.info("no_reminders_today_for_followup")
            return {
                "status": "success",
                "follow_ups_sent": 0,
                "follow_ups_failed": 0
            }
        
        sent_count = 0
        failed_count = 0
        
        for reminder in today_reminders:
            farm_id = reminder['farm_id']
            
            # Check if follow-up already sent today
            existing_followup = supabase.table('whatsapp_reminders').select('*').eq('farm_id', farm_id).eq('sent_at::date', today.isoformat()).eq('message_type', 'follow_up').execute()
            
            if existing_followup.data:
                logger.info("follow_up_already_sent", farm_id=farm_id)
                continue
            
            # Check if log submitted now
            log_exists = await check_today_log_exists(farm_id, today)
            if log_exists:
                logger.info("log_submitted_skip_followup", farm_id=farm_id)
                continue
            
            # Get farm details
            farm_result = supabase.table('farms').select('*').eq('id', farm_id).single().execute()
            if not farm_result.data:
                continue
            
            farm = farm_result.data
            farm_name = farm['name']
            whatsapp_number = farm['whatsapp_number']
            whatsapp_language = farm.get('whatsapp_language', 'hindi')
            
            # Build follow-up message
            if whatsapp_language == 'hindi':
                message = f"""🐔 FlockIQ — {farm_name} अनुस्मरण

Aaj ka log abhi tak nahi mila. Kripya data bhejein:
Format: [mri hui murgiyan] [khaana kg]

Example: 0 1250

FlockIQ — Aapke Farm ka Digital Saathi 🌱"""
            else:
                message = f"""🐔 FlockIQ — {farm_name} Reminder

We haven't received today's log yet. Please send data:
Format: [birds dead] [feed kg]

Example: 0 1250

FlockIQ — Your Farm's Digital Partner 🌱"""
            
            # Send WhatsApp message
            send_result = await send_whatsapp_message(whatsapp_number, message)
            
            if send_result['status'] == 'success':
                await log_reminder_sent(
                    farm_id=farm_id,
                    batch_id=reminder.get('batch_id'),
                    phone_number=whatsapp_number,
                    message_type='follow_up',
                    message_content=message,
                    twilio_message_sid=send_result.get('message_sid'),
                    delivery_status='queued'
                )
                sent_count += 1
            else:
                await log_reminder_sent(
                    farm_id=farm_id,
                    batch_id=reminder.get('batch_id'),
                    phone_number=whatsapp_number,
                    message_type='follow_up',
                    message_content=message,
                    delivery_status='failed',
                    error_message=send_result.get('error')
                )
                failed_count += 1
        
        logger.info(
            "follow_up_reminder_job_completed",
            follow_ups_sent=sent_count,
            follow_ups_failed=failed_count
        )
        
        return {
            "status": "success",
            "follow_ups_sent": sent_count,
            "follow_ups_failed": failed_count
        }
        
    except Exception as e:
        logger.error("follow_up_reminder_job_error", error=str(e))
        return {
            "status": "error",
            "error": str(e)
        }


# Create scheduler instance
scheduler = AsyncIOScheduler()


def start_scheduler():
    """
    Start the APScheduler with daily reminder jobs.
    This should be called during FastAPI app startup.
    """
    # Schedule daily reminder job to run every hour at minute 0
    # This will check for farms with reminder_time = current hour
    scheduler.add_job(
        send_daily_reminders,
        'cron',
        hour='*',  # Every hour
        minute='0',  # At minute 0
        id='daily_reminder_job',
        replace_existing=True
    )
    
    # Schedule follow-up reminder job to run at 8 PM IST (20:00)
    # Note: This runs in UTC, so we need to calculate the UTC time for 8 PM IST
    # IST = UTC + 5:30, so 8 PM IST = 2:30 PM UTC
    scheduler.add_job(
        send_follow_up_reminders,
        'cron',
        hour='14',  # 2 PM UTC = 8 PM IST
        minute='30',  # 30 minutes past
        id='follow_up_reminder_job',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("scheduler_started", jobs=scheduler.get_jobs())


def shutdown_scheduler():
    """
    Shutdown the scheduler.
    This should be called during FastAPI app shutdown.
    """
    scheduler.shutdown()
    logger.info("scheduler_shutdown")
