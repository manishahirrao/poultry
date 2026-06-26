import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const inviteUserSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional(),
  role_name: z.string().min(1, 'Role name is required'),
});

const updateUserSchema = z.object({
  role_name: z.string().min(1, 'Role name is required').optional(),
  is_suspended: z.boolean().optional(),
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all user_privileges for this integrator
    const { data: privileges, error: privilegesError } = await supabase
      .from('user_privileges')
      .select(`
        *,
        auth_users:user_id (
          email,
          phone,
          created_at
        )
      `)
      .eq('integrator_id', user.id)
      .order('created_at', { ascending: false });

    if (privilegesError) throw privilegesError;

    return NextResponse.json({
      data: privileges,
      error: null,
      meta: { total: privileges?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = inviteUserSchema.parse(body);

    // Check if user with this phone already exists
    const { data: existingUser } = await supabase
      .auth.admin.listUsers();
    
    const userWithPhone = existingUser.users.find((u: any) => u.phone === validatedData.phone);

    let userId: string;

    if (userWithPhone) {
      // User exists, check if already has privileges with this integrator
      const { data: existingPrivilege } = await supabase
        .from('user_privileges')
        .select('*')
        .eq('user_id', userWithPhone.id)
        .eq('integrator_id', user.id)
        .single();

      if (existingPrivilege) {
        return NextResponse.json(
          { error: 'User already exists under this integrator' },
          { status: 400 }
        );
      }

      userId = userWithPhone.id;
    } else {
      // Create new user with phone
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: validatedData.phone,
        email: validatedData.email || undefined,
        user_metadata: {
          invited_by: user.id,
        },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Create user_privileges record
    const { data: privilege, error: privilegeError } = await supabase
      .from('user_privileges')
      .insert({
        integrator_id: user.id,
        user_id: userId,
        role_name: validatedData.role_name,
        can_view_dashboard: true,
        can_view_farms: true,
        can_edit_farms: false,
        can_view_inventory: false,
        can_edit_inventory: false,
        can_view_accounts: false,
        can_edit_accounts: false,
        can_view_payroll: false,
        can_edit_payroll: false,
        can_view_reports: true,
        can_manage_users: false,
        can_approve_payments: false,
        allowed_farm_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (privilegeError) throw privilegeError;

    // Send OTP invite (this would typically integrate with an SMS service)
    // For now, we'll just return success
    // TODO: Implement actual OTP sending via SMS service

    return NextResponse.json({
      data: privilege,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error inviting user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to invite user',
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User privilege ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateUserSchema.parse(updateData);

    // Verify ownership
    const { data: existingPrivilege } = await supabase
      .from('user_privileges')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingPrivilege) {
      return NextResponse.json(
        { error: 'User privilege not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('user_privileges')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
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
          error: 'Validation error',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User privilege ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingPrivilege } = await supabase
      .from('user_privileges')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingPrivilege) {
      return NextResponse.json(
        { error: 'User privilege not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('user_privileges')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        data: null 
      },
      { status: 500 }
    );
  }
}
