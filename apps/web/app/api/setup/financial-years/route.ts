import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const financialYearSchema = z.object({
  year_label: z.string().min(1, 'Year label is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
  is_current: z.boolean().default(false),
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
      .from('financial_years')
      .select('*')
      .eq('integrator_id', user.id)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching financial years:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch financial years / वित्तीय वर्ष प्राप्त करने में विफल',
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
    const validatedData = financialYearSchema.parse(body);

    // If setting as current, unset all other current years
    if (validatedData.is_current) {
      await supabase
        .from('financial_years')
        .update({ is_current: false })
        .eq('integrator_id', user.id);
    }

    const { data, error } = await supabase
      .from('financial_years')
      .insert({
        integrator_id: user.id,
        year_label: validatedData.year_label,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        is_current: validatedData.is_current,
        is_closed: false,
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

    console.error('Error creating financial year:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create financial year / वित्तीय वर्ष बनाने में विफल',
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
        { error: 'Financial year ID is required / वित्तीय वर्ष आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = financialYearSchema.parse(updateData);

    // Verify ownership
    const { data: existingFY } = await supabase
      .from('financial_years')
      .select('id, is_closed')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingFY) {
      return NextResponse.json(
        { error: 'Financial year not found or unauthorized / वित्तीय वर्ष नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    if (existingFY.is_closed) {
      return NextResponse.json(
        { error: 'Cannot modify closed financial year / बंद वित्तीय वर्ष को संशोधित नहीं किया जा सकता' },
        { status: 400 }
      );
    }

    // If setting as current, unset all other current years
    if (validatedData.is_current) {
      await supabase
        .from('financial_years')
        .update({ is_current: false })
        .eq('integrator_id', user.id)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('financial_years')
      .update({
        year_label: validatedData.year_label,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        is_current: validatedData.is_current,
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

    console.error('Error updating financial year:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update financial year / वित्तीय वर्ष अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
