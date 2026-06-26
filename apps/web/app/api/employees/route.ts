import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for employee creation (matches FlockIQ_Windsurf_Prompt.md spec)
const CreateEmployeeSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  name_hindi: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['farm_manager', 'field_supervisor', 'farm_worker', 'driver', 'accountant', 'office_staff', 'other'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  role_custom: z.string().optional(),
  assigned_farm_ids: z.array(z.string().uuid()).optional(),
  employment_type: z.enum(['permanent', 'contractual', 'daily_wage', 'part_time']).default('permanent'),
  join_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  is_active: z.boolean().default(true),
  base_salary_monthly: z.number().min(0).optional(),
  daily_wage_rate: z.number().min(0).optional(),
  pf_applicable: z.boolean().default(false),
  esi_applicable: z.boolean().default(false),
  bonus_pct: z.number().min(0).max(100).optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  bank_name: z.string().optional(),
  aadhaar_last4: z.string().length(4).optional(),
  profile_photo_url: z.string().url().optional(),
  notes: z.string().optional(),
});

// GET: List all employees for the authenticated integrator
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

    // Fetch employees with farm names and salary status (matches spec schema)
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        employee_code,
        full_name,
        name_hindi,
        phone,
        role,
        role_custom,
        assigned_farm_ids,
        employment_type,
        join_date,
        end_date,
        is_active,
        base_salary_monthly,
        daily_wage_rate,
        created_at,
        updated_at
      `)
      .eq('integrator_id', customer.id)
      .order('created_at', { ascending: false });

    if (employeesError) {
      console.error('Employees query error:', employeesError);
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    // Get current month/year for salary status check
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch salary records for all employees for current month
    const employeeIds = (employees || []).map((e: any) => e.id);
    let employeesWithSalaryStatus: any[] = employees || [];

    if (employeeIds.length > 0) {
      const { data: salaryRecords } = await supabase
        .from('salary_records')
        .select('employee_id, payment_status, month, year')
        .in('employee_id', employeeIds)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      // Map salary status to employees
      const salaryStatusMap = new Map<string, { salary_status: string; salary_month: string }>();
      salaryRecords?.forEach((record: any) => {
        salaryStatusMap.set(record.employee_id, {
          salary_status: record.payment_status,
          salary_month: `${record.year}-${String(record.month).padStart(2, '0')}`
        });
      });

      employeesWithSalaryStatus = employeesWithSalaryStatus.map((employee: any) => {
        const salaryInfo = salaryStatusMap.get(employee.id);
        return {
          ...employee,
          salary_status: salaryInfo?.salary_status || 'pending',
          salary_month: salaryInfo?.salary_month
        };
      });
    }

    return NextResponse.json({
      employees: employeesWithSalaryStatus,
    });
  } catch (error) {
    console.error('Employees API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new employee
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
    const validationResult = CreateEmployeeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      full_name, name_hindi, phone, role, role_custom, assigned_farm_ids,
      employment_type, join_date, end_date, is_active,
      base_salary_monthly, daily_wage_rate, pf_applicable, esi_applicable,
      bonus_pct, bank_account_number, bank_ifsc, bank_name,
      aadhaar_last4, profile_photo_url, notes
    } = validationResult.data;

    // Verify assigned farms belong to this integrator
    if (assigned_farm_ids && assigned_farm_ids.length > 0) {
      const { data: farms, error: farmsError } = await supabase
        .from('farms')
        .select('id')
        .in('id', assigned_farm_ids)
        .eq('integrator_id', customer.id);

      if (farmsError || !farms || (Array.isArray(farms) && farms.length !== assigned_farm_ids.length)) {
        return NextResponse.json(
          { error: 'One or more farms not found or do not belong to you' },
          { status: 404 }
        );
      }
    }

    // Generate employee code (EMP-001, EMP-002, etc.)
    const { data: lastEmployee } = await supabase
      .from('employees')
      .select('employee_code')
      .eq('integrator_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let employee_code = 'EMP-001';
    if (lastEmployee && typeof lastEmployee === 'object' && 'employee_code' in lastEmployee && (lastEmployee as any).employee_code) {
      const lastNum = parseInt(((lastEmployee as any).employee_code as string).split('-')[1]);
      employee_code = `EMP-${String(lastNum + 1).padStart(3, '0')}`;
    }

    // Check if phone number already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this phone number already exists' },
        { status: 409 }
      );
    }

    // Create employee (matches spec schema)
    const { data: employee, error: createError } = await (supabase as any)
      .from('employees')
      .insert({
        integrator_id: customer.id,
        employee_code,
        full_name,
        name_hindi,
        phone,
        role,
        role_custom,
        assigned_farm_ids,
        employment_type,
        join_date,
        end_date,
        is_active,
        base_salary_monthly,
        daily_wage_rate,
        pf_applicable,
        esi_applicable,
        bonus_pct,
        bank_account_number,
        bank_ifsc,
        bank_name,
        aadhaar_last4,
        profile_photo_url,
        notes,
      })
      .select()
      .single();

    if (createError) {
      console.error('Employee creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create employee' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      employee,
      message: 'Employee created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Employees API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
