import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    let query = supabase.from('license_keys')
      .select('activated_by_user_id, plan_name')
      .eq('is_used', true)
      .not('activated_by_user_id', 'is', null);

    if (agentId) {
      query = query.eq('sales_agent_id', agentId);
    }

    const { data: keysData, error: keysError } = await query;
    if (keysError || !keysData || keysData.length === 0) {
      return NextResponse.json({ status: 'success', renewals: [] });
    }

    const customerIds = keysData.map(k => k.activated_by_user_id).filter(Boolean);

    const { data: subsData, error: subsError } = await supabase.from('subscriptions')
      .select('user_id, status, expires_at, customers(name, phone)')
      .in('user_id', customerIds);

    if (subsError || !subsData) {
      return NextResponse.json({ status: 'success', renewals: [] });
    }

    const now = new Date();
    const warningThreshold = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

    const renewals = subsData.map(sub => {
      const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
      let daysRemaining = 0;
      let statusFlag = 'healthy';

      if (expiresAt) {
        daysRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (expiresAt < now) {
          statusFlag = 'expired';
        } else if (expiresAt <= warningThreshold) {
          statusFlag = 'warning';
        }
      }

      const customerInfo = Array.isArray(sub.customers) ? sub.customers[0] : sub.customers;

      return {
        customer_id: sub.user_id,
        customer_name: customerInfo?.name || 'Unknown Farmer',
        phone: customerInfo?.phone || 'N/A',
        status: sub.status,
        expires_at: sub.expires_at,
        days_remaining: daysRemaining,
        status_flag: statusFlag
      };
    });

    renewals.sort((a, b) => a.days_remaining - b.days_remaining);

    return NextResponse.json({
      status: 'success',
      renewals
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
