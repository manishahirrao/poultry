import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { farmerId: string } }
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

    // Verify farmer ownership
    const { data: farmer } = await supabase
      .from('farmers')
      .select('id')
      .eq('id', params.farmerId)
      .eq('integrator_id', user.id)
      .single();

    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found or unauthorized / किसान नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    // Calculate stock from transfers and adjustments
    const { data: transfersIn } = await supabase
      .from('stock_transfers')
      .select('stock_transfer_items!inner(product_id, quantity_received)')
      .eq('to_farmer_id', params.farmerId)
      .eq('integrator_id', user.id)
      .eq('status', 'received');

    const { data: transfersOut } = await supabase
      .from('stock_transfers')
      .select('stock_transfer_items!inner(product_id, quantity_sent)')
      .eq('from_farmer_id', params.farmerId)
      .eq('integrator_id', user.id)
      .in('status', ['in_transit', 'received']);

    const { data: adjustments } = await supabase
      .from('stock_adjustments')
      .select('product_id, quantity')
      .eq('farmer_id', params.farmerId)
      .eq('integrator_id', user.id);

    // Aggregate stock by product
    const stockMap = new Map();

    // Add transfers in
    transfersIn?.forEach((transfer: any) => {
      transfer.stock_transfer_items?.forEach((item: any) => {
        const current = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, current + (item.quantity_received || 0));
      });
    });

    // Subtract transfers out
    transfersOut?.forEach((transfer: any) => {
      transfer.stock_transfer_items?.forEach((item: any) => {
        const current = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, current - item.quantity_sent);
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
    console.error('Error fetching farmer stock:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch farmer stock / किसान स्टॉक प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
