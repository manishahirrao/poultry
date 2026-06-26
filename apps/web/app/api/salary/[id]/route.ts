import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { syncLabourCostToGC } from '@/lib/gc/syncLabourCost';

// Zod schema for salary record update (matches database schema)
const UpdateSalaryRecordSchema = z.object({
  daysPresent: z.number().int().min(0).max(31).optional(),
  daysAbsent: z.number().int().min(0).max(31).optional(),
  daysHoliday: z.number().int().min(0).max(31).optional(),
  overtimeHrs: z.number().min(0).optional(),
  overtimeRate: z.number().min(0).optional(),
  basicSalary: z.number().min(0).optional(),
  hra: z.number().min(0).optional(),
  conveyance: z.number().min(0).optional(),
  bonusAmount: z.number().min(0).optional(),
  overtimeAmount: z.number().min(0).optional(),
  otherEarnings: z.number().min(0).optional(),
  pfDeduction: z.number().min(0).optional(),
  esiDeduction: z.number().min(0).optional(),
  advanceDeduction: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  paymentStatus: z.enum(['pending', 'processing', 'paid', 'on_hold']).optional(),
  paymentMode: z.enum(['bank_transfer', 'cash', 'upi']).optional(),
  paymentDate: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
  farmAllocations: z.array(z.object({
    farm_id: z.string().uuid(),
    allocation_pct: z.number().min(0).max(100)
  })).optional(),
  notes: z.string().optional(),
});

