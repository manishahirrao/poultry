import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for salary record creation (matches database schema)
const CreateSalaryRecordSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  daysPresent: z.number().int().min(0).max(31).optional(),
  daysAbsent: z.number().int().min(0).max(31).default(0),
  daysHoliday: z.number().int().min(0).max(31).default(0),
  overtimeHrs: z.number().min(0).default(0),
  overtimeRate: z.number().min(0).default(0),
  basicSalary: z.number().min(0),
  hra: z.number().min(0).default(0),
  conveyance: z.number().min(0).default(0),
  bonusAmount: z.number().min(0).default(0),
  overtimeAmount: z.number().min(0).default(0),
  otherEarnings: z.number().min(0).default(0),
  pfDeduction: z.number().min(0).default(0),
  esiDeduction: z.number().min(0).default(0),
  advanceDeduction: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  paymentStatus: z.enum(['pending', 'processing', 'paid', 'on_hold']).default('pending'),
  paymentMode: z.enum(['bank_transfer', 'cash', 'upi']).optional(),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
  farmAllocations: z.array(z.object({
    farm_id: z.string().uuid(),
    allocation_pct: z.number().min(0).max(100)
  })).optional(),
  notes: z.string().optional(),
});

// GET: List all salary records for the authenticated integrator
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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('salary_records')
      .select(`
        id,
        employee_id,
        month,
        year,
        days_present,
        days_absent,
        days_holiday,
        overtime_hrs,
        overtime_rate,
        basic_salary,
        hra,
        conveyance,
        bonus_amount,
        overtime_amount,
        other_earnings,
        gross_earnings,
        pf_deduction,
        esi_deduction,
        advance_deduction,
        other_deductions,
        total_deductions,
        net_salary,
        payment_status,
        payment_date,
        payment_mode,
        payment_reference,
        payment_notes,
        farm_allocations,
        notes,
        created_at,
        updated_at,
        employees (
          id,
          employee_code,
          full_name,
          name_hindi,
          role,
          employment_type,
          base_salary_monthly,
          daily_wage_rate
        )
      `)
      .eq('integrator_id', customer.id);

    if (month) {
      query = query.eq('month', parseInt(month));
    }

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (status) {
      query = query.eq('payment_status', status);
    }

    query = query.order('year', { ascending: false }).order('month', { ascending: false });

    const { data: salaryRecords, error: salaryError } = await query;

    if (salaryError) {
      console.error('Salary records query error:', salaryError);
      return NextResponse.json(
        { error: 'Failed to fetch salary records' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      salaryRecords: salaryRecords || [],
    });
  } catch (error) {
    console.error('Salary API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new salary record
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
    const validationResult = CreateSalaryRecordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { 
      employeeId, month, year, daysPresent, daysAbsent, daysHoliday,
      overtimeHrs, overtimeRate, basicSalary, hra, conveyance, bonusAmount,
      overtimeAmount, otherEarnings, pfDeduction, esiDeduction,
      advanceDeduction, otherDeductions, paymentStatus, paymentMode,
      paymentReference, paymentNotes, farmAllocations, notes 
    } = validationResult.data;

    // Verify employee belongs to this integrator
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, base_salary_monthly, daily_wage_rate, employment_type')
      .eq('id', employeeId)
      .eq('integrator_id', customer.id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Check if salary record already exists for this employee and month
    const { data: existingRecord } = await supabase
      .from('salary_records')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Salary record already exists for this employee and month' },
        { status: 409 }
      );
    }

    // Compute gross earnings and net salary
    const grossEarnings = basicSalary + hra + conveyance + bonusAmount + overtimeAmount + otherEarnings;
    const totalDeductions = pfDeduction + esiDeduction + advanceDeduction + otherDeductions;
    const netSalary = grossEarnings - totalDeductions;

    // Create salary record
    const { data: salaryRecord, error: createError } = await supabase
      .from('salary_records')
      .insert({
        employee_id: employeeId,
        integrator_id: customer.id,
        month,
        year,
        days_present: daysPresent,
        days_absent: daysAbsent,
        days_holiday: daysHoliday,
        overtime_hrs: overtimeHrs,
        overtime_rate: overtimeRate,
        basic_salary: basicSalary,
        hra,
        conveyance,
        bonus_amount: bonusAmount,
        overtime_amount: overtimeAmount,
        other_earnings: otherEarnings,
        gross_earnings: grossEarnings,
        pf_deduction: pfDeduction,
        esi_deduction: esiDeduction,
        advance_deduction: advanceDeduction,
        other_deductions: otherDeductions,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        payment_status: paymentStatus,
        payment_mode: paymentMode,
        payment_reference: paymentReference,
        payment_notes: paymentNotes,
        farm_allocations: farmAllocations || [],
        notes,
      } as any)
      .select()
      .single();

    if (createError) {
      console.error('Salary record creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create salary record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      salaryRecord,
      message: 'Salary record created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Salary API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
