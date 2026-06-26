/**
 * FlockIQ - Enterprise ERP Batch Endpoint
 * TASK-054: Enterprise ERP Webhook & API Enhancement
 * Requirement Refs: REQ-019 §19.3–19.5
 * 
 * This endpoint provides batch lifecycle data in ERP-friendly flat JSON format.
 * Returns batch data without nested objects for easy ERP system integration.
 * 
 * Features:
 * - ERP-friendly flat JSON (no nested objects)
 * - Date fields in ISO 8601 format
 * - Prices in INR as strings to avoid float precision issues
 * - XML response format available via Accept: application/xml header
 * - Authentication required via customer JWT
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { XMLBuilder } from 'fast-xml-parser';

interface ERPBatchData {
  batch_id: string;
  batch_name: string;
  customer_id: string;
  shed_id: string;
  poultry_type: string;
  breed: string;
  doc_placement_date: string;
  doc_count: string;
  doc_supplier_name: string;
  doc_supplier_price: string;
  current_bird_count: string;
  status: string;
  age_days: string;
  avg_weight_kg: string;
  target_harvest_weight_kg: string;
  target_harvest_age_days: string;
  created_at: string;
  updated_at: string;
  actual_harvest_date: string | null;
  actual_harvest_weight_kg: string | null;
  birds_sold: string | null;
  sale_price_per_kg: string | null;
  total_revenue: string | null;
  total_cost: string | null;
  net_profit: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{}> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId') || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // batchId already destructured from searchParams above

    // Fetch batch data
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this batch
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', batch.customer_id)
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Convert to ERP-friendly flat JSON format
    // All prices as strings to avoid float precision issues
    const erpData: ERPBatchData = {
      batch_id: batch.id,
      batch_name: batch.batch_id,
      customer_id: batch.customer_id,
      shed_id: batch.shed_id,
      poultry_type: batch.poultry_type || 'broiler',
      breed: batch.breed,
      doc_placement_date: batch.doc_placement_date,
      doc_count: batch.doc_count?.toString() || '0',
      doc_supplier_name: batch.doc_supplier_name || '',
      doc_supplier_price: batch.doc_supplier_price?.toString() || '0',
      current_bird_count: batch.current_bird_count?.toString() || '0',
      status: batch.status,
      age_days: batch.age_days?.toString() || '0',
      avg_weight_kg: batch.avg_weight_kg?.toString() || '0',
      target_harvest_weight_kg: batch.target_harvest_weight_kg?.toString() || '0',
      target_harvest_age_days: batch.target_harvest_age_days?.toString() || '0',
      created_at: batch.created_at,
      updated_at: batch.updated_at,
      actual_harvest_date: batch.actual_harvest_date || null,
      actual_harvest_weight_kg: batch.target_market_weight?.toString() || null,
      birds_sold: batch.birds_sold?.toString() || null,
      sale_price_per_kg: batch.sale_price_per_kg?.toString() || null,
      total_revenue: batch.total_revenue?.toString() || null,
      total_cost: batch.total_cost?.toString() || null,
      net_profit: batch.net_profit?.toString() || null,
    };

    // Check if XML format is requested
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('application/xml')) {
      // Convert to XML format
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
      });
      const xmlData = builder.build({ batch: erpData });

      return new NextResponse(xmlData, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }

    // Return JSON format (default)
    return NextResponse.json(erpData, { status: 200 });

  } catch (error) {
    console.error('Error fetching ERP batch data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
