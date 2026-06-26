"""
FlockIQ — WhatsApp Delivery Webhook Handler
File: apps/api/whatsapp/delivery_handler.py
Version: v3.0 | June 2026
Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md (FR-WHATSAPP-DEMO-001)
Task: WHATSAPP-001
"""

import os
from typing import Dict, Any, Optional
from datetime import datetime
import structlog
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from supabase import create_client, Client as SupabaseClient

logger = structlog.get_logger()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client (service role for admin operations)
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


class DeliveryWebhookPayload(BaseModel):
    """Pydantic schema for Twilio delivery webhook validation"""
    MessageSid: str = Field(..., description="Twilio message SID")
    MessageStatus: str = Field(..., description="Delivery status: queued, sent, delivered, failed, undelivered")
    ErrorCode: Optional[str] = Field(None, description="Twilio error code if delivery failed")
    ErrorMessage: Optional[str] = Field(None, description="Twilio error message if delivery failed")
    
    @validator('MessageStatus')
    def validate_status(cls, v):
        """Validate message status"""
        valid_statuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered']
        if v not in valid_statuses:
            raise ValueError(f'Invalid status: {v}')
        return v


def extract_customer_id_from_message_sid(message_sid: str) -> Optional[str]:
    """
    Extract customer_id from message SID by looking up in message_events table.
    The message_events table stores the mapping between message_sid and customer_id.
    """
    try:
        result = supabase.table('message_events').select('customer_id').eq('message_sid', message_sid).single().execute()
        
        if result.data:
            return result.data['customer_id']
        
        return None
    except Exception as e:
        logger.error("customer_id_lookup_failed", error=str(e), message_sid=message_sid)
        return None


async def update_delivery_status(message_sid: str, status: str, error_message: Optional[str] = None) -> Dict[str, Any]:
    """
    Update delivery status in message_events table.
    
    Args:
        message_sid: Twilio message SID
        status: Delivery status (queued, sent, delivered, failed, undelivered)
        error_message: Optional error message if delivery failed
    
    Returns:
        Dict with update status
    """
    try:
        # Build update data
        update_data = {
            'delivery_status': status
        }
        
        # Add timestamp based on status
        if status == 'delivered':
            update_data['delivered_at'] = datetime.utcnow().isoformat()
        elif status in ['failed', 'undelivered']:
            update_data['error_message'] = error_message
        
        # Update the message event
        result = supabase.table('message_events').update(update_data).eq('message_sid', message_sid).execute()
        
        logger.info(
            "delivery_status_updated",
            message_sid=message_sid,
            status=status,
            updated_count=len(result.data) if result.data else 0
        )
        
        return {
            "status": "success",
            "message_sid": message_sid,
            "delivery_status": status,
            "updated": len(result.data) > 0 if result.data else False
        }
        
    except Exception as e:
        logger.error("delivery_status_update_failed", error=str(e), message_sid=message_sid, status=status)
        return {
            "status": "failed",
            "error": str(e),
            "message_sid": message_sid
        }


