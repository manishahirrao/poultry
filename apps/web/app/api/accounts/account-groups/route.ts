import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const accountGroupSchema = z.object({
  group_code: z.string().min(1, 'Group code is required'),
  group_name: z.string().min(1, 'Group name is required'),
  group_type: z.enum(['asset', 'liability', 'income', 'expense', 'equity']),
  parent_group_id: z.string().uuid().nullable().optional(),
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
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('account_groups')
      .select(`
        *,
        parent_group!inner(id, group_name, group_code)
      `)
      .eq('integrator_id', user.id)
      .order('group_code', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching account groups:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch account groups / खाता समूह प्राप्त करने में विफल',
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
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = accountGroupSchema.parse(body);

    const { data, error } = await supabase
      .from('account_groups')
      .insert({
        integrator_id: user.id,
        group_code: validatedData.group_code,
        group_name: validatedData.group_name,
        group_type: validatedData.group_type,
        parent_group_id: validatedData.parent_group_id,
        created_at: new Date().toISOString(),
      })
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
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error creating account group:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create account group / खाता समूह बनाने में विफल',
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
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Account group ID is required / खाता समूह आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = accountGroupSchema.parse(updateData);

    // Verify ownership
    const { data: existingGroup } = await supabase
      .from('account_groups')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Account group not found or unauthorized / खाता समूह नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('account_groups')
      .update({
        group_code: validatedData.group_code,
        group_name: validatedData.group_name,
        group_type: validatedData.group_type,
        parent_group_id: validatedData.parent_group_id,
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
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error updating account group:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update account group / खाता समूह अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
