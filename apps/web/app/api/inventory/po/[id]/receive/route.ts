import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const receiveItemSchema = z.object({
  po_item_id: z.string().uuid(),
  received_qty: z.number().min(0),
  batch_number: z.string().optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid expiry date').optional().or(z.literal('')),
});

const receiveSchema = z.object({
  branch_id: z.string().uuid(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid invoice date').optional().or(z.literal('')),
  items: z.array(receiveItemSchema).min(1, 'At least one item is required'),
});

export async function POST(
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
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required / प्रमाणीकरण आवश्यक है' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = receiveSchema.parse(body);

    // Fetch PO with items
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers!inner(id, supplier_name),
        purchase_order_items!inner(id, product_id, ordered_qty, received_qty, unit_rate, tax_id)
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found / खरीद आदेश नहीं मिला' },
        { status: 404 }
      );
    }

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
    const purchaseItems = [];

    for (const item of validatedData.items) {
      const poItem = po.purchase_order_items.find((pi: any) => pi.id === item.po_item_id);
      if (!poItem) continue;

      const lineTotal = item.received_qty * poItem.unit_rate;
      subtotal += lineTotal;
      
      purchaseItems.push({
        purchase_id: null, // Will be set after purchase creation
        product_id: poItem.product_id,
        po_item_id: item.po_item_id,
        quantity: item.received_qty,
        unit_rate: poItem.unit_rate,
        tax_id: poItem.tax_id,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        line_total: lineTotal,
        batch_number: item.batch_number || null,
        expiry_date: item.expiry_date || null,
        created_at: new Date().toISOString(),
      });
    }

    // Create purchase entry
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        integrator_id: user.id,
        purchase_number: purchaseNumber,
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_type: 'against_po',
        supplier_id: po.supplier_id,
        branch_id: validatedData.branch_id,
        po_id: po.id,
        invoice_number: validatedData.invoice_number || null,
        invoice_date: validatedData.invoice_date || null,
        subtotal: subtotal,
        tax_total: taxTotal,
        freight_charges: 0,
        other_charges: 0,
        total_amount: subtotal + taxTotal,
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
    for (const item of purchaseItems) {
      item.purchase_id = purchase.id;
    }

    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItems);

    if (itemsError) throw itemsError;

    // Update PO items received quantities
    for (const item of validatedData.items) {
      const { data: currentPOItem } = await supabase
        .from('purchase_order_items')
        .select('received_qty')
        .eq('id', item.po_item_id)
        .single();

      if (currentPOItem) {
        await supabase
          .from('purchase_order_items')
          .update({ received_qty: (currentPOItem.received_qty || 0) + item.received_qty })
          .eq('id', item.po_item_id);
      }
    }

    // Update PO status based on received quantities
    const { data: updatedPOItems } = await supabase
      .from('purchase_order_items')
      .select('ordered_qty, received_qty')
      .eq('po_id', po.id);

    if (updatedPOItems) {
      const allReceived = updatedPOItems.every((item: any) => item.received_qty >= item.ordered_qty);
      const partiallyReceived = updatedPOItems.some((item: any) => item.received_qty > 0);

      let newStatus = po.status;
      if (allReceived) {
        newStatus = 'received';
      } else if (partiallyReceived) {
        newStatus = 'partial';
      }

      await supabase
        .from('purchase_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', po.id);
    }

    return NextResponse.json({
      data: {
        purchase,
        message: 'Goods received successfully / सामान सफलतापूर्वक प्राप्त हुआ'
      },
      error: null
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data / अमान्य इनपुट डेटा', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error receiving goods:', error);
    return NextResponse.json(
      { error: 'Failed to receive goods / सामान प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
