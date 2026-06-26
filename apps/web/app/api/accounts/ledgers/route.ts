import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ledgerSchema = z.object({
  account_code: z.string().optional(),
  account_name: z.string().min(1, 'Account name is required'),
  account_group_id: z.string().uuid(),
  opening_balance: z.number().default(0),
  opening_balance_type: z.enum(['Dr', 'Cr']).default('Dr'),
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
    const groupId = searchParams.get('group_id');

    let query = supabase
      .from('ledger_accounts')
      .select(`
        *,
        account_groups!inner(id, group_name, group_type)
      `)
      .eq('integrator_id', user.id)
      .order('account_name', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (groupId) {
      query = query.eq('account_group_id', groupId);
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
    console.error('Error fetching ledgers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch ledgers / लेजर प्राप्त करने में विफल',
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
    const validatedData = ledgerSchema.parse(body);

    // Generate account code if not provided
    let accountCode = validatedData.account_code;
    if (!accountCode) {
      const { data: existingLedgers } = await supabase
        .from('ledger_accounts')
        .select('account_code')
        .eq('integrator_id', user.id);

      const ledgerCount = (existingLedgers?.length || 0) + 1;
      accountCode = `ACC-${String(ledgerCount).padStart(4, '0')}`;
    }

    const { data, error } = await supabase
      .from('ledger_accounts')
      .insert({
        integrator_id: user.id,
        account_code: accountCode,
        account_name: validatedData.account_name,
        account_group_id: validatedData.account_group_id,
        opening_balance: validatedData.opening_balance,
        opening_balance_type: validatedData.opening_balance_type,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data,
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

    console.error('Error creating ledger:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create ledger / लेजर बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Ledger ID is required / लेजर आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = ledgerSchema.parse(updateData);

    // Verify ownership
    const { data: existingLedger } = await supabase
      .from('ledger_accounts')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingLedger) {
      return NextResponse.json(
        { error: 'Ledger not found or unauthorized / लेजर नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('ledger_accounts')
      .update({
        account_code: validatedData.account_code,
        account_name: validatedData.account_name,
        account_group_id: validatedData.account_group_id,
        opening_balance: validatedData.opening_balance,
        opening_balance_type: validatedData.opening_balance_type,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data,
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

    console.error('Error updating ledger:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update ledger / लेजर अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
