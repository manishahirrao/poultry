'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Thermometer, Drop, Wind, WifiHigh, WifiSlash, Pulse, TrendUp, TrendDown } from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EnvironmentReading {
  id: string;
  reading_at: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  ammonia_ppm: number | null;
}

interface DeviceStatus {
  device_id: string;
  device_name: string;
  device_type: string;
  status: 'online' | 'offline' | 'error';
  last_reading_at: string | null;
}

interface ShedEnvironmentPanelProps {
  shedId: string;
  customer_id: string;
}

export default function ShedEnvironmentPanel({ shedId, customer_id }: ShedEnvironmentPanelProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  // State
  const [currentReading, setCurrentReading] = useState<EnvironmentReading | null>(null);
  const [historicalData, setHistoricalData] = useState<EnvironmentReading[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'ammonia'>('temperature');

  // Safe ranges from requirements
  const safeRanges = {
    temperature: { min: 18, max: 25 },
    humidity: { min: 50, max: 70 },
    ammonia: { max: 20 }
  };

  // Load initial data
  useEffect(() => {
    loadEnvironmentData();
    loadDeviceStatus();

    // Set up Supabase Realtime subscription
    if (supabase) {
      const subscription = supabase
        .channel(`iot_readings_${shedId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'iot_readings',
            filter: `shed_id=eq.${shedId}`
          },
          (payload) => {
            handleNewReading(payload.new as EnvironmentReading);
          }
        )
        .subscribe();

      // Refresh data every 30 seconds as fallback
      const interval = setInterval(() => {
        loadEnvironmentData();
        loadDeviceStatus();
      }, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }

    // Refresh data every 30 seconds as fallback (without subscription)
    const interval = setInterval(() => {
      loadEnvironmentData();
      loadDeviceStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [shedId, customer_id]);

  const loadEnvironmentData = async () => {
    if (!supabase) {
      console.warn('[ShedEnvironmentPanel] Supabase not configured, skipping environment data load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get latest reading
      const { data: latestData, error: latestError } = await supabase
        .from('iot_readings')
        .select('*')
        .eq('shed_id', shedId)
        .eq('customer_id', customer_id)
        .order('reading_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestError && latestData) {
        setCurrentReading(latestData);
        setLastUpdated(new Date(latestData.reading_at));
      }

      // Get 24-hour historical data (15-minute resolution = 96 data points)
      const { data: historyData, error: historyError } = await supabase
        .from('iot_readings')
        .select('*')
        .eq('shed_id', shedId)
        .eq('customer_id', customer_id)
        .gte('reading_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('reading_at', { ascending: true })
        .limit(200);

      if (!historyError && historyData) {
        setHistoricalData(historyData);
      }
    } catch (err) {
      console.error('Failed to load environment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceStatus = async () => {
    if (!supabase) {
      console.warn('[ShedEnvironmentPanel] Supabase not configured, skipping device status load');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('id, device_name, device_type, status, last_reading_at')
        .eq('shed_id', shedId)
        .eq('customer_id', customer_id);

      if (!error && data) {
        setDevices(data.map(d => ({
          device_id: d.id,
          device_name: d.device_name,
          device_type: d.device_type,
          status: d.status,
          last_reading_at: d.last_reading_at
        })));
      }
    } catch (err) {
      console.error('Failed to load device status:', err);
    }
  };

  const handleNewReading = (reading: EnvironmentReading) => {
    setCurrentReading(reading);
    setLastUpdated(new Date(reading.reading_at));
    setHistoricalData(prev => [...prev.slice(-199), reading]);
  };

  const getMetricValue = (reading: EnvironmentReading | null, metric: string) => {
    if (!reading) return null;
    switch (metric) {
      case 'temperature': return reading.temperature_c;
      case 'humidity': return reading.humidity_pct;
      case 'ammonia': return reading.ammonia_ppm;
      default: return null;
    }
  };

  const getMetricStatus = (value: number | null | undefined, metric: string) => {
    if (value === null || value === undefined) return 'unknown';
    const range = safeRanges[metric as keyof typeof safeRanges];
    if (!range) return 'unknown';

    if (metric === 'ammonia') {
      return value > range.max ? 'critical' : 'ok';
    }

    if ('min' in range && (value < range.min || value > range.max)) {
      return value > range.max + 5 || value < range.min - 5 ? 'critical' : 'warning';
    }
    return 'ok';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'ok': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const prepareChartData = () => {
    return historicalData
      .filter(r => getMetricValue(r, selectedMetric) !== null)
      .map(r => ({
        time: new Date(r.reading_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: getMetricValue(r, selectedMetric),
        timestamp: r.reading_at
      }));
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'ammonia': return 'ppm';
      default: return '';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'temperature': return Thermometer;
      case 'humidity': return Drop;
      case 'ammonia': return Wind;
      default: return Pulse;
    }
  };

  const MetricIcon = getMetricIcon(selectedMetric);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const currentValue = getMetricValue(currentReading, selectedMetric);
  const currentStatus = getMetricStatus(currentValue, selectedMetric);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shed Environment — {shedId}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {formatTimeAgo(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {devices.filter(d => d.status === 'online').length > 0 ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <WifiHigh size={16} />
              {devices.filter(d => d.status === 'online').length} devices online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600 text-sm">
              <WifiSlash size={16} />
              All devices offline
            </span>
          )}
        </div>
      </div>

      {/* Current Metrics */}
      <div className="p-4 grid grid-cols-3 gap-4">
        {/* Temperature */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedMetric('temperature')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedMetric === 'temperature' ? 'ring-2 ring-gray-900' : ''
          } ${getMetricColor(getMetricStatus(currentReading?.temperature_c, 'temperature'))}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Thermometer size={24} />
            <span className={`text-xs px-2 py-1 rounded-full border ${
              getMetricStatus(currentReading?.temperature_c ?? null, 'temperature') === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {getMetricStatus(currentReading?.temperature_c ?? null, 'temperature') === 'ok' ? 'OK' : 'ALERT'}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {currentReading?.temperature_c?.toFixed(1) || '--'}°C
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Safe: {safeRanges.temperature.min}-{safeRanges.temperature.max}°C
          </div>
        </motion.div>

        {/* Humidity */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedMetric('humidity')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedMetric === 'humidity' ? 'ring-2 ring-gray-900' : ''
          } ${getMetricColor(getMetricStatus(currentReading?.humidity_pct ?? null, 'humidity'))}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Drop size={24} />
            <span className={`text-xs px-2 py-1 rounded-full border ${
              getMetricStatus(currentReading?.humidity_pct ?? null, 'humidity') === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {getMetricStatus(currentReading?.humidity_pct ?? null, 'humidity') === 'ok' ? 'OK' : 'ALERT'}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {currentReading?.humidity_pct?.toFixed(0) || '--'}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Safe: {safeRanges.humidity.min}-{safeRanges.humidity.max}%
          </div>
        </motion.div>

        {/* Ammonia */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedMetric('ammonia')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedMetric === 'ammonia' ? 'ring-2 ring-gray-900' : ''
          } ${getMetricColor(getMetricStatus(currentReading?.ammonia_ppm ?? null, 'ammonia'))}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Wind size={24} />
            <span className={`text-xs px-2 py-1 rounded-full border ${
              getMetricStatus(currentReading?.ammonia_ppm ?? null, 'ammonia') === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {getMetricStatus(currentReading?.ammonia_ppm ?? null, 'ammonia') === 'ok' ? 'OK' : 'ALERT'}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {currentReading?.ammonia_ppm?.toFixed(1) || '--'} ppm
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Safe: &lt; {safeRanges.ammonia.max} ppm
          </div>
        </motion.div>
      </div>

      {/* 24-Hour Trend Chart */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <MetricIcon size={20} />
            24-Hour {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend
          </h4>
          <div className="flex gap-2 text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <span className="w-3 h-3 bg-gray-900 rounded-full"></span>
              Actual
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <span className="w-3 h-3 border-2 border-dashed border-red-500 rounded-full"></span>
              Safe Range
            </span>
          </div>
        </div>

        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value.toFixed(1), `${selectedMetric} (${getMetricUnit(selectedMetric)})`]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {selectedMetric === 'temperature' && (
                  <>
                    <ReferenceLine y={safeRanges.temperature.max} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={safeRanges.temperature.min} stroke="#ef4444" strokeDasharray="3 3" />
                  </>
                )}
                {selectedMetric === 'humidity' && (
                  <>
                    <ReferenceLine y={safeRanges.humidity.max} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={safeRanges.humidity.min} stroke="#ef4444" strokeDasharray="3 3" />
                  </>
                )}
                {selectedMetric === 'ammonia' && (
                  <ReferenceLine y={safeRanges.ammonia.max} stroke="#ef4444" strokeDasharray="3 3" />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No historical data available
            </div>
          )}
        </div>
      </div>

      {/* Device Status */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Active Device Status</h4>
        <div className="space-y-2">
          {devices.map((device) => (
            <div key={device.device_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {device.status === 'online' ? (
                  <WifiHigh size={16} className="text-green-600" />
                ) : (
                  <WifiSlash size={16} className="text-red-600" />
                )}
                <span className="text-sm font-medium">{device.device_name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="capitalize">{device.status}</span>
                <span>•</span>
                <span>{formatTimeAgo(device.last_reading_at ? new Date(device.last_reading_at) : null)}</span>
              </div>
            </div>
          ))}
          {devices.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              No devices registered for this shed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
