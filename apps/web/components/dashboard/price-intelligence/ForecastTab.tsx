'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { P50_AREA_PROPS, P10_AREA_PROPS, P90_AREA_PROPS,
         ACTUAL_SCATTER_PROPS, CHART_MARGIN, tooltipStyle,
         xAxisProps, yAxisProps, CHART_COLOURS } from '@/lib/charts/config';
import { ChartSkeleton } from '@/components/dashboard/skeletons';
import { SellSignalCallout } from './SellSignalCallout';
import { CaretDown, Info, Plus, X } from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type Range = '7D' | '14D' | '30D' | '60D';

interface ForecastTabProps {
  mandi: string;
  setMandi: (mandi: string) => void;
  range: Range;
  setRange: (range: Range) => void;
  forecastData: any[];
  forecastError: any;
  forecastLoading: boolean;
  compareMandi: string | null;
  setCompareMandi: (mandi: string | null) => void;
  compareData: any[];
}

export function ForecastTab({
  mandi,
  setMandi,
  range,
  setRange,
  forecastData,
  forecastError,
  forecastLoading,
  compareMandi,
  setCompareMandi,
  compareData,
}: ForecastTabProps) {
  const [showDrivers, setShowDrivers] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: true, amount: 0.3 });

  // Animate chart data on load
  useEffect(() => {
    if (isInView && forecastData && forecastData.length > 0) {
      setIsChartVisible(true);

      const data = forecastData.map((p: any) => ({
        date: new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        p10: p.p10,
        p50: p.p50,
        p90: p.p90,
        actual: p.actual,
        sellSignal: p.sellSignal,
        isToday: p.isToday,
        festivalName: p.festivalName,
        hpaiAlert: p.hpaiAlert,
      }));

      // Staggered data reveal animation
      setChartData([]);
      let index = 0;
      const interval = setInterval(() => {
        if (index < data.length) {
          setChartData(prev => [...prev, data[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50); // 50ms delay between each data point

      return () => clearInterval(interval);
    }
  }, [isInView, forecastData]);

  const mandiOptions = [
    { value: 'gorakhpur', label: 'Gorakhpur' },
    { value: 'deoria', label: 'Deoria' },
    { value: 'kushinagar', label: 'Kushinagar' },
    { value: 'basti', label: 'Basti' },
    { value: 'maharajganj', label: 'Maharajganj' },
  ];

  const rangeOptions = [
    { value: '7D' as Range, label: '7D' },
    { value: '14D' as Range, label: '14D' },
    { value: '30D' as Range, label: '30D' },
    { value: '60D' as Range, label: '60D' },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const error = data.actual ? Math.abs((data.actual - data.p50) / data.p50 * 100).toFixed(1) : null;

    return (
      <div style={tooltipStyle.contentStyle}>
        <p style={tooltipStyle.labelStyle}>{data.date}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={tooltipStyle.itemStyle}>
            <span style={{ color: entry.color }}>●</span>{' '}
            {entry.name}: ₹{entry.value}/kg
          </p>
        ))}
        {data.actual && (
          <>
            <p style={tooltipStyle.itemStyle}>
              <span style={{ color: CHART_COLOURS.actual }}>●</span>{' '}
              Actual: ₹{data.actual}/kg
            </p>
            {error && (
              <p style={tooltipStyle.itemStyle}>
                Error: ±{error}%
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  if (forecastLoading) {
    return <ChartSkeleton height={400} />;
  }

  if (forecastError) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-100">
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold mb-2">Error loading forecast data</p>
          <p className="text-sm text-neutral-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-100">
        <div className="text-center py-12">
          <p className="text-neutral-600 font-semibold mb-2">No forecast data available</p>
          <p className="text-sm text-neutral-500">Price data loads daily at 6:00 AM. Check back tomorrow.</p>
        </div>
      </div>
    );
  }

  const latestPrediction = forecastData[0];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-neutral-700">Mandi:</label>
          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          >
            {mandiOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-neutral-700">Range:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          >
            {rangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {compareMandi ? (
            <button
              onClick={() => setCompareMandi(null)}
              className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
            >
              <X size={16} />
              <span>Clear Compare</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const otherMandi = mandiOptions.find(m => m.value !== mandi);
                if (otherMandi) setCompareMandi(otherMandi.value);
              }}
              className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
            >
              <Plus size={16} />
              <span>Compare Mandi</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <motion.div 
        ref={chartRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isChartVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-6 border border-neutral-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Price Forecast</h3>

        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLOURS.grid} />
            <XAxis
              {...xAxisProps}
              dataKey="date"
            />
            <YAxis {...yAxisProps} domain={[140, 180]} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* MANDATORY: All three bands must be visible */}
            <Area {...P10_AREA_PROPS} name="P10 (Lower)" />
            <Area {...P50_AREA_PROPS} name="P50 (Median)" />
            <Area {...P90_AREA_PROPS} name="P90 (Upper)" />
            
            {/* Actual prices where available */}
            {chartData.some(d => d.actual !== null) && (
              <Area {...ACTUAL_SCATTER_PROPS} name="Actual Price" />
            )}
            
            {/* Today reference line */}
            <ReferenceLine
              x={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              stroke={CHART_COLOURS.actual}
              strokeDasharray="4 4"
              label={{ value: 'Today', fill: CHART_COLOURS.actual, fontSize: 10 }}
            />
            
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Hidden data table for screen readers */}
        <table className="sr-only" aria-label="Price forecast data">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">P10 (₹/kg)</th>
              <th scope="col">P50 (₹/kg)</th>
              <th scope="col">P90 (₹/kg)</th>
              <th scope="col">Actual (₹/kg)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.p10}</td>
                <td>{row.p50}</td>
                <td>{row.p90}</td>
                <td>{row.actual || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Sell Signal Callout */}
      <div className="flex justify-end">
        <SellSignalCallout mandi={mandi} />
      </div>

      {/* Price Drivers Panel */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <button
          onClick={() => setShowDrivers(!showDrivers)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={18} className="text-brandGreen700" />
            <span className="text-sm font-semibold text-neutral-900">
              Why is FlockIQ predicting this?
            </span>
          </div>
          <CaretDown
            size={18}
            className={`text-neutral-400 transition-transform ${showDrivers ? 'rotate-180' : ''}`}
          />
        </button>

        {showDrivers && (
          <div className="px-6 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-4 py-2 text-left font-semibold text-neutral-600">Driver</th>
                  <th className="px-4 py-2 text-right font-semibold text-neutral-600">Impact (₹/kg)</th>
                  <th className="px-4 py-2 text-center font-semibold text-neutral-600">Direction</th>
                  <th className="px-4 py-2 text-center font-semibold text-neutral-600">Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-2 text-neutral-700">Maize price (42-day lag)</td>
                  <td className="px-4 py-2 text-right text-green-600">+₹4.2</td>
                  <td className="px-4 py-2 text-center">↑</td>
                  <td className="px-4 py-2 text-center text-green-600">High</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-2 text-neutral-700">Upcoming festivals</td>
                  <td className="px-4 py-2 text-right text-green-600">+₹2.1</td>
                  <td className="px-4 py-2 text-center">↑</td>
                  <td className="px-4 py-2 text-center text-amber-600">Medium</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-2 text-neutral-700">District supply index</td>
                  <td className="px-4 py-2 text-right text-red-600">-₹1.3</td>
                  <td className="px-4 py-2 text-center">↓</td>
                  <td className="px-4 py-2 text-center text-amber-600">Medium</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-2 text-neutral-700">Weather forecast</td>
                  <td className="px-4 py-2 text-right text-green-600">+₹0.8</td>
                  <td className="px-4 py-2 text-center">↑</td>
                  <td className="px-4 py-2 text-center text-green-600">High</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-neutral-700">Transport costs</td>
                  <td className="px-4 py-2 text-right text-red-600">-₹0.5</td>
                  <td className="px-4 py-2 text-center">↓</td>
                  <td className="px-4 py-2 text-center text-green-600">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confidence Explainer */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <button
          onClick={() => setShowConfidence(!showConfidence)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-neutral-900">
              P10/P50/P90 का मतलब क्या है?
            </span>
          </div>
          <CaretDown
            size={18}
            className={`text-neutral-400 transition-transform ${showConfidence ? 'rotate-180' : ''}`}
          />
        </button>

        {showConfidence && (
          <div className="px-6 pb-4">
            <div className="text-sm text-neutral-600 space-y-2">
              <p><strong>P50 (Median):</strong> सबसे संभावित भाव - 50% chance इस price के आसपास होगा</p>
              <p><strong>P10 (Lower):</strong> 10% chance भाव इससे कम होगा</p>
              <p><strong>P90 (Upper):</strong> 90% chance भाव इससे कम होगा (यानी 10% chance इससे ज्यादा)</p>
              <p className="text-xs text-neutral-500 mt-3">यह confidence interval AI model की uncertainty को दर्शाता है।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
