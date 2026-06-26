import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const gcSetupSchema = z.object({
  schedule_name: z.string().min(1, 'Schedule name is required'),
  breed: z.string().optional(),
  description: z.string().optional(),
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

    // Since gc_setup table might not exist in migration, return empty for now
    return NextResponse.json({
      data: [],
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error fetching GC setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch GC setup / GC सेटअप प्राप्त करने में विफल',
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
    const validatedData = gcSetupSchema.parse(body);

    return NextResponse.json({
      data: { 
        id: crypto.randomUUID(),
        integrator_id: user.id,
        ...validatedData,
        created_at: new Date().toISOString(),
      },
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

    console.error('Error creating GC setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create GC setup / GC सेटअप बनाने में विफल',
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
        { error: 'GC setup ID is required / GC सेटअप आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = gcSetupSchema.parse(updateData);

    return NextResponse.json({
      data: {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      },
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

    console.error('Error updating GC setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update GC setup / GC सेटअप अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
