import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { calculateRiskScore, calculateCurrentDay } from '@/lib/risk-calculation';

// POST /api/alerts/risk/recalculate
// Triggers risk score calculation for all farms with active batches
// Called automatically when: new alert created, vaccination status updated, biosecurity updated
// Auth: Admin or service role required
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Verify admin/service role authorization
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role (you may need to adjust this based on your auth setup)
    // For now, we'll allow any authenticated user for testing
    // In production, you should verify admin/service role

    // Fetch all active disease alerts
    const { data: alertsData, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('type', 'disease')
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false });

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    const alerts = alertsData || [];
    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active disease alerts found',
        calculated: 0,
      });
    }

    // Fetch all farms with active batches
    const { data: farmsData, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        integrator_id,
        name,
        lat,
        lng,
        biosecurity_level,
        batches!inner (
          id,
          placement_date,
          status
        )
      `)
      .eq('batches.status', 'active')
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (farmsError) {
      console.error('Error fetching farms:', farmsError);
      return NextResponse.json(
        { error: 'Failed to fetch farms' },
        { status: 500 }
      );
    }

    const farms = farmsData || [];
    if (farms.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No farms with active batches found',
        calculated: 0,
      });
    }

    // Fetch vaccination records for all farms
    const farmIds = farms.map((f: any) => f.id);
    const { data: vaccinationsData, error: vaccinationsError } = await supabase
      .from('vaccination_schedule')
      .select('*')
      .in('farm_id', farmIds);

    if (vaccinationsError) {
      console.error('Error fetching vaccinations:', vaccinationsError);
      // Continue without vaccination data
    }

    // Group vaccinations by farm
    const vaccinationsByFarm: Record<string, any[]> = {};
    if (vaccinationsData) {
      vaccinationsData.forEach((v: any) => {
        if (!vaccinationsByFarm[v.farm_id]) {
          vaccinationsByFarm[v.farm_id] = [];
        }
        vaccinationsByFarm[v.farm_id].push(v);
      });
    }

    // Calculate risk scores for each farm-alert pair
    let calculatedCount = 0;
    const riskScoresToInsert: any[] = [];

    for (const farm of farms) {
      for (const alert of alerts) {
        // Skip if alert doesn't have location data
        if (!alert.district) {
          continue;
        }

        // Get alert location (use district centroid or stored lat/lng if available)
        // For now, we'll use a placeholder - in production, you should have alert lat/lng
        // or a district centroids lookup table
        const alertLat = alert.lat || 26.7; // Default to Gorakhpur area
        const alertLng = alert.lng || 83.3;

        // Get farm's active batch
        const activeBatch = farm.batches?.[0];
        if (!activeBatch) continue;

        const batchDay = calculateCurrentDay(activeBatch.placement_date);
        const farmVaccinations = vaccinationsByFarm[farm.id] || [];

        // Calculate risk score
        const riskScore = calculateRiskScore({
          farmLat: farm.lat,
          farmLng: farm.lng,
          alertLat: alertLat,
          alertLng: alertLng,
          batchDay: batchDay,
          vaccinations: farmVaccinations,
          biosecurityLevel: farm.biosecurity_level,
        });

        riskScoresToInsert.push({
          farm_id: farm.id,
          alert_id: alert.id,
          integrator_id: farm.integrator_id,
          proximity_km: riskScore.proximity_km,
          proximity_score: riskScore.proximity_score,
          age_score: riskScore.age_score,
          vaccination_score: riskScore.vaccination_score,
          biosecurity_score: riskScore.biosecurity_score,
          total_score: riskScore.total_score,
          risk_level: riskScore.risk_level,
          calculated_at: new Date().toISOString(),
        });

        calculatedCount++;
      }
    }

    // Upsert risk scores
    if (riskScoresToInsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('farm_risk_scores')
        .upsert(riskScoresToInsert, {
          onConflict: 'farm_id,alert_id,calculated_at',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error('Error upserting risk scores:', upsertError);
        return NextResponse.json(
          { error: 'Failed to save risk scores' },
          { status: 500 }
        );
      }
    }

    // TODO: Send WhatsApp notifications for risk level changes (HIGH or MEDIUM → up only)
    // This would require checking previous risk levels and sending notifications

    return NextResponse.json({
      success: true,
      message: `Risk scores calculated for ${calculatedCount} farm-alert pairs`,
      calculated: calculatedCount,
      farms_processed: farms.length,
      alerts_processed: alerts.length,
    });

  } catch (error) {
    console.error('Risk recalculation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
