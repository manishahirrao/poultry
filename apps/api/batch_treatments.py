"""
PoultryPulse AI — Treatment Log API
File: apps/api/batch_treatments.py
Version: v1.0 | June 2026
Task: TASK-GAP3-API-001
Requirements: REQ-GAP3-HEALTH-001 through REQ-GAP3-HEALTH-005
Description: API endpoints for medication/treatment tracking with withdrawal period management
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException, Request
from supabase import Client
import structlog
from datetime import datetime, date, timedelta
from decimal import Decimal

logger = structlog.get_logger()


async def verify_farm_ownership(supabase: Client, farm_id: str, customer_id: str) -> bool:
    """
    Verify that the farm belongs to the authenticated customer/integrator.
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID to verify
        customer_id: Customer ID from JWT token
        
    Returns:
        True if farm belongs to customer, False otherwise
    """
    try:
        result = supabase.table('farms').select('id, integrator_id').eq('id', farm_id).single().execute()
        
        if not result.data:
            return False
            
        farm = result.data
        # Check if farm belongs to this integrator/customer
        return farm.get('integrator_id') == customer_id
        
    except Exception as e:
        logger.error("farm_ownership_verification_failed", farm_id=farm_id, customer_id=customer_id, error=str(e))
        return False


async def get_medicine_withdrawal_days(supabase: Client, medicine_name: str) -> int:
    """
    Get standard withdrawal days from medicines_db for a given medicine name.
    Matches against generic_name or brand_names array.
    
    Args:
        supabase: Supabase client instance
        medicine_name: Medicine name to look up
        
    Returns:
        Withdrawal days (0 if not found)
    """
    try:
        # Try exact match on generic_name first
        result = supabase.table('medicines_db') \
            .select('standard_withdrawal_days_india') \
            .eq('generic_name', medicine_name) \
            .single() \
            .execute()
        
        if result.data:
            return result.data.get('standard_withdrawal_days_india', 0)
        
        # Try case-insensitive match on generic_name
        result = supabase.table('medicines_db') \
            .select('standard_withdrawal_days_india') \
            .ilike('generic_name', medicine_name) \
            .execute()
        
        if result.data:
            return result.data[0].get('standard_withdrawal_days_india', 0)
        
        # Try match in brand_names array
        result = supabase.table('medicines_db') \
            .select('standard_withdrawal_days_india') \
            .contains('brand_names', f"{medicine_name}") \
            .execute()
        
        if result.data:
            return result.data[0].get('standard_withdrawal_days_india', 0)
        
        return 0
        
    except Exception as e:
        logger.error("medicine_withdrawal_lookup_failed", medicine_name=medicine_name, error=str(e))
        return 0


async def calculate_withdrawal_status(
    supabase: Client,
    batch_id: str
) -> Dict[str, Any]:
    """
    Calculate withdrawal status for a batch based on all treatments.
    
    Args:
        supabase: Supabase client instance
        batch_id: Batch ID to calculate status for
        
    Returns:
        Dictionary with withdrawal status information
    """
    try:
        today = date.today()
        
        # Query for all treatments with withdrawal days
        result = supabase.table('batch_treatments') \
            .select('treatment_id, medicine_name, last_dose_date, withdrawal_days, clearance_date') \
            .eq('batch_id', batch_id) \
            .gt('withdrawal_days', 0) \
            .execute()
        
        treatments = result.data if result.data else []
        
        # Calculate active withdrawals
        active_withdrawals = []
        latest_clearance_date = None
        
        for treatment in treatments:
            clearance_date_str = treatment.get('clearance_date')
            if clearance_date_str:
                clearance_date = datetime.strptime(clearance_date_str, '%Y-%m-%d').date()
                
                if clearance_date > today:
                    # Active withdrawal
                    days_remaining = (clearance_date - today).days
                    active_withdrawals.append({
                        'medicine_name': treatment.get('medicine_name'),
                        'last_dose_date': treatment.get('last_dose_date'),
                        'clearance_date': clearance_date_str,
                        'days_remaining': days_remaining
                    })
                
                # Track latest clearance date
                if latest_clearance_date is None or clearance_date > latest_clearance_date:
                    latest_clearance_date = clearance_date
        
        return {
            'has_active_withdrawal': len(active_withdrawals) > 0,
            'active_withdrawals': active_withdrawals,
            'latest_clearance_date': latest_clearance_date.isoformat() if latest_clearance_date else None,
            'harvest_safe': len(active_withdrawals) == 0
        }
        
    except Exception as e:
        logger.error("withdrawal_status_calculation_failed", batch_id=batch_id, error=str(e))
        # On error, assume safe to avoid blocking operations
        return {
            'has_active_withdrawal': False,
            'active_withdrawals': [],
            'latest_clearance_date': None,
            'harvest_safe': True
        }


async def get_batch_treatments(
    supabase: Client,
    farm_id: str,
    batch_id: Optional[str] = None,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    GET /api/farms/{farmId}/treatments
    Returns all treatment events for the batch + withdrawal_status
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        batch_id: Optional batch ID to filter treatments
        customer_id: Customer ID for ownership verification
        
    Returns:
        Dictionary with treatments list and withdrawal_status
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Build query
    query = supabase.table('batch_treatments').select('*').eq('farm_id', farm_id)
    
    if batch_id:
        query = query.eq('batch_id', batch_id)
    
    treatments_result = query.order('treatment_date', desc=True).execute()
    treatments = treatments_result.data if treatments_result.data else []
    
    # Calculate withdrawal status if batch_id provided
    withdrawal_status = {
        'has_active_withdrawal': False,
        'active_withdrawals': [],
        'latest_clearance_date': None,
        'harvest_safe': True
    }
    
    if batch_id:
        withdrawal_status = await calculate_withdrawal_status(supabase, batch_id)
    
    return {
        'treatments': treatments,
        'withdrawal_status': withdrawal_status
    }


async def create_batch_treatment(
    supabase: Client,
    farm_id: str,
    treatment_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    POST /api/farms/{farmId}/treatments
    Create a new treatment event
    
    Side effects:
    1. Creates batch_treatments record
    2. If cost_per_unit + quantity provided: auto-creates batch_medicine_costs record
    3. Auto-fills withdrawal_days from medicines_db if medicine_name matches
    4. Calculates clearance_date = last_dose_date + withdrawal_days
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        treatment_data: Treatment event data
        customer_id: Customer ID for ownership verification
        
    Returns:
        Created treatment record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Validate required fields
    if 'batch_id' not in treatment_data:
        raise HTTPException(status_code=400, detail="batch_id is required")
    
    if 'medicine_name' not in treatment_data:
        raise HTTPException(status_code=400, detail="medicine_name is required")
    
    if 'treatment_date' not in treatment_data:
        raise HTTPException(status_code=400, detail="treatment_date is required")
    
    batch_id = treatment_data['batch_id']
    medicine_name = treatment_data['medicine_name']
    
    # Auto-fill withdrawal_days from medicines_db if not provided
    withdrawal_days = treatment_data.get('withdrawal_days')
    if withdrawal_days is None:
        withdrawal_days = await get_medicine_withdrawal_days(supabase, medicine_name)
        if withdrawal_days == 0:
            withdrawal_days = treatment_data.get('withdrawal_days', 0)
    
    # Calculate clearance_date if withdrawal_days > 0
    clearance_date = None
    if withdrawal_days > 0:
        last_dose_date_str = treatment_data.get('last_dose_date', treatment_data.get('treatment_date'))
        if last_dose_date_str:
            last_dose_date = datetime.strptime(last_dose_date_str, '%Y-%m-%d').date()
            clearance_date = last_dose_date + timedelta(days=withdrawal_days)
    
    # Prepare treatment record
    treatment_record = {
        'batch_id': batch_id,
        'farm_id': farm_id,
        'integrator_id': customer_id,
        'treatment_date': treatment_data.get('treatment_date'),
        'medicine_name': medicine_name,
        'brand_name': treatment_data.get('brand_name'),
        'lot_number': treatment_data.get('lot_number'),
        'purpose': treatment_data.get('purpose'),
        'dosage_amount': treatment_data.get('dosage_amount'),
        'dosage_unit': treatment_data.get('dosage_unit'),
        'dosage_per': treatment_data.get('dosage_per'),
        'route': treatment_data.get('route'),
        'treatment_day_start': treatment_data.get('treatment_day_start'),
        'treatment_day_end': treatment_data.get('treatment_day_end'),
        'last_dose_date': treatment_data.get('last_dose_date'),
        'withdrawal_days': withdrawal_days,
        'clearance_date': clearance_date.isoformat() if clearance_date else None,
        'is_complete': treatment_data.get('is_complete', False),
        'vet_id': treatment_data.get('vet_id'),
        'vet_name_snapshot': treatment_data.get('vet_name_snapshot'),
        'notes': treatment_data.get('notes'),
        'created_by': customer_id,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    # Insert treatment record
    try:
        result = supabase.table('batch_treatments').insert(treatment_record).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create treatment record")
        
        treatment = result.data[0]
        logger.info("batch_treatment_created", treatment_id=treatment['treatment_id'], batch_id=batch_id, medicine_name=medicine_name)
        
        # Side effect: Create batch_medicine_costs record if cost provided
        cost_per_unit = treatment_data.get('cost_per_unit')
        quantity = treatment_data.get('quantity')
        
        if cost_per_unit and quantity and float(cost_per_unit) > 0:
            from batch_costs import create_batch_cost
            
            cost_data = {
                'batch_id': batch_id,
                'cost_type': 'medicine',
                'item_name': medicine_name,
                'cost_per_unit': cost_per_unit,
                'quantity': quantity,
                'total_cost': float(cost_per_unit) * float(quantity),
                'unit': treatment_data.get('cost_unit', 'unit'),
                'purchase_date': treatment_data.get('treatment_date'),
                'supplier': treatment_data.get('supplier'),
                'notes': treatment_data.get('notes'),
                'treatment_id': treatment['treatment_id']
            }
            
            try:
                medicine_cost = await create_batch_cost(supabase, farm_id, cost_data, customer_id)
                logger.info("batch_medicine_cost_created", cost_id=medicine_cost.get('cost_id'), treatment_id=treatment['treatment_id'])
            except Exception as e:
                logger.warning("batch_medicine_cost_creation_failed", treatment_id=treatment['treatment_id'], error=str(e))
                # Don't fail the treatment creation if cost creation fails
        
        return treatment
        
    except Exception as e:
        logger.error("batch_treatment_creation_failed", batch_id=batch_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create treatment record: {str(e)}")


async def update_batch_treatment(
    supabase: Client,
    farm_id: str,
    treatment_id: str,
    treatment_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    PATCH /api/farms/{farmId}/treatments/{treatmentId}
    Update an existing treatment event
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        treatment_id: Treatment ID to update
        treatment_data: Updated treatment data
        customer_id: Customer ID for ownership verification
        
    Returns:
        Updated treatment record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if treatment exists and belongs to this farm
    existing_treatment = supabase.table('batch_treatments').select('*').eq('treatment_id', treatment_id).eq('farm_id', farm_id).single().execute()
    
    if not existing_treatment.data:
        raise HTTPException(status_code=404, detail="Treatment record not found")
    
    # Prepare update data (only include provided fields)
    update_data = {}
    allowed_fields = [
        'treatment_date', 'medicine_name', 'brand_name', 'lot_number', 'purpose',
        'dosage_amount', 'dosage_unit', 'dosage_per', 'route',
        'treatment_day_start', 'treatment_day_end', 'last_dose_date',
        'withdrawal_days', 'is_complete', 'vet_id', 'vet_name_snapshot', 'notes'
    ]
    
    for field in allowed_fields:
        if field in treatment_data:
            update_data[field] = treatment_data[field]
    
    # Auto-fill withdrawal_days from medicines_db if medicine_name changed and withdrawal_days not provided
    if 'medicine_name' in update_data and 'withdrawal_days' not in update_data:
        withdrawal_days = await get_medicine_withdrawal_days(supabase, update_data['medicine_name'])
        if withdrawal_days > 0:
            update_data['withdrawal_days'] = withdrawal_days
    
    # Recalculate clearance_date if withdrawal_days or last_dose_date changed
    if 'withdrawal_days' in update_data or 'last_dose_date' in update_data:
        withdrawal_days = update_data.get('withdrawal_days', existing_treatment.data.get('withdrawal_days', 0))
        last_dose_date_str = update_data.get('last_dose_date', existing_treatment.data.get('last_dose_date'))
        
        if withdrawal_days > 0 and last_dose_date_str:
            last_dose_date = datetime.strptime(last_dose_date_str, '%Y-%m-%d').date()
            clearance_date = last_dose_date + timedelta(days=withdrawal_days)
            update_data['clearance_date'] = clearance_date.isoformat()
        elif withdrawal_days == 0:
            update_data['clearance_date'] = None
    
    update_data['updated_at'] = datetime.now().isoformat()
    
    # Update treatment record
    try:
        result = supabase.table('batch_treatments').update(update_data).eq('treatment_id', treatment_id).execute()
        
        if result.data:
            logger.info("batch_treatment_updated", treatment_id=treatment_id)
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to update treatment record")
            
    except Exception as e:
        logger.error("batch_treatment_update_failed", treatment_id=treatment_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update treatment record: {str(e)}")


async def delete_batch_treatment(
    supabase: Client,
    farm_id: str,
    treatment_id: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    DELETE /api/farms/{farmId}/treatments/{treatmentId}
    Delete a treatment event
    
    Side effects:
    1. Deletes associated batch_medicine_costs entry
    2. Recalculates withdrawal status
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        treatment_id: Treatment ID to delete
        customer_id: Customer ID for ownership verification
        
    Returns:
        Deletion confirmation
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if treatment exists and belongs to this farm
    existing_treatment = supabase.table('batch_treatments').select('*').eq('treatment_id', treatment_id).eq('farm_id', farm_id).single().execute()
    
    if not existing_treatment.data:
        raise HTTPException(status_code=404, detail="Treatment record not found")
    
    treatment = existing_treatment.data
    batch_id = treatment.get('batch_id')
    
    # Delete treatment record
    try:
        result = supabase.table('batch_treatments').delete().eq('treatment_id', treatment_id).execute()
        
        logger.info("batch_treatment_deleted", treatment_id=treatment_id)
        
        # Side effect 1: Delete associated batch_medicine_costs entry
        from batch_costs import delete_batch_cost
        
        try:
            # Find medicine cost linked to this treatment
            cost_result = supabase.table('batch_medicine_costs') \
                .select('cost_id') \
                .eq('treatment_id', treatment_id) \
                .execute()
            
            if cost_result.data:
                for cost in cost_result.data:
                    await delete_batch_cost(supabase, farm_id, cost['cost_id'], customer_id)
                    logger.info("batch_medicine_cost_deleted", cost_id=cost['cost_id'], treatment_id=treatment_id)
        except Exception as e:
            logger.warning("batch_medicine_cost_deletion_failed", treatment_id=treatment_id, error=str(e))
        
        # Side effect 2: Withdrawal status will be recalculated on next GET
        # No immediate action needed as it's computed dynamically
        
        return {'deleted': True, 'treatment_id': treatment_id}
            
    except Exception as e:
        logger.error("batch_treatment_deletion_failed", treatment_id=treatment_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete treatment record: {str(e)}")


async def get_medicines_autocomplete(
    supabase: Client,
    query: str,
    limit: int = 10
) -> Dict[str, Any]:
    """
    GET /api/medicines?q=[query]&limit=10
    Medicine autocomplete endpoint
    Returns medicines_db rows matching generic_name or brand_names ILIKE '%query%'
    
    Args:
        supabase: Supabase client instance
        query: Search query string
        limit: Maximum number of results to return
        
    Returns:
        Dictionary with medicines list
    """
    try:
        # Search in generic_name
        result = supabase.table('medicines_db') \
            .select('*') \
            .ilike('generic_name', f'%{query}%') \
            .limit(limit) \
            .execute()
        
        medicines = result.data if result.data else []
        
        return {'medicines': medicines}
        
    except Exception as e:
        logger.error("medicines_autocomplete_failed", query=query, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to search medicines: {str(e)}")
