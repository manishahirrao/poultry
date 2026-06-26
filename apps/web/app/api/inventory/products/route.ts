import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const productSchema = z.object({
  product_code: z.string().optional(),
  product_name: z.string().min(1, 'Product name is required'),
  product_name_hi: z.string().optional(),
  category_id: z.string().uuid(),
  unit_of_measure: z.enum(['kg', 'g', 'mt', 'litre', 'ml', 'pcs', 'bag', 'crate', 'dozen', 'box']).default('kg'),
  purchase_price: z.number().min(0).optional(),
  sale_price: z.number().min(0).optional(),
  margin_pct: z.number().min(0).max(100).optional(),
  reorder_level: z.number().min(0).optional(),
  hsn_code: z.string().optional(),
  tax_id: z.string().uuid().nullable().optional(),
  withdrawal_days: z.number().min(0).optional(),
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(id, category_name, category_type),
        tax_setup!inner(id, tax_name, tax_rate)
      `)
      .eq('integrator_id', user.id)
      .order('product_name', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      error: null,
      meta: {
        total: count || 0,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products / उत्पाद प्राप्त करने में विफल',
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
    const validatedData = productSchema.parse(body);

    // Generate product code if not provided
    let productCode = validatedData.product_code;
    if (!productCode) {
      const { data: existingProducts } = await supabase
        .from('products')
        .select('product_code')
        .eq('integrator_id', user.id);

      const productCount = (existingProducts?.length || 0) + 1;
      productCode = `PRD-${String(productCount).padStart(4, '0')}`;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        integrator_id: user.id,
        product_code: productCode,
        product_name: validatedData.product_name,
        product_name_hi: validatedData.product_name_hi || null,
        category_id: validatedData.category_id,
        unit_of_measure: validatedData.unit_of_measure,
        purchase_price: validatedData.purchase_price || null,
        sale_price: validatedData.sale_price || null,
        margin_pct: validatedData.margin_pct || null,
        reorder_level: validatedData.reorder_level || null,
        hsn_code: validatedData.hsn_code || null,
        tax_id: validatedData.tax_id,
        withdrawal_days: validatedData.withdrawal_days || null,
        notes: validatedData.notes || null,
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
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create product / उत्पाद बनाने में विफल',
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
        { error: 'Product ID is required / उत्पाद आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = productSchema.parse(updateData);

    // Verify ownership
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized / उत्पाद नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        product_code: validatedData.product_code,
        product_name: validatedData.product_name,
        product_name_hi: validatedData.product_name_hi || null,
        category_id: validatedData.category_id,
        unit_of_measure: validatedData.unit_of_measure,
        purchase_price: validatedData.purchase_price || null,
        sale_price: validatedData.sale_price || null,
        margin_pct: validatedData.margin_pct || null,
        reorder_level: validatedData.reorder_level || null,
        hsn_code: validatedData.hsn_code || null,
        tax_id: validatedData.tax_id,
        withdrawal_days: validatedData.withdrawal_days || null,
        notes: validatedData.notes || null,
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
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update product / उत्पाद अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