// PUT: Update a salary record
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

    // Verify salary record belongs to this integrator
    const { data: existingRecord, error: existingError } = await supabase
      .from('salary_records')
      .select('id, payment_status, basic_salary, hra, conveyance, bonus_amount, overtime_amount, other_earnings, pf_deduction, esi_deduction, advance_deduction, other_deductions')
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (existingError || !existingRecord) {
      return NextResponse.json(
        { error: 'Salary record not found' },
        { status: 404 }
      );
    }

    const record = existingRecord as any;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateSalaryRecordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      daysPresent, daysAbsent, daysHoliday, overtimeHrs, overtimeRate,
      basicSalary, hra, conveyance, bonusAmount, overtimeAmount, otherEarnings,
      pfDeduction, esiDeduction, advanceDeduction, otherDeductions,
      paymentStatus, paymentMode, paymentDate, paymentReference, paymentNotes,
      farmAllocations, notes
    } = validationResult.data;

    // Build update object with proper typing
    const updateData: Record<string, unknown> = {};
    if (daysPresent !== undefined) updateData.days_present = daysPresent;
    if (daysAbsent !== undefined) updateData.days_absent = daysAbsent;
    if (daysHoliday !== undefined) updateData.days_holiday = daysHoliday;
    if (overtimeHrs !== undefined) updateData.overtime_hrs = overtimeHrs;
    if (overtimeRate !== undefined) updateData.overtime_rate = overtimeRate;
    if (basicSalary !== undefined) updateData.basic_salary = basicSalary;
    if (hra !== undefined) updateData.hra = hra;
    if (conveyance !== undefined) updateData.conveyance = conveyance;
    if (bonusAmount !== undefined) updateData.bonus_amount = bonusAmount;
    if (overtimeAmount !== undefined) updateData.overtime_amount = overtimeAmount;
    if (otherEarnings !== undefined) updateData.other_earnings = otherEarnings;
    if (pfDeduction !== undefined) updateData.pf_deduction = pfDeduction;
    if (esiDeduction !== undefined) updateData.esi_deduction = esiDeduction;
    if (advanceDeduction !== undefined) updateData.advance_deduction = advanceDeduction;
    if (otherDeductions !== undefined) updateData.other_deductions = otherDeductions;
    if (paymentStatus !== undefined) {
      updateData.payment_status = paymentStatus;
      // Set payment_date when marked as paid
      if (paymentStatus === 'paid' && record.payment_status !== 'paid') {
        updateData.payment_date = paymentDate || new Date().toISOString().split('T')[0];
      }
    }

    // Track if payment status is changing to 'paid' to trigger GC sync
    const isChangingToPaid = paymentStatus === 'paid' && record.payment_status !== 'paid';
    if (paymentMode !== undefined) updateData.payment_mode = paymentMode;
    if (paymentDate !== undefined) updateData.payment_date = paymentDate;
    if (paymentReference !== undefined) updateData.payment_reference = paymentReference;
    if (paymentNotes !== undefined) updateData.payment_notes = paymentNotes;
    if (farmAllocations !== undefined) updateData.farm_allocations = farmAllocations;
    if (notes !== undefined) updateData.notes = notes;

    // Recompute gross earnings, total deductions, and net salary if any earnings/deductions changed
    const hasEarningsChange = basicSalary !== undefined || hra !== undefined || conveyance !== undefined ||
                            bonusAmount !== undefined || overtimeAmount !== undefined || otherEarnings !== undefined;
    const hasDeductionsChange = pfDeduction !== undefined || esiDeduction !== undefined ||
                               advanceDeduction !== undefined || otherDeductions !== undefined;

    if (hasEarningsChange || hasDeductionsChange) {
      const currentBasicSalary = basicSalary ?? (record.basic_salary as number);
      const currentHra = hra ?? (record.hra as number);
      const currentConveyance = conveyance ?? (record.conveyance as number);
      const currentBonusAmount = bonusAmount ?? (record.bonus_amount as number);
      const currentOvertimeAmount = overtimeAmount ?? (record.overtime_amount as number);
      const currentOtherEarnings = otherEarnings ?? (record.other_earnings as number);
      const currentPfDeduction = pfDeduction ?? (record.pf_deduction as number);
      const currentEsiDeduction = esiDeduction ?? (record.esi_deduction as number);
      const currentAdvanceDeduction = advanceDeduction ?? (record.advance_deduction as number);
      const currentOtherDeductions = otherDeductions ?? (record.other_deductions as number);

      const grossEarnings = currentBasicSalary + currentHra + currentConveyance +
                                  currentBonusAmount + currentOvertimeAmount + currentOtherEarnings;
      const totalDeductions = currentPfDeduction + currentEsiDeduction +
                                    currentAdvanceDeduction + currentOtherDeductions;
      const netSalary = grossEarnings - totalDeductions;

      updateData.gross_earnings = grossEarnings;
      updateData.total_deductions = totalDeductions;
      updateData.net_salary = netSalary;
    }

    // Update salary record
    const { data: salaryRecord, error: updateError } = await (supabase as any)
      .from('salary_records')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Salary record update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update salary record' },
        { status: 500 }
      );
    }

    // Trigger GC sync if payment status changed to 'paid'
    if (isChangingToPaid) {
      try {
        const syncResult = await syncLabourCostToGC(id);
        if (syncResult.success) {
          console.log('GC sync completed for salary record:', id, 'Updated farms:', syncResult.updatedFarms);
        } else {
          console.warn('GC sync failed for salary record:', id, 'Error:', syncResult.error);
        }
      } catch (syncError) {
        console.error('Error during GC sync for salary record:', id, syncError);
        // Don't fail the salary update if GC sync fails, just log it
      }
    }

    return NextResponse.json({
      salaryRecord,
      message: 'Salary record updated successfully',
    });
  } catch (error) {
    console.error('Salary API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a salary record
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

    // Verify salary record belongs to this integrator
    const { data: existingRecord, error: existingError } = await supabase
      .from('salary_records')
      .select('id, payment_status')
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (existingError || !existingRecord) {
      return NextResponse.json(
        { error: 'Salary record not found' },
        { status: 404 }
      );
    }

    const record = existingRecord as any;

    // Prevent deletion of paid salary records for audit purposes
    if (record.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete paid salary records for audit purposes' },
        { status: 400 }
      );
    }

    // Delete salary record
    const { error: deleteError } = await supabase
      .from('salary_records')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Salary record deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete salary record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Salary record deleted successfully',
    });
  } catch (error) {
    console.error('Salary API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