async def track_deep_link_click(message_sid: str) -> Dict[str, Any]:
    """
    Track when a user clicks a deep link in a WhatsApp message.
    This would be called from the frontend when user opens a deep link.
    
    Args:
        message_sid: Twilio message SID
    
    Returns:
        Dict with update status
    """
    try:
        update_data = {
            'deep_link_clicked': True,
            'deep_link_clicked_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('message_events').update(update_data).eq('message_sid', message_sid).execute()
        
        logger.info(
            "deep_link_clicked",
            message_sid=message_sid,
            updated_count=len(result.data) if result.data else 0
        )
        
        return {
            "status": "success",
            "message_sid": message_sid,
            "updated": len(result.data) > 0 if result.data else False
        }
        
    except Exception as e:
        logger.error("deep_link_click_tracking_failed", error=str(e), message_sid=message_sid)
        return {
            "status": "failed",
            "error": str(e),
            "message_sid": message_sid
        }


async def handle_delivery_webhook(request: Request) -> JSONResponse:
    """
    Handle Twilio delivery status webhook POST /api/v1/webhooks/twilio/delivery
    
    Processes delivery status events from Twilio and updates message_events table.
    This webhook is called by Twilio when message delivery status changes.
    
    Expected form data from Twilio:
    - MessageSid: Unique message identifier
    - MessageStatus: Delivery status (queued, sent, delivered, failed, undelivered)
    - ErrorCode: Error code if delivery failed (optional)
    - ErrorMessage: Error message if delivery failed (optional)
    """
    try:
        # Parse form data from Twilio
        form_data = await request.form()
        
        # Validate with Pydantic schema
        payload = DeliveryWebhookPayload(
            MessageSid=form_data.get('MessageSid'),
            MessageStatus=form_data.get('MessageStatus'),
            ErrorCode=form_data.get('ErrorCode'),
            ErrorMessage=form_data.get('ErrorMessage')
        )
        
        message_sid = payload.MessageSid
        status = payload.MessageStatus
        error_message = payload.ErrorMessage
        
        logger.info(
            "delivery_webhook_received",
            message_sid=message_sid,
            status=status,
            error_code=payload.ErrorCode
        )
        
        # Update delivery status in database
        result = await update_delivery_status(message_sid, status, error_message)
        
        # Return 200 OK to Twilio (don't retry)
        return JSONResponse(
            content={"status": "received"},
            status_code=200
        )
        
    except Exception as e:
        logger.error("delivery_webhook_error", error=str(e))
        
        # Return 200 OK even on error to prevent Twilio retries
        return JSONResponse(
            content={"status": "error", "message": str(e)},
            status_code=200
        )


async def get_analytics_summary(days: int = 30) -> Dict[str, Any]:
    """
    Get WhatsApp analytics summary for admin dashboard.
    
    Args:
        days: Number of days to include in summary (default: 30)
    
    Returns:
        Dict with analytics metrics
    """
    try:
        # Get overall metrics
        sent_result = supabase.table('message_events').select('*', count='exact').gte('sent_at', f'now() - {days} days').execute()
        sent_count = sent_result.count if hasattr(sent_result, 'count') else len(sent_result.data)
        
        delivered_result = supabase.table('message_events').select('*', count='exact').gte('sent_at', f'now() - {days} days').not_.is_('delivered_at', None).execute()
        delivered_count = delivered_result.count if hasattr(delivered_result, 'count') else len(delivered_result.data)
        
        read_result = supabase.table('message_events').select('*', count='exact').gte('sent_at', f'now() - {days} days').not_.is_('read_at', None).execute()
        read_count = read_result.count if hasattr(read_result, 'count') else len(read_result.data)
        
        deep_link_result = supabase.table('message_events').select('*', count='exact').gte('sent_at', f'now() - {days} days').eq('deep_link_clicked', True).execute()
        deep_link_count = deep_link_result.count if hasattr(deep_link_result, 'count') else len(deep_link_result.data)
        
        # Get metrics by message type
        by_type_result = supabase.table('message_events').select('message_type, count').gte('sent_at', f'now() - {days} days').execute()
        
        # Calculate rates
        delivery_rate = (delivered_count / sent_count * 100) if sent_count > 0 else 0
        read_rate = (read_count / delivered_count * 100) if delivered_count > 0 else 0
        ctr = (deep_link_count / delivered_count * 100) if delivered_count > 0 else 0
        
        return {
            "period_days": days,
            "sent_count": sent_count,
            "delivered_count": delivered_count,
            "read_count": read_count,
            "deep_link_click_count": deep_link_count,
            "delivery_rate": round(delivery_rate, 2),
            "read_rate": round(read_rate, 2),
            "ctr": round(ctr, 2),
            "by_message_type": by_type_result.data if by_type_result.data else []
        }
        
    except Exception as e:
        logger.error("analytics_summary_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")


async def get_engagement_heatmap(days: int = 7) -> Dict[str, Any]:
    """
    Get engagement heatmap data (day × hour grid).
    
    Args:
        days: Number of days to include (default: 7)
    
    Returns:
        Dict with heatmap data
    """
    try:
        # Call the SQL function to get heatmap data
        result = supabase.rpc('get_engagement_heatmap', {'p_days': days}).execute()
        
        return {
            "period_days": days,
            "heatmap_data": result.data if result.data else []
        }
        
    except Exception as e:
        logger.error("engagement_heatmap_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch heatmap: {str(e)}")


async def get_high_churn_risk_customers() -> Dict[str, Any]:
    """
    Get list of high-churn-risk customers.
    
    Returns:
        Dict with churn risk data
    """
    try:
        # Call the SQL function to get high churn risk customers
        result = supabase.rpc('get_high_churn_risk_customers').execute()
        
        return {
            "high_churn_risk_customers": result.data if result.data else []
        }
        
    except Exception as e:
        logger.error("high_churn_risk_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch churn risk data: {str(e)}")
