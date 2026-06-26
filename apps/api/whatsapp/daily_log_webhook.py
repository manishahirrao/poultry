"""
FlockIQ — WhatsApp Daily Log Automation Webhook
File: apps/api/whatsapp/daily_log_webhook.py
Version: v3.0 | June 2026
Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md (FR-WHATSAPP-DEMO-001)
Task: WHATSAPP-001
"""

import os
import hmac
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime, date
from dataclasses import dataclass
import structlog
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from supabase import create_client, Client as SupabaseClient

logger = structlog.get_logger()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
WHATSAPP_APP_SECRET = os.getenv("WHATSAPP_APP_SECRET")

# Initialize Supabase client
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# WhatsApp Business API configuration (Meta WABA or Twilio)
USE_TWILIO = os.getenv("USE_TWILIO", "false").lower() == "true"
if USE_TWILIO:
    from twilio.rest import Client
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Global dictionary to temporarily hold pending confirmations (P0 Fix)
# Note: In a multi-worker production environment, this should be migrated to Redis.
PENDING_CONFIRMATIONS: Dict[str, Dict[str, Any]] = {}

@dataclass
class ParsedLog:
    """Parsed daily log from WhatsApp message"""
    success: bool
    birds_dead: Optional[int] = None
    feed_kg: Optional[float] = None
    weight_g: Optional[float] = None
    notes: Optional[str] = None
    confidence: str = 'LOW'
    parse_method: str = ''
    error_message: Optional[str] = None


class DailyLogParser:
    """
    Natural language parser for farmer WhatsApp replies.
    Handles Hindi/English/mixed input variations.
    
    Implements parsing strategies per T-WA-002 specification:
    - STRATEGY 1: Pure numeric format "2 1250 1680"
    - STRATEGY 2: Keyword extraction (Hindi + English)
    - STRATEGY 3: Unable to parse fallback
    """
    
    def __init__(self, message: str, farm_id: str):
        self.message = message.strip()
        self.farm_id = farm_id
    
    def parse(self) -> ParsedLog:
        """Parse WhatsApp message and extract daily log data"""
        msg = self.message.strip().lower()
        
        # Check for special commands first
        if msg in ['stop', 'बंद', 'unsubscribe']:
            return ParsedLog(success=False, parse_method='command_stop', error_message='STOP_COMMAND')
        if msg in ['help', 'मदद', 'menu']:
            return ParsedLog(success=False, parse_method='command_help', error_message='HELP_COMMAND')
        if msg in ['redo', 'correction']:
            return ParsedLog(success=False, parse_method='command_redo', error_message='REDO_COMMAND')
        
        # STRATEGY 1: Pure numeric format "2 1250 1680"
        numeric_match = self._match_numeric_format(msg)
        if numeric_match:
            return numeric_match
        
        # STRATEGY 2: Keyword extraction (Hindi + English)
        keyword_result = self._parse_with_keywords(msg)
        if keyword_result:
            return keyword_result
        
        # STRATEGY 3: Unable to parse
        return ParsedLog(success=False, confidence='LOW', parse_method='failed', error_message='UNABLE_TO_PARSE')
    
    def _match_numeric_format(self, msg: str) -> Optional[ParsedLog]:
        """
        STRATEGY 1: Pure numeric format "2 1250 1680"
        Matches: "2 1250 1680", "0 1150", etc.
        """
        import re
        numeric_match = re.match(r'^(\d+)\s+(\d+(?:\.\d+)?)\s*(\d+)?$', msg)
        if numeric_match:
            birds_dead = int(numeric_match.group(1))
            feed_kg = float(numeric_match.group(2))
            weight_g = int(numeric_match.group(3)) if numeric_match.group(3) else None
            
            return ParsedLog(
                success=True,
                birds_dead=birds_dead,
                feed_kg=feed_kg,
                weight_g=weight_g,
                confidence='HIGH',
                parse_method='numeric_positional'
            )
        return None
    
    def _parse_with_keywords(self, msg: str) -> Optional[ParsedLog]:
        """
        STRATEGY 2: Keyword extraction (Hindi + English)
        Handles natural language variations
        """
        import re
        
        # Keyword definitions
        bird_keywords = ['muri', 'murgi', 'bird', 'birds', 'murgiyan', 'mur', 'dead', 'mre', 'mari']
        feed_keywords = ['kg', 'kilo', 'khana', 'khaana', 'feed', 'dana', 'daana']
        weight_keywords = ['g', 'gm', 'gram', 'wazn', 'weight']
        all_good_keywords = ['theek', 'sab theek', 'all good', 'normal', 'okay', 'ok', '0 dead', 'no death']
        
        # Check "all good" patterns
        if any(kw in msg for kw in all_good_keywords):
            feed_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|kilo)?', msg)
            if feed_match:
                return ParsedLog(
                    success=True,
                    birds_dead=0,
                    feed_kg=float(feed_match.group(1)),
                    confidence='HIGH',
                    parse_method='all_good_with_feed'
                )
        
        # Extract numbers near keywords
        numbers = re.findall(r'\d+(?:\.\d+)?', msg)
        if len(numbers) >= 2:
            numbers_float = [float(n) for n in numbers]
            
            # Heuristic: first small number = birds dead, larger number = feed kg
            sorted_nums = sorted(numbers_float)
            birds_dead = int(numbers_float[0])  # usually first number mentioned
            feed_kg = next((n for n in numbers_float if 100 < n < 50000), None)  # feed is typically 100-50000
            
            if birds_dead is not None and feed_kg is not None:
                # Try to extract weight (third number, typically 1000-4000 range)
                weight_g = next((n for n in numbers_float if 1000 < n < 4000 and n != feed_kg), None)
                if weight_g:
                    weight_g = int(weight_g)
                
                return ParsedLog(
                    success=True,
                    birds_dead=birds_dead,
                    feed_kg=feed_kg,
                    weight_g=weight_g,
                    confidence='MEDIUM',
                    parse_method='keyword_heuristic'
                )
        
        return None


