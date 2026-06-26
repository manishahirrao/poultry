import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@poultrypulse/types';



// GET /api/farms/[farmId]/treatments?batchId=XXX
// Returns treatments + withdrawal_status for cross-tab integration (TASK-INT-001)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'batchId query parameter required' }, { status: 400 });
    }



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all treatments for this batch
    const { data: treatments, error: treatmentsError } = await supabase
      .from('batch_treatments')
      .select('*')
      .eq('batch_id', batchId)
      .eq('farm_id', farmId)
      .order('treatment_date', { ascending: false });

    if (treatmentsError) {
      console.error('Treatments fetch error:', treatmentsError);
    }

    const typedTreatments = (treatments as Database['public']['Tables']['batch_treatments']['Row'][]) || [];

    const today = new Date().toISOString().split('T')[0];

    // Find active withdrawal periods
    const activeWithdrawals = typedTreatments.filter((t) =>
      t.withdrawal_days &&
      t.withdrawal_days > 0 &&
      t.clearance_date &&
      t.clearance_date > today &&
      !t.is_complete
    );

    // Find latest clearance date
    const latestClearanceDate = activeWithdrawals.length > 0
      ? activeWithdrawals.reduce((latest: string | null, t) => {
          if (!latest) return t.clearance_date || null;
          return (t.clearance_date || '') > latest ? t.clearance_date : latest;
        }, null)
      : null;

    return NextResponse.json({
      success: true,
      treatments: typedTreatments,
      withdrawal_status: {
        has_active_withdrawal: activeWithdrawals.length > 0,
        latest_clearance_date: latestClearanceDate,
        active_medicines: activeWithdrawals.map((t) => ({
          medicine_name: t.medicine_name,
          clearance_date: t.clearance_date,
        })),
      },
    });

  } catch (error) {
    console.error('Treatments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
