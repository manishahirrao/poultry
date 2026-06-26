'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { 
  calculateSellHoldMatrix, 
  isBelowBreakEven, 
  RoiCalculatorInputs, 
  PriceForecast, 
  SellHoldRow 
} from '@/lib/roiCalculator';
import { createClient } from '@supabase/supabase-js';

interface BatchRoiOptimizerProps {
  initialInputs?: Partial<RoiCalculatorInputs>;
  initialForecast?: PriceForecast;
  batchId?: string; // For auto-population from batch data
}

export function BatchRoiOptimizer({ 
  initialInputs, 
  initialForecast,
  batchId 
}: BatchRoiOptimizerProps) {
  // Note: Using standard Supabase client for batch data loading
  // In production, this should use the auth-helpers pattern for proper session management
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Input state
  const [inputs, setInputs] = useState<RoiCalculatorInputs>({
    flockSize: initialInputs?.flockSize || 25000,
    ageDays: initialInputs?.ageDays || 38,
    avgWeightKg: initialInputs?.avgWeightKg || 1.8,
    feedCostPerKg: initialInputs?.feedCostPerKg || 58,
    overheadCostPerBirdPerDay: initialInputs?.overheadCostPerBirdPerDay || 0.50,
  });

  // Forecast state (mock data - will come from API)
  const [forecast, setForecast] = useState<PriceForecast>(initialForecast || {
    p10: 158.00,
    p50: 162.40,
    p90: 168.00,
  });

  // Load batch data when batchId is provided (TASK-030 integration)
  useEffect(() => {
    if (batchId) {
      loadBatchData(batchId);
    }
  }, [batchId]);

  const loadBatchData = async (id: string) => {


    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('batch_id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Calculate age in days
        const ageDays = Math.floor((new Date().getTime() - new Date(data.doc_placement_date).getTime()) / (1000 * 60 * 60 * 24));
        
        // Auto-populate inputs from batch data
        setInputs(prev => ({
          ...prev,
          flockSize: data.current_bird_count || data.doc_count,
          ageDays: ageDays > 0 ? ageDays : 1,
          avgWeightKg: data.current_avg_weight_kg || data.target_harvest_weight_kg * 0.8, // Estimate if no weight data
        }));
      }
    } catch (err) {
      console.error('Failed to load batch data:', err);
    }
  };

  // Trader offer state
  const [traderOffer, setTraderOffer] = useState<number>(0);

  // Calculator result state
  const [result, setResult] = useState<ReturnType<typeof calculateSellHoldMatrix> | null>(null);

  // Persist to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('batchOptimizerInputs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setInputs(parsed);
        } catch (e) {
          console.error('Failed to parse saved inputs:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('batchOptimizerInputs', JSON.stringify(inputs));
    }
  }, [inputs]);

  // Calculate ROI whenever inputs or forecast change
  useEffect(() => {
    const startTime = performance.now();
    const calculationResult = calculateSellHoldMatrix(inputs, forecast);
    const endTime = performance.now();
    
    // Log performance for monitoring (should be < 50ms per REQ-003 §3.7)
    const calculationTime = endTime - startTime;
    if (calculationTime > 50) {
      console.warn(`ROI calculation took ${calculationTime.toFixed(2)}ms (target: <50ms)`);
    }
    
    setResult(calculationResult);
  }, [inputs, forecast]);

  const handleInputChange = useCallback((field: keyof RoiCalculatorInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTraderOfferChange = useCallback((value: number) => {
    setTraderOffer(value);
  }, []);

  if (!result) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  const belowBreakEven = traderOffer > 0 && isBelowBreakEven(traderOffer, inputs);

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Batch Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Flock Size (birds)
            </label>
            <input
              type="number"
              value={inputs.flockSize}
              onChange={(e) => handleInputChange('flockSize', Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green-700 focus:border-transparent"
              min="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Age (days)
            </label>
            <input
              type="number"
              value={inputs.ageDays}
              onChange={(e) => handleInputChange('ageDays', Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green-700 focus:border-transparent"
              min="28"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Avg Weight (kg/bird)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.avgWeightKg}
              onChange={(e) => handleInputChange('avgWeightKg', Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green-700 focus:border-transparent"
              min="1.0"
              max="3.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Feed Cost (₹/kg)
            </label>
            <input
              type="number"
              value={inputs.feedCostPerKg}
              onChange={(e) => handleInputChange('feedCostPerKg', Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green-700 focus:border-transparent"
              min="40"
              max="80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Overhead Cost (₹/bird/day)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.overheadCostPerBirdPerDay}
              onChange={(e) => handleInputChange('overheadCostPerBirdPerDay', Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green-700 focus:border-transparent"
              min="0"
              max="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Trader Offer (₹/kg)
            </label>
            <input
              type="number"
              value={traderOffer || ''}
              onChange={(e) => handleTraderOfferChange(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green-700 focus:border-transparent ${
                belowBreakEven ? 'border-red-500 bg-red-50' : 'border-neutral-300'
              }`}
              min="100"
              max="200"
            />
            {belowBreakEven && (
              <p className="text-xs text-red-600 mt-1">
                🔴 Below Break-Even — Do Not Sell at This Price
              </p>
            )}
          </div>
        </div>

        {/* Break-Even Info */}
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Break-Even Price:</span>
            <span className="text-lg font-semibold text-neutral-900">
              ₹{result.breakEvenPrice.toFixed(2)}/kg
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Formula: (total_feed_cost + overhead_cost) / (flock_size × avg_weight)
          </p>
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Sell vs Hold Decision Matrix
          </h3>
          {result.optimalScenario && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ⭐ Optimal: {result.optimalScenario.toUpperCase()}
            </div>
          )}
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 px-3 font-medium text-neutral-900">Scenario</th>
                <th className="text-right py-2 px-3 font-medium text-neutral-900">Price (P50)</th>
                <th className="text-right py-2 px-3 font-medium text-neutral-900">Revenue (₹)</th>
                <th className="text-right py-2 px-3 font-medium text-neutral-900">Feed Cost (₹)</th>
                <th className="text-right py-2 px-3 font-medium text-neutral-900">Mortality Cost (₹)</th>
                <th className="text-right py-2 px-3 font-medium text-neutral-900">Net Profit (₹)</th>
                <th className="text-right py-2 px-3 font-medium text-neutral-900">ROI %</th>
              </tr>
            </thead>
            <tbody>
              {result.sellHoldMatrix.map((row) => (
                <tr 
                  key={row.scenario}
                  className={`border-b border-neutral-100 ${
                    row.isOptimal ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.scenario.toUpperCase()}</span>
                      {row.isOptimal && <span>⭐</span>}
                    </div>
                  </td>
                  <td className="text-right py-2 px-3">
                    ₹{row.projectedPrice.p50.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-3">
                    ₹{row.revenue.base.toLocaleString()}
                  </td>
                  <td className="text-right py-2 px-3 text-red-600">
                    -₹{row.feedCost.toLocaleString()}
                  </td>
                  <td className="text-right py-2 px-3 text-red-600">
                    -₹{row.mortalityCost.toLocaleString()}
                  </td>
                  <td className={`text-right py-2 px-3 font-semibold ${
                    row.netProfit.base > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{row.netProfit.base.toLocaleString()}
                  </td>
                  <td className="text-right py-2 px-3">
                    {row.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Profit Waterfall Chart */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">Profit Waterfall Analysis</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.profitWaterfall}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#1C2B22',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                />
                <ReferenceLine y={0} stroke="#7A9C8A" strokeWidth={2} />
                <Bar dataKey="pessimistic" fill="#C0392B" name="Pessimistic" />
                <Bar dataKey="base" fill="#1A6B3C" name="Base (P50)" />
                <Bar dataKey="optimistic" fill="#2ECC71" name="Optimistic" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
