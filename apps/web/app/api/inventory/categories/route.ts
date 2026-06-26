import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const categorySchema = z.object({
  category_code: z.string().optional(),
  category_name: z.string().min(1, 'Category name is required'),
  category_type: z.enum(['chick', 'feed', 'medicine', 'vaccine', 'equipment', 'other']).default('other'),
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
      .from('product_categories')
      .select('*')
      .eq('integrator_id', user.id)
      .order('category_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories / श्रेणियां प्राप्त करने में विफल',
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
    const validatedData = categorySchema.parse(body);

    // Generate category code if not provided
    let categoryCode = validatedData.category_code;
    if (!categoryCode) {
      const { data: existingCategories } = await supabase
        .from('product_categories')
        .select('category_code')
        .eq('integrator_id', user.id)
        .eq('category_type', validatedData.category_type);

      const categoryCount = (existingCategories?.length || 0) + 1;
      const typePrefix = validatedData.category_type.substring(0, 3).toUpperCase();
      categoryCode = `${typePrefix}-${String(categoryCount).padStart(3, '0')}`;
    }

    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        integrator_id: user.id,
        category_code: categoryCode,
        category_name: validatedData.category_name,
        category_type: validatedData.category_type,
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

    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create category / श्रेणी बनाने में विफल',
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
        { error: 'Category ID is required / श्रेणी आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = categorySchema.parse(updateData);

    // Verify ownership
    const { data: existingCategory } = await supabase
      .from('product_categories')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found or unauthorized / श्रेणी नहीं मिली या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('product_categories')
      .update({
        category_code: validatedData.category_code,
        category_name: validatedData.category_name,
        category_type: validatedData.category_type,
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

    console.error('Error updating category:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update category / श्रेणी अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
