import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST {} — no body required
// Auth: admin role required
// Rate limit: 1 per 6 hours (prevent runaway)
// Triggers: Airflow DAG via REST API (POST to Astronomer.io endpoint)
// Logs to retrain_requests: { triggered_by, triggered_at, dag_run_id }
// Returns: { triggered: true, dag_run_id, estimated_completion: '2 hours' }
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

    // Get admin customer
    const { data: adminData } = await supabase
      .from('customers')
      .select('id, role')
      .eq('phone', user.phone)
      .single();
    const admin = adminData as { id: string; role: string } | null;

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: admin role required' },
        { status: 403 }
      );
    }

    // Rate limit check: 1 per 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: recentRetrainData } = await supabase
      .from('retrain_requests')
      .select('*')
      .eq('triggered_by', admin.id)
      .gte('triggered_at', sixHoursAgo)
      .order('triggered_at', { ascending: false })
      .limit(1)
      .single();
    const recentRetrain = recentRetrainData as { triggered_at: string } | null;

    if (recentRetrain) {
      const timeSinceLast = Date.now() - new Date(recentRetrain.triggered_at).getTime();
      const hoursRemaining = Math.ceil((6 * 60 * 60 * 1000 - timeSinceLast) / (60 * 60 * 1000));
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. Please wait ${hoursRemaining} hours before triggering another retrain.`,
          last_triggered: recentRetrain.triggered_at,
        },
        { status: 429 }
      );
    }

    // Trigger Airflow DAG (placeholder - actual implementation depends on Airflow setup)
    // This would typically be a POST request to the Airflow REST API
    const dagRunId = `manual_${Date.now()}`;
    
    // For now, simulate successful trigger
    // In production, replace with actual Airflow API call:
    // const airflowResponse = await fetch('https://your-airflow-instance/api/v1/dags/poultry_predictions/dagRuns', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${AIRFLOW_API_TOKEN}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ conf: { trigger: 'manual', triggered_by: admin.id } }),
    // });

    // Log retrain request
    const { error: logError } = await (supabase.from('retrain_requests') as any)
      .insert({
        triggered_by: admin.id,
        triggered_at: new Date().toISOString(),
        dag_run_id: dagRunId,
        status: 'triggered',
      });

    if (logError) {
      console.error('Retrain log error:', logError);
    }

    return NextResponse.json({
      triggered: true,
      dag_run_id: dagRunId,
      estimated_completion: '2 hours',
      message: 'Model retrain triggered successfully. You will be notified when complete.',
    });

  } catch (error) {
    console.error('Admin retrain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
