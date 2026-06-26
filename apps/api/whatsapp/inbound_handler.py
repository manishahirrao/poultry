"""
FlockIQ — WhatsApp Inbound Handler
File: apps/api/whatsapp/inbound_handler.py
Version: v3.0 | June 2026
Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md (FR-WHATSAPP-DEMO-001)
Task: WHATSAPP-001
"""

import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import structlog
from fastapi import Request, HTTPException
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
from pydantic import BaseModel, Field, validator
from supabase import create_client, Client as SupabaseClient

logger = structlog.get_logger()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


class UserIntent(Enum):
    """User intent from WhatsApp message"""
    PRICE = "price"  # "भाव" / "price" → send current forecast
    HELP = "help"  # "मदद" / "help" → send menu
    STOP = "stop"  # "बंद" / "stop" → unsubscribe
    UNKNOWN = "unknown"


@dataclass
class WebhookPayload:
    """Twilio webhook payload"""
    phone: str
    message: str
    message_sid: str


class WebhookPayloadSchema(BaseModel):
    """Pydantic schema for Twilio webhook validation"""
    From: str = Field(..., description="Phone number in format whatsapp:+91XXXXXXXXXX")
    Body: str = Field(..., description="Message body text")
    MessageSid: str = Field(..., description="Twilio message SID")
    
    @validator('From')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if not v.startswith('whatsapp:+91'):
            raise ValueError('Invalid phone format')
        return v
    
    @validator('Body')
    def validate_body(cls, v):
        """Validate message body"""
        if not v or len(v.strip()) == 0:
            raise ValueError('Message body cannot be empty')
        return v.strip()


def detect_intent(message: str) -> UserIntent:
    """
    Detect user intent from message text.
    Supports Hindi and English keywords.
    
    Intent detection:
    - "भाव" / "price" → send current forecast
    - "मदद" / "help" → send menu
    - "बंद" / "stop" → unsubscribe
    """
    message_lower = message.lower().strip()
    
    # Price intent
    if message_lower in ['भाव', 'price', 'bhav', 'rate']:
        return UserIntent.PRICE
    
    # Help intent
    if message_lower in ['मदद', 'help', 'menu']:
        return UserIntent.HELP
    
    # Stop intent
    if message_lower in ['बंद', 'stop', 'unsubscribe']:
        return UserIntent.STOP
    
    return UserIntent.UNKNOWN


def extract_phone_number(phone: str) -> str:
    """Extract phone number from Twilio format (whatsapp:+91XXXXXXXXXX)"""
    return phone.replace('whatsapp:+', '')


async def get_customer_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    """Fetch customer by phone number from Supabase"""
    try:
        response = supabase.table('customers').select('*').eq('phone', phone).execute()
        data = response.data
        
        if data and len(data) > 0:
            customer = data[1][0] if isinstance(data, tuple) and len(data) > 1 else data
            return customer
        
        return None
    except Exception as e:
        logger.error("customer_fetch_failed", error=str(e), phone=phone)
        return None


async def get_latest_prediction(customer_id: str, mandi: str) -> Optional[Dict[str, Any]]:
    """Fetch latest prediction for customer's mandi"""
    try:
        response = supabase.table('predictions').select('*').eq('mandi', mandi).order('predicted_at', ascending=False).limit(1).execute()
        data = response.data
        
        if data and len(data) > 0:
            prediction = data[1][0] if isinstance(data, tuple) and len(data) > 1 else data
            return prediction
        
        return None
    except Exception as e:
        logger.error("prediction_fetch_failed", error=str(e), customer_id=customer_id, mandi=mandi)
        return None


async def handle_price_intent(phone: str) -> str:
    """Handle price intent - send current forecast"""
    customer = await get_customer_by_phone(phone)
    
    if not customer:
        return "❌ आपकी जानकारी नहीं मिली। कृपया पहले ऐप से रजिस्टर करें।\n\nYour information not found. Please register via the app first."
    
    mandi = customer.get('mandi', 'gorakhpur')
    prediction = await get_latest_prediction(customer['id'], mandi)
    
    if not prediction:
        return "❌ अभी भविष्यवाणी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।\n\nPrediction not available yet. Please try again later."
    
    # Format Hindi response
    mandi_map = {
        'gorakhpur': 'गोरखपुर',
        'deoria': 'देवरिया',
        'basti': 'बस्ती',
        'kushinagar': 'कुशीनगर',
        'maharajganj': 'महाराजगंज',
    }
    mandi_hi = mandi_map.get(mandi, mandi)
    
    response = f"""🐔 आज का भाव — {mandi_hi}

₹{prediction['p50']}/kg (₹{prediction['p10']}–₹{prediction['p90']} संभावित)

विश्वास: {prediction['confidence']}%

—PoultryPulse AI"""
    
    return response


