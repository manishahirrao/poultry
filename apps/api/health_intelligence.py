"""
PoultryPulse AI — Health Intelligence Integration
File: apps/api/health_intelligence.py
Version: v1.0 | May 2026
Task: TASK-036 - Health-to-Price Intelligence Integration
Description: Handles health checklist triggers and escalates HPAI alerts when respiratory symptoms are detected
"""

from typing import Dict, Any, Optional
from supabase import Client
import structlog
from datetime import datetime, timedelta

logger = structlog.get_logger()


async def check_hpai_alert_escalation(
    supabase: Client,
    customer_id: str,
    district: str,
    respiratory_status: str
) -> Dict[str, Any]:
    """
    Check if there's an active HPAI alert within 200km and escalate if respiratory symptoms are present.
    
    Args:
        supabase: Supabase client
        customer_id: Customer ID who submitted the health checklist
        district: District of the customer
        respiratory_status: Respiratory status from health checklist
        
    Returns:
        Dict with escalation status and alert details
    """
    # Only escalate if respiratory symptoms are present
    if respiratory_status == 'normal':
        return {
            'escalated': False,
            'reason': 'No respiratory symptoms detected'
        }
    
    try:
        # Check for active HPAI alerts in the same district
        # In production, this would use geospatial queries with actual coordinates
        # For now, we'll use district matching as a proxy for proximity
        hpai_alerts = supabase.table('alerts').select('*').eq('type', 'HPAI').eq('severity', 'critical').contains('districts', [district]).gte('active_from', datetime.now().isoformat()).lte('active_until', datetime.now().isoformat()).execute()
        
        if not hpai_alerts.data or len(hpai_alerts.data) == 0:
            return {
                'escalated': False,
                'reason': 'No active HPAI alert in district'
            }
        
        # Get the customer's district coordinates (in production, this would be from customer profile)
        # For now, we'll use district matching
        customer_district = district
        
        # Check if any HPAI alert is within 200km (simplified to district matching)
        # In production, this would use PostGIS: ST_DWithin(coordinates, alert_coordinates, 200000)
        nearby_alerts = [alert for alert in hpai_alerts.data if customer_district in alert.get('districts', [])]
        
        if not nearby_alerts:
            return {
                'escalated': False,
                'reason': 'No HPAI alert within 200km'
            }
        
        # Escalate the alert for this customer
        alert = nearby_alerts[0]
        
        # Create escalated alert specifically for this customer
        escalated_alert = {
            'customer_id': customer_id,
            'type': 'HPAI_ESCALATED',
            'severity': 'critical',
            'title': 'HPAI Alert Escalated - Respiratory Symptoms Detected',
            'title_hi': 'बर्ड फ्लू चेतावनी बढ़ा दी गई - श्वसन लक्षण पाए गए',
            'message': f'Your flock is showing respiratory symptoms and there is an active HPAI alert within 200km. Immediate veterinary consultation recommended.',
            'message_hi': '⚠ आपके झुंड में लक्षण + पास में बर्ड फ्लू — तुरंत डॉक्टर को बुलाएं',
            'districts': [district],
            'active_from': datetime.now().isoformat(),
            'active_until': (datetime.now() + timedelta(days=7)).isoformat(),
            'metadata': {
                'original_alert_id': alert['id'],
                'respiratory_status': respiratory_status,
                'escalation_reason': 'health_checklist_respiratory_symptoms',
                'distance_km': '<200'  # In production, actual distance
            }
        }
        
        # Insert escalated alert
        supabase.table('alerts').insert(escalated_alert).execute()
        
        logger.info(
            'hpai_alert_escalated',
            customer_id=customer_id,
            district=district,
            respiratory_status=respiratory_status,
            original_alert_id=alert['id']
        )
        
        return {
            'escalated': True,
            'alert_id': alert['id'],
            'escalated_alert_details': escalated_alert
        }
        
    except Exception as e:
        logger.error(
            'hpai_escalation_check_failed',
            customer_id=customer_id,
            error=str(e)
        )
        return {
            'escalated': False,
            'error': str(e)
        }


