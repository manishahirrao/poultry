import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const taxSetupSchema = z.object({
  tax_name: z.string().min(1, 'Tax name is required'),
  tax_rate: z.number().min(0).max(100),
  cgst_rate: z.number().min(0).max(100).optional(),
  sgst_rate: z.number().min(0).max(100).optional(),
  igst_rate: z.number().min(0).max(100).optional(),
  hsn_code: z.string().optional(),
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
      .from('tax_setup')
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
    console.error('Error fetching tax setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tax setup / टैक्स सेटअप प्राप्त करने में विफल',
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
    const validatedData = taxSetupSchema.parse(body);

    const { data, error } = await supabase
      .from('tax_setup')
      .insert({
        integrator_id: user.id,
        tax_name: validatedData.tax_name,
        tax_rate: validatedData.tax_rate,
        cgst_rate: validatedData.cgst_rate || null,
        sgst_rate: validatedData.sgst_rate || null,
        igst_rate: validatedData.igst_rate || null,
        hsn_code: validatedData.hsn_code || null,
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

    console.error('Error creating tax setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create tax setup / टैक्स सेटअप बनाने में विफल',
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
        { error: 'Tax setup ID is required / टैक्स सेटअप आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = taxSetupSchema.parse(updateData);

    // Verify ownership
    const { data: existingTax } = await supabase
      .from('tax_setup')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingTax) {
      return NextResponse.json(
        { error: 'Tax setup not found or unauthorized / टैक्स सेटअप नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('tax_setup')
      .update({
        tax_name: validatedData.tax_name,
        tax_rate: validatedData.tax_rate,
        cgst_rate: validatedData.cgst_rate || null,
        sgst_rate: validatedData.sgst_rate || null,
        igst_rate: validatedData.igst_rate || null,
        hsn_code: validatedData.hsn_code || null,
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

    console.error('Error updating tax setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update tax setup / टैक्स सेटअप अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
