import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const purchaseItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit_rate: z.number().min(0),
  tax_id: z.string().uuid().nullable().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid expiry date').optional().or(z.literal('')),
});

const purchaseSchema = z.object({
  purchase_type: z.enum(['against_po', 'direct', 'chick', 'freight', 'return']).default('direct'),
  supplier_id: z.string().uuid(),
  branch_id: z.string().uuid().nullable().optional(),
  po_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid invoice date').optional().or(z.literal('')),
  freight_charges: z.number().min(0).default(0),
  other_charges: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
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
    const status = searchParams.get('status');

    let query = supabase
      .from('purchases')
      .select(`
        *,
        suppliers!inner(id, supplier_name, supplier_type),
        branches!inner(id, branch_name, branch_type),
        purchase_items!inner(id, product_id, quantity, unit_rate, line_total)
      `)
      .eq('integrator_id', user.id)
      .order('purchase_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('payment_status', status);
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
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchases / खरीद प्राप्त करने में विफल',
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
    const validatedData = purchaseSchema.parse(body);

    // Generate purchase number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastPurchase } = await supabase
      .from('purchases')
      .select('purchase_number')
      .eq('integrator_id', user.id)
      .like('purchase_number', `PUR/${yearSuffix}/%`)
      .order('purchase_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastPurchase) {
      const lastSequence = parseInt(lastPurchase.purchase_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const purchaseNumber = `PUR/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Calculate totals
    let subtotal = 0;
    let taxTotal = 0;
    const purchaseItems = validatedData.items.map(item => {
      const lineTotal = item.quantity * item.unit_rate;
      subtotal += lineTotal;
      return {
        product_id: item.product_id,
        po_item_id: null,
        quantity: item.quantity,
        unit_rate: item.unit_rate,
        tax_id: item.tax_id,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        line_total: lineTotal,
        batch_number: item.batch_number || null,
        expiry_date: item.expiry_date || null,
        created_at: new Date().toISOString(),
      };
    });

    const totalAmount = subtotal + taxTotal + validatedData.freight_charges + validatedData.other_charges;

    // Create purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        integrator_id: user.id,
        purchase_number: purchaseNumber,
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_type: validatedData.purchase_type,
        supplier_id: validatedData.supplier_id,
        branch_id: validatedData.branch_id,
        po_id: validatedData.po_id,
        invoice_number: validatedData.invoice_number || null,
        invoice_date: validatedData.invoice_date || null,
        subtotal: subtotal,
        tax_total: taxTotal,
        freight_charges: validatedData.freight_charges,
        other_charges: validatedData.other_charges,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_status: 'unpaid',
        financial_year_id: financialYear?.id,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Create purchase items
    const itemsWithPurchaseId = purchaseItems.map(item => ({
      ...item,
      purchase_id: purchase.id,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(itemsWithPurchaseId);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      data: purchase,
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

    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create purchase / खरीद बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
