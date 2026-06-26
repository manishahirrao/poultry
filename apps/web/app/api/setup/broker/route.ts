import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const brokerSchema = z.object({
  broker_name: z.string().min(1, 'Broker name is required'),
  broker_name_hi: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  commission_pct: z.number().min(0).max(100).default(0),
  address: z.string().optional(),
  notes: z.string().optional(),
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

    // Since broker table might not exist in migration, return empty for now
    return NextResponse.json({
      data: [],
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch brokers / ब्रोकर प्राप्त करने में विफल',
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
    const validatedData = brokerSchema.parse(body);

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

    console.error('Error creating broker:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create broker / ब्रोकर बनाने में विफल',
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
        { error: 'Broker ID is required / ब्रोकर आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = brokerSchema.parse(updateData);

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

    console.error('Error updating broker:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update broker / ब्रोकर अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
