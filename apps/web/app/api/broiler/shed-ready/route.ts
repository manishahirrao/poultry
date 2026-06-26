import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const shedReadinessSchema = z.object({
  farm_id: z.string().uuid(),
  shed_id: z.string().uuid().nullable().optional(),
  expected_chick_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid expected chick date').optional().or(z.literal('')),
  litter_laid: z.boolean().default(false),
  brooder_tested: z.boolean().default(false),
  feeders_placed: z.boolean().default(false),
  drinkers_placed: z.boolean().default(false),
  disinfection_done: z.boolean().default(false),
  supervisor_id: z.string().uuid().nullable().optional(),
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
    const status = searchParams.get('status');

    let query = supabase
      .from('shed_readiness')
      .select(`
        *,
        farms!inner(id, farm_name, village, district),
        sheds!inner(id, shed_name),
        employees!inner(id, name, phone)
      `)
      .eq('integrator_id', user.id)
      .order('readiness_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
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
    console.error('Error fetching shed readiness:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch shed readiness / शेड रेडिनेस प्राप्त करने में विफल',
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
    const validatedData = shedReadinessSchema.parse(body);

    const { data, error } = await supabase
      .from('shed_readiness')
      .insert({
        integrator_id: user.id,
        farm_id: validatedData.farm_id,
        shed_id: validatedData.shed_id,
        readiness_date: new Date().toISOString().split('T')[0],
        expected_chick_date: validatedData.expected_chick_date || null,
        litter_laid: validatedData.litter_laid,
        brooder_tested: validatedData.brooder_tested,
        feeders_placed: validatedData.feeders_placed,
        drinkers_placed: validatedData.drinkers_placed,
        disinfection_done: validatedData.disinfection_done,
        supervisor_id: validatedData.supervisor_id,
        remarks: validatedData.remarks || null,
        status: 'pending',
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

    console.error('Error creating shed readiness:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create shed readiness / शेड रेडिनेस बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
