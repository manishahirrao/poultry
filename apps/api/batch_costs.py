"""
PoultryPulse AI — Batch P&L Cost Tracking API
File: apps/api/batch_costs.py
Version: v1.0 | June 2026
Task: TASK-GAP1-API-001
Requirements: REQ-GAP1-PL-001 through REQ-GAP1-PL-007
Description: API endpoints for batch cost tracking (chick, feed, medicine, labour, overhead)
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException, Request
from supabase import Client
import structlog
from datetime import datetime, date
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


async def get_batch_costs(
    supabase: Client,
    farm_id: str,
    batch_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    GET /api/farms/{farmId}/costs
    Returns all cost entries for a batch, grouped by category + computed totals
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        batch_id: Optional batch ID to filter costs
        customer_id: Customer ID for ownership verification
        start_date: Optional start date for filtering costs (inclusive)
        end_date: Optional end date for filtering costs (inclusive)
        
    Returns:
        Dictionary with costs, pl_summary, feed_costs, and medicine_costs
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Build query
    query = supabase.table('batch_costs').select('*').eq('farm_id', farm_id).is_('deleted_at', None)
    
    if batch_id:
        query = query.eq('batch_id', batch_id)
    
    # Add date range filter
    if start_date:
        query = query.gte('entry_date', start_date.isoformat())
    if end_date:
        query = query.lte('entry_date', end_date.isoformat())
    
    costs_result = query.execute()
    costs = costs_result.data if costs_result.data else []
    
    # Get batch information for P&L calculations
    batch = None
    if batch_id:
        batch_result = supabase.table('batches').select('*').eq('id', batch_id).single().execute()
        if batch_result.data:
            batch = batch_result.data
    
    # Calculate P&L summary
    pl_summary = {
        'chick_total': 0,
        'feed_total': 0,
        'medicine_total': 0,
        'labour_total': 0,
        'overhead_total': 0,
        'other_total': 0,
        'grand_total': 0,
        'live_cost_per_bird': 0,
        'estimated_revenue': 0
    }
    
    # Calculate totals from batch_costs
    for cost in costs:
        category = cost.get('category')
        amount = float(cost.get('amount', 0))
        
        if category == 'chick':
            pl_summary['chick_total'] += amount
        elif category in ('labour_daily', 'labour_period'):
            pl_summary['labour_total'] += amount
        elif category == 'overhead':
            # Apply batch share percentage
            batch_share_pct = float(cost.get('batch_share_pct', 100))
            pl_summary['overhead_total'] += amount * (batch_share_pct / 100)
        elif category == 'other':
            pl_summary['other_total'] += amount
    
    # Get feed costs from feed_purchase_log table
    feed_costs = {'total': 0, 'avg_rate': 0, 'total_mt': 0}
    if batch_id:
        try:
            feed_query = supabase.table('feed_purchase_log').select('*').eq('batch_id', batch_id).is_('deleted_at', None)
            
            # Add date range filter
            if start_date:
                feed_query = feed_query.gte('purchase_date', start_date.isoformat())
            if end_date:
                feed_query = feed_query.lte('purchase_date', end_date.isoformat())
            
            feed_result = feed_query.execute()
            feed_purchases = feed_result.data if feed_result.data else []
            
            total_feed_cost = 0
            total_feed_kg = 0
            
            for purchase in feed_purchases:
                quantity = float(purchase.get('quantity_kg', 0))
                rate = float(purchase.get('rate_per_kg', 0))
                total_feed_cost += quantity * rate
                total_feed_kg += quantity
            
            feed_costs['total'] = total_feed_cost
            feed_costs['total_mt'] = total_feed_kg / 1000 if total_feed_kg > 0 else 0
            feed_costs['avg_rate'] = total_feed_cost / total_feed_kg if total_feed_kg > 0 else 0
            pl_summary['feed_total'] = total_feed_cost
            
        except Exception as e:
            logger.error("feed_costs_fetch_failed", batch_id=batch_id, error=str(e))
    
    # Get medicine costs from batch_medicine_costs table
    medicine_costs = []
    medicine_total = 0
    if batch_id:
        try:
            med_query = supabase.table('batch_medicine_costs').select('*').eq('batch_id', batch_id).is_('deleted_at', None)
            
            # Add date range filter
            if start_date:
                med_query = med_query.gte('administration_date', start_date.isoformat())
            if end_date:
                med_query = med_query.lte('administration_date', end_date.isoformat())
            
            med_result = med_query.execute()
            medicine_costs = med_result.data if med_result.data else []
            
            for med in medicine_costs:
                medicine_total += float(med.get('total_cost', 0))
            
            pl_summary['medicine_total'] = medicine_total
            
        except Exception as e:
            logger.error("medicine_costs_fetch_failed", batch_id=batch_id, error=str(e))
    
    # Calculate grand total
    pl_summary['grand_total'] = (
        pl_summary['chick_total'] +
        pl_summary['feed_total'] +
        pl_summary['medicine_total'] +
        pl_summary['labour_total'] +
        pl_summary['overhead_total'] +
        pl_summary['other_total']
    )
    
    # Calculate live cost per bird
    if batch and batch.get('birds_placed') and batch['birds_placed'] > 0:
        pl_summary['live_cost_per_bird'] = pl_summary['grand_total'] / batch['birds_placed']
    else:
        pl_summary['live_cost_per_bird'] = 0
    
    # Calculate estimated revenue (if batch data available)
    if batch:
        birds_alive = batch.get('birds_alive', batch.get('birds_placed', 0))
        avg_weight = batch.get('latest_avg_weight_kg', 0)
        
        # Get latest P50 price from price intelligence (placeholder - would need actual price table)
        # For now, using a default or fetching from predictions table
        latest_p50_price = 168.0  # Default fallback price in INR
        
        try:
            # Try to get latest price from predictions
            pred_result = supabase.table('predictions').select('p50_price').eq('mandi', batch.get('mandi', 'gorakhpur')).order('predicted_at', ascending=False).limit(1).execute()
            if pred_result.data and len(pred_result.data) > 0:
                latest_p50_price = float(pred_result.data[0].get('p50_price', 168.0))
        except Exception as e:
            logger.error("price_fetch_failed", error=str(e))
        
        pl_summary['estimated_revenue'] = birds_alive * avg_weight * latest_p50_price
    
    return {
        'costs': costs,
        'pl_summary': pl_summary,
        'feed_costs': feed_costs,
        'medicine_costs': medicine_costs
    }


async def create_batch_cost(
    supabase: Client,
    farm_id: str,
    cost_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    POST /api/farms/{farmId}/costs
    Create a new cost entry for a batch
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        cost_data: Cost entry data
        customer_id: Customer ID for ownership verification
        
    Returns:
        Created cost record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Validate required fields
    if 'batch_id' not in cost_data:
        raise HTTPException(status_code=400, detail="batch_id is required")
    
    if 'category' not in cost_data:
        raise HTTPException(status_code=400, detail="category is required")
    
    category = cost_data['category']
    valid_categories = ['chick', 'labour_daily', 'labour_period', 'overhead', 'other']
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {valid_categories}")
    
    # Auto-compute amount for labour_daily category
    if category == 'labour_daily':
        batch_id = cost_data['batch_id']
        workers_count = cost_data.get('workers_count', 0)
        rate_per_day = cost_data.get('rate_per_day', 0)
        
        # Get batch current day
        try:
            batch_result = supabase.table('batches').select('doc_placement_date').eq('id', batch_id).single().execute()
            if batch_result.data:
                placement_date = batch_result.data.get('doc_placement_date')
                if placement_date:
                    if isinstance(placement_date, str):
                        placement_date = datetime.strptime(placement_date, '%Y-%m-%d').date()
                    current_day = (date.today() - placement_date).days + 1
                    cost_data['amount'] = workers_count * rate_per_day * current_day
                    cost_data['days_count'] = current_day
        except Exception as e:
            logger.error("batch_day_calculation_failed", batch_id=batch_id, error=str(e))
    
    # Prepare cost record
    cost_record = {
        'batch_id': cost_data['batch_id'],
        'farm_id': farm_id,
        'integrator_id': customer_id,
        'category': category,
        'entry_date': cost_data.get('entry_date', date.today().isoformat()),
        'amount': cost_data.get('amount', 0),
        'description': cost_data.get('description'),
        'notes': cost_data.get('notes'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    # Add category-specific fields
    if category == 'chick':
        cost_record['doc_supplier'] = cost_data.get('doc_supplier')
        cost_record['price_per_doc'] = cost_data.get('price_per_doc')
        cost_record['transport_cost'] = cost_data.get('transport_cost')
    
    elif category in ('labour_daily', 'labour_period'):
        cost_record['workers_count'] = cost_data.get('workers_count')
        cost_record['rate_per_day'] = cost_data.get('rate_per_day')
        cost_record['period_start_date'] = cost_data.get('period_start_date')
        cost_record['period_end_date'] = cost_data.get('period_end_date')
        cost_record['days_count'] = cost_data.get('days_count')
    
    elif category == 'overhead':
        cost_record['overhead_category'] = cost_data.get('overhead_category')
        cost_record['frequency'] = cost_data.get('frequency', 'once')
        cost_record['batch_share_pct'] = cost_data.get('batch_share_pct', 100.0)
    
    # Insert cost record
    try:
        result = supabase.table('batch_costs').insert(cost_record).execute()
        
        if result.data:
            logger.info("batch_cost_created", cost_id=result.data[0]['id'], category=category)
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create cost record")
            
    except Exception as e:
        logger.error("batch_cost_creation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create cost record: {str(e)}")


async def update_batch_cost(
    supabase: Client,
    farm_id: str,
    cost_id: str,
    cost_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    PATCH /api/farms/{farmId}/costs/{costId}
    Update an existing cost entry
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        cost_id: Cost ID to update
        cost_data: Updated cost data
        customer_id: Customer ID for ownership verification
        
    Returns:
        Updated cost record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if cost exists and belongs to this farm
    existing_cost = supabase.table('batch_costs').select('*').eq('cost_id', cost_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not existing_cost.data:
        raise HTTPException(status_code=404, detail="Cost record not found")
    
    # Prepare update data (only include provided fields)
    update_data = {}
    allowed_fields = [
        'description', 'amount', 'notes', 'entry_date',
        'doc_supplier', 'price_per_doc', 'transport_cost',
        'workers_count', 'rate_per_day', 'period_start_date', 'period_end_date', 'days_count',
        'overhead_category', 'frequency', 'batch_share_pct'
    ]
    
    for field in allowed_fields:
        if field in cost_data:
            update_data[field] = cost_data[field]
    
    update_data['updated_at'] = datetime.now().isoformat()
    
    # Update cost record
    try:
        result = supabase.table('batch_costs').update(update_data).eq('cost_id', cost_id).execute()
        
        if result.data:
            logger.info("batch_cost_updated", cost_id=cost_id)
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to update cost record")
            
    except Exception as e:
        logger.error("batch_cost_update_failed", cost_id=cost_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update cost record: {str(e)}")


async def delete_batch_cost(
    supabase: Client,
    farm_id: str,
    cost_id: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    DELETE /api/farms/{farmId}/costs/{costId}
    Delete a cost entry
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        cost_id: Cost ID to delete
        customer_id: Customer ID for ownership verification
        
    Returns:
        Deletion confirmation
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if cost exists and belongs to this farm
    existing_cost = supabase.table('batch_costs').select('*').eq('cost_id', cost_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not existing_cost.data:
        raise HTTPException(status_code=404, detail="Cost record not found")
    
    # Delete cost record
    try:
        result = supabase.table('batch_costs').delete().eq('cost_id', cost_id).execute()
        
        logger.info("batch_cost_deleted", cost_id=cost_id)
        return {'deleted': True, 'cost_id': cost_id}
            
    except Exception as e:
        logger.error("batch_cost_deletion_failed", cost_id=cost_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete cost record: {str(e)}")
