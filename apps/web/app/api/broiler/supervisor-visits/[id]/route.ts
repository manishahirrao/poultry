import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const visitUpdateSchema = z.object({
  visit_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format HH:MM').optional(),
  purpose: z.string().optional(),
  flock_condition: z.string().optional(),
  mortality_today: z.number().min(0).optional(),
  feed_present_days: z.number().min(0).optional(),
  avg_weight_g: z.number().min(0).optional(),
  action_taken: z.string().optional(),
  km_travelled: z.number().min(0).optional(),
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
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('supervisor_visits')
      .select(`
        *,
        employees!inner(id, name, phone),
        farms!inner(id, farm_name, village, district),
        batches!inner(id, batch_number, breed)
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Supervisor visit not found / सुपरवाइजर विजिट नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching supervisor visit:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch supervisor visit / सुपरवाइजर विजिट प्राप्त करने में विफल',
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
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = visitUpdateSchema.parse(body);

    // Verify ownership
    const { data: existingVisit } = await supabase
      .from('supervisor_visits')
      .select('id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingVisit) {
      return NextResponse.json(
        { error: 'Supervisor visit not found or unauthorized / सुपरवाइजर विजिट नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('supervisor_visits')
      .update({
        visit_time: validatedData.visit_time || null,
        purpose: validatedData.purpose || null,
        flock_condition: validatedData.flock_condition || null,
        mortality_today: validatedData.mortality_today || null,
        feed_present_days: validatedData.feed_present_days || null,
        avg_weight_g: validatedData.avg_weight_g || null,
        action_taken: validatedData.action_taken || null,
        km_travelled: validatedData.km_travelled || null,
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
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error updating supervisor visit:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update supervisor visit / सुपरवाइजर विजिट अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existingVisit } = await supabase
      .from('supervisor_visits')
      .select('id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingVisit) {
      return NextResponse.json(
        { error: 'Supervisor visit not found or unauthorized / सुपरवाइजर विजिट नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('supervisor_visits')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting supervisor visit:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete supervisor visit / सुपरवाइजर विजिट हटाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
