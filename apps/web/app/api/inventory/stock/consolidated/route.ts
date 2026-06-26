import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Get all branches
    const { data: branches } = await supabase
      .from('branches')
      .select('id, branch_name, branch_type')
      .eq('integrator_id', user.id)
      .eq('is_active', true);

    // Calculate stock for each branch
    const branchStockPromises = branches?.map(async (branch: any) => {
      const { data: purchases } = await supabase
        .from('purchases')
        .select('purchase_items!inner(product_id, quantity)')
        .eq('branch_id', branch.id)
        .eq('integrator_id', user.id);

      const { data: transfersOut } = await supabase
        .from('stock_transfers')
        .select('stock_transfer_items!inner(product_id, quantity_sent)')
        .eq('from_branch_id', branch.id)
        .eq('integrator_id', user.id)
        .in('status', ['in_transit', 'received']);

      const { data: transfersIn } = await supabase
        .from('stock_transfers')
        .select('stock_transfer_items!inner(product_id, quantity_received)')
        .eq('to_branch_id', branch.id)
        .eq('integrator_id', user.id)
        .eq('status', 'received');

      const { data: adjustments } = await supabase
        .from('stock_adjustments')
        .select('product_id, quantity')
        .eq('branch_id', branch.id)
        .eq('integrator_id', user.id);

      const stockMap = new Map();

      purchases?.forEach((purchase: any) => {
        purchase.purchase_items?.forEach((item: any) => {
          const current = stockMap.get(item.product_id) || 0;
          stockMap.set(item.product_id, current + item.quantity);
        });
      });

      transfersOut?.forEach((transfer: any) => {
        transfer.stock_transfer_items?.forEach((item: any) => {
          const current = stockMap.get(item.product_id) || 0;
          stockMap.set(item.product_id, current - item.quantity_sent);
        });
      });

      transfersIn?.forEach((transfer: any) => {
        transfer.stock_transfer_items?.forEach((item: any) => {
          const current = stockMap.get(item.product_id) || 0;
          stockMap.set(item.product_id, current + (item.quantity_received || 0));
        });
      });

      adjustments?.forEach((adj: any) => {
        const current = stockMap.get(adj.product_id) || 0;
        stockMap.set(adj.product_id, current + adj.quantity);
      });

      return {
        branch_id: branch.id,
        branch_name: branch.branch_name,
        branch_type: branch.branch_type,
        stock: Object.fromEntries(stockMap),
      };
    }) || [];

    const branchStockData = await Promise.all(branchStockPromises);

    return NextResponse.json({
      data: branchStockData,
      error: null,
      meta: { total: branchStockData.length }
    });
  } catch (error) {
    console.error('Error fetching consolidated stock:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch consolidated stock / समेकित स्टॉक प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
