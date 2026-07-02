import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const UPFRONT_COMMISSION_RATE = 0.10;
const RECURRING_COMMISSION_RATE = 0.05;
const STANDARD_MONTHLY_TARGET = 500000; // 5 Lakhs INR

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

    const { data: keys, error: keysError } = await supabase.from('license_keys').select('*');
    if (keysError) {
      return NextResponse.json({ error: 'Failed to fetch license keys' }, { status: 500 });
    }

    const leaderboard: Record<string, any> = {};

    for (const key of keys || []) {
      const agentId = key.sales_agent_id;
      if (!agentId) continue;

      if (!leaderboard[agentId]) {
        // We will fetch customer names later to optimize queries
        leaderboard[agentId] = {
          agent_id: agentId,
          agent_name: 'Unknown Agent',
          keys_generated: 0,
          keys_activated: 0,
          total_revenue: 0,
          commission_owed: 0,
          target_progress_pct: 0
        };
      }

      const stats = leaderboard[agentId];
      stats.keys_generated += 1;

      const amount = key.payment_amount || 0;
      stats.total_revenue += amount;

      if (amount >= 100000) {
        stats.commission_owed += (amount * UPFRONT_COMMISSION_RATE);
      } else {
        stats.commission_owed += (amount * RECURRING_COMMISSION_RATE);
      }

      if (key.is_used) {
        stats.keys_activated += 1;
      }
    }

    // Fetch agent names
    const agentIds = Object.keys(leaderboard);
    if (agentIds.length > 0) {
      const { data: agents } = await supabase.from('customers').select('id, name').in('id', agentIds);
      if (agents) {
        agents.forEach(agent => {
          if (leaderboard[agent.id]) {
            leaderboard[agent.id].agent_name = agent.name || 'Unknown Agent';
          }
        });
      }
    }

    const results = Object.values(leaderboard).map(stats => {
      stats.conversion_rate = stats.keys_generated > 0 ? Number(((stats.keys_activated / stats.keys_generated) * 100).toFixed(1)) : 0;
      stats.target_progress_pct = Math.min(100, Number(((stats.total_revenue / STANDARD_MONTHLY_TARGET) * 100).toFixed(1)));
      return stats;
    });

    results.sort((a, b) => b.total_revenue - a.total_revenue);

    return NextResponse.json({
      status: 'success',
      leaderboard: results
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
