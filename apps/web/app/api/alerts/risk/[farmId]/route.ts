import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/alerts/risk/[farmId]?alertId=[alertId]
// Returns: latest risk score record for this farm + alert + history (last 5 calculations)
// Auth: Supabase session required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    const supabase = await createClient() as any;
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
      .select('id')
      .eq('phone', user.phone)
      .single();
    const customer = customerData as { id: string } | null;

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    // Verify farm belongs to customer's integrator
    const { data: farmData, error: farmError } = await supabase
      .from('farms')
      .select('id, integrator_id, name')
      .eq('id', farmId)
      .single();

    if (farmError || !farmData) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this farm (either owns it or is the integrator)
    // For S2 integrators, they can see all farms under their integrator_id
    // For S1 farmers, they can only see their own farms
    const { data: customerFarmData } = await supabase
      .from('customers')
      .select('segment')
      .eq('id', customer.id)
      .single();

    const customerSegment = customerFarmData?.segment;
    
    // Check access: S2 integrators can access farms with their integrator_id
    // S1 farmers can only access farms where they are the integrator
    if (customerSegment === 'S1' && farmData.integrator_id !== customer.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('farm_risk_scores')
      .select(`
        *,
        alerts!inner (
          id,
          type,
          title_english,
          title_hindi,
          body_english,
          body_hindi,
          severity,
          district,
          created_at,
          expires_at
        )
      `)
      .eq('farm_id', farmId)
      .eq('integrator_id', farmData.integrator_id)
      .order('calculated_at', { ascending: false })
      .limit(5);

    // Filter by alertId if provided
    if (alertId) {
      query = query.eq('alert_id', alertId);
    }

    const { data: riskScoresData, error: riskScoresError } = await query;

    if (riskScoresError) {
      console.error('Error fetching risk scores:', riskScoresError);
      return NextResponse.json(
        { error: 'Failed to fetch risk scores' },
        { status: 500 }
      );
    }

    const riskScores = riskScoresData || [];

    // Get latest risk score for each alert
    const latestScoresByAlert: Record<string, any> = {};
    const allHistory: any[] = [];

    riskScores.forEach((score: any) => {
      const alertId = score.alert_id;
      
      if (!latestScoresByAlert[alertId]) {
        latestScoresByAlert[alertId] = score;
      }
      
      allHistory.push(score);
    });

    const latestScores = Object.values(latestScoresByAlert);

    // Calculate overall risk level (highest risk among all alerts)
    let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let highestTotalScore = 0;

    latestScores.forEach((score: any) => {
      if (score.total_score > highestTotalScore) {
        highestTotalScore = score.total_score;
        overallRiskLevel = score.risk_level;
      }
    });

    return NextResponse.json({
      success: true,
      farm: {
        id: farmData.id,
        name: farmData.name,
      },
      overall_risk_level: overallRiskLevel,
      highest_total_score: highestTotalScore,
      latest_scores: latestScores,
      history: allHistory,
      total_calculations: riskScores.length,
    });

  } catch (error) {
    console.error('Risk score fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
