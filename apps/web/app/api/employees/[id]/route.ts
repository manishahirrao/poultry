import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for employee update (matches FlockIQ_Windsurf_Prompt.md spec)
const UpdateEmployeeSchema = z.object({
  full_name: z.string().min(1).optional(),
  name_hindi: z.string().optional(),
  phone: z.string().min(10).optional(),
  role: z.enum(['farm_manager', 'field_supervisor', 'farm_worker', 'driver', 'accountant', 'office_staff', 'other']).optional(),
  role_custom: z.string().optional(),
  assigned_farm_ids: z.array(z.string().uuid()).optional(),
  employment_type: z.enum(['permanent', 'contractual', 'daily_wage', 'part_time']).optional(),
  join_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_active: z.boolean().optional(),
  base_salary_monthly: z.number().min(0).optional(),
  daily_wage_rate: z.number().min(0).optional(),
  pf_applicable: z.boolean().optional(),
  esi_applicable: z.boolean().optional(),
  bonus_pct: z.number().min(0).max(100).optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  bank_name: z.string().optional(),
  aadhaar_last4: z.string().length(4).optional(),
  profile_photo_url: z.string().url().optional(),
  notes: z.string().optional(),
});

// GET: Get a single employee by ID
export async function GET(
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

    // Fetch employee (matches spec schema)
    const { data: employee, error: employeeError } = await supabase
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
        pf_applicable,
        esi_applicable,
        bonus_pct,
        bank_account_number,
        bank_ifsc,
        bank_name,
        aadhaar_last4,
        profile_photo_url,
        notes,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      employee,
    });
  } catch (error) {
    console.error('Employee API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an employee
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

    // Verify employee belongs to this integrator
    const { data: existingEmployee, error: existingError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (existingError || !existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateEmployeeSchema.safeParse(body);

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

    // If phone is being updated, check for duplicates
    if (phone) {
      const { data: duplicateEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('phone', phone)
        .neq('id', id)
        .single();

      if (duplicateEmployee) {
        return NextResponse.json(
          { error: 'Employee with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // If assigned_farm_ids is being updated, verify farms belong to this integrator
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

    // Build update object (matches spec schema)
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (name_hindi !== undefined) updateData.name_hindi = name_hindi;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (role_custom !== undefined) updateData.role_custom = role_custom;
    if (assigned_farm_ids !== undefined) updateData.assigned_farm_ids = assigned_farm_ids;
    if (employment_type !== undefined) updateData.employment_type = employment_type;
    if (join_date !== undefined) updateData.join_date = join_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (base_salary_monthly !== undefined) updateData.base_salary_monthly = base_salary_monthly;
    if (daily_wage_rate !== undefined) updateData.daily_wage_rate = daily_wage_rate;
    if (pf_applicable !== undefined) updateData.pf_applicable = pf_applicable;
    if (esi_applicable !== undefined) updateData.esi_applicable = esi_applicable;
    if (bonus_pct !== undefined) updateData.bonus_pct = bonus_pct;
    if (bank_account_number !== undefined) updateData.bank_account_number = bank_account_number;
    if (bank_ifsc !== undefined) updateData.bank_ifsc = bank_ifsc;
    if (bank_name !== undefined) updateData.bank_name = bank_name;
    if (aadhaar_last4 !== undefined) updateData.aadhaar_last4 = aadhaar_last4;
    if (profile_photo_url !== undefined) updateData.profile_photo_url = profile_photo_url;
    if (notes !== undefined) updateData.notes = notes;

    // Update employee
    const { data: employee, error: updateError } = await (supabase as any)
      .from('employees')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Employee update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update employee' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    console.error('Employee API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an employee
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

    // Verify employee belongs to this integrator
    const { data: existingEmployee, error: existingError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', customer.id)
      .single();

    if (existingError || !existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Delete employee
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Employee deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete employee' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Employee API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
