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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('traders')
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
    console.error('Error fetching traders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch traders',
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = traderSchema.parse(body);

    // Generate trader code
    const { data: existingTraders } = await supabase
      .from('traders')
      .select('trader_code')
      .eq('integrator_id', user.id);

    const traderCount = (existingTraders?.length || 0) + 1;
    const traderCode = `TRD-${String(traderCount).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from('traders')
      .insert({
        integrator_id: user.id,
        trader_code: traderCode,
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
          error: 'Validation error',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error creating trader:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create trader',
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Trader ID is required' },
        { status: 400 }
      );
    }

    const validatedData = traderSchema.parse(updateData);

    // Verify ownership
    const { data: existingTrader } = await supabase
      .from('traders')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingTrader) {
      return NextResponse.json(
        { error: 'Trader not found or unauthorized' },
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
          error: 'Validation error',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error updating trader:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update trader',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Trader ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingTrader } = await supabase
      .from('traders')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingTrader) {
      return NextResponse.json(
        { error: 'Trader not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('traders')
      .delete()
      .eq('id', id);

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
        error: 'Failed to delete trader',
        data: null 
      },
      { status: 500 }
    );
  }
}