def handle_help_intent() -> str:
    """Handle help intent - send menu"""
    response = """📋 PoultryPulse AI मेनू

भाव जानने के लिए टाइप करें:
• "भाव" या "price"

मदद के लिए टाइप करें:
• "मदद" या "help"

सदस्यता रोकने के लिए टाइप करें:
• "बंद" या "stop"

—

📋 PoultryPulse AI Menu

Type for price:
• "भाव" or "price"

For help:
• "मदद" or "help"

To unsubscribe:
• "बंद" or "stop"

—PoultryPulse AI"""
    
    return response


async def handle_stop_intent(phone: str) -> str:
    """Handle stop intent - unsubscribe user"""
    customer = await get_customer_by_phone(phone)
    
    if not customer:
        return "❌ आपकी जानकारी नहीं मिली।\n\nYour information not found."
    
    try:
        # Update customer's whatsapp_opt_in to false
        supabase.table('customers').update({'whatsapp_opt_in': False}).eq('id', customer['id']).execute()
        
        logger.info("user_unsubscribed", customer_id=customer['id'], phone=phone)
        
        response = """✅ आपकी सदस्यता रोक दी गई है।

आप अब WhatsApp संदेश प्राप्त नहीं करेंगे।

ऐप से पुनः सक्षम करें।

—

✅ You have been unsubscribed.

You will no longer receive WhatsApp messages.

Re-enable via the app."""
        
        return response
    except Exception as e:
        logger.error("unsubscribe_failed", error=str(e), customer_id=customer['id'])
        return "❌ त्रुटि हुई। कृपया पुनः प्रयास करें।\n\nError occurred. Please try again."


def handle_unknown_intent() -> str:
    """Handle unknown intent"""
    response = """❓ मुझे समझ नहीं आया।

मदद के लिए "मदद" टाइप करें।

—

❓ I didn't understand.

Type "help" for assistance."""
    
    return response


async def handle_inbound_webhook(request: Request) -> Response:
    """
    Handle Twilio inbound webhook POST /webhooks/twilio/inbound
    
    Parses WebhookPayloadSchema with Pydantic model
    Intent detection: "भाव" / "price" → send current forecast; "मदद" / "help" → send menu; "बंद" / "stop" → unsubscribe
    Responds within Twilio's 5-second webhook timeout
    """
    try:
        # Parse form data from Twilio
        form_data = await request.form()
        
        # Validate with Pydantic schema
        payload = WebhookPayloadSchema(
            From=form_data.get('From'),
            Body=form_data.get('Body'),
            MessageSid=form_data.get('MessageSid')
        )
        
        phone = extract_phone_number(payload.From)
        message = payload.Body
        message_sid = payload.MessageSid
        
        logger.info(
            "webhook_received",
            phone=phone,
            message=message,
            message_sid=message_sid
        )
        
        # Detect intent
        intent = detect_intent(message)
        
        logger.info("intent_detected", intent=intent.value, phone=phone)
        
        # Handle intent
        if intent == UserIntent.PRICE:
            response_text = await handle_price_intent(phone)
        elif intent == UserIntent.HELP:
            response_text = handle_help_intent()
        elif intent == UserIntent.STOP:
            response_text = await handle_stop_intent(phone)
        else:
            response_text = handle_unknown_intent()
        
        # Create TwiML response
        twiml_response = MessagingResponse()
        twiml_response.message(response_text)
        
        logger.info(
            "webhook_responded",
            intent=intent.value,
            phone=phone,
            message_sid=message_sid
        )
        
        return Response(
            content=str(twiml_response),
            media_type="application/xml",
            status_code=200
        )
        
    except Exception as e:
        logger.error("webhook_error", error=str(e))
        
        # Return error response
        twiml_response = MessagingResponse()
        twiml_response.message("❌ त्रुटि हुई। कृपया पुनः प्रयास करें।\n\nError occurred. Please try again.")
        
        return Response(
            content=str(twiml_response),
            media_type="application/xml",
            status_code=200
        )
