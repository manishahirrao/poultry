import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for expense update
const UpdateExpenseSchema = z.object({
  farmId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  category: z.enum([
    'vehicle_fuel', 'vehicle_maintenance', 'vehicle_insurance',
    'equipment', 'equipment_purchase', 'equipment_maintenance',
    'office', 'office_supplies', 'communication', 'internet', 'printing',
    'travel', 'insurance', 'rent', 'utilities',
    'professional_fees', 'audit_fees', 'legal_fees', 'consultant_fees',
    'marketing', 'miscellaneous', 'bank_charges', 'veterinary_visit', 'farm_repair', 'other'
  ]).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'card']).optional(),
  gstAmount: z.number().min(0).optional(),
  isTaxDeductible: z.boolean().optional(),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// PUT: Update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify expense belongs to this integrator
    const { data: existingExpense, error: existingError } = await supabase
      .from('business_expenses')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (existingError || !existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateExpenseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { farmId, batchId, category, description, amount, expenseDate, paymentMode, gstAmount, isTaxDeductible, receiptUrl, notes } = validationResult.data;

    // Build update object
    const updateData: any = {};
    if (farmId !== undefined) updateData.farm_id = farmId;
    if (batchId !== undefined) updateData.batch_id = batchId;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (expenseDate !== undefined) updateData.expense_date = expenseDate;
    if (paymentMode !== undefined) updateData.payment_mode = paymentMode;
    if (gstAmount !== undefined) updateData.gst_amount = gstAmount;
    if (isTaxDeductible !== undefined) updateData.is_tax_deductible = isTaxDeductible;
    if (receiptUrl !== undefined) updateData.receipt_url = receiptUrl;
    if (notes !== undefined) updateData.notes = notes;

    // Update expense
    const { data: expense, error: updateError } = await (supabase.from('business_expenses') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Expense update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    console.error('Expenses API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify expense belongs to this integrator
    const { data: existingExpense, error: existingError } = await supabase
      .from('business_expenses')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (existingError || !existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Delete expense
    const { error: deleteError } = await supabase
      .from('business_expenses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Expense deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Expenses API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
