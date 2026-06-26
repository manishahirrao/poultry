import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/alerts/test
// Auth: Supabase session required
// Creates a sample test alert for the user (visible for 60 seconds)
// Shows: "🧪 Test Alert — This is a sample alert to confirm notifications work."
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.phone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer from phone
    const { data: customerData } = await supabase
      .from('customers')
      .select('id, district')
      .eq('phone', user.phone)
      .single();
    const customer = customerData as { id: string; district: string } | null;

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create test alert that expires in 60 seconds
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    
    const { data: alertData, error: alertError } = await supabase
      .from('alerts')
      .insert({
        type: 'PRICE_CRASH',
        title_hi: '🧪 Test Alert — This is a sample alert to confirm notifications work.',
        body_hi: '',
        severity: 'LOW',
        district: customer.district || 'all',
        expires_at: expiresAt,
        source_url: null,
        is_active: true,
      } as any)
      .select()
      .single();

    if (alertError) {
      console.error('Test alert creation error:', alertError);
      return NextResponse.json(
        { error: 'Failed to create test alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: alertData,
      message: 'Test alert created successfully',
    });

  } catch (error) {
    console.error('Test alert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
