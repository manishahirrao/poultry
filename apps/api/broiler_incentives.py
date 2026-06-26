"""
PoultryPulse AI — Broiler Incentive API
File: apps/api/broiler_incentives.py
Version: v1.0 | June 2026
Purpose: API endpoints for supervisor incentive calculation and management
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException
from supabase import Client
from datetime import datetime
import structlog

logger = structlog.get_logger()


async def get_incentives(
    supabase: Client,
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Fetch supervisor incentives with optional filtering.
    
    Args:
        supabase: Supabase client instance
        customer_id: Optional customer ID for filtering (mapped to integrator_id)
        status: Optional status filter (pending, approved, paid)
        limit: Maximum number of records to return
    
    Returns:
        Dictionary with incentives data
    """
    try:
        # Build query
        query = supabase.table('supervisor_incentives').select('*')
        
        # Apply filters (note: database uses integrator_id, not customer_id)
        if customer_id:
            query = query.eq('integrator_id', customer_id)
        
        if status:
            query = query.eq('status', status)
        
        # Order by calculation date descending
        query = query.order('calculation_date', desc=True).limit(limit)
        
        result = query.execute()
        
        if not result.data:
            return {
                "data": [],
                "count": 0
            }
        
        # Fetch related data (batches, farms, employees)
        incentive_ids = [inc['id'] for inc in result.data]
        batch_ids = [inc['batch_id'] for inc in result.data if inc.get('batch_id')]
        farm_ids = [inc['farm_id'] for inc in result.data if inc.get('farm_id')]
        supervisor_ids = [inc['supervisor_id'] for inc in result.data if inc.get('supervisor_id')]
        
        # Fetch related data in parallel
        batches_data = {}
        farms_data = {}
        employees_data = {}
        
        if batch_ids:
            batches_result = supabase.table('batches').select('id, batch_number, placement_date, harvest_date, birds_placed').in_('id', batch_ids).execute()
            batches_data = {b['id']: b for b in batches_result.data} if batches_result.data else {}
        
        if farm_ids:
            farms_result = supabase.table('farms').select('id, name').in_('id', farm_ids).execute()
            farms_data = {f['id']: f for f in farms_result.data} if farms_result.data else {}
        
        if supervisor_ids:
            employees_result = supabase.table('employees').select('id, name').in_('id', supervisor_ids).execute()
            employees_data = {e['id']: e for e in employees_result.data} if employees_result.data else {}
        
        # Enrich incentives with related data
        enriched_incentives = []
        for inc in result.data:
            enriched_inc = inc.copy()
            if inc.get('batch_id') and inc['batch_id'] in batches_data:
                enriched_inc['batches'] = batches_data[inc['batch_id']]
            if inc.get('farm_id') and inc['farm_id'] in farms_data:
                enriched_inc['farms'] = farms_data[inc['farm_id']]
            if inc.get('supervisor_id') and inc['supervisor_id'] in employees_data:
                enriched_inc['employees'] = employees_data[inc['supervisor_id']]
            enriched_incentives.append(enriched_inc)
        
        return {
            "data": enriched_incentives,
            "count": len(enriched_incentives)
        }
        
    except Exception as e:
        logger.error("get_incentives_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch incentives: {str(e)}")


