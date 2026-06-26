import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const profitCenterSchema = z.object({
  center_code: z.string().min(1, 'Center code is required'),
  center_name: z.string().min(1, 'Center name is required'),
  center_type: z.enum(['integration', 'trading', 'feed', 'other']).default('integration'),
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
      .from('profit_centers')
      .select('*')
      .eq('integrator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching profit centers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profit centers / प्रॉफिट सेंटर प्राप्त करने में विफल',
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
    const validatedData = profitCenterSchema.parse(body);

    const { data, error } = await supabase
      .from('profit_centers')
      .insert({
        integrator_id: user.id,
        center_code: validatedData.center_code,
        center_name: validatedData.center_name,
        center_type: validatedData.center_type,
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

    console.error('Error creating profit center:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create profit center / प्रॉफिट सेंटर बनाने में विफल',
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
        { error: 'Profit center ID is required / प्रॉफिट सेंटर आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = profitCenterSchema.parse(updateData);

    // Verify ownership
    const { data: existingCenter } = await supabase
      .from('profit_centers')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Profit center not found or unauthorized / प्रॉफिट सेंटर नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('profit_centers')
      .update({
        center_code: validatedData.center_code,
        center_name: validatedData.center_name,
        center_type: validatedData.center_type,
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

    console.error('Error updating profit center:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profit center / प्रॉफिट सेंटर अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
