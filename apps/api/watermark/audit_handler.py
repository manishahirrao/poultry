"""
PoultryPulse AI — Watermark Audit Handler
File: apps/api/watermark/audit_handler.py
Version: v1.0 | May 2026
Design Reference: REQ-010, TASK-026
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


class WatermarkActionRequest(BaseModel):
    """Pydantic schema for watermark action request"""
    action: str = Field(..., description="Action to take: warning, suspend, resolve")
    notes: Optional[str] = Field(None, description="Optional notes about the action")
    
    @validator('action')
    def validate_action(cls, v):
        """Validate action type"""
        valid_actions = ['warning', 'suspend', 'resolve']
        if v not in valid_actions:
            raise ValueError(f'Invalid action: {v}')
        return v


async def get_watermark_events(limit: int = 50) -> Dict[str, Any]:
    """
    Get watermark events for audit console.
    
    Args:
        limit: Maximum number of events to return
    
    Returns:
        Dict with events list
    """
    try:
        result = supabase.table('watermark_events').select('*').order('detection_timestamp', desc=True).limit(limit).execute()
        
        return {
            "events": result.data if result.data else [],
            "count": len(result.data) if result.data else 0
        }
        
    except Exception as e:
        logger.error("get_watermark_events_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch watermark events: {str(e)}")


async def get_watermark_coverage(date: Optional[str] = None) -> Dict[str, Any]:
    """
    Get watermark coverage metrics for a given date.
    
    Args:
        date: Date string (YYYY-MM-DD), defaults to today
    
    Returns:
        Dict with coverage metrics
    """
    try:
        target_date = date or datetime.now().strftime('%Y-%m-%d')
        
        # Call the SQL function
        result = supabase.rpc('get_watermark_coverage', {'p_date': target_date}).execute()
        
        if result.data and len(result.data) > 0:
            return {
                "total_predictions": result.data[0]['total_predictions'],
                "watermarked_predictions": result.data[0]['watermarked_predictions'],
                "coverage_percentage": result.data[0]['coverage_percentage'],
                "date": target_date
            }
        else:
            return {
                "total_predictions": 0,
                "watermarked_predictions": 0,
                "coverage_percentage": 0,
                "date": target_date
            }
        
    except Exception as e:
        logger.error("get_watermark_coverage_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch coverage metrics: {str(e)}")


async def get_decode_success_rate(days: int = 30) -> Dict[str, Any]:
    """
    Get decode success rate metrics.
    
    Args:
        days: Number of days to include in calculation
    
    Returns:
        Dict with decode metrics
    """
    try:
        # Call the SQL function
        result = supabase.rpc('get_decode_success_rate', {'p_days': days}).execute()
        
        if result.data and len(result.data) > 0:
            return {
                "total_processed": result.data[0]['total_processed'],
                "successful_decodes": result.data[0]['successful_decodes'],
                "success_rate": result.data[0]['success_rate'],
                "period_days": days
            }
        else:
            return {
                "total_processed": 0,
                "successful_decodes": 0,
                "success_rate": 0,
                "period_days": days
            }
        
    except Exception as e:
        logger.error("get_decode_success_rate_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch decode metrics: {str(e)}")


async def handle_watermark_action(event_id: str, action: str, notes: Optional[str] = None, admin_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Handle action on a watermark event (warning, suspend, resolve).
    
    Args:
        event_id: Watermark event ID
        action: Action to take (warning, suspend, resolve)
        notes: Optional notes about the action
        admin_id: Admin user ID taking the action
    
    Returns:
        Dict with action result
    """
    try:
        # Get the original event
        event_result = supabase.table('watermark_events').select('*').eq('id', event_id).single().execute()
        
        if not event_result.data:
            raise HTTPException(status_code=404, detail="Watermark event not found")
        
        original_event = event_result.data[0]
        customer_id = original_event['customer_id']
        
        # Map action to state
        action_to_state = {
            'warning': 'warning_sent',
            'suspend': 'account_reviewed',
            'resolve': 'resolved'
        }
        
        new_state = action_to_state.get(action)
        if not new_state:
            raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
        
        # If suspend action, also suspend the customer account
        if action == 'suspend':
            suspend_result = supabase.rpc('suspend_customer_account', {
                'p_customer_id': customer_id,
                'p_suspended_by': admin_id or 'system'
            }).execute()
            
            if not suspend_result.data:
                logger.warning("customer_suspend_failed", customer_id=customer_id)
        
        # Create new event record with new state (immutable pattern)
        new_event_result = supabase.rpc('add_watermark_action', {
            'p_original_event_id': event_id,
            'p_new_state': new_state,
            'p_action_taken_by': admin_id or 'system',
            'p_action_notes': notes
        }).execute()
        
        logger.info(
            "watermark_action_completed",
            event_id=event_id,
            action=action,
            new_state=new_state,
            customer_id=customer_id
        )
        
        return {
            "status": "success",
            "action": action,
            "new_state": new_state,
            "new_event_id": new_event_result.data[0] if new_event_result.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("watermark_action_failed", error=str(e), event_id=event_id, action=action)
        raise HTTPException(status_code=500, detail=f"Failed to perform action: {str(e)}")


async def handle_watermark_action_request(request: Request, event_id: str) -> JSONResponse:
    """
    Handle POST request for watermark action.
    
    Args:
        request: FastAPI request
        event_id: Watermark event ID
    
    Returns:
        JSONResponse with action result
    """
    try:
        body = await request.json()
        action_request = WatermarkActionRequest(**body)
        
        # Get admin ID from request state (set by auth middleware)
        admin_id = getattr(request.state, 'customer_id', None) if hasattr(request, 'state') else None
        
        result = await handle_watermark_action(
            event_id=event_id,
            action=action_request.action,
            notes=action_request.notes,
            admin_id=admin_id
        )
        
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("watermark_action_request_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process action request: {str(e)}")
