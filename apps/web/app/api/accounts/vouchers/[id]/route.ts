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
      .from('vouchers')
      .select(`
        *,
        voucher_entries!inner(
          id, 
          ledger_account_id, 
          entry_type, 
          amount,
          ledger_accounts!inner(id, account_name, account_code)
        )
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Voucher not found / वाउचर नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch voucher / वाउचर प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify ownership
    const { data: existingVoucher } = await supabase
      .from('vouchers')
      .select('id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingVoucher) {
      return NextResponse.json(
        { error: 'Voucher not found or unauthorized / वाउचर नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete voucher / वाउचर हटाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
