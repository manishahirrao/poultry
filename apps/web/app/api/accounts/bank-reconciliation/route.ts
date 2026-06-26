import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bankReconciliationSchema = z.object({
  bank_account_id: z.string().uuid(),
  as_of_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  statement_balance: z.number(),
  book_balance: z.number(),
  difference: z.number(),
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
    const bankAccountId = searchParams.get('bank_account_id');

    let query = supabase
      .from('bank_reconciliations')
      .select(`
        *,
        ledger_accounts(account_name, account_code)
      `)
      .eq('integrator_id', user.id)
      .order('as_of_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (bankAccountId) {
      query = query.eq('bank_account_id', bankAccountId);
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
    console.error('Error fetching bank reconciliations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bank reconciliations / बैंक समाधान प्राप्त करने में विफल',
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
    const validatedData = bankReconciliationSchema.parse(body);

    const { data, error } = await supabase
      .from('bank_reconciliations')
      .insert({
        integrator_id: user.id,
        bank_account_id: validatedData.bank_account_id,
        as_of_date: validatedData.as_of_date,
        statement_balance: validatedData.statement_balance,
        book_balance: validatedData.book_balance,
        difference: validatedData.difference,
        created_by: user.id,
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

    console.error('Error creating bank reconciliation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create bank reconciliation / बैंक समाधान बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
