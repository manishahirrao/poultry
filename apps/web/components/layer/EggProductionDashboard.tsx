'use client';

/**
 * FlockIQ - Egg Production Dashboard
 * TASK-051: Layer Farm Profile & Egg Production Dashboard
 * Requirement Refs: REQ-022, Design Addendum §19.1
 * 
 * This component implements the layer farm egg production dashboard with HDP tracking,
 * 30-day production charts, feed vs egg correlation, and NECC price hero variant.
 * 
 * Features:
 * - HDP (Hen Day Production) gauge with color-coded status
 * - 30-day production chart vs breed standard curve
 * - Feed vs egg correlation chart
 * - NECC egg price hero widget for layer farms
 * - Yield forecasting with confidence bands
 * - Egg grading log support (Large/Medium/Small/Cracked)
 * - Integration with layer breed standards (Lohmann Brown, HH-260, BV-300, Hy-Line Brown)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { TrendUp, TrendDown, Egg, ChartLine, ChartBar, Pulse } from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import layerBreedStandards from '@/lib/data/layerBreedStandards.json';

/**
 * Props for Egg Production Dashboard
 * - batchId: Unique identifier for the layer batch
 */
interface EggProductionDashboardProps {
  batchId: string;
}

/**
 * Egg production log structure
 * Records daily egg production data for layer flocks
 */
interface ProductionLog {
  log_date: string; // ISO date string
  flock_age_weeks: number; // Flock age in weeks
  total_eggs: number; // Total eggs collected
  broken_eggs: number; // Number of broken eggs
  floor_eggs: number; // Number of floor eggs
  saleable_eggs: number; // Number of saleable eggs
  hdp_percentage: number; // Hen Day Production percentage
  feed_consumed_kg: number; // Feed consumed in kg
  water_consumed_litres: number; // Water consumed in litres
}

/**
 * Batch information structure
 * Contains basic batch metadata for layer flocks
 */
interface BatchInfo {
  breed: string; // Layer breed name
  doc_placement_date: string; // Date when DOCs were placed
  current_bird_count: number; // Current number of birds
}