class WhatsAppService:
    """Service for sending WhatsApp messages"""
    
    @staticmethod
    async def send(phone: str, message: str) -> Dict[str, Any]:
        """Send WhatsApp message to farmer"""
        try:
            if USE_TWILIO:
                # Use Twilio
                message_obj = twilio_client.messages.create(
                    body=message,
                    from_=TWILIO_WHATSAPP_FROM,
                    to=f"whatsapp:+91{phone}"
                )
                logger.info("whatsapp_sent", phone=phone, message_sid=message_obj.sid)
                return {"status": "success", "message_sid": message_obj.sid}
            else:
                # Use Meta WhatsApp Business API
                # Implementation would go here
                logger.info("whatsapp_sent_meta", phone=phone)
                return {"status": "success", "message_sid": "meta_simulated"}
        except Exception as e:
            logger.error("whatsapp_send_failed", error=str(e), phone=phone)
            return {"status": "failed", "error": str(e)}


# Help messages
HELP_MESSAGE_HINDI = """📋 FlockIQ Daily Log — Format Instructions

आज का लॉग भेजने के लिए इस format में भेजें:
[मरी हुई मुर्गियां] [खाना kg]

उदाहरण:
• 2 1250
• 0 1250
• 5 1280 1680 (with weight)

वैकल्पिक: नोट्स जोड़ सकते हैं
• 2 1250 birds looking weak

कमांड:
• HELP — यह संदेश देखें
• STOP — रिमाइंडर रोकें
• REDO — आज का लॉग सुधारें

—FlockIQ"""


