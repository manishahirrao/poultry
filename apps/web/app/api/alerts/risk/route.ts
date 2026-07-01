import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/alerts/risk?integratorId=[id]
// Returns: active alerts + farm risk scores for all farms belonging to the integrator
// Auth: Supabase session required
export async function GET(request: NextRequest) {
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
    const integratorId = searchParams.get('integratorId');

    // Default to the provided integrator ID or the user's own ID
    let effectiveIntegratorId = integratorId || customer.id;

    // Fetch active disease alerts
    let alerts: any[] = [];
    try {
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('type', 'disease')
        .or('expires_at.is.null,expires_at.gt.now()')
        .limit(50);

      if (!alertsError && alertsData) {
        alerts = alertsData;
      }
    } catch (e) {
      // If alerts table has schema issues, continue with empty alerts
      console.warn('Alerts query failed, continuing with empty alerts:', e);
    }

    // Fetch farms belonging to the integrator
    let farms: any[] = [];
    try {
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select(`
          id,
          name,
          lat,
          lng,
          biosecurity_level,
          integrator_id,
          batches!inner (
            id,
            placement_date,
            status
          )
        `)
        .eq('integrator_id', effectiveIntegratorId)
        .eq('batches.status', 'growing');

      if (!farmsError && farmsData) {
        farms = farmsData;
      }
    } catch (e) {
      console.warn('Farms query failed:', e);
    }

    // Fetch risk scores for these farms
    const farmIds = farms.map((f: any) => f.id);
    const alertIds = alerts.map((a: any) => a.id);

    let farmRisks: any[] = [];

    if (farmIds.length > 0 && alertIds.length > 0) {
      const { data: riskScoresData, error: riskScoresError } = await supabase
        .from('farm_risk_scores')
        .select('*')
        .in('farm_id', farmIds)
        .in('alert_id', alertIds)
        .order('calculated_at', { ascending: false });

      if (riskScoresError) {
        console.error('Error fetching risk scores:', riskScoresError);
      } else {
        farmRisks = riskScoresData || [];
      }
    }

    // Get latest risk score for each farm-alert pair
    const latestRisksByFarmAlert: Record<string, any> = {};
    
    farmRisks.forEach((risk: any) => {
      const key = `${risk.farm_id}-${risk.alert_id}`;
      if (!latestRisksByFarmAlert[key]) {
        latestRisksByFarmAlert[key] = risk;
      }
    });

    // Group risks by farm
    const risksByFarm: Record<string, any[]> = {};
    Object.values(latestRisksByFarmAlert).forEach((risk: any) => {
      if (!risksByFarm[risk.farm_id]) {
        risksByFarm[risk.farm_id] = [];
      }
      risksByFarm[risk.farm_id].push(risk);
    });

    // Calculate overall risk level for each farm
    const farmRiskSummary = farms.map((farm: any) => {
      const risks = risksByFarm[farm.id] || [];
      const highestRisk = risks.length > 0 
        ? risks.reduce((max: any, r: any) => r.total_score > max.total_score ? r : max, risks[0])
        : null;

      return {
        farm_id: farm.id,
        farm_name: farm.name,
        farm_lat: farm.lat,
        farm_lng: farm.lng,
        biosecurity_level: farm.biosecurity_level,
        active_batch: farm.batches?.[0] || null,
        risks: risks,
        highest_risk: highestRisk,
        overall_risk_level: highestRisk ? highestRisk.risk_level : 'LOW',
        overall_risk_score: highestRisk ? highestRisk.total_score : 0,
      };
    });

    // Filter to only show farms with risk > 0
    const farmsWithRisk = farmRiskSummary.filter(f => f.overall_risk_score > 0);

    return NextResponse.json({
      success: true,
      active_alerts: alerts,
      farm_risks: farmsWithRisk,
      total_farms: farms.length,
      farms_with_risk: farmsWithRisk.length,
    });

  } catch (error) {
    console.error('Risk scores fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
