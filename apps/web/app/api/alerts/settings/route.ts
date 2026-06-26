import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for validating the new card-based settings format
const AlertCategorySchema = z.object({
  category: z.enum(['disease', 'weather', 'price', 'policy']),
  label: z.string(),
  emoji: z.string(),
  thresholdLabel: z.string(),
  thresholdValue: z.number().min(0),
  thresholdUnit: z.string(),
  channels: z.object({
    whatsapp: z.boolean(),
    email: z.boolean(),
    inApp: z.boolean(),
  }),
  severityFilter: z.enum(['high_only', 'high_and_medium', 'all']),
});

const DailySummarySchema = z.object({
  enabled: z.boolean(),
  time: z.string(),
});

const AlertSettingsSchema = z.object({
  categories: z.array(AlertCategorySchema),
  dailySummary: DailySummarySchema,
});

// POST - Save alert settings (new card-based format)
// Auth: Supabase session required
// Body: { categories: [...], dailySummary: {...} }
// Returns success confirmation
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();

    // Validate request body
    const validationResult = AlertSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error },
        { status: 400 }
      );
    }

    const { categories, dailySummary } = validationResult.data;

    // Map new card-based format to existing database schema
    // Find disease category settings
    const diseaseSettings = categories.find(c => c.category === 'disease');
    const weatherSettings = categories.find(c => c.category === 'weather');
    const priceSettings = categories.find(c => c.category === 'price');
    const policySettings = categories.find(c => c.category === 'policy');

    // Build update object for existing schema
    const updateData = {
      // Disease settings
      hpai_distance_km: diseaseSettings?.thresholdValue || 100,
      whatsapp_enabled: diseaseSettings?.channels.whatsapp || false,
      email_enabled: diseaseSettings?.channels.email || false,
      push_enabled: diseaseSettings?.channels.inApp || false,
      
      // Weather settings
      temp_threshold_c: weatherSettings?.thresholdValue || 42,
      
      // Price settings
      price_drop_pct: priceSettings?.thresholdValue || 10,
      
      // Feed settings (using policy threshold for now)
      feed_cost_rise_pct: policySettings?.thresholdValue || 8,
      
      // Daily summary
      daily_summary_enabled: dailySummary.enabled,
      daily_summary_time: dailySummary.time,
    };

    // Check if preferences exist for this customer
    const { data: existingPrefs } = await supabase
      .from('customer_alert_preferences')
      .select('id')
      .eq('customer_id', customer.id)
      .single();

    let result;
    if (existingPrefs) {
      // Update existing preferences
      const { data: preferencesData, error: updateError } = await (supabase
        .from('customer_alert_preferences')
        .update(updateData as any)
        .eq('customer_id', customer.id)
        .select()
        .single() as any);

      if (updateError) {
        console.error('Preferences update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update preferences' },
          { status: 500 }
        );
      }
      result = preferencesData;
    } else {
      // Insert new preferences
      const { data: preferencesData, error: insertError } = await supabase
        .from('customer_alert_preferences')
        .insert({
          customer_id: customer.id,
          ...updateData,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Preferences insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create preferences' },
          { status: 500 }
        );
      }
      result = preferencesData;
    }

    return NextResponse.json({
      success: true,
      preferences: result,
    });

  } catch (error) {
    console.error('Alert settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch current alert settings (new card-based format)
// Auth: Supabase session required
// Returns settings in the new card-based format
export async function GET(request: NextRequest) {
  try {
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

    // Fetch preferences from existing schema
    const { data: preferencesData, error: fetchError } = await supabase
      .from('customer_alert_preferences')
      .select('*')
      .eq('customer_id', customer.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found", which is ok for new users
      console.error('Preferences fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    const prefs: any = preferencesData || {};

    // Map existing schema to new card-based format
    const categories = [
      {
        category: 'disease' as const,
        label: 'Disease Alerts',
        emoji: '🦠',
        thresholdLabel: 'HPAI within',
        thresholdValue: prefs.hpai_distance_km || 100,
        thresholdUnit: 'km',
        channels: {
          whatsapp: prefs.whatsapp_enabled ?? true,
          email: prefs.email_enabled ?? true,
          inApp: prefs.push_enabled ?? true,
        },
        severityFilter: 'high_and_medium' as const,
      },
      {
        category: 'weather' as const,
        label: 'Weather Alerts',
        emoji: '🌩',
        thresholdLabel: 'Heat wave ≥',
        thresholdValue: prefs.temp_threshold_c || 42,
        thresholdUnit: '°C',
        channels: {
          whatsapp: prefs.whatsapp_enabled ?? true,
          email: prefs.email_enabled ?? false,
          inApp: prefs.push_enabled ?? true,
        },
        severityFilter: 'high_only' as const,
      },
      {
        category: 'price' as const,
        label: 'Price Alerts',
        emoji: '📉',
        thresholdLabel: 'Price drop >',
        thresholdValue: prefs.price_drop_pct || 10,
        thresholdUnit: '%',
        channels: {
          whatsapp: prefs.whatsapp_enabled ?? true,
          email: prefs.email_enabled ?? false,
          inApp: prefs.push_enabled ?? true,
        },
        severityFilter: 'high_and_medium' as const,
      },
      {
        category: 'policy' as const,
        label: 'Policy Alerts',
        emoji: '📋',
        thresholdLabel: 'Price rise >',
        thresholdValue: prefs.feed_cost_rise_pct || 8,
        thresholdUnit: '%',
        channels: {
          whatsapp: prefs.whatsapp_enabled ?? false,
          email: prefs.email_enabled ?? true,
          inApp: prefs.push_enabled ?? true,
        },
        severityFilter: 'high_only' as const,
      },
    ];

    const dailySummary = {
      enabled: prefs.daily_summary_enabled ?? false,
      time: prefs.daily_summary_time || '8:00 AM',
    };

    return NextResponse.json({
      success: true,
      settings: {
        categories,
        dailySummary,
      },
    });

  } catch (error) {
    console.error('Alert settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
