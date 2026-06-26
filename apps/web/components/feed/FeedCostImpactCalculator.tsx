'use client';

import { useState } from 'react';
import { Calculator, TrendUp, TrendDown } from '@phosphor-icons/react';

interface CommodityPrice {
  price: number;
  delta: number;
  trend: 'up' | 'down' | 'flat';
}

interface CommodityData {
  maize: CommodityPrice;
  soya: CommodityPrice;
  palmOil: CommodityPrice;
  composite: CommodityPrice;
}

interface ForecastData {
  date: string;
  maizeActual?: number;
  maizeForecast?: number;
  soyaActual?: number;
  soyaForecast?: number;
}

interface FeedCostImpactCalculatorProps {
  commodities: CommodityData;
  forecast: ForecastData[];
}

export function FeedCostImpactCalculator({
  commodities,
  forecast,
}: FeedCostImpactCalculatorProps) {
  const [inputs, setInputs] = useState({
    currentCost: 2850, // ₹ per quintal
    procurementVolume: 10, // tonnes
    waitDays: 7,
  });

  // Calculate impact based on forecast
  const calculateImpact = () => {
    const todayPrice = commodities.composite.price;
    // Use composite price trend to estimate future price
    const priceChangePerDay = (commodities.composite.delta / 7); // Assuming 7-day delta
    const futurePrice = todayPrice + (priceChangePerDay * inputs.waitDays);
    
    const currentTotalCost = inputs.currentCost * inputs.procurementVolume * 10; // tonnes to quintals
    const futureTotalCost = futurePrice * inputs.procurementVolume * 10;
    const delta = futureTotalCost - currentTotalCost;
    
    return {
      currentTotalCost,
      futureTotalCost,
      delta,
      deltaPercent: ((delta / currentTotalCost) * 100).toFixed(1),
    };
  };

  const impact = calculateImpact();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Current Feed Cost (₹/quintal)
          </label>
          <input
            type="number"
            value={inputs.currentCost}
            onChange={(e) =>
              setInputs({ ...inputs, currentCost: Number(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-500"
            min="1000"
            step="50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Procurement Volume (tonnes)
          </label>
          <input
            type="number"
            value={inputs.procurementVolume}
            onChange={(e) =>
              setInputs({ ...inputs, procurementVolume: Number(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-500"
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Wait Period (days)
          </label>
          <input
            type="number"
            value={inputs.waitDays}
            onChange={(e) =>
              setInputs({ ...inputs, waitDays: Math.min(14, Math.max(1, Number(e.target.value) || 0)) })
            }
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-500"
            min="1"
            max="14"
            step="1"
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Cost if bought today:</span>
          <span className="font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
            ₹{impact.currentTotalCost.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">
            Cost if bought in {inputs.waitDays} days:
          </span>
          <span className="font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
            ₹{impact.futureTotalCost.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <span className="text-sm font-semibold text-neutral-900">Impact:</span>
          <div className="flex items-center gap-2">
            {impact.delta > 0 ? (
              <TrendUp size={16} className="text-red-600" />
            ) : impact.delta < 0 ? (
              <TrendDown size={16} className="text-green-600" />
            ) : null}
            <span
              className={`font-bold ${
                impact.delta > 0 ? 'text-red-600' : impact.delta < 0 ? 'text-green-600' : 'text-neutral-600'
              }`}
              style={{ fontFamily: "'Sora', system-ui" }}
            >
              {impact.delta > 0 ? '+' : ''}₹{impact.delta.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500">
              ({impact.delta > 0 ? '+' : ''}{impact.deltaPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`p-4 rounded-xl flex items-center gap-3 ${
          impact.delta < 0
            ? 'bg-green-50 border border-green-200'
            : impact.delta > 0
            ? 'bg-red-50 border border-red-200'
            : 'bg-neutral-50 border border-neutral-200'
        }`}
      >
        <Calculator size={24} className={impact.delta < 0 ? 'text-green-600' : impact.delta > 0 ? 'text-red-600' : 'text-neutral-600'} />
        <div>
          <div className="text-sm font-semibold text-neutral-900">
            {impact.delta < 0
              ? 'Recommendation: Wait to save money'
              : impact.delta > 0
              ? 'Recommendation: Buy now to avoid higher costs'
              : 'Recommendation: No significant difference'}
          </div>
          <div className="text-xs text-neutral-600">
            Based on {inputs.waitDays}-day commodity price forecast
          </div>
        </div>
      </div>
    </div>
  );
}
