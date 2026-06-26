import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj';

// Auth check: Supabase session check, S2+ only
async function checkAuth(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return { authorized: false, error: 'Database connection failed' };
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user?.phone) {
    return { authorized: false, error: 'Unauthorized' };
  }

  // Fetch customer profile for segment check
  const { data: customerData } = await supabase
    .from('customers')
    .select('id, segment, plan')
    .eq('phone', user.phone)
    .single();
  const customer = customerData as { id: string; segment: string; plan: string } | null;

  if (!customer) {
    return { authorized: false, error: 'Customer not found' };
  }

  // S1 customers cannot access export
  if (customer.segment === 'S1') {
    return { authorized: false, error: 'Upgrade required' };
  }

  return { authorized: true, customer };
}

// GET /api/export/predictions?mandi=gorakhpur,deoria&from=2026-05-01&to=2026-05-20
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const mandiParam = searchParams.get('mandi');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const fieldsParam = searchParams.get('fields');

    // Parse mandi parameter (comma-separated)
    const mandis: MandiSlug[] = mandiParam 
      ? (mandiParam.split(',') as MandiSlug[])
      : ['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj'];

    // Validate mandis
    const validMandis: MandiSlug[] = ['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj'];
    const invalidMandis = mandis.filter(m => !validMandis.includes(m as MandiSlug));
    if (invalidMandis.length > 0) {
      return NextResponse.json(
        { error: `Invalid mandi: ${invalidMandis.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse date range (max 90 days)
    const fromDate = fromParam ? new Date(fromParam) : new Date(Date.now() - 30 * 86_400_000);
    const toDate = toParam ? new Date(toParam) : new Date();
    
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86_400_000);
    if (daysDiff > 90) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 90 days' },
        { status: 400 }
      );
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        { error: 'From date must be before to date' },
        { status: 400 }
      );
    }

    // Parse fields to include (default: all)
    const defaultFields = ['mandi', 'predicted_at', 'p10', 'p50', 'p90', 'sell_signal', 'actual_price', 'confidence', 'drivers'];
    const fields = fieldsParam ? fieldsParam.split(',') : defaultFields;

    // Fetch predictions from Supabase
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const { data: predictionsRaw, error } = await supabase
      .from('predictions')
      .select('*')
      .in('mandi', mandis)
      .gte('predicted_at', fromDate.toISOString())
      .lte('predicted_at', toDate.toISOString())
      .order('predicted_at', { ascending: true });
    
    const predictions = predictionsRaw as any[] | null;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch predictions' },
        { status: 500 }
      );
    }

    if (!predictions || predictions.length === 0) {
      return NextResponse.json(
        { error: 'No predictions found for the specified criteria' },
        { status: 404 }
      );
    }

    // Generate CSV content
    const csvHeaders = fields.join(',');
    const csvRows = predictions.map(row => {
      return fields.map(field => {
        let value = row[field as keyof typeof row];
        
        // Handle array fields (drivers)
        if (Array.isArray(value)) {
          value = `"${value.join(', ')}"`;
        }
        
        // Handle null values
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Handle strings with commas or quotes
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value;
      }).join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `poultry_predictions_${timestamp}.csv`;

    // Stream response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
