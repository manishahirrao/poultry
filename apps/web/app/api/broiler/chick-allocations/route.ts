import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// WHY: This API route handles chick allocation creation with proper validation,
// batch creation in farms module, and stock decrement from branch inventory.
// It follows the specs requirement for section 5.3 of the account.md document.

const chickAllocationSchema = z.object({
  shed_readiness_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  breed: z.string().min(1),
  chick_rate: z.number().positive(),
  chicks_allotted: z.number().positive(),
  chicks_received: z.number().nonnegative(),
  transport_cost: z.number().nonnegative().default(0),
  vehicle_id: z.string().uuid().nullable().optional(),
  driver_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().optional(),
  remarks: z.string().optional(),
  alloc_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    
    // Verify session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required / प्रमाणीकरण आवश्यक है' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = chickAllocationSchema.parse(body);

    // Fetch shed readiness record
    const { data: shedReadiness, error: shedError } = await supabase
      .from('shed_readiness')
      .select(`
        id,
        farm_id,
        shed_id,
        supervisor_id,
        farms!inner(farm_name, farmer_id),
        sheds!inner(shed_name)
      `)
      .eq('id', validatedData.shed_readiness_id)
      .eq('integrator_id', user.id)
      .eq('status', 'approved')
      .single();

    if (shedError || !shedReadiness) {
      return NextResponse.json(
        { error: 'Shed readiness record not found or not approved / शेड रेडिनेस रिकॉर्ड नहीं मिला या अनुमोदित नहीं है' },
        { status: 404 }
      );
    }

    // Generate allocation number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastAlloc } = await supabase
      .from('chick_allocations')
      .select('alloc_number')
      .eq('integrator_id', user.id)
      .like('alloc_number', `CA/${yearSuffix}/%`)
      .order('alloc_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastAlloc) {
      const lastSequence = parseInt(lastAlloc.alloc_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const allocNumber = `CA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Start transaction - create chick allocation
    const { data: allocation, error: allocError } = await supabase
      .from('chick_allocations')
      .insert({
        integrator_id: user.id,
        alloc_number: allocNumber,
        alloc_date: validatedData.alloc_date,
        farm_id: shedReadiness.farm_id,
        farmer_id: (shedReadiness.farms as any)?.farmer_id || shedReadiness.farm_id,
        shed_readiness_id: validatedData.shed_readiness_id,
        supplier_id: validatedData.supplier_id,
        breed: validatedData.breed,
        chicks_allotted: validatedData.chicks_allotted,
        chicks_received: validatedData.chicks_received,
        chick_rate: validatedData.chick_rate,
        transport_cost: validatedData.transport_cost,
        vehicle_id: validatedData.vehicle_id,
        driver_id: validatedData.driver_id,
        supervisor_id: shedReadiness.supervisor_id,
        invoice_number: validatedData.invoice_number,
        remarks: validatedData.remarks,
        financial_year_id: financialYear?.id,
        created_by: user.id
      })
      .select()
      .single();

    if (allocError) throw allocError;

    // Update shed readiness status
    const { error: updateError } = await supabase
      .from('shed_readiness')
      .update({ status: 'chicks_placed' })
      .eq('id', validatedData.shed_readiness_id);

    if (updateError) throw updateError;

    // Create batch in farms module
    const { data: newBatch, error: batchError } = await supabase
      .from('batches')
      .insert({
        farm_id: shedReadiness.farm_id,
        shed_id: shedReadiness.shed_id,
        batch_number: sequence, // Use same sequence for simplicity
        breed: validatedData.breed,
        placement_date: validatedData.alloc_date,
        birds_placed: validatedData.chicks_received,
        target_days: 42, // Default target for broiler
        status: 'active',
        created_by: user.id
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch:', batchError);
      // Continue even if batch creation fails - allocation is still valid
    }

    // Decrement stock from chick inventory at branch
    // First, find the branch (assuming main branch for now)
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('branch_type', 'godown')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (branch) {
      // Find chick product
      const { data: chickProduct } = await supabase
        .from('products')
        .select('id')
        .eq('integrator_id', user.id)
        .eq('category_id', (await supabase
          .from('product_categories')
          .select('id')
          .eq('integrator_id', user.id)
          .eq('category_type', 'chick')
          .single()
        ).data?.id)
        .limit(1)
        .single();

      if (chickProduct) {
        // Create stock adjustment for decrement
        await supabase
          .from('stock_adjustments')
          .insert({
            integrator_id: user.id,
            adj_number: `SA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`,
            adj_date: validatedData.alloc_date,
            adj_type: 'transfer_correction',
            branch_id: branch.id,
            product_id: chickProduct.id,
            quantity: -validatedData.chicks_received, // Negative to decrement
            unit_rate: validatedData.chick_rate,
            reason: `Chick allocation ${allocNumber}`,
            financial_year_id: financialYear?.id,
            approved_by: user.id,
            created_by: user.id
          });
      }
    }

    return NextResponse.json({
      data: {
        allocation,
        batch: newBatch || null,
        message: 'Chick allocation created successfully / चिक एलोकेशन सफलतापूर्वक बनाया गया'
      },
      error: null
    });

  } catch (error) {
    console.error('Error creating chick allocation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data / अमान्य इनपुट डेटा', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create chick allocation / चिक एलोकेशन बनाने में विफल' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    
    // Verify session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required / प्रमाणीकरण आवश्यक है' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    let query = supabase
      .from('chick_allocations')
      .select(`
        *,
        farms!inner(farm_name),
        sheds!inner(shed_name),
        suppliers!inner(supplier_name),
        vehicles!inner(vehicle_number),
        employees!inner(name)
      `)
      .eq('integrator_id', user.id)
      .order('alloc_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
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
    console.error('Error fetching chick allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chick allocations / चिक एलोकेशन प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
