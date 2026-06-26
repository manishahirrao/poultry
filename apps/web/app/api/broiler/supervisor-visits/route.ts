// FlockIQ — Supervisor Visits API
// File: apps/web/app/api/broiler/supervisor-visits/route.ts
// Version: v1.0 | June 2026
// Task: SECTION 5.4 - Supervisor Report Entry

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/broiler/supervisor-visits
 * Fetch all supervisor visits for the current integrator
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farm_id');
    const batchId = searchParams.get('batch_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('supervisor_visits')
      .select(`
        *,
        farms (farm_name, farmer_name, village),
        batches (batch_number, breed),
        employees (name)
      `)
      .eq('integrator_id', user.id)
      .order('visit_date', { ascending: false })
      .order('visit_time', { ascending: false });

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    if (startDate) {
      query = query.gte('visit_date', startDate);
    }

    if (endDate) {
      query = query.lte('visit_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching supervisor visits:', error);
      return NextResponse.json({ error: 'Failed to fetch supervisor visits' }, { status: 500 });
    }

    return NextResponse.json({ visits: data });
  } catch (error) {
    console.error('Error in GET /api/broiler/supervisor-visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/broiler/supervisor-visits
 * Create a new supervisor visit record
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      farm_id,
      batch_id,
      supervisor_id,
      visit_date,
      visit_time,
      purpose,
      sample_birds_weighed,
      total_sample_weight_kg,
      flock_condition,
      health_observation,
      mortality_today,
      feed_present_days,
      water_ok,
      ventilation_ok,
      action_taken,
      km_travelled,
      travel_allowance,
      vehicle_id,
      lat,
      lng,
      photos_count
    } = body;

    // Validate required fields
    if (!farm_id || !visit_date || !purpose) {
      return NextResponse.json({ error: 'Missing required fields: farm_id, visit_date, purpose' }, { status: 400 });
    }

    // Get supervisor_id if not provided (use current user's employee record)
    let finalSupervisorId = supervisor_id;
    if (!finalSupervisorId) {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employeeError || !employeeData) {
        return NextResponse.json({ error: 'Supervisor not found for current user' }, { status: 400 });
      }
      finalSupervisorId = (employeeData as any).id;
    }

    // Convert flock_condition from number to text if needed
    const flockConditionMap: Record<number, string> = {
      1: 'critical',
      2: 'poor',
      3: 'fair',
      4: 'good',
      5: 'excellent'
    };
    const finalFlockCondition = typeof flock_condition === 'number' 
      ? flockConditionMap[flock_condition] 
      : flock_condition;

    // Create supervisor visit record
    const { data: visitData, error: insertError } = await (supabase
      .from('supervisor_visits') as any)
      .insert({
        integrator_id: user.id,
        supervisor_id: finalSupervisorId,
        farm_id,
        batch_id: batch_id || null,
        visit_date,
        visit_time: visit_time || null,
        purpose,
        sample_birds_weighed: sample_birds_weighed || null,
        total_sample_weight_kg: total_sample_weight_kg || null,
        flock_condition: finalFlockCondition,
        health_observation: health_observation || null,
        mortality_today: mortality_today || 0,
        feed_present_days: feed_present_days || null,
        water_ok: water_ok !== undefined ? water_ok : true,
        ventilation_ok: ventilation_ok !== undefined ? ventilation_ok : true,
        action_taken: action_taken || null,
        km_travelled: km_travelled || null,
        travel_allowance: travel_allowance || null,
        vehicle_id: vehicle_id || null,
        lat: lat || null,
        lng: lng || null,
        photos_count: photos_count || 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating supervisor visit:', insertError);
      return NextResponse.json({ error: 'Failed to create supervisor visit' }, { status: 500 });
    }

    return NextResponse.json({ visit: visitData }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/broiler/supervisor-visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
