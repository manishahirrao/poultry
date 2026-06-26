import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const birdSaleSchema = z.object({
  batch_id: z.string().uuid(),
  trader_id: z.string().uuid(),
  sale_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birds_sold: z.number().positive(),
  avg_weight_kg: z.number().positive(),
  rate_per_kg: z.number().positive(),
  transport_cost: z.number().nonnegative().default(0),
  commission_rate: z.number().nonnegative().default(0),
  total_weight_kg: z.number().positive(),
  sale_amount: z.number().positive(),
  commission_amount: z.number().nonnegative(),
  net_amount: z.number(),
  gc: z.number().nonnegative(),
  remarks: z.string().optional(),
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
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required / प्रमाणीकरण आवश्यक है' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = birdSaleSchema.parse(body);

    // Fetch batch details
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select(`
        *,
        farms!inner(farm_name, farmer_id),
        sheds!inner(shed_name)
      `)
      .eq('id', validatedData.batch_id)
      .eq('integrator_id', user.id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found or unauthorized / बैच नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    // Generate sale number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastSale } = await supabase
      .from('bird_sales')
      .select('saleNumber')
      .eq('integrator_id', user.id)
      .like('saleNumber', `BS/${yearSuffix}/%`)
      .order('saleNumber', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const saleNumber = `BS/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Start transaction - create bird sale
    const { data: sale, error: saleError } = await supabase
      .from('bird_sales')
      .insert({
        integrator_id: user.id,
        saleNumber,
        sale_date: validatedData.sale_date,
        batch_id: validatedData.batch_id,
        farm_id: batch.farm_id,
        trader_id: validatedData.trader_id,
        birds_sold: validatedData.birds_sold,
        avg_weight_kg: validatedData.avg_weight_kg,
        total_weight_kg: validatedData.total_weight_kg,
        rate_per_kg: validatedData.rate_per_kg,
        sale_amount: validatedData.sale_amount,
        transport_cost: validatedData.transport_cost,
        commission_rate: validatedData.commission_rate,
        commission_amount: validatedData.commission_amount,
        net_amount: validatedData.net_amount,
        gc: validatedData.gc,
        remarks: validatedData.remarks,
        financial_year_id: financialYear?.id,
        created_by: user.id
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Update batch status to 'closed' if all birds are sold
    if (validatedData.birds_sold >= batch.birds_alive) {
      const { error: updateError } = await supabase
        .from('batches')
        .update({
          status: 'closed',
          harvest_date: validatedData.sale_date,
          birds_sold: validatedData.birds_sold,
          final_gc: validatedData.gc,
          final_weight_kg: validatedData.avg_weight_kg
        })
        .eq('id', validatedData.batch_id);

      if (updateError) throw updateError;
    }

    // Create payment voucher for trader
    const voucherNumber = `PV/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;
    const { error: voucherError } = await supabase
      .from('payment_vouchers')
      .insert({
        integrator_id: user.id,
        voucher_number: voucherNumber,
        voucher_date: validatedData.sale_date,
        voucher_type: 'purchase',
        party_type: 'trader',
        party_id: validatedData.trader_id,
        amount: validatedData.net_amount,
        reference_type: 'bird_sale',
        reference_id: sale.id,
        status: 'pending',
        financial_year_id: financialYear?.id,
        created_by: user.id
      });

    if (voucherError) {
      console.error('Error creating payment voucher:', voucherError);
      // Continue even if voucher creation fails - sale is still valid
    }

    // Flow to P&L - record revenue
    const { error: pnlError } = await supabase
      .from('pnl_entries')
      .insert({
        integrator_id: user.id,
        entry_date: validatedData.sale_date,
        entry_type: 'revenue',
        category: 'bird_sale',
        amount: validatedData.sale_amount,
        reference_type: 'bird_sale',
        reference_id: sale.id,
        farm_id: batch.farm_id,
        batch_id: validatedData.batch_id,
        financial_year_id: financialYear?.id,
        created_by: user.id
      });

    if (pnlError) {
      console.error('Error creating P&L entry:', pnlError);
      // Continue even if P&L entry fails - sale is still valid
    }

    return NextResponse.json({
      data: {
        sale,
        message: 'Bird sale recorded successfully / पक्षी बिक्री सफलतापूर्वक दर्ज की गई'
      },
      error: null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bird sale:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error / सत्यापन त्रुटि', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create bird sale / पक्षी बिक्री बनाने में विफल' },
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
      .from('bird_sales')
      .select(`
        *,
        batches!inner(batch_number, placement_date),
        farms!inner(farm_name),
        traders!inner(trader_name, phone)
      `)
      .eq('integrator_id', user.id)
      .order('sale_date', { ascending: false })
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
    console.error('Error fetching bird sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bird sales / पक्षी बिक्री प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
