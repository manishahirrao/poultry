import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const voucherEntrySchema = z.object({
  ledger_account_id: z.string().uuid(),
  entry_type: z.enum(['Dr', 'Cr']),
  amount: z.number().positive(),
});

const voucherSchema = z.object({
  voucher_type: z.enum(['payment', 'receipt', 'contra', 'journal', 'employee']),
  voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid voucher date'),
  narration: z.string().optional(),
  entries: z.array(voucherEntrySchema).min(2, 'At least two entries are required'),
});

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const voucherType = searchParams.get('voucher_type');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    let query = supabase
      .from('vouchers')
      .select(`
        *,
        voucher_entries!inner(id, ledger_account_id, entry_type, amount, ledger_accounts!inner(id, account_name))
      `)
      .eq('integrator_id', user.id)
      .order('voucher_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (voucherType) {
      query = query.eq('voucher_type', voucherType);
    }
    if (fromDate) {
      query = query.gte('voucher_date', fromDate);
    }
    if (toDate) {
      query = query.lte('voucher_date', toDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      error: null,
      meta: {
        total: count || 0,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vouchers / वाउचर प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = voucherSchema.parse(body);

    // Validate debit-credit balance
    const totalDebit = validatedData.entries
      .filter(e => e.entry_type === 'Dr')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = validatedData.entries
      .filter(e => e.entry_type === 'Cr')
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { 
          error: 'Debit and Credit amounts must be equal / डेबिट और क्रेडिट राशि समान होनी चाहिए',
          data: null 
        },
        { status: 400 }
      );
    }

    // Generate voucher number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastVoucher } = await supabase
      .from('vouchers')
      .select('voucher_number')
      .eq('integrator_id', user.id)
      .like('voucher_number', `VOU/${validatedData.voucher_type.toUpperCase()}/${yearSuffix}/%`)
      .order('voucher_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastVoucher) {
      const lastSequence = parseInt(lastVoucher.voucher_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const voucherNumber = `VOU/${validatedData.voucher_type.toUpperCase()}/${yearSuffix}/${sequence.toString().padStart(4, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Create voucher
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers')
      .insert({
        integrator_id: user.id,
        voucher_number: voucherNumber,
        voucher_date: validatedData.voucher_date,
        voucher_type: validatedData.voucher_type,
        narration: validatedData.narration || null,
        total_amount: totalDebit,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (voucherError) throw voucherError;

    // Create voucher entries
    const voucherEntries = validatedData.entries.map(entry => ({
      voucher_id: voucher.id,
      ledger_account_id: entry.ledger_account_id,
      entry_type: entry.entry_type,
      amount: entry.amount,
      created_at: new Date().toISOString(),
    }));

    const { error: entriesError } = await supabase
      .from('voucher_entries')
      .insert(voucherEntries);

    if (entriesError) throw entriesError;

    return NextResponse.json({
      data: voucher,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error creating voucher:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create voucher / वाउचर बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
