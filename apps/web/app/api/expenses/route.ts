import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for expense creation
const CreateExpenseSchema = z.object({
  farmId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  category: z.enum([
    'vehicle_fuel', 'vehicle_maintenance', 'vehicle_insurance',
    'equipment', 'equipment_purchase', 'equipment_maintenance',
    'office', 'office_supplies', 'communication', 'internet', 'printing',
    'travel', 'insurance', 'rent', 'utilities',
    'professional_fees', 'audit_fees', 'legal_fees', 'consultant_fees',
    'marketing', 'miscellaneous', 'bank_charges', 'veterinary_visit', 'farm_repair', 'other'
  ], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'card']).default('cash'),
  gstAmount: z.number().min(0).optional(),
  isTaxDeductible: z.boolean().default(true),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// GET: List all expenses for the authenticated integrator
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer to check segment
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string };

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = supabase
      .from('business_expenses')
      .select(`
        id,
        farm_id,
        batch_id,
        category,
        description,
        amount,
        expense_date,
        payment_mode,
        gst_amount,
        is_tax_deductible,
        receipt_url,
        notes,
        created_at,
        updated_at,
        farms (
          id,
          name
        ),
        batches (
          id,
          batch_number
        )
      `)
      .eq('integrator_id', customer.id);

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('expense_date', startDate);
    }

    if (endDate) {
      query = query.lte('expense_date', endDate);
    }

    query = query.order('expense_date', { ascending: false });

    const { data: expenses, error: expensesError } = await query;

    if (expensesError) {
      console.error('Expenses query error:', expensesError);
      return NextResponse.json(
        { error: 'Failed to fetch expenses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      expenses: expenses || [],
    });
  } catch (error) {
    console.error('Expenses API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new expense
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer to check segment
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string };

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateExpenseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { farmId, batchId, category, description, amount, expenseDate, paymentMode, gstAmount, isTaxDeductible, receiptUrl, notes } = validationResult.data;

    // Verify farm belongs to this integrator (if farmId is provided)
    if (farmId) {
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .select('id')
        .eq('id', farmId)
        .eq('integrator_id', customer.id)
        .single();

      if (farmError || !farm) {
        return NextResponse.json(
          { error: 'Farm not found or does not belong to you' },
          { status: 404 }
        );
      }
    }

    // Verify batch belongs to this integrator (if batchId is provided)
    if (batchId) {
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('id, farm_id')
        .eq('id', batchId)
        .single();

      if (batchError || !batch) {
        return NextResponse.json(
          { error: 'Batch not found' },
          { status: 404 }
        );
      }

      // Verify batch's farm belongs to this integrator
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .select('id')
        .eq('id', (batch as any).farm_id)
        .eq('integrator_id', customer.id)
        .single();

      if (farmError || !farm) {
        return NextResponse.json(
          { error: 'Batch does not belong to your farm' },
          { status: 404 }
        );
      }
    }

    // Create expense
    const { data: expense, error: createError } = await (supabase.from('business_expenses') as any)
      .insert({
        farm_id: farmId || null,
        batch_id: batchId || null,
        integrator_id: customer.id,
        category,
        description,
        amount,
        expense_date: expenseDate,
        payment_mode: paymentMode,
        gst_amount: gstAmount || 0,
        is_tax_deductible: isTaxDeductible,
        receipt_url: receiptUrl || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Expense creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      expense,
      message: 'Expense created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Expenses API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
