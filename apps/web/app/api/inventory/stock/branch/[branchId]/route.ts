import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    // Verify branch ownership
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .eq('id', params.branchId)
      .eq('integrator_id', user.id)
      .single();

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or unauthorized / शाखा नहीं मिली या अनधिकृत' },
        { status: 404 }
      );
    }

    // Calculate stock from purchases, transfers, and adjustments
    // This is a simplified calculation - in production, use materialized views
    const { data: purchases } = await supabase
      .from('purchases')
      .select('purchase_items!inner(product_id, quantity)')
      .eq('branch_id', params.branchId)
      .eq('integrator_id', user.id);

    const { data: transfersOut } = await supabase
      .from('stock_transfers')
      .select('stock_transfer_items!inner(product_id, quantity_sent)')
      .eq('from_branch_id', params.branchId)
      .eq('integrator_id', user.id)
      .in('status', ['in_transit', 'received']);

    const { data: transfersIn } = await supabase
      .from('stock_transfers')
      .select('stock_transfer_items!inner(product_id, quantity_received)')
      .eq('to_branch_id', params.branchId)
      .eq('integrator_id', user.id)
      .eq('status', 'received');

    const { data: adjustments } = await supabase
      .from('stock_adjustments')
      .select('product_id, quantity')
      .eq('branch_id', params.branchId)
      .eq('integrator_id', user.id);

    // Aggregate stock by product
    const stockMap = new Map();

    // Add purchases
    purchases?.forEach((purchase: any) => {
      purchase.purchase_items?.forEach((item: any) => {
        const current = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, current + item.quantity);
      });
    });

    // Subtract transfers out
    transfersOut?.forEach((transfer: any) => {
      transfer.stock_transfer_items?.forEach((item: any) => {
        const current = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, current - item.quantity_sent);
      });
    });

    // Add transfers in
    transfersIn?.forEach((transfer: any) => {
      transfer.stock_transfer_items?.forEach((item: any) => {
        const current = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, current + (item.quantity_received || 0));
      });
    });

    // Add adjustments
    adjustments?.forEach((adj: any) => {
      const current = stockMap.get(adj.product_id) || 0;
      stockMap.set(adj.product_id, current + adj.quantity);
    });

    // Get product details
    const productIds = Array.from(stockMap.keys());
    const { data: products } = await supabase
      .from('products')
      .select('id, product_name, unit_of_measure, purchase_price')
      .in('id', productIds.length > 0 ? productIds : ['00000000-0000-0000-0000-000000000000']);

    const stockData = products?.map((product: any) => ({
      product_id: product.id,
      product_name: product.product_name,
      unit_of_measure: product.unit_of_measure,
      purchase_price: product.purchase_price,
      quantity: stockMap.get(product.id) || 0,
      value: (stockMap.get(product.id) || 0) * (product.purchase_price || 0),
    })) || [];

    return NextResponse.json({
      data: stockData,
      error: null,
      meta: { total: stockData.length }
    });
  } catch (error) {
    console.error('Error fetching branch stock:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch branch stock / शाखा स्टॉक प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
