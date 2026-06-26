import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 });
    }

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate subscription age
    const subscriptionAgeDays = Math.floor(
      (new Date().getTime() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get engagement metrics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: engagementData, error: engagementError } = await supabase
      .from('engagement_metrics')
      .select('*')
      .eq('customer_id', customerId)
      .gte('metric_date', thirtyDaysAgo.toISOString())
      .order('metric_date', { ascending: false });

    if (engagementError) {
      console.error('Error fetching engagement metrics:', engagementError);
    }

    // Calculate login frequency
    const loginFrequency7d = engagementData?.slice(0, 7).reduce((sum, day) => sum + (day.logins || 0), 0) || 0;
    const loginFrequency30d = engagementData?.reduce((sum, day) => sum + (day.logins || 0), 0) || 0;

    // Calculate days since last login
    const lastLoginDate = engagementData?.[0]?.metric_date;
    const daysSinceLastLogin = lastLoginDate 
      ? Math.floor((new Date().getTime() - new Date(lastLoginDate).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    // Get feature usage
    const { data: featureUsage, error: featureError } = await supabase
      .from('feature_usage')
      .select('*')
      .eq('customer_id', customerId);

    if (featureError) {
      console.error('Error fetching feature usage:', featureError);
    }

    const featureUsageMap = featureUsage?.reduce((acc: any, feature: any) => {
      acc[feature.feature_name] = feature.usage_count || 0;
      return acc;
    }, {}) || {};

    // Calculate engagement trend
    let engagementTrend = 'stable';
    if (engagementData && engagementData.length >= 14) {
      const recentWeek = engagementData.slice(0, 7).reduce((sum, day) => sum + (day.logins || 0), 0);
      const previousWeek = engagementData.slice(7, 14).reduce((sum, day) => sum + (day.logins || 0), 0);
      
      if (recentWeek > previousWeek * 1.2) {
        engagementTrend = 'increasing';
      } else if (recentWeek < previousWeek * 0.8) {
        engagementTrend = 'decreasing';
      }
    }

    // Calculate health score using the scoring logic
    const healthScore = calculateHealthScore({
      login_frequency_7d: loginFrequency7d,
      login_frequency_30d: loginFrequency30d,
      days_since_last_login: daysSinceLastLogin,
      subscription_age_days: subscriptionAgeDays,
      support_tickets_count: 0, // Not tracked yet
      feature_usage: featureUsageMap,
      engagement_trend: engagementTrend,
    });

    // Save health score to database
    await supabase
      .from('customer_health_scores')
      .upsert({
        customer_id: customerId,
        health_score: healthScore.health_score,
        risk_level: healthScore.risk_level,
        login_frequency_7d: loginFrequency7d,
        login_frequency_30d: loginFrequency30d,
        feature_usage: featureUsageMap,
        days_since_last_login: daysSinceLastLogin,
        subscription_age_days: subscriptionAgeDays,
        support_tickets_count: 0,
        calculated_at: new Date().toISOString(),
      });

    return NextResponse.json(healthScore);
  } catch (error) {
    console.error('Error calculating health score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateHealthScore(data: any) {
  // Login score (40% weight)
  let loginScore = 0;
  if (data.days_since_last_login <= 2) loginScore = 40;
  else if (data.days_since_last_login <= 7) loginScore = 30;
  else if (data.days_since_last_login <= 14) loginScore = 20;
  else if (data.days_since_last_login <= 30) loginScore = 10;
  
  loginScore += Math.min(20, (data.login_frequency_7d / 5) * 20);

  // Feature usage score (25% weight)
  const activeFeatures = Object.values(data.feature_usage).filter((count: any) => count > 0).length;
  let featureScore = 0;
  if (activeFeatures >= 4) featureScore = 25;
  else if (activeFeatures >= 3) featureScore = 20;
  else if (activeFeatures >= 2) featureScore = 15;
  else if (activeFeatures >= 1) featureScore = 10;

  // Subscription age score (15% weight)
  let subscriptionScore = 0;
  if (data.subscription_age_days >= 180) subscriptionScore = 15;
  else if (data.subscription_age_days >= 90) subscriptionScore = 12;
  else if (data.subscription_age_days >= 30) subscriptionScore = 9;
  else subscriptionScore = 5;

  // Engagement trend score (20% weight)
  let trendScore = 10; // default stable
  if (data.engagement_trend === 'increasing') trendScore = 20;
  else if (data.engagement_trend === 'decreasing') trendScore = 5;

  // Support score (0% - not tracked yet)
  const supportScore = 0;

  const overallScore = loginScore + featureScore + subscriptionScore + trendScore + supportScore;

  let riskLevel = 'LOW';
  if (overallScore <= 40) riskLevel = 'CRITICAL';
  else if (overallScore <= 55) riskLevel = 'HIGH';
  else if (overallScore <= 70) riskLevel = 'MEDIUM';

  return {
    health_score: overallScore,
    risk_level: riskLevel,
    component_scores: {
      login_score: loginScore,
      feature_score: featureScore,
      subscription_score: subscriptionScore,
      trend_score: trendScore,
      support_score: supportScore,
    },
  };
}
