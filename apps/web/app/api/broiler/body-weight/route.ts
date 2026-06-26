import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodyWeightSchema = z.object({
  batch_id: z.string().uuid(),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  sample_birds_weighed: z.number().min(1, 'Sample birds must be at least 1'),
  total_sample_weight_kg: z.number().min(0.01, 'Total weight must be positive'),
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
    const batchId = searchParams.get('batch_id');

    let query = supabase
      .from('body_weight_entries')
      .select(`
        *,
        batches!inner(batch_number, farms(farm_name))
      `)
      .eq('integrator_id', user.id)
      .order('entry_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (batchId) {
      query = query.eq('batch_id', batchId);
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
    console.error('Error fetching body weight entries:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch body weight entries / बॉडी वेट एंट्री प्राप्त करने में विफल',
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
    const validatedData = bodyWeightSchema.parse(body);

    // Calculate average weight
    const averageWeightG = (validatedData.total_sample_weight_kg * 1000) / validatedData.sample_birds_weighed;

    const { data, error } = await supabase
      .from('body_weight_entries')
      .insert({
        integrator_id: user.id,
        batch_id: validatedData.batch_id,
        entry_date: validatedData.entry_date,
        sample_birds_weighed: validatedData.sample_birds_weighed,
        total_sample_weight_kg: validatedData.total_sample_weight_kg,
        average_weight_g: averageWeightG,
        remarks: validatedData.remarks || null,
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

    console.error('Error creating body weight entry:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create body weight entry / बॉडी वेट एंट्री बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
