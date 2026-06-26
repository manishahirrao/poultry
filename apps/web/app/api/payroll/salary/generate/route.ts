import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const salaryGenerateSchema = z.object({
  employee_id: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  working_days: z.number().min(1).max(31),
  present_days: z.number().min(0).max(31),
  overtime_hours: z.number().min(0).optional(),
  deductions: z.array(z.object({
    type: z.string(),
    amount: z.number().min(0),
  })).optional(),
  bonuses: z.array(z.object({
    type: z.string(),
    amount: z.number().min(0),
  })).optional(),
});

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
    const validatedData = salaryGenerateSchema.parse(body);

    // Fetch employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', validatedData.employee_id)
      .eq('integrator_id', user.id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found / कर्मचारी नहीं मिला' },
        { status: 404 }
      );
    }

    // Fetch payroll components for this employee
    const { data: components } = await supabase
      .from('payroll_components')
      .select('*')
      .eq('integrator_id', user.id);

    // Calculate basic salary
    const basicSalary = employee.basic_salary || 0;
    const dailyRate = basicSalary / validatedData.working_days;
    const earnedBasic = dailyRate * validatedData.present_days;

    // Calculate allowances
    let totalAllowances = 0;
    const allowances: any[] = [];

    components?.filter((c: any) => c.component_type === 'allowance' && c.is_active).forEach((comp: any) => {
      const amount = comp.is_percentage ? (earnedBasic * comp.amount / 100) : comp.amount;
      totalAllowances += amount;
      allowances.push({
        component_name: comp.component_name,
        amount: amount,
      });
    });

    // Calculate deductions
    let totalDeductions = 0;
    const deductionDetails: any[] = [];

    // Add statutory deductions
    components?.filter((c: any) => c.component_type === 'deduction' && c.is_active).forEach((comp: any) => {
      const amount = comp.is_percentage ? (earnedBasic * comp.amount / 100) : comp.amount;
      totalDeductions += amount;
      deductionDetails.push({
        component_name: comp.component_name,
        amount: amount,
      });
    });

    // Add custom deductions from request
    validatedData.deductions?.forEach(ded => {
      totalDeductions += ded.amount;
      deductionDetails.push({
        component_name: ded.type,
        amount: ded.amount,
      });
    });

    // Calculate bonuses
    let totalBonuses = 0;
    const bonusDetails: any[] = [];

    validatedData.bonuses?.forEach(bonus => {
      totalBonuses += bonus.amount;
      bonusDetails.push({
        component_name: bonus.type,
        amount: bonus.amount,
      });
    });

    // Calculate overtime
    let overtimeAmount = 0;
    if (validatedData.overtime_hours && validatedData.overtime_hours > 0) {
      const hourlyRate = dailyRate / 8;
      overtimeAmount = hourlyRate * validatedData.overtime_hours * 1.5; // 1.5x for overtime
    }

    // Calculate gross salary
    const grossSalary = earnedBasic + totalAllowances + totalBonuses + overtimeAmount;

    // Calculate net salary
    const netSalary = grossSalary - totalDeductions;

    // Generate salary slip number
    const salarySlipNumber = `SAL/${validatedData.year}/${String(validatedData.month).padStart(2, '0')}/${employee.employee_code}`;

    const salarySlip = {
      salary_slip_number: salarySlipNumber,
      employee_id: validatedData.employee_id,
      employee_name: employee.name,
      employee_code: employee.employee_code,
      month: validatedData.month,
      year: validatedData.year,
      working_days: validatedData.working_days,
      present_days: validatedData.present_days,
      basic_salary: basicSalary,
      earned_basic: earnedBasic,
      allowances: allowances,
      total_allowances: totalAllowances,
      bonuses: bonusDetails,
      total_bonuses: totalBonuses,
      overtime_hours: validatedData.overtime_hours || 0,
      overtime_amount: overtimeAmount,
      deductions: deductionDetails,
      total_deductions: totalDeductions,
      gross_salary: grossSalary,
      net_salary: netSalary,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      data: salarySlip,
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

    console.error('Error generating salary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate salary / वेतन जनरेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
