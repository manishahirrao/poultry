import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        suppliers!inner(id, supplier_name, supplier_type, phone, address),
        branches!inner(id, branch_name, branch_type, city),
        purchase_items!inner(
          id, 
          product_id, 
          quantity, 
          unit_rate, 
          line_total,
          batch_number,
          expiry_date,
          products!inner(id, product_name, unit_of_measure)
        )
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Purchase not found / खरीद नहीं मिली' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchase / खरीद प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
