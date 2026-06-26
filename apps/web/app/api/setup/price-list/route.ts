import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const priceListSchema = z.object({
  list_name: z.string().min(1, 'List name is required'),
  farmer_id: z.string().uuid().nullable().optional(),
  line_id: z.string().uuid().nullable().optional(),
  season: z.enum(['summer', 'winter', 'monsoon', 'all']).default('all'),
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

    // Since price_list table might not exist in migration, return empty for now
    return NextResponse.json({
      data: [],
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error fetching price list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch price list / मूल्य सूची प्राप्त करने में विफल',
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
    const validatedData = priceListSchema.parse(body);

    return NextResponse.json({
      data: { 
        id: crypto.randomUUID(),
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

    console.error('Error creating price list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create price list / मूल्य सूची बनाने में विफल',
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
        { error: 'Price list ID is required / मूल्य सूची आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = priceListSchema.parse(updateData);

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

    console.error('Error updating price list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update price list / मूल्य सूची अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