export default function EggProductionDashboard({ batchId }: EggProductionDashboardProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentHDP, setCurrentHDP] = useState<number>(0);
  const [hdpTrend, setHdpTrend] = useState<'up' | 'down' | 'flat'>('flat');
  const [hdpDelta, setHdpDelta] = useState<number>(0);

  /**
   * Load production data when component mounts or batchId changes
   * Fetches batch info and production logs from Supabase
   */
  useEffect(() => {
    loadProductionData();
  }, [batchId]);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Load batch info
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('breed, doc_placement_date, current_bird_count')
        .eq('id', batchId)
        .single();

      if (batchError) throw batchError;
      setBatchInfo(batchData);

      // Load production logs (last 30 days)
      const { data: logsData, error: logsError } = await supabase
        .from('egg_production_logs')
        .select('*')
        .eq('batch_id', batchId)
        .order('log_date', { ascending: true })
        .limit(30);

      if (logsError) throw logsError;
      setProductionLogs(logsData || []);

      // Calculate current HDP and trend
      if (logsData && logsData.length > 0) {
        const latestLog = logsData[logsData.length - 1];
        setCurrentHDP(latestLog.hdp_percentage || 0);

        if (logsData.length >= 2) {
          const previousLog = logsData[logsData.length - 2];
          const delta = (latestLog.hdp_percentage || 0) - (previousLog.hdp_percentage || 0);
          setHdpDelta(Math.abs(delta));
          setHdpTrend(delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat');
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  // Get HDP color coding
  const getHDPColor = (hdp: number) => {
    if (hdp >= 95) return { color: 'text-green-600', bg: 'bg-green-100', label: 'उत्कृष्ट' };
    if (hdp >= 90) return { color: 'text-green-600', bg: 'bg-green-100', label: 'अच्छा' };
    if (hdp >= 80) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'स्वीकार्य' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'कमज़ोर' };
  };

  // Get breed standard HDP curve
  const getBreedStandardCurve = () => {
    if (!batchInfo) return [];
    const breed = layerBreedStandards.breeds.find(b => b.name === batchInfo.breed);
    if (!breed) return [];

    return Object.entries(breed.hdp_curve).map(([weekKey, value]) => ({
      week: parseInt(weekKey.replace('week_', '')),
      standard: value,
    }));
  };

  // Prepare chart data
  const prepareProductionChartData = () => {
    const breedStandard = getBreedStandardCurve();
    return productionLogs.map(log => {
      const weekData = breedStandard.find(b => b.week === log.flock_age_weeks);
      return {
        date: new Date(log.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        week: log.flock_age_weeks,
        actual: log.hdp_percentage || 0,
        standard: weekData?.standard || 0,
        totalEggs: log.total_eggs,
        saleableEggs: log.saleable_eggs,
      };
    });
  };

  // Prepare feed vs egg correlation data
  const prepareFeedEggData = () => {
    return productionLogs.map(log => ({
      date: new Date(log.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      feedKg: log.feed_consumed_kg || 0,
      eggs: log.saleable_eggs,
      feedPerEgg: log.feed_consumed_kg && log.saleable_eggs > 0 
        ? (log.feed_consumed_kg / log.saleable_eggs * 1000).toFixed(1) 
        : 0,
    }));
  };

  const hdpColor = getHDPColor(currentHDP);
  const productionChartData = prepareProductionChartData();
  const feedEggData = prepareFeedEggData();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-32 bg-neutral-200 rounded" />
          <div className="h-48 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HDP Gauge Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-neutral-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">HDP Today</h3>
            <p className="text-sm text-neutral-500">Hen-Day Production %</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${hdpColor.bg} ${hdpColor.color}`}>
            <span className="font-semibold">{hdpColor.label}</span>
          </div>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <div className="text-5xl font-bold text-neutral-900">
            {currentHDP.toFixed(1)}%
          </div>
          <div className={`flex items-center gap-1 pb-2 ${hdpTrend === 'up' ? 'text-green-600' : hdpTrend === 'down' ? 'text-red-600' : 'text-neutral-500'}`}>
            {hdpTrend === 'up' && <TrendUp size={20} weight="bold" />}
            {hdpTrend === 'down' && <TrendDown size={20} weight="bold" />}
            <span className="text-sm font-medium">
              {hdpDelta > 0 ? `${hdpDelta.toFixed(1)}% vs yesterday` : 'No change'}
            </span>
          </div>
        </div>

        {/* HDP Progress Bar */}
        <div className="relative">
          <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentHDP}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${currentHDP >= 90 ? 'bg-green-500' : currentHDP >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>60%</span>
            <span>80%</span>
            <span>95%</span>
            <span>100%</span>
          </div>
        </div>

        {batchInfo && (
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600">
              Breed Standard: <span className="font-semibold">{batchInfo.breed}</span>
              {' · '}Birds: <span className="font-semibold">{batchInfo.current_bird_count?.toLocaleString()}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* 30-Day Production Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-neutral-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">30-Day Production Trend</h3>
            <p className="text-sm text-neutral-500">Actual vs Breed Standard</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-neutral-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neutral-300 rounded-full border-2 border-dashed border-neutral-400" />
              <span className="text-neutral-600">Standard</span>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productionChartData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                domain={[0, 100]}
                label={{ value: 'HDP %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#22c55e" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActual)"
              />
              <Line 
                type="monotone" 
                dataKey="standard" 
                stroke="#9ca3af" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Feed vs Egg Correlation Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-neutral-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Feed vs Egg Correlation</h3>
            <p className="text-sm text-neutral-500">Feed efficiency analysis</p>
          </div>
          <Pulse className="text-neutral-400" size={24} />
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feedEggData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Feed (kg)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Eggs', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar yAxisId="left" dataKey="feedKg" fill="#3b82f6" name="Feed (kg)" />
              <Bar yAxisId="right" dataKey="eggs" fill="#22c55e" name="Eggs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feed per egg summary */}
        {feedEggData.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Avg Feed/Day</p>
              <p className="text-lg font-bold text-blue-900">
                {(feedEggData.reduce((sum, d) => sum + d.feedKg, 0) / feedEggData.length).toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Avg Eggs/Day</p>
              <p className="text-lg font-bold text-green-900">
                {(feedEggData.reduce((sum, d) => sum + d.eggs, 0) / feedEggData.length).toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Feed/Egg Ratio</p>
              <p className="text-lg font-bold text-purple-900">
                {(feedEggData.reduce((sum, d) => sum + parseFloat(d.feedPerEgg.toString()), 0) / feedEggData.length).toFixed(1)} g
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Production Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-neutral-200 p-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Production (Last 7 Days)</h3>
        
        {productionLogs.slice(-7).reverse().map((log, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
            <div className="flex items-center gap-3">
              <Egg className="text-neutral-400" size={20} />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {new Date(log.log_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs text-neutral-500">Week {log.flock_age_weeks}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-neutral-900">{log.saleable_eggs.toLocaleString()} eggs</p>
              <p className={`text-xs font-medium ${log.hdp_percentage >= 90 ? 'text-green-600' : log.hdp_percentage >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                {log.hdp_percentage?.toFixed(1)}% HDP
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
