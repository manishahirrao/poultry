import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const privilegesSchema = z.object({
  role_name: z.string().min(1, 'Role name is required'),
  can_view_dashboard: z.boolean().default(true),
  can_view_farms: z.boolean().default(true),
  can_edit_farms: z.boolean().default(false),
  can_view_inventory: z.boolean().default(false),
  can_edit_inventory: z.boolean().default(false),
  can_view_accounts: z.boolean().default(false),
  can_edit_accounts: z.boolean().default(false),
  can_view_payroll: z.boolean().default(false),
  can_edit_payroll: z.boolean().default(false),
  can_view_reports: z.boolean().default(true),
  can_manage_users: z.boolean().default(false),
  can_approve_payments: z.boolean().default(false),
  allowed_farm_ids: z.array(z.string()).default([]),
});

export async function GET(
  request: NextRequest,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: privilege, error } = await supabase
      .from('user_privileges')
      .select('*')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!privilege) {
      return NextResponse.json(
        { error: 'User privilege not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: privilege,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching user privileges:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user privileges',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = privilegesSchema.parse(body);

    // Verify ownership
    const { data: existingPrivilege } = await supabase
      .from('user_privileges')
      .select('id')
      .eq('id', params.id)
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
      .eq('id', params.id)
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

    console.error('Error updating user privileges:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user privileges',
        data: null 
      },
      { status: 500 }
    );
  }
}