async def handle_health_checklist_insert(
    supabase: Client,
    checklist_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Handle health checklist INSERT trigger and perform health intelligence integration.
    
    Args:
        supabase: Supabase client
        checklist_data: Health checklist data from INSERT trigger
        
    Returns:
        Dict with processing results
    """
    try:
        batch_id = checklist_data.get('batch_id')
        respiratory_status = checklist_data.get('respiratory', 'normal')
        
        # Get batch details to find customer and district
        batch_response = supabase.table('batches').select('customer_id, district').eq('id', batch_id).execute()
        
        if not batch_response.data:
            logger.error('batch_not_found', batch_id=batch_id)
            return {
                'success': False,
                'error': 'Batch not found'
            }
        
        batch = batch_response.data[0]
        customer_id = batch['customer_id']
        district = batch.get('district', 'Unknown')
        
        # Check for HPAI alert escalation
        escalation_result = await check_hpai_alert_escalation(
            supabase=supabase,
            customer_id=customer_id,
            district=district,
            respiratory_status=respiratory_status
        )
        
        logger.info(
            'health_checklist_processed',
            batch_id=batch_id,
            customer_id=customer_id,
            respiratory_status=respiratory_status,
            escalation_result=escalation_result
        )
        
        return {
            'success': True,
            'escalation_result': escalation_result
        }
        
    except Exception as e:
        logger.error(
            'health_checklist_processing_failed',
            checklist_data=checklist_data,
            error=str(e)
        )
        return {
            'success': False,
            'error': str(e)
        }


async def check_missing_checklist_alert(
    supabase: Client,
    customer_id: str,
    district: str
) -> Dict[str, Any]:
    """
    Check if health checklist was submitted by 10:00 AM IST and create alert if missing.
    
    Args:
        supabase: Supabase client
        customer_id: Customer ID to check
        district: District of the customer
        
    Returns:
        Dict with alert creation status
    """
    try:
        today = datetime.now().date()
        ten_am = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
        current_time = datetime.now()
        
        # If it's before 10 AM, don't check yet
        if current_time < ten_am:
            return {
                'alert_created': False,
                'reason': 'Before 10:00 AM IST'
            }
        
        # Check if health checklist was submitted today
        checklist_response = supabase.table('health_checklists').select('*').eq('log_date', today.isoformat()).execute()
        
        if checklist_response.data and len(checklist_response.data) > 0:
            return {
                'alert_created': False,
                'reason': 'Checklist already submitted today'
            }
        
        # Check if customer has active batches
        batches_response = supabase.table('batches').select('*').eq('customer_id', customer_id).in_('status', ['placement', 'growing', 'pre_harvest', 'harvest_ready']).execute()
        
        if not batches_response.data or len(batches_response.data) == 0:
            return {
                'alert_created': False,
                'reason': 'No active batches'
            }
        
        # Create missing checklist alert
        missing_alert = {
            'customer_id': customer_id,
            'type': 'supervisor_checklist_missing',
            'severity': 'warning',
            'title': 'Daily Health Checklist Missing',
            'title_hi': 'दैनिक स्वास्थ्य जांच लंबित',
            'message': 'No health checklist submitted today. Please complete the daily health check for your active batches.',
            'message_hi': 'आज कोई स्वास्थ्य जांच नहीं भरी गई। कृपया अपने सक्रिय बैचों के लिए दैनिक स्वास्थ्य जांच पूरी करें।',
            'districts': [district],
            'active_from': datetime.now().isoformat(),
            'active_until': (datetime.now() + timedelta(days=1)).isoformat(),
            'metadata': {
                'check_date': today.isoformat(),
                'active_batch_count': len(batches_response.data)
            }
        }
        
        supabase.table('alerts').insert(missing_alert).execute()
        
        logger.info(
            'missing_checklist_alert_created',
            customer_id=customer_id,
            district=district,
            active_batch_count=len(batches_response.data)
        )
        
        return {
            'alert_created': True,
            'alert_details': missing_alert
        }
        
    except Exception as e:
        logger.error(
            'missing_checklist_alert_failed',
            customer_id=customer_id,
            error=str(e)
        )
        return {
            'alert_created': False,
            'error': str(e)
        }
