import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supplierSchema = z.object({
  supplier_name: z.string().min(1, 'Supplier name is required'),
  supplier_type: z.enum(['chick', 'feed', 'medicine', 'equipment', 'other']),
  contact_person: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  opening_balance: z.number().default(0),
  balance_type: z.enum(['payable', 'receivable']).default('payable'),
  credit_days: z.number().min(0).default(0),
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
      .from('suppliers')
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
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch suppliers',
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
    const validatedData = supplierSchema.parse(body);

    // Generate supplier code
    const { data: existingSuppliers } = await supabase
      .from('suppliers')
      .select('supplier_code')
      .eq('integrator_id', user.id);

    const supplierCount = (existingSuppliers?.length || 0) + 1;
    const supplierCode = `SUP-${String(supplierCount).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        integrator_id: user.id,
        supplier_code: supplierCode,
        supplier_name: validatedData.supplier_name,
        supplier_type: validatedData.supplier_type,
        contact_person: validatedData.contact_person || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        gst_number: validatedData.gst_number || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state,
        opening_balance: validatedData.opening_balance,
        balance_type: validatedData.balance_type,
        credit_days: validatedData.credit_days,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create supplier',
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
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    const validatedData = supplierSchema.parse(updateData);

    // Verify ownership
    const { data: existingSupplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        supplier_name: validatedData.supplier_name,
        supplier_type: validatedData.supplier_type,
        contact_person: validatedData.contact_person || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        gst_number: validatedData.gst_number || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state,
        opening_balance: validatedData.opening_balance,
        balance_type: validatedData.balance_type,
        credit_days: validatedData.credit_days,
        updated_at: new Date().toISOString(),
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

    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update supplier',
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
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingSupplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete supplier',
        data: null 
      },
      { status: 500 }
    );
  }
}
