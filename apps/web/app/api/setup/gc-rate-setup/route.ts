import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const gcRateSetupSchema = z.object({
  rate_name: z.string().min(1, 'Rate name is required'),
  breed: z.string().optional(),
  season: z.enum(['summer', 'winter', 'monsoon', 'all']).default('all'),
  chick_rate: z.number().min(0).optional(),
  feed_rate: z.number().min(0).optional(),
  target_gc: z.number().min(0),
  incentive_above: z.number().min(0).optional(),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid effective from date'),
  effective_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid effective to date').optional().or(z.literal('')),
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
      .from('gc_rate_setup')
      .select('*')
      .eq('integrator_id', user.id)
      .order('effective_from', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching GC rate setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch GC rate setup / GC दर सेटअप प्राप्त करने में विफल',
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
    const validatedData = gcRateSetupSchema.parse(body);

    const { data, error } = await supabase
      .from('gc_rate_setup')
      .insert({
        integrator_id: user.id,
        rate_name: validatedData.rate_name,
        breed: validatedData.breed || null,
        season: validatedData.season,
        chick_rate: validatedData.chick_rate || null,
        feed_rate: validatedData.feed_rate || null,
        target_gc: validatedData.target_gc,
        incentive_above: validatedData.incentive_above || null,
        effective_from: validatedData.effective_from,
        effective_to: validatedData.effective_to || null,
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

    console.error('Error creating GC rate setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create GC rate setup / GC दर सेटअप बनाने में विफल',
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
        { error: 'GC rate setup ID is required / GC दर सेटअप आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = gcRateSetupSchema.parse(updateData);

    // Verify ownership
    const { data: existingRate } = await supabase
      .from('gc_rate_setup')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingRate) {
      return NextResponse.json(
        { error: 'GC rate setup not found or unauthorized / GC दर सेटअप नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('gc_rate_setup')
      .update({
        rate_name: validatedData.rate_name,
        breed: validatedData.breed || null,
        season: validatedData.season,
        chick_rate: validatedData.chick_rate || null,
        feed_rate: validatedData.feed_rate || null,
        target_gc: validatedData.target_gc,
        incentive_above: validatedData.incentive_above || null,
        effective_from: validatedData.effective_from,
        effective_to: validatedData.effective_to || null,
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

    console.error('Error updating GC rate setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update GC rate setup / GC दर सेटअप अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
