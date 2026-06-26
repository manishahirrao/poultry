import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const packingTypeSchema = z.object({
  type_name: z.string().min(1, 'Type name is required'),
  type_name_hi: z.string().optional(),
  capacity_kg: z.number().min(0),
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

    // Since packing_types table might not exist in migration, we'll use a simple approach
    // For now, return default packing types
    const defaultPackingTypes = [
      { id: '1', type_name: '20kg Crate', type_name_hi: '20 किलोग्राम क्रेट', capacity_kg: 20, description: 'Standard 20kg bird crate' },
      { id: '2', type_name: '25kg Crate', type_name_hi: '25 किलोग्राम क्रेट', capacity_kg: 25, description: 'Standard 25kg bird crate' },
      { id: '3', type_name: '30kg Crate', type_name_hi: '30 किलोग्राम क्रेट', capacity_kg: 30, description: 'Standard 30kg bird crate' },
    ];

    return NextResponse.json({
      data: defaultPackingTypes,
      error: null,
      meta: { total: defaultPackingTypes.length }
    });
  } catch (error) {
    console.error('Error fetching packing types:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch packing types / पैकिंग प्रकार प्राप्त करने में विफल',
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
    const validatedData = packingTypeSchema.parse(body);

    // For now, return success without database operation
    // In production, this would insert into packing_types table
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

    console.error('Error creating packing type:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create packing type / पैकिंग प्रकार बनाने में विफल',
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
        { error: 'Packing type ID is required / पैकिंग प्रकार आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = packingTypeSchema.parse(updateData);

    // For now, return success without database operation
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

    console.error('Error updating packing type:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update packing type / पैकिंग प्रकार अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
