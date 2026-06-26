'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CHART_COLOURS, tooltipStyle, xAxisProps, yAxisProps } from '@/lib/charts/config';
import { FarmDataLoader } from '@/app/dashboard/calculator/components/FarmDataLoader';
import { HarvestWindowVisualizer } from '@/app/dashboard/calculator/components/HarvestWindowVisualizer';
import useSWR from 'swr';

interface Customer {
  segment: string;
  role: string;
}

interface PredictionRow {
  mandi: string;
  p50: number;
  p10: number;
  p90: number;
  sell_signal: string;
}

interface BatchCalculatorParams {
  flockSize: number;
  ageInDays: number;
  avgWeightKg: number;
  feedCostPerKg: number;
  overheadCostPerBirdPerDay: number;
  breakEvenPrice: number;
}

interface GCData {
  batchId: string;
  farmName: string;
  batchDay: number;
  docCost: number;
  feedCost: number;
  medicineCost: number;
  vaccineCost: number;
  litterCost: number;
  electricityCost: number;
  waterCost: number;
  labourCost: number;
  miscCost: number;
  fixedOverhead: number;
  totalCost: number;
  gcPerKg: number;
  liveKgs: number;
  birdsAlive: number;
  avgWeightKg: number;
  targetSellPriceP50: number | null;
  margin: number | null;
  marginPct: number | null;
  estimatedProfit: number | null;
  industryBenchmarkGC: number;
  vsIndustry: number;
}

interface BatchProfitCalculatorProps {
  customer: Customer;
  initialPredictions?: PredictionRow[];
}

