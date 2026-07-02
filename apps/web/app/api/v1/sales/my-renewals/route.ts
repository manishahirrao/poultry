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
      .select('id, key_code, is_used, activated_by_user_id, plan_name, validity_days, assigned_phone, metadata, created_at, sales_agent_id');

    if (agentId) {
      query = query.eq('sales_agent_id', agentId);
    }

    const { data: keysData, error: keysError } = await query;
    if (keysError || !keysData || keysData.length === 0) {
      return NextResponse.json({ status: 'success', renewals: [] });
    }

    // Process pending keys
    const pendingKeys = keysData.filter(k => !k.is_used && k.assigned_phone);
    const activatedKeys = keysData.filter(k => k.is_used && k.activated_by_user_id);
    
    const customerIds = activatedKeys.map(k => k.activated_by_user_id).filter(Boolean);

    let subsData: any[] = [];
    if (customerIds.length > 0) {
      const { data, error } = await supabase.from('subscriptions')
        .select('user_id, status, expires_at, customers(name, phone)')
        .in('user_id', customerIds);
      if (!error && data) {
        subsData = data;
      }
    }

    const now = new Date();
    const warningThreshold = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

    const renewals: any[] = [];

    // Add activated subscriptions
    subsData.forEach(sub => {
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

      renewals.push({
        customer_id: sub.user_id,
        customer_name: customerInfo?.name || 'Unknown Farmer',
        phone: customerInfo?.phone || 'N/A',
        status: sub.status,
        expires_at: sub.expires_at,
        days_remaining: daysRemaining,
        status_flag: statusFlag
      });
    });

    // Add pending customers
    pendingKeys.forEach(key => {
      const farmerName = key.metadata?.farmer_details?.name || 'Pending Farmer';
      renewals.push({
        customer_id: key.id, // using key id as a temporary unique identifier
        customer_name: farmerName,
        phone: key.assigned_phone,
        status: 'pending',
        expires_at: null,
        days_remaining: key.validity_days, // show validity days
        status_flag: 'pending'
      });
    });

    // Sort by status flag and days remaining
    renewals.sort((a, b) => {
      if (a.status_flag === 'pending' && b.status_flag !== 'pending') return -1;
      if (b.status_flag === 'pending' && a.status_flag !== 'pending') return 1;
      return a.days_remaining - b.days_remaining;
    });

    return NextResponse.json({
      status: 'success',
      renewals
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
