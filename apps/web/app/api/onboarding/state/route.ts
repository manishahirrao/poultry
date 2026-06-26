import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { OnboardingStateSchema, OnboardingStepSchema } from '@/lib/validations/schemas';

// Initialize Supabase client with service role key for server-side operations
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * GET /api/onboarding/state
 * Returns the current onboarding state for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionData = JSON.parse(session.value);
    const userId = sessionData.userId;
    
    // Fetch customer data from Supabase
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', sessionData.phone)
      .single();
    
    if (customerError) {
      console.error('Customer fetch error:', customerError);
      return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
    }
    
    // If onboarding is completed, return empty state (redirect to dashboard)
    if (customer?.onboarding_completed) {
      return NextResponse.json({
        currentStep: 'OB-10',
        completedSteps: ['OB-01', 'OB-02', 'OB-03', 'OB-04', 'OB-05', 'OB-06', 'OB-07', 'OB-08', 'OB-09', 'OB-10'],
        data: {
          district: customer.district,
          flockRange: customer.flock_range,
          batchesPerYear: customer.batches_per_year,
          farmType: customer.farm_type,
          integratorName: customer.integrator_name,
          planConfirmed: customer.plan,
          whatsappVerified: customer.whatsapp_verified,
        },
        trialDurationDays: 14,
        startedAt: customer.onboarding_completed_at || customer.createdAt,
        completedAt: customer.onboarding_completed_at,
      });
    }
    
    // Return initial state if onboarding not started
    return NextResponse.json({
      currentStep: 'OB-01',
      completedSteps: [],
      data: {},
      trialDurationDays: 14,
      startedAt: customer?.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/onboarding/state error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/onboarding/state
 * Upserts step data and marks step as completed
 * Handles plan_locked_at gate (currency immutability)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionData = JSON.parse(session.value);
    
    const body = await request.json();
    const { step, data } = body;

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 });
    }

    // Validate step
    const validatedStep = OnboardingStepSchema.parse(step);

    // Fetch current customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', sessionData.phone)
      .single();
    
    if (customerError) {
      console.error('Customer fetch error:', customerError);
      return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
    }

    // Handle plan_locked_at gate for OB-05 (currency immutability)
    if (validatedStep === 'OB-05' && data.planConfirmed) {
      if (customer?.plan_locked_at) {
        // Plan already locked, don't allow change
        return NextResponse.json(
          { error: 'Plan already confirmed — cannot change (Currency Immutability Gate)' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map step data to customer fields
    if (data.district) updateData.district = data.district;
    if (data.flockRange) updateData.flock_range = data.flockRange;
    if (data.batchesPerYear) updateData.batches_per_year = data.batchesPerYear;
    if (data.farmType) updateData.farm_type = data.farmType;
    if (data.integratorName) updateData.integrator_name = data.integratorName;
    if (data.planConfirmed) {
      updateData.plan = data.planConfirmed;
      updateData.plan_locked_at = new Date().toISOString();
    }
    if (data.whatsappVerified !== undefined) updateData.whatsapp_verified = data.whatsappVerified;
    if (data.appDownloaded !== undefined) updateData.app_downloaded = data.appDownloaded;
    if (data.referralSource) updateData.referral_source = data.referralSource;
    if (data.referralCode) updateData.referral_code = data.referralCode;

    // Handle onboarding completion
    if (validatedStep === 'OB-10') {
      updateData.onboarding_completed = true;
      updateData.onboarding_completed_at = new Date().toISOString();
      updateData.trial_started_at = new Date().toISOString();
      updateData.trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days
    }

    // Update customer in Supabase
    const { error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .eq('phone', sessionData.phone);

    if (updateError) {
      console.error('Customer update error:', updateError);
      return NextResponse.json({ error: 'Failed to update onboarding state' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      currentStep: validatedStep,
      data: updateData,
    });
  } catch (error) {
    console.error('POST /api/onboarding/state error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/onboarding/state
 * Updates a single field in the onboarding state
 * Used for fields like whatsapp_verified: true
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionData = JSON.parse(session.value);
    
    const body = await request.json();
    const { field, value } = body;

    if (!field) {
      return NextResponse.json({ error: 'Field is required' }, { status: 400 });
    }

    // Map field names to database columns
    const fieldMap: Record<string, string> = {
      whatsappVerified: 'whatsapp_verified',
      appDownloaded: 'app_downloaded',
      referralSource: 'referral_source',
      referralCode: 'referral_code',
    };

    const dbField = fieldMap[field] || field;

    // Update single field in Supabase
    const { error } = await supabase
      .from('customers')
      .update({
        [dbField]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('phone', sessionData.phone);

    if (error) {
      console.error('Customer update error:', error);
      return NextResponse.json({ error: 'Failed to update onboarding state' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      field,
      value,
    });
  } catch (error) {
    console.error('PATCH /api/onboarding/state error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