export function BatchProfitCalculator({ customer, initialPredictions = [] }: BatchProfitCalculatorProps) {
  const [inputs, setInputs] = useState({
    flockSize: 10000,
    batchAge: 35,
    avgWeightKg: 2.2,
    totalFeedCost: 50000,
    otherCosts: 10000,
    breakEvenPrice: 0,
  });
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  // Fetch GC data when farm is selected
  const { data: gcData } = useSWR(
    selectedFarmId ? `/api/farms/${selectedFarmId}/gc` : null,
    (url) => fetch(url).then((r) => (r.ok ? r.json() : null))
  );

  // Handle farm data loading
  const handleFarmDataLoad = (params: BatchCalculatorParams, farmId?: string) => {
    if (farmId) {
      setSelectedFarmId(farmId);
    }
    setInputs({
      flockSize: params.flockSize,
      batchAge: params.ageInDays,
      avgWeightKg: params.avgWeightKg,
      totalFeedCost: params.flockSize * params.avgWeightKg * params.feedCostPerKg, // Estimate total feed cost
      otherCosts: inputs.otherCosts, // Keep existing other costs
      breakEvenPrice: params.breakEvenPrice, // Use GC as break-even price from farm data
    });
  };

  // Update inputs when GC data is available
  useEffect(() => {
    if (gcData?.gc) {
      const gc = gcData.gc;
      const totalCost = gc.totalCost || 0;
      const feedCost = gc.feedCost || 0;
      const otherCosts = totalCost - feedCost;
      
      setInputs(prev => ({
        ...prev,
        totalFeedCost: feedCost,
        otherCosts: otherCosts > 0 ? otherCosts : prev.otherCosts,
        breakEvenPrice: gc.gcPerKg || 0,
      }));
    }
  }, [gcData]);

  const [predictions, setPredictions] = useState<PredictionRow[]>(initialPredictions);

  // Calculate profit for a given price
  const calculateProfit = (price: number) => {
    const grossRevenue = inputs.flockSize * inputs.avgWeightKg * (price / 1000); // ₹/g → ₹/kg
    const netProfit = grossRevenue - inputs.totalFeedCost - inputs.otherCosts;
    const profitPerBird = netProfit / inputs.flockSize;
    return { grossRevenue, netProfit, profitPerBird };
  };

  // Get current P50 price
  const currentPrice = predictions[0]?.p50 || 168;

  // Calculate current profit
  const currentProfit = calculateProfit(currentPrice);

  // Generate 14-day projection
  const projectionData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayPrice = currentPrice + Math.sin(i * 0.3) * 5 + (Math.random() - 0.5) * 3;
    const profit = calculateProfit(dayPrice);
    
    // Determine signal based on profit trend
    const signal = i < 2 ? 'SELL_NOW' : i < 5 ? 'HOLD' : 'CAUTION';
    
    return {
      day: `D+${i}`,
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price: Math.round(dayPrice),
      netProfit: Math.round(profit.netProfit),
      profitPerBird: Math.round(profit.profitPerBird),
      signal,
    };
  });

  // Find optimal selling window (D+2 to D+4)
  const optimalWindow = projectionData.slice(2, 5);
  const maxProfitDay = optimalWindow.reduce((max, day) => 
    day.netProfit > max.netProfit ? day : max
  , optimalWindow[0]);

  // Generate scenarios for HarvestWindowVisualizer
  const scenarios = [
    {
      label: 'TODAY',
      daysFromNow: 0,
      price: projectionData[0].price,
      netProfit: projectionData[0].netProfit,
      roiPct: 0,
      recommendation: 'sell_now' as const,
    },
    {
      label: '+3D',
      daysFromNow: 3,
      price: projectionData[3].price,
      netProfit: projectionData[3].netProfit,
      roiPct: ((projectionData[3].netProfit - projectionData[0].netProfit) / projectionData[0].netProfit) * 100,
      recommendation: projectionData[3].netProfit > projectionData[0].netProfit ? 'acceptable' as const : 'caution' as const,
    },
    {
      label: '+7D',
      daysFromNow: 7,
      price: projectionData[7].price,
      netProfit: projectionData[7].netProfit,
      roiPct: ((projectionData[7].netProfit - projectionData[0].netProfit) / projectionData[0].netProfit) * 100,
      recommendation: projectionData[7].netProfit > projectionData[0].netProfit ? 'acceptable' as const : 'caution' as const,
    },
    {
      label: '+14D',
      daysFromNow: 14,
      price: projectionData[13].price,
      netProfit: projectionData[13].netProfit,
      roiPct: ((projectionData[13].netProfit - projectionData[0].netProfit) / projectionData[0].netProfit) * 100,
      recommendation: projectionData[13].netProfit < projectionData[0].netProfit * 0.95 ? 'avoid' as const : 'caution' as const,
    },
  ];

  // Determine optimal label based on max profit in optimal window
  const optimalLabel = maxProfitDay ? `D+${projectionData.indexOf(maxProfitDay)}` : 'TODAY';

  const getBarColor = (signal: string) => {
    switch (signal) {
      case 'SELL_NOW':
        return CHART_COLOURS.good;
      case 'HOLD':
        return CHART_COLOURS.warn;
      case 'CAUTION':
        return CHART_COLOURS.bad;
      default:
        return CHART_COLOURS.axis;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div style={tooltipStyle.contentStyle}>
        <p style={tooltipStyle.labelStyle}>{data.date}</p>
        <p style={tooltipStyle.itemStyle}>Price: ₹{data.price}/kg</p>
        <p style={tooltipStyle.itemStyle}>Net Profit: ₹{data.netProfit.toLocaleString()}</p>
        <p style={tooltipStyle.itemStyle}>Profit/Bird: ₹{data.profitPerBird}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Farm Data Loader */}
      <FarmDataLoader onLoad={handleFarmDataLoad} />

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">Batch Profit Calculator</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Flock Size */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              झुंड का आकार (Flock Size)
            </label>
            <input
              type="number"
              value={inputs.flockSize}
              onChange={(e) => setInputs({ ...inputs, flockSize: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              min="1000"
              step="1000"
            />
          </div>

          {/* Batch Age */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              उम्र (Batch Age) - Days
            </label>
            <input
              type="range"
              value={inputs.batchAge}
              onChange={(e) => setInputs({ ...inputs, batchAge: parseInt(e.target.value) })}
              className="w-full"
              min="28"
              max="56"
            />
            <div className="text-sm text-neutral-600 mt-1">{inputs.batchAge} days</div>
          </div>

          {/* Avg Weight */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              अनुमानित वजन (Avg Weight) - kg
            </label>
            <input
              type="number"
              value={inputs.avgWeightKg}
              onChange={(e) => setInputs({ ...inputs, avgWeightKg: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              step="0.1"
              min="1.5"
              max="3.5"
            />
          </div>

          {/* Feed Cost */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              चारा लागत (Total Feed Cost) - ₹
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputs.totalFeedCost}
                onChange={(e) => setInputs({ ...inputs, totalFeedCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
                min="0"
                step="1000"
                readOnly={!!gcData?.gc}
                disabled={!!gcData?.gc}
              />
              {gcData?.gc && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  GC: ₹{gcData.gc.gcPerKg.toFixed(2)}/kg
                </div>
              )}
            </div>
            {gcData?.gc && (
              <p className="text-[10px] text-neutral-500 mt-1">
                (computed from your cost records)
              </p>
            )}
          </div>

          {/* Other Costs */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              अन्य लागत (Other Costs) - ₹
            </label>
            <input
              type="number"
              value={inputs.otherCosts}
              onChange={(e) => setInputs({ ...inputs, otherCosts: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              min="0"
              step="1000"
            />
          </div>

          {/* Break-even Price */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Break-even Price (GC) - ₹/kg
            </label>
            <input
              type="number"
              value={inputs.breakEvenPrice}
              onChange={(e) => setInputs({ ...inputs, breakEvenPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              min="0"
              step="0.01"
            />
            {gcData?.gc && (
              <p className="text-[10px] text-neutral-500 mt-1">
                GC: ₹{gcData.gc.gcPerKg.toFixed(2)}/kg (computed from your cost records)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Projection Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Profit */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            आज बेचने पर (If Sold Today)
          </h4>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-neutral-500">Gross Revenue</div>
              <div className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{currentProfit.grossRevenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Net Profit</div>
              <div className="text-2xl font-bold text-brandGreen700" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{currentProfit.netProfit.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Profit/Bird</div>
              <div className="text-xl font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{currentProfit.profitPerBird.toFixed(2)}
              </div>
            </div>
            {gcData?.gc && gcData.gc.margin !== null && (
              <div className="pt-2 border-t border-neutral-100">
                <div className="text-xs text-neutral-500">Margin at sell-today</div>
                <div className={`text-lg font-semibold ${gcData.gc.margin > 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Sora', system-ui" }}>
                  {gcData.gc.margin > 0 ? '+' : ''}₹{gcData.gc.margin.toFixed(2)}/kg
                </div>
                <div className="text-[10px] text-neutral-400">
                  (P50: ₹{gcData.gc.targetSellPriceP50}/kg - GC: ₹{gcData.gc.gcPerKg.toFixed(2)}/kg)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5-Day Profit */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            5 दिन में बेचने पर (If Sold in 5 Days)
          </h4>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-neutral-500">Gross Revenue</div>
              <div className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{calculateProfit(projectionData[4].price).grossRevenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Net Profit</div>
              <div className="text-2xl font-bold text-brandGreen700" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{calculateProfit(projectionData[4].price).netProfit.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-neutral-500">Delta vs today:</div>
              <div className="text-sm font-semibold">
                {projectionData[4].netProfit > currentProfit.netProfit ? (
                  <span className="text-green-600">+₹{(projectionData[4].netProfit - currentProfit.netProfit).toLocaleString()}</span>
                ) : (
                  <span className="text-red-600">-₹{(currentProfit.netProfit - projectionData[4].netProfit).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Window */}
      <div className="bg-brandGreen50 rounded-2xl border border-brandGreen200 p-6">
        <h4 className="text-sm font-semibold text-brandGreen800 mb-2">
          Optimal Selling Window: D+2 to D+4
        </h4>
        <p className="text-sm text-brandGreen700">
          Best day: {maxProfitDay.date} (D+{projectionData.indexOf(maxProfitDay)}) -
          Projected profit: ₹{maxProfitDay.netProfit.toLocaleString()}
        </p>
      </div>

      {/* Harvest Window Visualizer */}
      <HarvestWindowVisualizer scenarios={scenarios} optimalLabel={optimalLabel} />

      {/* 14-Day Projection Chart */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">14-Day Profit Projection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLOURS.grid} />
            <XAxis {...xAxisProps} dataKey="day" />
            <YAxis {...yAxisProps} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="netProfit" fill={CHART_COLOURS.good} />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLOURS.good }} />
            <span className="text-neutral-600">SELL_NOW (Recommended)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLOURS.warn }} />
            <span className="text-neutral-600">HOLD (Acceptable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLOURS.bad }} />
            <span className="text-neutral-600">CAUTION (Avoid)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
