// FlockIQ — Supervisor Management API
// File: apps/web/app/api/supervisors/route.ts
// Version: v1.0 | June 2026
// Task: TASK-045

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/supervisors
 * Fetch all supervisors for the current customer (farm owner)
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

    // Fetch supervisors for this customer
    const { data: supervisors, error } = await supabase
      .from('supervisors')
      .select(`
        *,
        supervisor_daily_tasks (
          task_date,
          task_type,
          status,
          completed_at
        )
      `)
      .eq('customer_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching supervisors:', error);
      return NextResponse.json({ error: 'Failed to fetch supervisors' }, { status: 500 });
    }

    // Process submission history for each supervisor
    const supervisorsWithHistory = supervisors?.map(supervisor => {
      const tasks = supervisor.supervisor_daily_tasks || [];
      const submissionHistory = tasks
        .filter((task: any) => task.task_type === 'health_checklist')
        .map((task: any) => ({
          date: task.task_date,
          completed: task.status === 'completed'
        }));

      return {
        id: supervisor.id,
        name: supervisor.name,
        phone: supervisor.phone,
        assignedSheds: supervisor.assigned_sheds,
        isActive: supervisor.is_active,
        createdAt: supervisor.created_at,
        submissionHistory
      };
    }) || [];

    return NextResponse.json({ supervisors: supervisorsWithHistory });
  } catch (error) {
    console.error('Error in GET /api/supervisors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/supervisors
 * Create a new supervisor and send OTP for account creation
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
    const { phone, name, assignedSheds } = body;

    if (!phone || !name || !assignedSheds || assignedSheds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send OTP to supervisor's phone
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: `+91${phone.replace(/\D/g, '')}`,
    });

    if (otpError) {
      console.error('Error sending OTP:', otpError);
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }

    // Create supervisor record (will be linked when supervisor completes OTP verification)
    // For now, we create a pending supervisor record
    const { data: supervisor, error: insertError } = await (supabase.from('supervisors') as any)
      .insert({
        customer_id: user.id,
        supervisor_user_id: null, // Will be set when supervisor completes signup
        name,
        phone: phone.replace(/\D/g, ''), // Store clean phone number
        assigned_sheds: assignedSheds,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating supervisor:', insertError);
      return NextResponse.json({ error: 'Failed to create supervisor' }, { status: 500 });
    }

    return NextResponse.json({ 
      supervisor,
      message: 'OTP sent successfully. Supervisor should complete signup to activate account.'
    });
  } catch (error) {
    console.error('Error in POST /api/supervisors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
