'use client';

/**
 * FlockIQ - Environment Trends
 * TASK-GAP4-UI-002: Environment Trend Charts in Metrics Tab
 * Requirements: REQ-GAP4-ENV-001 through REQ-GAP4-ENV-004
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §4
 * 
 * This component implements environment data visualization with:
 * - Temperature & Humidity dual-axis chart (ComposedChart)
 * - Ammonia trend chart with ReferenceLines for thresholds
 * - Light Programme Compliance bar chart
 * - Environment Health Summary (last 7 days analysis)
 * - AI-generated environment insights
 * - "View as table" accessibility toggle on all charts
 * 
 * Integration: Integrated into MetricsTab component
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TempHumidityChart } from './TempHumidityChart';
import { AmmoniaChart } from './AmmoniaChart';
import { LightComplianceChart } from './LightComplianceChart';

interface EnvironmentTrendsProps {
  farmId: string;
  batchId: string;
  breed?: string;
}

interface EnvironmentSummary {
  tempOk: number;
  humidityOk: number;
  ammoniaOk: number;
  totalDays: number;
}

export function EnvironmentTrends({ farmId, batchId, breed }: EnvironmentTrendsProps) {
  const [summary, setSummary] = useState<EnvironmentSummary | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchEnvironmentSummary();
  }, [batchId]);

  const fetchEnvironmentSummary = async () => {
    try {
      let envLogs;
      
      if (supabase) {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('log_date, temp_morning, temp_afternoon, humidity_morning, humidity_afternoon, ammonia_ppm')
          .eq('batch_id', batchId)
          .order('log_date', { ascending: true })
          .limit(7);

        if (error) throw error;
        envLogs = data;
      } else {
        // Use mock data when Supabase is not configured
        envLogs = generateMockSummaryData();
      }

      const last7Days = envLogs || [];
      const totalDays = last7Days.length;

      const tempOk = last7Days.filter((d: any) => {
        const temp = d.temp_afternoon || d.temp_morning;
        return temp && temp >= 10 && temp <= 35;
      }).length;

      const humidityOk = last7Days.filter((d: any) => {
        const humidity = d.humidity_afternoon || d.humidity_morning;
        return humidity && humidity >= 50 && humidity <= 70;
      }).length;

      const ammoniaOk = last7Days.filter((d: any) => {
        const ammonia = d.ammonia_ppm;
        return ammonia !== null && ammonia < 10;
      }).length;

      setSummary({
        tempOk,
        humidityOk,
        ammoniaOk,
        totalDays,
      });

      // Generate AI-like insight (mock for now, would call AI API in production)
      if (totalDays >= 3) {
        generateInsight(tempOk, humidityOk, ammoniaOk, totalDays);
      } else {
        setInsight('Continue logging environment data daily to see insights');
      }
    } catch (err) {
      console.error('Error fetching environment summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSummaryData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      log_date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      temp_morning: 20 + Math.random() * 8,
      temp_afternoon: 25 + Math.random() * 10,
      humidity_morning: 55 + Math.random() * 20,
      humidity_afternoon: 60 + Math.random() * 20,
      ammonia_ppm: 5 + Math.random() * 20,
    }));
  };

  const generateInsight = (tempOk: number, humidityOk: number, ammoniaOk: number, totalDays: number) => {
    const insights: string[] = [];

    if (tempOk === totalDays) {
      insights.push('Temperature is consistently within optimal range.');
    } else if (tempOk >= totalDays * 0.7) {
      insights.push('Temperature mostly optimal with occasional fluctuations.');
    } else {
      insights.push('Temperature management needs attention - frequent deviations detected.');
    }

    if (humidityOk === totalDays) {
      insights.push('Humidity levels are well controlled.');
    } else if (humidityOk >= totalDays * 0.7) {
      insights.push('Humidity generally acceptable with some elevated readings.');
    } else {
      insights.push('High humidity detected - improve ventilation to reduce respiratory disease risk.');
    }

    if (ammoniaOk === totalDays) {
      insights.push('Ammonia levels are excellent - litter condition is good.');
    } else if (ammoniaOk >= totalDays * 0.5) {
      insights.push('Ammonia levels occasionally elevated - monitor litter condition.');
    } else {
      insights.push('Ammonia levels are concerning - increase ventilation and check litter management.');
    }

    setInsight(insights.join(' '));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">🌡️ Environment Trends</h2>
      </div>

      {/* Environment Health Summary Card */}
      {summary && summary.totalDays > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Environment Summary — Last {summary.totalDays} days
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-lg ${summary.tempOk === summary.totalDays ? 'text-green-600' : summary.tempOk >= summary.totalDays * 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                {summary.tempOk === summary.totalDays ? '✅' : summary.tempOk >= summary.totalDays * 0.7 ? '⚠' : '🔴'}
              </span>
              <span className="text-sm text-gray-700">
                Temperature: {summary.tempOk}/{summary.totalDays} days within safe range
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${summary.humidityOk === summary.totalDays ? 'text-green-600' : summary.humidityOk >= summary.totalDays * 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                {summary.humidityOk === summary.totalDays ? '✅' : summary.humidityOk >= summary.totalDays * 0.7 ? '⚠' : '🔴'}
              </span>
              <span className="text-sm text-gray-700">
                Humidity: {summary.humidityOk}/{summary.totalDays} days within safe range
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${summary.ammoniaOk === summary.totalDays ? 'text-green-600' : summary.ammoniaOk >= summary.totalDays * 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                {summary.ammoniaOk === summary.totalDays ? '✅' : summary.ammoniaOk >= summary.totalDays * 0.5 ? '⚠' : '🔴'}
              </span>
              <span className="text-sm text-gray-700">
                Ammonia: {summary.ammoniaOk}/{summary.totalDays} days within safe range
              </span>
            </div>
          </div>
          
          {/* AI-Generated Environment Insight */}
          {summary.totalDays >= 3 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-700 italic">
                💡 {insight}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        {/* Temperature & Humidity Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Temperature & Humidity</h3>
          <TempHumidityChart batchId={batchId} />
        </div>

        {/* Ammonia Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Ammonia Trend</h3>
          <AmmoniaChart batchId={batchId} />
        </div>

        {/* Light Programme Compliance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Light Programme Compliance</h3>
          <LightComplianceChart batchId={batchId} breed={breed} />
        </div>
      </div>
    </div>
  );
}
