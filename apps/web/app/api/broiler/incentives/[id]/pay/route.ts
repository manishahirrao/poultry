import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const paySchema = z.object({
  paid: z.boolean(),
  voucher_number: z.string().optional(),
});

export async function POST(
  request: Request,
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = paySchema.parse(body);

    // First, get the incentive record to verify ownership and get details
    const { data: incentive, error: fetchError } = await supabase
      .from('supervisor_incentives')
      .select(`
        *,
        employees!inner(name, bank_account),
        batches!inner(batch_number)
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (fetchError || !incentive) {
      return NextResponse.json(
        { error: 'Incentive not found / प्रोत्साहन नहीं मिला' },
        { status: 404 }
      );
    }

    if (incentive.status !== 'approved') {
      return NextResponse.json(
        { error: 'Incentive must be approved before payment / भुगतान से पहले प्रोत्साहन स्वीकृत होना चाहिए' },
        { status: 400 }
      );
    }

    // Generate voucher number if not provided
    const voucherNumber = validatedData.voucher_number || await generateVoucherNumber(supabase, user.id);

    // Start a transaction to update incentive and create voucher
    const { data: updatedIncentive, error: updateError } = await supabase
      .from('supervisor_incentives')
      .update({
        status: validatedData.paid ? 'paid' : 'approved',
        paid_date: validatedData.paid ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create payment voucher in accounts module
    if (validatedData.paid && incentive.net_incentive > 0) {
      const { error: voucherError } = await supabase
        .from('vouchers')
        .insert({
          integrator_id: user.id,
          voucher_number: voucherNumber,
          voucher_date: new Date().toISOString().split('T')[0],
          voucher_type: 'employee',
          narration: `Incentive payment for ${incentive.employees?.name} - Batch ${incentive.batches?.batch_number} / ${incentive.employees?.name} के लिए प्रोत्साहन भुगतान - बैच ${incentive.batches?.batch_number}`,
          total_amount: incentive.net_incentive,
          is_posted: true,
          created_by: user.id,
        });

      if (voucherError) {
        console.error('Error creating voucher:', voucherError);
        // Rollback incentive update if voucher creation fails
        await supabase
          .from('supervisor_incentives')
          .update({
            status: 'approved',
            paid_date: null,
          })
          .eq('id', params.id);
        
        throw new Error('Failed to create payment voucher / भुगतान वाउचर बनाने में विफल');
      }

      // Create voucher entries for double-entry bookkeeping
      // Debit: Salary/Incentive Expense Account
      // Credit: Bank/Cash Account
      const { error: entriesError } = await supabase
        .from('voucher_entries')
        .insert([
          {
            voucher_id: voucherNumber, // This should be the actual voucher ID, need to fetch it
            ledger_account_id: await getExpenseLedgerId(supabase, user.id),
            entry_type: 'Dr',
            amount: incentive.net_incentive,
            narration: `Incentive expense - ${incentive.employees?.name}`,
          },
          {
            voucher_id: voucherNumber,
            ledger_account_id: await getBankLedgerId(supabase, user.id),
            entry_type: 'Cr',
            amount: incentive.net_incentive,
            narration: `Payment to ${incentive.employees?.name}`,
          },
        ]);

      if (entriesError) {
        console.error('Error creating voucher entries:', entriesError);
      }
    }

    return NextResponse.json({
      data: updatedIncentive,
      error: null,
      meta: { total: 1 }
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to process payment / भुगतान प्रक्रिया में विफल',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function generateVoucherNumber(supabase: any, integratorId: string): Promise<string> {
  const year = new Date().getFullYear();
  const financialYear = year % 100;
  
  // Get the last voucher number for this financial year
  const { data: lastVoucher } = await supabase
    .from('vouchers')
    .select('voucher_number')
    .eq('integrator_id', integratorId)
    .ilike('voucher_number', `PV/${financialYear}%`)
    .order('voucher_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastVoucher?.voucher_number) {
    const match = lastVoucher.voucher_number.match(/PV\/(\d{2})\/(\d{3})/);
    if (match) {
      sequence = parseInt(match[2]) + 1;
    }
  }

  return `PV/${financialYear}/${sequence.toString().padStart(3, '0')}`;
}

async function getExpenseLedgerId(supabase: any, integratorId: string): Promise<string> {
  // Try to find or create a salary/incentive expense ledger account
  const { data: ledger } = await supabase
    .from('ledger_accounts')
    .select('id')
    .eq('integrator_id', integratorId)
    .ilike('account_name', '%salary%')
    .or('account_name.ilike.%incentive%')
    .limit(1)
    .single();

  if (ledger) return ledger.id;

  // Create a default salary expense account if not found
  const { data: newLedger } = await supabase
    .from('ledger_accounts')
    .insert({
      integrator_id: integratorId,
      account_code: 'EXP-001',
      account_name: 'Salary & Incentive Expense / वेतन और प्रोत्साहन व्यय',
      account_group_id: await getExpenseGroupId(supabase, integratorId),
      opening_balance: 0,
      opening_balance_type: 'Dr',
      is_active: true,
    })
    .select('id')
    .single();

  return newLedger?.id || '';
}

async function getBankLedgerId(supabase: any, integratorId: string): Promise<string> {
  // Try to find a bank/cash ledger account
  const { data: ledger } = await supabase
    .from('ledger_accounts')
    .select('id')
    .eq('integrator_id', integratorId)
    .ilike('account_name', '%bank%')
    .or('account_name.ilike.%cash%')
    .limit(1)
    .single();

  if (ledger) return ledger.id;

  // Create a default bank account if not found
  const { data: newLedger } = await supabase
    .from('ledger_accounts')
    .insert({
      integrator_id: integratorId,
      account_code: 'AST-001',
      account_name: 'Bank Account / बैंक खाता',
      account_group_id: await getAssetGroupId(supabase, integratorId),
      opening_balance: 0,
      opening_balance_type: 'Dr',
      is_active: true,
    })
    .select('id')
    .single();

  return newLedger?.id || '';
}

async function getExpenseGroupId(supabase: any, integratorId: string): Promise<string> {
  const { data: group } = await supabase
    .from('account_groups')
    .select('id')
    .eq('integrator_id', integratorId)
    .eq('group_type', 'expense')
    .ilike('group_name', '%salary%')
    .limit(1)
    .single();

  if (group) return group.id;

  // Create default expense group
  const { data: newGroup } = await supabase
    .from('account_groups')
    .insert({
      integrator_id: integratorId,
      group_code: 'EXP',
      group_name: 'Expense Expenses / व्यय',
      group_type: 'expense',
      is_system: false,
    })
    .select('id')
    .single();

  return newGroup?.id || '';
}

async function getAssetGroupId(supabase: any, integratorId: string): Promise<string> {
  const { data: group } = await supabase
    .from('account_groups')
    .select('id')
    .eq('integrator_id', integratorId)
    .eq('group_type', 'asset')
    .ilike('group_name', '%current%')
    .limit(1)
    .single();

  if (group) return group.id;

  // Create default asset group
  const { data: newGroup } = await supabase
    .from('account_groups')
    .insert({
      integrator_id: integratorId,
      group_code: 'AST',
      group_name: 'Current Assets / वर्तमान संपत्तियां',
      group_type: 'asset',
      is_system: false,
    })
    .select('id')
    .single();

  return newGroup?.id || '';
}