async def approve_incentive(
    supabase: Client,
    incentive_id: str,
    approved_by: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Approve a supervisor incentive.
    
    Args:
        supabase: Supabase client instance
        incentive_id: ID of the incentive to approve
        approved_by: ID of the user approving the incentive
        customer_id: Optional customer ID for authorization (mapped to integrator_id)
    
    Returns:
        Updated incentive data
    """
    try:
        # Check if incentive exists
        incentive_result = supabase.table('supervisor_incentives').select('*').eq('id', incentive_id).single().execute()
        
        if not incentive_result.data:
            raise HTTPException(status_code=404, detail="Incentive not found")
        
        incentive = incentive_result.data
        
        # Check authorization if customer_id provided (note: database uses integrator_id)
        if customer_id and incentive.get('integrator_id') != customer_id:
            raise HTTPException(status_code=403, detail="Not authorized to approve this incentive")
        
        # Check if incentive is in pending status
        if incentive.get('status') != 'pending':
            raise HTTPException(status_code=400, detail=f"Incentive is already {incentive.get('status')}")
        
        # Update incentive status
        update_data = {
            'status': 'approved',
            'approved_by': approved_by
        }
        
        update_result = supabase.table('supervisor_incentives').update(update_data).eq('id', incentive_id).execute()
        
        if not update_result.data:
            raise HTTPException(status_code=500, detail="Failed to update incentive")
        
        logger.info("incentive_approved", incentive_id=incentive_id, approved_by=approved_by)
        
        return {
            "data": update_result.data[0],
            "message": "Incentive approved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("approve_incentive_failed", incentive_id=incentive_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to approve incentive: {str(e)}")


async def pay_incentive(
    supabase: Client,
    incentive_id: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Mark a supervisor incentive as paid.
    
    Args:
        supabase: Supabase client instance
        incentive_id: ID of the incentive to mark as paid
        customer_id: Optional customer ID for authorization (mapped to integrator_id)
    
    Returns:
        Updated incentive data
    """
    try:
        # Check if incentive exists
        incentive_result = supabase.table('supervisor_incentives').select('*').eq('id', incentive_id).single().execute()
        
        if not incentive_result.data:
            raise HTTPException(status_code=404, detail="Incentive not found")
        
        incentive = incentive_result.data
        
        # Check authorization if customer_id provided (note: database uses integrator_id)
        if customer_id and incentive.get('integrator_id') != customer_id:
            raise HTTPException(status_code=403, detail="Not authorized to pay this incentive")
        
        # Check if incentive is in approved status
        if incentive.get('status') != 'approved':
            raise HTTPException(status_code=400, detail=f"Incentive must be approved before payment. Current status: {incentive.get('status')}")
        
        # Update incentive status
        update_data = {
            'status': 'paid',
            'paid_date': datetime.utcnow().date().isoformat()
        }
        
        update_result = supabase.table('supervisor_incentives').update(update_data).eq('id', incentive_id).execute()
        
        if not update_result.data:
            raise HTTPException(status_code=500, detail="Failed to update incentive")
        
        logger.info("incentive_paid", incentive_id=incentive_id, amount=incentive.get('net_incentive'))
        
        return {
            "data": update_result.data[0],
            "message": "Incentive marked as paid successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("pay_incentive_failed", incentive_id=incentive_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process payment: {str(e)}")


async def calculate_incentive(
    supabase: Client,
    batch_id: str,
    supervisor_id: str,
    customer_id: str
) -> Dict[str, Any]:
    """
    Calculate incentive for a supervisor based on batch performance.
    
    Args:
        supabase: Supabase client instance
        batch_id: ID of the batch
        supervisor_id: ID of the supervisor
        customer_id: ID of the customer (mapped to integrator_id)
    
    Returns:
        Calculated incentive data
    """
    try:
        # Fetch batch data
        batch_result = supabase.table('batches').select('*').eq('id', batch_id).single().execute()
        
        if not batch_result.data:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        batch = batch_result.data
        
        # Fetch farm data
        farm_result = supabase.table('farms').select('*').eq('id', batch['farm_id']).single().execute()
        
        if not farm_result.data:
            raise HTTPException(status_code=404, detail="Farm not found")
        
        farm = farm_result.data
        
        # Get target GC from breed standards or farm configuration
        target_gc = 1.8  # Default target GC, should be fetched from configuration
        
        # Calculate actual GC (Feed Conversion Ratio)
        actual_gc = batch.get('current_fcr', target_gc)
        
        # Calculate GC saving
        gc_saving = target_gc - actual_gc
        
        # Get total weight
        birds_sold = batch.get('birds_sold', batch.get('birds_placed', 0))
        avg_weight_kg = batch.get('current_avg_weight_kg', 2.0)
        total_weight_kg = birds_sold * avg_weight_kg
        
        # Incentive rate per kg (should be configurable)
        incentive_rate = 0.5  # ₹0.5 per kg of GC saving
        
        # Calculate incentive amount
        incentive_amount = gc_saving * total_weight_kg * incentive_rate
        
        # Calculate penalty if GC saving is negative
        penalty_rate = 0.75  # Higher rate for penalties
        penalty_amount = 0
        if gc_saving < 0:
            penalty_amount = abs(gc_saving) * total_weight_kg * penalty_rate
        
        # Calculate net incentive
        net_incentive = max(0, incentive_amount - penalty_amount)
        
        # Create incentive record (note: database uses integrator_id, not customer_id)
        incentive_data = {
            'supervisor_id': supervisor_id,
            'batch_id': batch_id,
            'farm_id': batch['farm_id'],
            'integrator_id': customer_id,  # Use integrator_id as per database schema
            'calculation_date': datetime.utcnow().date().isoformat(),
            'actual_gc': actual_gc,
            'target_gc': target_gc,
            'gc_saving': gc_saving,
            'birds_sold': birds_sold,
            'total_weight_kg': total_weight_kg,
            'incentive_rate': incentive_rate,
            'incentive_amount': incentive_amount,
            'penalty_rate': penalty_rate if gc_saving < 0 else 0,
            'penalty_amount': penalty_amount,
            'net_incentive': net_incentive,
            'status': 'pending'
        }
        
        insert_result = supabase.table('supervisor_incentives').insert(incentive_data).execute()
        
        if not insert_result.data:
            raise HTTPException(status_code=500, detail="Failed to create incentive record")
        
        logger.info("incentive_calculated", batch_id=batch_id, supervisor_id=supervisor_id, net_incentive=net_incentive)
        
        return {
            "data": insert_result.data[0],
            "message": "Incentive calculated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("calculate_incentive_failed", batch_id=batch_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to calculate incentive: {str(e)}")
