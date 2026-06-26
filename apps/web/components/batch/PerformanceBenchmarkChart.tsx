'use client';

import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';
import { Lightbulb } from '@phosphor-icons/react';

interface PerformanceBenchmarkChartProps {
  batchId: string;
  breed: string;
  district?: string;
}

interface BenchmarkData {
  metric: string;
  thisBatch: number;
  personalBest: number;
  districtAverage: number | null;
  breedStandard: number;
}

interface NormalizedBenchmarkData {
  metric: string;
  thisBatch: number;
  personalBest: number;
  districtAverage: number;
  breedStandard: number;
  fullMark: number;
}

const METRICS = [
  { key: 'fcr', label: 'FCR', lowerIsBetter: true },
  { key: 'mortality', label: 'Mortality %', lowerIsBetter: true },
  { key: 'avgWeight', label: 'Avg Weight (kg)', lowerIsBetter: false },
  { key: 'feedCost', label: 'Feed Cost/kg', lowerIsBetter: true },
  { key: 'netProfit', label: 'Net Profit/bird (₹)', lowerIsBetter: false },
];

export function PerformanceBenchmarkChart({ batchId, breed, district }: PerformanceBenchmarkChartProps) {
  const [benchmarkData, setBenchmarkData] = useState<NormalizedBenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notEnoughData, setNotEnoughData] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchBenchmarkData();
  }, [batchId, breed, district]);

  const fetchBenchmarkData = async () => {
    try {
      // Fetch current batch data
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('*, feed_logs(*), mortality_logs(*), weight_logs(*)')
        .eq('id', batchId)
        .single();

      if (batchError) throw batchError;

      // Fetch district benchmarks
      const { data: districtBenchmarks, error: districtError } = await supabase
        .from('district_benchmarks')
        .select('*')
        .eq('breed', breed)
        .eq('metric_type', 'performance')
        .single();

      if (districtError && districtError.code !== 'PGRST116') {
        throw districtError;
      }

      // Check privacy threshold
      if (districtBenchmarks && districtBenchmarks.sample_size < 5) {
        setNotEnoughData(true);
      }

      // Fetch personal best (from harvested batches)
      const { data: personalBatches, error: personalError } = await supabase
        .from('batches')
        .select('*')
        .eq('customer_id', batch.customer_id)
        .eq('breed', breed)
        .eq('status', 'harvested')
        .order('created_at', { ascending: false })
        .limit(5);

      if (personalError && personalError.code !== 'PGRST116') {
        throw personalError;
      }

      // Calculate metrics for current batch
      const currentMetrics = calculateBatchMetrics(batch);

      // Calculate personal best
      const personalBestMetrics = calculatePersonalBest(personalBatches || [], currentMetrics);

      // Get district averages
      const districtMetrics = districtBenchmarks ? parseDistrictBenchmarks(districtBenchmarks) : null;

      // Get breed standards
      const breedStandardMetrics = getBreedStandards(breed);

      // Normalize all metrics to 0-1 scale
      const normalizedData: NormalizedBenchmarkData[] = METRICS.map((metric) => {
        const currentValue = currentMetrics[metric.key as keyof typeof currentMetrics] || 0;
        const personalBestValue = personalBestMetrics[metric.key as keyof typeof personalBestMetrics] || currentValue;
        const districtValue = districtMetrics ? districtMetrics[metric.key as keyof typeof districtMetrics] || 0 : 0;
        const breedStandardValue = breedStandardMetrics[metric.key as keyof typeof breedStandardMetrics] || 0;

        // Determine full mark for normalization
        const allValues = [currentValue, personalBestValue, districtValue, breedStandardValue];
        const fullMark = metric.lowerIsBetter 
          ? Math.max(...allValues) * 1.2 
          : Math.max(...allValues) * 1.2;

        // Normalize: for lower-is-better metrics, invert the scale
        const normalize = (value: number) => {
          if (metric.lowerIsBetter) {
            return 1 - (value / fullMark);
          }
          return value / fullMark;
        };

        return {
          metric: metric.label,
          thisBatch: normalize(currentValue),
          personalBest: normalize(personalBestValue),
          districtAverage: notEnoughData ? 0 : normalize(districtValue),
          breedStandard: normalize(breedStandardValue),
          fullMark,
        };
      });

      setBenchmarkData(normalizedData);
      
      // Generate AI insight after benchmark data is loaded
      generateAIInsight(currentMetrics, districtMetrics, breedStandardMetrics);
    } catch (err) {
      console.error('Error fetching benchmark data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsight = async (currentMetrics: any, districtMetrics: any, breedStandardMetrics: any) => {
    setAiInsightLoading(true);
    
    try {
      // Check cache first (24h cache)
      const cacheKey = `ai_insight_${batchId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, insight } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          setAiInsight(insight);
          setAiInsightLoading(false);
          return;
        }
      }

      // Calculate performance differences
      const fcrDiff = districtMetrics 
        ? ((currentMetrics.fcr - districtMetrics.fcr) / districtMetrics.fcr * 100).toFixed(1)
        : ((currentMetrics.fcr - breedStandardMetrics.fcr) / breedStandardMetrics.fcr * 100).toFixed(1);
      
      const mortalityDiff = districtMetrics
        ? ((currentMetrics.mortality - districtMetrics.mortality) / districtMetrics.mortality * 100).toFixed(1)
        : ((currentMetrics.mortality - breedStandardMetrics.mortality) / breedStandardMetrics.mortality * 100).toFixed(1);

      const weightDiff = districtMetrics
        ? ((currentMetrics.avgWeight - districtMetrics.avgWeight) / districtMetrics.avgWeight * 100).toFixed(1)
        : ((currentMetrics.avgWeight - breedStandardMetrics.avgWeight) / breedStandardMetrics.avgWeight * 100).toFixed(1);

      // Generate insight (simplified - in production would call Claude API)
      const fcrStatus = parseFloat(fcrDiff) < 0 ? 'बेहतर' : 'कमज़ोर';
      const fcrValue = Math.abs(parseFloat(fcrDiff));
      
      let insight = `आपका FCR ${districtMetrics ? 'जिले के औसत से' : 'नस्ल मानक से'} ${fcrValue}% ${fcrStatus} है। `;
      
      // Add actionable suggestions based on metrics
      const suggestions = [];
      if (parseFloat(fcrDiff) > 5) {
        suggestions.push('चारे की गुणवत्ता और वितरण समय की जाँच करें');
      }
      if (parseFloat(mortalityDiff) > 10) {
        suggestions.push('स्वच्छता और जैव सुरक्षा उपायों पर ध्यान दें');
      }
      if (parseFloat(weightDiff) < -5) {
        suggestions.push('पोषण संतुलन और पानी की उपलब्धता सुनिश्चित करें');
      }
      
      if (suggestions.length > 0) {
        insight += suggestions.slice(0, 2).join('। ') + '।';
      } else {
        insight += 'आपका प्रदर्शन अच्छा है, इसे बनाए रखें।';
      }

      // Cache the insight
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        insight
      }));

      setAiInsight(insight);
    } catch (err) {
      console.error('Error generating AI insight:', err);
      setAiInsight(null);
    } finally {
      setAiInsightLoading(false);
    }
  };

  const calculateBatchMetrics = (batch: any) => {
    // Calculate FCR from feed_logs
    const feedLogs = batch.feed_logs || [];
    const totalFeed = feedLogs.reduce((sum: number, log: any) => sum + (log.total_feed_kg || 0), 0);
    
    // Calculate mortality %
    const mortalityLogs = batch.mortality_logs || [];
    const totalMortality = mortalityLogs.reduce((sum: number, log: any) => sum + (log.count || 0), 0);
    const mortalityPct = batch.doc_count > 0 ? (totalMortality / batch.doc_count) * 100 : 0;

    // Get average weight from weight_logs or batch.current_avg_weight_kg
    const weightLogs = batch.weight_logs || [];
    const avgWeight = weightLogs.length > 0 
      ? weightLogs[weightLogs.length - 1].avg_weight_kg 
      : batch.current_avg_weight_kg || 0;

    // Estimate feed cost/kg (simplified - would need actual feed cost data)
    const feedCostPerKg = 24.8; // Default feed cost
    
    // Estimate net profit per bird (simplified - would need actual cost/revenue data)
    const netProfitPerBird = avgWeight > 0 ? (avgWeight * 150) - (totalFeed / batch.doc_count * feedCostPerKg) - 50 : 0;

    return {
      fcr: batch.current_fcr || 1.8,
      mortality: mortalityPct,
      avgWeight: avgWeight,
      feedCost: feedCostPerKg,
      netProfit: Math.max(0, netProfitPerBird),
    };
  };

  const calculatePersonalBest = (batches: any[], currentMetrics: any) => {
    if (batches.length === 0) {
      return currentMetrics;
    }

    const metrics = batches.map((batch) => calculateBatchMetrics(batch));
    
    // For lower-is-better metrics, find minimum; for higher-is-better, find maximum
    return {
      fcr: Math.min(...metrics.map((m) => m.fcr)),
      mortality: Math.min(...metrics.map((m) => m.mortality)),
      avgWeight: Math.max(...metrics.map((m) => m.avgWeight)),
      feedCost: Math.min(...metrics.map((m) => m.feedCost)),
      netProfit: Math.max(...metrics.map((m) => m.netProfit)),
    };
  };

  const parseDistrictBenchmarks = (benchmarks: any) => {
    // Parse district benchmark JSON data
    try {
      const data = typeof benchmarks.benchmark_data === 'string' 
        ? JSON.parse(benchmarks.benchmark_data) 
        : benchmarks.benchmark_data;
      
      return {
        fcr: data.avg_fcr || 1.8,
        mortality: data.avg_mortality_pct || 3.0,
        avgWeight: data.avg_weight_kg || 2.0,
        feedCost: data.avg_feed_cost_per_kg || 25.0,
        netProfit: data.avg_net_profit_per_bird || 30.0,
      };
    } catch {
      return null;
    }
  };

  const getBreedStandards = (breed: string) => {
    // Breed standard values (simplified - would use breedStandards.json)
    const standards: Record<string, any> = {
      'Cobb 500': {
        fcr: 1.75,
        mortality: 3.0,
        avgWeight: 2.2,
        feedCost: 24.0,
        netProfit: 35.0,
      },
      'Ross 308': {
        fcr: 1.70,
        mortality: 2.8,
        avgWeight: 2.3,
        feedCost: 23.5,
        netProfit: 38.0,
      },
      'Vencobb': {
        fcr: 1.80,
        mortality: 3.2,
        avgWeight: 2.0,
        feedCost: 24.5,
        netProfit: 32.0,
      },
      'Hubbard': {
        fcr: 1.78,
        mortality: 3.0,
        avgWeight: 2.1,
        feedCost: 24.2,
        netProfit: 34.0,
      },
    };

    return standards[breed] || standards['Cobb 500'];
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading benchmark data...</div>
      </div>
    );
  }

  if (benchmarkData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Insufficient data for benchmarking</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Insight Card */}
      {aiInsightLoading ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin">
            <Lightbulb size={20} weight="regular" className="text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">Generating AI insight...</div>
        </div>
      ) : aiInsight && (
        <div className="bg-gradient-to-r from-brand-green-50 to-blue-50 border border-brand-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} weight="fill" className="text-brand-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-brand-green-900 mb-1">AI Insight</div>
              <div className="text-sm text-brand-green-800">{aiInsight}</div>
            </div>
          </div>
        </div>
      )}

      {notEnoughData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          ⚠️ Not enough data in your district yet (minimum 5 farms required). Showing breed standard comparison only.
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={benchmarkData} aria-label="Performance benchmarking radar chart">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 1]}
            tick={false}
          />
          <Legend />
          
          {/* This Batch - Blue solid line */}
          <Radar
            name="This Batch"
            dataKey="thisBatch"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          
          {/* Personal Best - Green dotted line */}
          <Radar
            name="Personal Best"
            dataKey="personalBest"
            stroke="#16A34A"
            fill="#16A34A"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          
          {/* District Average - Grey dashed line */}
          {!notEnoughData && (
            <Radar
              name="District Avg"
              dataKey="districtAverage"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
          
          {/* Breed Standard - Purple dotted line */}
          <Radar
            name="Breed Standard"
            dataKey="breedStandard"
            stroke="#A855F7"
            fill="#A855F7"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="2 2"
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="text-xs text-neutral-500 text-center">
        * Higher values indicate better performance (normalized 0-1 scale)
      </div>
    </div>
  );
}

export default PerformanceBenchmarkChart;
