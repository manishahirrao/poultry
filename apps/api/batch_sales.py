"""
PoultryPulse AI — Sales & Lifting API
File: apps/api/batch_sales.py
Version: v1.0 | June 2026
Task: TASK-GAP2-API-001
Requirements: REQ-GAP2-SALES-001 through REQ-GAP2-SALES-006
Description: API endpoints for bird lifting/sales tracking with withdrawal period checks
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


async def check_active_withdrawal_periods(
    supabase: Client,
    batch_id: str
) -> Dict[str, Any]:
    """
    Check for active withdrawal periods for a batch.
    
    Args:
        supabase: Supabase client instance
        batch_id: Batch ID to check
        
    Returns:
        Dictionary with withdrawal status information
    """
    try:
        today = date.today().isoformat()
        
        # Query for active withdrawal periods
        result = supabase.table('batch_medicine_costs') \
            .select('medicine_name, clearance_date, withdrawal_days, last_dose_date') \
            .eq('batch_id', batch_id) \
            .gt('withdrawal_days', 0) \
            .gt('clearance_date', today) \
            .is_('deleted_at', None) \
            .execute()
        
        active_withdrawals = result.data if result.data else []
        
        # Find latest clearance date
        latest_clearance_date = None
        if active_withdrawals:
            clearance_dates = [w.get('clearance_date') for w in active_withdrawals]
            latest_clearance_date = max(clearance_dates) if clearance_dates else None
        
        return {
            'has_active_withdrawal': len(active_withdrawals) > 0,
            'active_withdrawals': active_withdrawals,
            'latest_clearance_date': latest_clearance_date,
            'harvest_safe': len(active_withdrawals) == 0
        }
        
    except Exception as e:
        logger.error("withdrawal_check_failed", batch_id=batch_id, error=str(e))
        # On error, assume safe to avoid blocking sales unnecessarily
        return {
            'has_active_withdrawal': False,
            'active_withdrawals': [],
            'latest_clearance_date': None,
            'harvest_safe': True
        }


async def get_batch_sales(
    supabase: Client,
    farm_id: str,
    batch_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    GET /api/farms/{farmId}/sales
    Returns all sale events for the batch + sales_summary
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        batch_id: Optional batch ID to filter sales
        customer_id: Customer ID for ownership verification
        start_date: Optional start date for filtering sales (inclusive)
        end_date: Optional end date for filtering sales (inclusive)
        
    Returns:
        Dictionary with sales list and sales_summary
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Build query
    query = supabase.table('batch_sales').select('*').eq('farm_id', farm_id).is_('deleted_at', None)
    
    if batch_id:
        query = query.eq('batch_id', batch_id)
    
    # Add date range filter
    if start_date:
        query = query.gte('sale_date', start_date.isoformat())
    if end_date:
        query = query.lte('sale_date', end_date.isoformat())
    
    sales_result = query.order('sale_date', desc=True).execute()
    sales = sales_result.data if sales_result.data else []
    
    # Get batch information for summary calculations
    batch = None
    if batch_id:
        batch_result = supabase.table('batches').select('*').eq('id', batch_id).single().execute()
        if batch_result.data:
            batch = batch_result.data
    
    # Calculate sales summary
    sales_summary = {
        'total_birds_sold': 0,
        'total_weight_kg': 0,
        'total_gross_revenue': 0,
        'total_net_revenue': 0,
        'avg_rate_per_kg': 0,
        'birds_remaining': 0,
        'pct_sold': 0,
        'sale_count': len(sales)
    }
    
    # Calculate totals from sales
    for sale in sales:
        sales_summary['total_birds_sold'] += sale.get('birds_sold', 0)
        sales_summary['total_weight_kg'] += float(sale.get('total_weight_kg', 0))
        sales_summary['total_gross_revenue'] += float(sale.get('gross_revenue', 0))
        sales_summary['total_net_revenue'] += float(sale.get('net_revenue', 0))
    
    # Calculate average rate per kg
    if sales_summary.get('total_weight_kg') and sales_summary['total_weight_kg'] > 0:
        sales_summary['avg_rate_per_kg'] = sales_summary['total_gross_revenue'] / sales_summary['total_weight_kg']
    else:
        sales_summary['avg_rate_per_kg'] = 0
    
    # Calculate birds remaining and percentage sold
    if batch:
        birds_placed = batch.get('birds_placed', 0)
        birds_alive = batch.get('birds_alive', birds_placed)
        sales_summary['birds_remaining'] = birds_alive
        
        if batch and batch.get('birds_placed') and batch['birds_placed'] > 0:
            sales_summary['pct_sold'] = (sales_summary['total_birds_sold'] / batch['birds_placed']) * 100
        else:
            sales_summary['pct_sold'] = 0
    
    return {
        'sales': sales,
        'sales_summary': sales_summary
    }


async def create_batch_sale(
    supabase: Client,
    farm_id: str,
    sale_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    POST /api/farms/{farmId}/sales
    Create a new sale/lifting event
    
    Side effects:
    1. Decrements birds_alive on batch by (birds_sold + dead_in_transit)
    2. Updates batch.total_revenue = SUM(net_revenue) for batch
    3. If sale.sale_type = 'full' OR batch.birds_alive becomes 0: sets batch.harvest_ready = true
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        sale_data: Sale event data
        customer_id: Customer ID for ownership verification
        
    Returns:
        Created sale record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Validate required fields
    if 'batch_id' not in sale_data:
        raise HTTPException(status_code=400, detail="batch_id is required")
    
    if 'sale_type' not in sale_data:
        raise HTTPException(status_code=400, detail="sale_type is required")
    
    sale_type = sale_data['sale_type']
    if sale_type not in ('full', 'partial'):
        raise HTTPException(status_code=400, detail="sale_type must be 'full' or 'partial'")
    
    if 'birds_sold' not in sale_data or sale_data['birds_sold'] <= 0:
        raise HTTPException(status_code=400, detail="birds_sold must be greater than 0")
    
    if 'total_weight_kg' not in sale_data:
        raise HTTPException(status_code=400, detail="total_weight_kg is required")
    
    if 'rate_per_kg' not in sale_data:
        raise HTTPException(status_code=400, detail="rate_per_kg is required")
    
    batch_id = sale_data['batch_id']
    
    # Check for active withdrawal periods BEFORE inserting sale
    withdrawal_status = await check_active_withdrawal_periods(supabase, batch_id)
    
    if withdrawal_status['has_active_withdrawal']:
        latest_clearance = withdrawal_status.get('latest_clearance_date')
        return {
            'error': 'WITHDRAWAL_PERIOD_ACTIVE',
            'message': f'Active withdrawal period. Earliest safe harvest: {latest_clearance}',
            'medicines': withdrawal_status['active_withdrawals']
        }, 422
    
    # Get batch information for validation and side effects
    batch_result = supabase.table('batches').select('*').eq('id', batch_id).single().execute()
    
    if not batch_result.data:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch = batch_result.data
    
    # Validate birds_sold doesn't exceed birds_alive
    birds_alive = batch.get('birds_alive', batch.get('birds_placed', 0))
    birds_sold = sale_data['birds_sold']
    dead_in_transit = sale_data.get('dead_in_transit', 0)
    total_birds_removed = birds_sold + dead_in_transit
    
    if total_birds_removed > birds_alive:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot sell {birds_sold} birds with {dead_in_transit} dead in transit. Only {birds_alive} birds alive."
        )
    
    # Calculate net_revenue
    gross_revenue = float(sale_data['total_weight_kg']) * float(sale_data['rate_per_kg'])
    commission_amount = float(sale_data.get('commission_amount', 0))
    commission_pct = sale_data.get('commission_pct')
    
    if commission_pct:
        commission_amount = gross_revenue * (float(commission_pct) / 100)
    
    weighment_deduction = float(sale_data.get('weighment_deduction_kg', 0))
    net_revenue = gross_revenue - commission_amount - weighment_deduction
    
    # Prepare sale record
    sale_record = {
        'batch_id': batch_id,
        'farm_id': farm_id,
        'integrator_id': customer_id,
        'sale_date': sale_data.get('sale_date', date.today().isoformat()),
        'sale_type': sale_type,
        'birds_sold': birds_sold,
        'total_weight_kg': sale_data['total_weight_kg'],
        'actual_avg_weight_g': sale_data.get('actual_avg_weight_g'),
        'rate_per_kg': sale_data['rate_per_kg'],
        'commission_amount': commission_amount,
        'commission_pct': commission_pct,
        'weighment_deduction_kg': weighment_deduction,
        'net_revenue': net_revenue,
        'buyer_id': sale_data.get('buyer_id'),
        'buyer_name_snapshot': sale_data.get('buyer_name_snapshot'),
        'vehicle_number': sale_data.get('vehicle_number'),
        'driver_name': sale_data.get('driver_name'),
        'departure_time': sale_data.get('departure_time'),
        'destination': sale_data.get('destination'),
        'crates_used': sale_data.get('crates_used'),
        'dead_in_transit': dead_in_transit,
        'payment_status': sale_data.get('payment_status', 'pending'),
        'challan_number': sale_data.get('challan_number'),
        'notes': sale_data.get('notes'),
        'created_by': customer_id,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    # Insert sale record
    try:
        result = supabase.table('batch_sales').insert(sale_record).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create sale record")
        
        sale = result.data[0]
        logger.info("batch_sale_created", sale_id=sale['sale_id'], batch_id=batch_id, birds_sold=birds_sold)
        
        # Side effect 1: Decrement birds_alive on batch
        new_birds_alive = birds_alive - total_birds_removed
        supabase.table('batches').update({
            'birds_alive': new_birds_alive,
            'updated_at': datetime.now().isoformat()
        }).eq('id', batch_id).execute()
        
        # Side effect 2: Update batch.total_revenue
        # Get all sales for this batch to calculate total revenue
        all_sales_result = supabase.table('batch_sales').select('net_revenue').eq('batch_id', batch_id).is_('deleted_at', None).execute()
        total_revenue = sum(float(s.get('net_revenue', 0)) for s in all_sales_result.data)
        
        supabase.table('batches').update({
            'total_revenue': total_revenue,
            'updated_at': datetime.now().isoformat()
        }).eq('id', batch_id).execute()
        
        # Side effect 3: Set harvest_ready if full sale or no birds remaining
        if sale_type == 'full' or new_birds_alive == 0:
            supabase.table('batches').update({
                'harvest_ready': True,
                'updated_at': datetime.now().isoformat()
            }).eq('id', batch_id).execute()
        
        return sale
        
    except Exception as e:
        logger.error("batch_sale_creation_failed", batch_id=batch_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create sale record: {str(e)}")


async def update_batch_sale(
    supabase: Client,
    farm_id: str,
    sale_id: str,
    sale_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    PATCH /api/farms/{farmId}/sales/{saleId}
    Update an existing sale event
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        sale_id: Sale ID to update
        sale_data: Updated sale data
        customer_id: Customer ID for ownership verification
        
    Returns:
        Updated sale record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if sale exists and belongs to this farm
    existing_sale = supabase.table('batch_sales').select('*').eq('sale_id', sale_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not existing_sale.data:
        raise HTTPException(status_code=404, detail="Sale record not found")
    
    # Prepare update data (only include provided fields)
    update_data = {}
    allowed_fields = [
        'sale_date', 'sale_type', 'birds_sold', 'total_weight_kg', 'actual_avg_weight_g',
        'rate_per_kg', 'commission_amount', 'commission_pct', 'weighment_deduction_kg',
        'buyer_id', 'buyer_name_snapshot', 'vehicle_number', 'driver_name',
        'departure_time', 'destination', 'crates_used', 'dead_in_transit',
        'payment_status', 'challan_number', 'notes'
    ]
    
    for field in allowed_fields:
        if field in sale_data:
            update_data[field] = sale_data[field]
    
    # Recalculate net_revenue if relevant fields changed
    if 'total_weight_kg' in update_data or 'rate_per_kg' in update_data or 'commission_amount' in update_data or 'commission_pct' in update_data:
        total_weight_kg = float(update_data.get('total_weight_kg', existing_sale.data.get('total_weight_kg', 0)))
        rate_per_kg = float(update_data.get('rate_per_kg', existing_sale.data.get('rate_per_kg', 0)))
        gross_revenue = total_weight_kg * rate_per_kg
        
        commission_amount = float(update_data.get('commission_amount', existing_sale.data.get('commission_amount', 0)))
        commission_pct = update_data.get('commission_pct', existing_sale.data.get('commission_pct'))
        
        if commission_pct is not None:
            commission_amount = gross_revenue * (float(commission_pct) / 100)
        
        weighment_deduction = float(update_data.get('weighment_deduction_kg', existing_sale.data.get('weighment_deduction_kg', 0)))
        update_data['net_revenue'] = gross_revenue - commission_amount - weighment_deduction
    
    update_data['updated_at'] = datetime.now().isoformat()
    
    # Update sale record
    try:
        result = supabase.table('batch_sales').update(update_data).eq('sale_id', sale_id).execute()
        
        if result.data:
            logger.info("batch_sale_updated", sale_id=sale_id)
            
            # Recalculate batch total revenue
            batch_id = existing_sale.data.get('batch_id')
            all_sales_result = supabase.table('batch_sales').select('net_revenue').eq('batch_id', batch_id).is_('deleted_at', None).execute()
            total_revenue = sum(float(s.get('net_revenue', 0)) for s in all_sales_result.data)
            
            supabase.table('batches').update({
                'total_revenue': total_revenue,
                'updated_at': datetime.now().isoformat()
            }).eq('id', batch_id).execute()
            
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to update sale record")
            
    except Exception as e:
        logger.error("batch_sale_update_failed", sale_id=sale_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update sale record: {str(e)}")


async def delete_batch_sale(
    supabase: Client,
    farm_id: str,
    sale_id: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    DELETE /api/farms/{farmId}/sales/{saleId}
    Delete a sale event
    
    Side effects: reverses birds_alive decrement; reverses revenue update
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        sale_id: Sale ID to delete
        customer_id: Customer ID for ownership verification
        
    Returns:
        Deletion confirmation
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if sale exists and belongs to this farm
    existing_sale = supabase.table('batch_sales').select('*').eq('sale_id', sale_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not existing_sale.data:
        raise HTTPException(status_code=404, detail="Sale record not found")
    
    sale = existing_sale.data
    batch_id = sale.get('batch_id')
    birds_sold = sale.get('birds_sold', 0)
    dead_in_transit = sale.get('dead_in_transit', 0)
    net_revenue = float(sale.get('net_revenue', 0))
    
    # Delete sale record
    try:
        result = supabase.table('batch_sales').delete().eq('sale_id', sale_id).execute()
        
        logger.info("batch_sale_deleted", sale_id=sale_id)
        
        # Side effect 1: Reverse birds_alive decrement
        batch_result = supabase.table('batches').select('birds_alive').eq('id', batch_id).single().execute()
        if batch_result.data:
            current_birds_alive = batch_result.data.get('birds_alive', 0)
            new_birds_alive = current_birds_alive + birds_sold + dead_in_transit
            
            supabase.table('batches').update({
                'birds_alive': new_birds_alive,
                'updated_at': datetime.now().isoformat()
            }).eq('id', batch_id).execute()
        
        # Side effect 2: Reverse revenue update
        all_sales_result = supabase.table('batch_sales').select('net_revenue').eq('batch_id', batch_id).is_('deleted_at', None).execute()
        total_revenue = sum(float(s.get('net_revenue', 0)) for s in all_sales_result.data)
        
        supabase.table('batches').update({
            'total_revenue': total_revenue,
            'updated_at': datetime.now().isoformat()
        }).eq('id', batch_id).execute()
        
        return {'deleted': True, 'sale_id': sale_id}
            
    except Exception as e:
        logger.error("batch_sale_deletion_failed", sale_id=sale_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete sale record: {str(e)}")


async def get_buyers(
    supabase: Client,
    customer_id: str
) -> Dict[str, Any]:
    """
    GET /api/buyers
    Returns all buyers for the integrator
    
    Args:
        supabase: Supabase client instance
        customer_id: Customer ID (integrator_id)
        
    Returns:
        Dictionary with buyers list
    """
    try:
        result = supabase.table('buyers').select('*').eq('integrator_id', customer_id).execute()
        buyers = result.data if result.data else []
        
        return {'buyers': buyers}
        
    except Exception as e:
        logger.error("buyers_fetch_failed", customer_id=customer_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch buyers: {str(e)}")


async def create_buyer(
    supabase: Client,
    buyer_data: Dict[str, Any],
    customer_id: str
) -> Dict[str, Any]:
    """
    POST /api/buyers
    Create a new buyer
    
    Args:
        supabase: Supabase client instance
        buyer_data: Buyer data
        customer_id: Customer ID (integrator_id)
        
    Returns:
        Created buyer record
    """
    # Validate required fields
    if 'name' not in buyer_data:
        raise HTTPException(status_code=400, detail="name is required")
    
    # Prepare buyer record
    buyer_record = {
        'integrator_id': customer_id,
        'name': buyer_data['name'],
        'phone': buyer_data.get('phone'),
        'location': buyer_data.get('location'),
        'buyer_type': buyer_data.get('buyer_type'),
        'notes': buyer_data.get('notes'),
        'rating': buyer_data.get('rating'),
        'created_at': datetime.now().isoformat()
    }
    
    # Insert buyer record
    try:
        result = supabase.table('buyers').insert(buyer_record).execute()
        
        if result.data:
            logger.info("buyer_created", buyer_id=result.data[0]['buyer_id'], name=buyer_data['name'])
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create buyer record")
            
    except Exception as e:
        logger.error("buyer_creation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create buyer record: {str(e)}")
