import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const accountGroupSchema = z.object({
  group_name: z.string().min(1, 'Group name is required'),
  groupCode: z.string().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  group_type: z.enum(['asset', 'liability', 'income', 'expense', 'equity']),
  nature: z.enum(['debit', 'credit']),
  remarks: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const groupType = searchParams.get('group_type');

    let query = supabase
      .from('account_groups')
      .select(`
        *,
        parent(group_name)
      `)
      .eq('integrator_id', user.id)
      .eq('is_active', true)
      .order('group_code')
      .range((page - 1) * limit, page * limit - 1);

    if (groupType) {
      query = query.eq('group_type', groupType);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      error: null,
      meta: {
        total: count || 0,
        page,
        limit
      }
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

    // Generate group code if not provided
    const groupCode = validatedData.groupCode || await generateGroupCode(supabase, user.id, validatedData.group_type);

    const { data, error } = await supabase
      .from('account_groups')
      .insert({
        integrator_id: user.id,
        groupCode,
        group_name: validatedData.group_name,
        parent_id: validatedData.parent_id,
        group_type: validatedData.group_type,
        nature: validatedData.nature,
        remarks: validatedData.remarks || null,
        is_active: true,
        created_by: user.id,
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

async function generateGroupCode(supabase: any, userId: string, type: string): Promise<string> {
  try {
    const typePrefix = type.substring(0, 3).toUpperCase();
    
    const { data: lastGroup } = await supabase
      .from('account_groups')
      .select('group_code')
      .eq('integrator_id', userId)
      .like('group_code', `${typePrefix}%`)
      .order('group_code', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastGroup) {
      const lastSequence = parseInt(lastGroup.group_code.replace(`${typePrefix}`, ''));
      sequence = lastSequence + 1;
    }

    return `${typePrefix}${sequence.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating group code:', error);
    return `${type.substring(0, 3).toUpperCase()}001`;
  }
}