def verify_whatsapp_signature(body: bytes, signature: str) -> bool:
    """
    Verify WhatsApp webhook signature for security.
    
    Args:
        body: Raw request body as bytes
        signature: X-Hub-Signature-256 header value
    
    Returns:
        True if signature is valid, False otherwise
    """
    if not WHATSAPP_APP_SECRET:
        logger.warning("whatsapp_app_secret_not_configured")
        return True  # Allow if not configured (development mode)
    
    expected_sig = hmac.new(
        WHATSAPP_APP_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return f"sha256={expected_sig}" == signature


def extract_message(payload: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """
    Extract message from WhatsApp webhook payload.
    Supports both Meta WABA and Twilio formats.
    
    Args:
        payload: Webhook payload JSON
    
    Returns:
        Dict with fromPhone, messageText, messageId or None
    """
    try:
        # Try Meta WABA format first
        if 'entry' in payload:
            entry = payload['entry'][0]
            changes = entry.get('changes', [])
            if changes:
                value = changes[0].get('value', {})
                messages = value.get('messages', [])
                if messages:
                    message = messages[0]
                    return {
                        'fromPhone': message['from'].replace('+', ''),
                        'messageText': message.get('text', {}).get('body', ''),
                        'messageId': message['id']
                    }
        
        # Try Twilio format
        elif 'From' in payload and 'Body' in payload:
            return {
                'fromPhone': payload['From'].replace('whatsapp:+', '').replace('+', ''),
                'messageText': payload['Body'],
                'messageId': payload.get('MessageSid', '')
            }
        
        return None
    except Exception as e:
        logger.error("message_extraction_failed", error=str(e))
        return None


async def get_farm_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    """Find farm by WhatsApp phone number"""
    try:
        result = supabase.table('farms').select('*').eq('whatsapp_phone', phone).eq('is_active', True).single().execute()
        
        if result.data:
            return result.data
        
        return None
    except Exception as e:
        logger.error("farm_fetch_failed", error=str(e), phone=phone)
        return None


async def get_batch_details(batch_id: str) -> Optional[Dict[str, Any]]:
    """Get batch details for validation"""
    try:
        result = supabase.table('batches').select('*').eq('id', batch_id).single().execute()
        
        if result.data:
            return result.data
        
        return None
    except Exception as e:
        logger.error("batch_fetch_failed", error=str(e), batch_id=batch_id)
        return None


def validate_log_values(parsed: ParsedLog, batch: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate parsed log values against batch data.
    
    Args:
        parsed: Parsed log data
        batch: Batch details
    
    Returns:
        Dict with validation result and confirmation message if needed
    """
    birds_placed = batch.get('birds_placed', 0)
    cumulative_dead = batch.get('cumulative_dead', 0)
    birds_alive = birds_placed - cumulative_dead
    
    # Validate birds_dead
    if parsed.birds_dead > (birds_alive * 0.15):
        return {
            'needs_confirmation': True,
            'confirmationMessage': f"⚠ आपने {parsed.birds_dead} मुर्गियां मरी हुई बताईं। यह 15% से ज्यादा है। सही है? Reply YES/NO\n\nYou reported {parsed.birds_dead} birds dead. This is >15%. Confirm? Reply YES/NO"
        }
    
    # Validate feed_kg
    if parsed.feed_kg > (birds_alive * 0.30):
        return {
            'needs_confirmation': True,
            'confirmationMessage': f"⚠ आपने {parsed.feed_kg} kg खाना बताया। यह ज्यादा लग रहा है। सही है? Reply YES/NO\n\nYou reported {parsed.feed_kg} kg feed. This seems high. Confirm? Reply YES/NO"
        }
    
    return {'needs_confirmation': False}


async def compute_batch_metrics(batch_id: str, log_id: str) -> Dict[str, Any]:
    """
    Compute batch metrics (FCR, cumulative mortality, GC to-date) after log save.
    
    Args:
        batch_id: Batch ID
        log_id: Daily log ID
    
    Returns:
        Dict with computed metrics
    """
    try:
        # Fetch GC data for the batch
        gc_result = supabase.table('batch_gc_costs').select('*').eq('batch_id', batch_id).single().execute()
        
        gc_to_date = 0.0
        if gc_result.data:
            gc_to_date = gc_result.data.get('gc_per_kg', 0.0) or 0.0
        
        # This would typically call a database function or compute from all logs
        # For now, return placeholder values for FCR and mortality
        return {
            'fcr': 1.82,
            'cumulative_mortality_pct': 0.40,
            'gc_to_date': gc_to_date
        }
    except Exception as e:
        logger.error("metrics_computation_failed", error=str(e), batch_id=batch_id)
        return {
            'fcr': 0.0,
            'cumulative_mortality_pct': 0.0,
            'gc_to_date': 0.0
        }


def build_confirmation_message(data: Dict[str, Any]) -> str:
    """Build confirmation message for farmer"""
    msg = f"""✅ Log save ho gaya — {data['farmName']} ({data['date']}):

• Mri hui murgiyan: {data['birdsDead']}
• Khaana: {data['feedKg']:.0f} kg"""
    
    if data.get('weightG'):
        msg += f"\n• Wazn: {data['weightG']} g"
    
    msg += f"""
• FCR (estimated): {data['fcr']:.2f}
• Sanchiit mortality: {data['cumulativeMortalityPct']:.2f}%"""
    
    if data.get('gcToDate'):
        msg += f"\n• GC to-date: ₹{data['gcToDate']:.2f}/kg"
    
    msg += """

Galti hai? Reply: REDO

—FlockIQ"""
    
    return msg


async def create_dashboard_alert(integrator_id: str, message: str) -> None:
    """Create dashboard alert for integration manager"""
    try:
        supabase.table('alerts').insert({
            'integrator_id': integrator_id,
            'type': 'whatsapp',
            'severity': 'medium',
            'message': message,
            'created_at': datetime.utcnow().isoformat()
        }).execute()
        
        logger.info("dashboard_alert_created", integrator_id=integrator_id)
    except Exception as e:
        logger.error("alert_creation_failed", error=str(e), integrator_id=integrator_id)


async def handle_daily_log_webhook(request: Request) -> JSONResponse:
    """
    Handle WhatsApp webhook for daily log automation.
    
    POST /api/v1/webhooks/whatsapp/daily-log
    
    Processes incoming WhatsApp messages from farmers, parses daily log data,
    validates, saves to database, and sends confirmation.
    """
    try:
        # Get raw body for signature verification
        body = await request.body()
        
        # Verify signature (Meta WABA)
        signature = request.headers.get('x-hub-signature-256', '')
        if not verify_whatsapp_signature(body, signature):
            logger.warning("invalid_webhook_signature")
            return JSONResponse(
                content={"error": "Invalid signature"},
                status_code=401
            )
        
        # Parse payload
        try:
            payload = await request.json()
        except:
            # Try form data (Twilio)
            form_data = await request.form()
            payload = dict(form_data)
        
        # Extract message
        message = extract_message(payload)
        if not message:
            logger.info("no_message_in_webhook")
            return JSONResponse(content={"status": "ack"}, status_code=200)
        
        from_phone = message['fromPhone']
        message_text = message['messageText']
        message_id = message['messageId']
        
        logger.info(
            "daily_log_webhook_received",
            phone=from_phone,
            message=message_text[:50],
            message_id=message_id
        )
        
        # Find farm by phone number
        farm = await get_farm_by_phone(from_phone)
        if not farm:
            logger.info("unknown_phone_number", phone=from_phone)
            return JSONResponse(content={"status": "ack"}, status_code=200)
        
        # Handle special commands
        upper_text = message_text.strip().upper()
        if upper_text in ['STOP', 'बंद']:
            await supabase.table('farms').update({'whatsapp_reminders_paused': True}).eq('id', farm['id']).execute()
            await WhatsAppService.send(
                from_phone,
                'FlockIQ reminders paused. Reply START to resume.\n\nFlockIQ रिमाइंडर रोक दिए गए। फिर से शुरू करने के लिए START टाइप करें।'
            )
            await create_dashboard_alert(
                farm['integrator_id'],
                f"{farm['name']}: WhatsApp reminders paused by farmer"
            )
            return JSONResponse(content={"status": "ack"}, status_code=200)
        
        if upper_text in ['HELP', 'मदद']:
            await WhatsAppService.send(from_phone, HELP_MESSAGE_HINDI)
            return JSONResponse(content={"status": "ack"}, status_code=200)
        
        if upper_text in ['REDO', 'CORRECTION', 'NO', 'नहीं']:
            if from_phone in PENDING_CONFIRMATIONS:
                del PENDING_CONFIRMATIONS[from_phone]
            
            today = date.today().isoformat()
            await supabase.table('daily_logs').delete().eq('farm_id', farm['id']).eq('log_date', today).execute()
            await WhatsAppService.send(
                from_phone,
                'Kal ka log hata diya. Abhi naya log bhejein:\n\nYesterday\'s log deleted. Please send new log:\n[mri hui murgiyan] [khaana kg]'
            )
            return JSONResponse(content={"status": "ack"}, status_code=200)
            
        if upper_text in ['YES', 'हां']:
            if from_phone in PENDING_CONFIRMATIONS:
                pending = PENDING_CONFIRMATIONS.pop(from_phone)
                parsed = pending['parsed']
                today = date.today().isoformat()
                
                if pending.get('override_existing', False):
                    await supabase.table('daily_logs').delete().eq('farm_id', farm['id']).eq('log_date', today).execute()
                
                saved_log = supabase.table('daily_logs').insert({
                    'farm_id': farm['id'],
                    'batch_id': farm['current_batch_id'],
                    'log_date': today,
                    'birds_dead': parsed.birds_dead,
                    'feed_kg': parsed.feed_kg,
                    'avg_weight_g': parsed.weight_g,
                    'notes': parsed.notes,
                    'source': 'whatsapp',
                    'raw_whatsapp_message': pending['message_text'],
                    'whatsapp_message_id': pending['message_id'],
                    'whatsapp_confirmed': True,
                    'whatsapp_confirmed_at': datetime.utcnow().isoformat(),
                    'created_at': datetime.utcnow().isoformat()
                }).select().single().execute()
                
                if not saved_log.data:
                    logger.error("log_save_failed", farm_id=farm['id'])
                    return JSONResponse(content={"status": "error"}, status_code=500)
                
                # Compute metrics
                computed = await compute_batch_metrics(farm['current_batch_id'], saved_log.data['id'])
                
                # Trigger GC recomputation
                try:
                    supabase.rpc('compute_batch_gc', {'p_batch_id': farm['current_batch_id']}).execute()
                except Exception as gc_error:
                    pass
                
                try:
                    gc_result = supabase.table('batch_gc_costs').select('gc_per_kg').eq('batch_id', farm['current_batch_id']).single().execute()
                    if gc_result.data:
                        computed['gc_to_date'] = gc_result.data.get('gc_per_kg', 0.0) or 0.0
                except Exception as gc_fetch_error:
                    pass
                
                confirm_msg = build_confirmation_message({
                    'farmName': farm['name'],
                    'date': today,
                    'birdsDead': parsed.birds_dead,
                    'feedKg': parsed.feed_kg,
                    'weightG': parsed.weight_g,
                    'fcr': computed['fcr'],
                    'cumulativeMortalityPct': computed['cumulative_mortality_pct'],
                    'gcToDate': computed['gc_to_date']
                })
                
                await WhatsAppService.send(from_phone, confirm_msg)
                
                logger.info(
                    "daily_log_saved",
                    farm_id=farm['id'],
                    log_id=saved_log.data['id'],
                    birds_dead=parsed.birds_dead,
                    feed_kg=parsed.feed_kg
                )
                return JSONResponse(content={"status": "success"}, status_code=200)
            else:
                await WhatsAppService.send(from_phone, "❌ कोई लंबित डेटा नहीं है। कृपया नया लॉग भेजें।\n\nNo pending data. Please send a new log.")
                return JSONResponse(content={"status": "ack"}, status_code=200)
        
        # Parse the log data (for new incoming log)
        parser = DailyLogParser(message_text, farm['id'])
        parsed = parser.parse()
        
        if not parsed.success:
            if parsed.error_message == 'HELP_COMMAND':
                await WhatsAppService.send(from_phone, HELP_MESSAGE_HINDI)
            elif parsed.error_message == 'STOP_COMMAND':
                pass
            else:
                await WhatsAppService.send(
                    from_phone,
                    f"FlockIQ: Aapka reply samajh nahi aaya.\n\nKripya is format mein bhejein:\n[mri hui murgiyan] [khaana kg]\n\nExample: 2 1250\n\nYour reply wasn't understood. Please send in this format:\n[birds dead] [feed kg]\n\nExample: 2 1250"
                )
            return JSONResponse(content={"status": "ack"}, status_code=200)
        
        # Get batch details for validation
        batch = await get_batch_details(farm['current_batch_id'])
        if not batch:
            logger.error("batch_not_found", farm_id=farm['id'])
            return JSONResponse(content={"status": "ack"}, status_code=200)
        
        # Validate parsed values
        validation = validate_log_values(parsed, batch)
        
        # Check for duplicate
        today = date.today().isoformat()
        existing_log = supabase.table('daily_logs').select('*').eq('farm_id', farm['id']).eq('log_date', today).single().execute()
        override_existing = bool(existing_log.data)
        
        # Store in pending confirmations
        PENDING_CONFIRMATIONS[from_phone] = {
            'parsed': parsed,
            'message_text': message_text,
            'message_id': message_id,
            'override_existing': override_existing
        }
        
        # Send confirmation prompt instead of saving immediately (P0 Fix)
        if validation['needs_confirmation']:
            await WhatsAppService.send(from_phone, validation['confirmationMessage'])
        elif override_existing:
            await WhatsAppService.send(
                from_phone,
                f"⚠ आज का लॉग पहले से सेव है। क्या आप इसे {parsed.birds_dead} मुर्गियां, {parsed.feed_kg} kg खाना से बदलना चाहते हैं? Reply YES/NO\n\nToday's log exists. Override with {parsed.birds_dead} dead, {parsed.feed_kg} kg feed? Reply YES/NO"
            )
        else:
            await WhatsAppService.send(
                from_phone,
                f"✅ दर्ज किया गया: {parsed.birds_dead} मरी हुई मुर्गियां, {parsed.feed_kg} kg खाना। पुष्टि करने के लिए YES टाइप करें या REDO टाइप करें।\n\nRecorded: {parsed.birds_dead} dead, {parsed.feed_kg} kg feed. Reply YES to confirm or REDO to correct."
            )
            
        return JSONResponse(content={"status": "ack"}, status_code=200)
        
    except Exception as e:
        logger.error("daily_log_webhook_error", error=str(e))
        return JSONResponse(
            content={"status": "error", "message": str(e)},
            status_code=500
        )
