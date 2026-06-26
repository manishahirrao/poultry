import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const traderSchema = z.object({
  full_name: z.string().min(1, 'Trader name is required'),
  company_name: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  opening_balance: z.number().default(0),
  balance_type: z.enum(['payable', 'receivable']).default('receivable'),
  credit_days: z.number().min(0).default(0),
  rating: z.number().min(1).max(5).default(3),
  notes: z.string().optional(),
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
      .from('traders')
      .select('*')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Trader not found / व्यापारी नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching trader:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch trader / व्यापारी प्राप्त करने में विफल',
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
    const validatedData = traderSchema.parse(body);

    // Verify ownership
    const { data: existingTrader } = await supabase
      .from('traders')
      .select('id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingTrader) {
      return NextResponse.json(
        { error: 'Trader not found or unauthorized / व्यापारी नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('traders')
      .update({
        full_name: validatedData.full_name,
        company_name: validatedData.company_name || null,
        phone: validatedData.phone || null,
        gst_number: validatedData.gst_number || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state,
        opening_balance: validatedData.opening_balance,
        balance_type: validatedData.balance_type,
        credit_days: validatedData.credit_days,
        rating: validatedData.rating,
        notes: validatedData.notes || null,
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

    console.error('Error updating trader:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update trader / व्यापारी अपडेट करने में विफल',
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
    const { data: existingTrader } = await supabase
      .from('traders')
      .select('id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingTrader) {
      return NextResponse.json(
        { error: 'Trader not found or unauthorized / व्यापारी नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('traders')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting trader:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete trader / व्यापारी हटाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
