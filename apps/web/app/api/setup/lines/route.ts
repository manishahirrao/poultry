import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const lineSchema = z.object({
  line_code: z.string().min(1, 'Line code is required'),
  line_name: z.string().min(1, 'Line name is required'),
  supervisor_id: z.string().uuid().nullable().optional(),
  district: z.string().optional(),
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
      .from('lines')
      .select(`
        *,
        employees!line_supervisor(id, name, phone),
        farmers!line_farmers(id, full_name, village)
      `)
      .eq('integrator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching lines:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch lines / लाइन प्राप्त करने में विफल',
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
    const validatedData = lineSchema.parse(body);

    const { data, error } = await supabase
      .from('lines')
      .insert({
        integrator_id: user.id,
        line_code: validatedData.line_code,
        line_name: validatedData.line_name,
        supervisor_id: validatedData.supervisor_id,
        district: validatedData.district || null,
        farm_count: 0,
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

    console.error('Error creating line:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create line / लाइन बनाने में विफल',
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
        { error: 'Line ID is required / लाइन आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = lineSchema.parse(updateData);

    // Verify ownership
    const { data: existingLine } = await supabase
      .from('lines')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingLine) {
      return NextResponse.json(
        { error: 'Line not found or unauthorized / लाइन नहीं मिली या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('lines')
      .update({
        line_code: validatedData.line_code,
        line_name: validatedData.line_name,
        supervisor_id: validatedData.supervisor_id,
        district: validatedData.district || null,
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

    console.error('Error updating line:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update line / लाइन अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
