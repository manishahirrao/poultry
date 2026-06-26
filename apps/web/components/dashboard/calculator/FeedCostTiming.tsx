'use client';

import { useState } from 'react';
import { TrendUp, TrendDown, CaretDown } from '@phosphor-icons/react';

export function FeedCostTiming() {
  const [inputs, setInputs] = useState({
    currentBatchSize: 10000,
    currentBatchAge: 35,
  });

  // Mock commodity prices
  const commodityPrices = {
    maize: { current: 2200, trend: 'up', change: 50 },
    soybean: { current: 3800, trend: 'down', change: -30 },
    broilerFeed: { current: 4200, trend: 'up', change: 80 },
  };

  const [showDetails, setShowDetails] = useState(false);

  // Calculate feed requirement for next 30 days
  const calculateFeedRequirement = () => {
    // Approximate feed consumption: 150g/bird/day average
    const dailyFeed = Number(inputs.currentBatchSize) * 0.15; // kg
    const monthlyFeed = dailyFeed * 30; // kg
    const monthlyFeedQtls = monthlyFeed / 100; // quintals
    
    return {
      dailyFeed: Math.round(dailyFeed),
      monthlyFeed: Math.round(monthlyFeed),
      monthlyFeedQtls: monthlyFeedQtls.toFixed(1),
    };
  };

  const feedReq = calculateFeedRequirement();

  // Calculate total cost
  const calculateTotalCost = () => {
    const broilerFeedCost = Number(feedReq.monthlyFeedQtls) * commodityPrices.broilerFeed.current;
    return Math.round(broilerFeedCost);
  };

  const totalCost = calculateTotalCost();

  // Recommendation based on trend
  const getRecommendation = () => {
    if (commodityPrices.broilerFeed.trend === 'up') {
      return {
        action: 'अभी खरीदें',
        reason: 'Prices trending up - buy now to lock in lower rates',
        savings: Math.round(Number(feedReq.monthlyFeedQtls) * 40), // Estimated savings if bought now vs later
      };
    }
    return {
      action: '3 दिन रुकें',
      reason: 'Prices expected to dip - wait for better rates',
      savings: Math.round(Number(feedReq.monthlyFeedQtls) * 30),
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-6">
      {/* Feed Requirement Calculator */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">
          अगले 30 दिनों में चारे की ज़रूरत
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Current Batch Size
            </label>
            <input
              type="number"
              value={inputs.currentBatchSize}
              onChange={(e) => setInputs({ ...inputs, currentBatchSize: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              min="1000"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Current Batch Age (Days)
            </label>
            <input
              type="number"
              value={inputs.currentBatchAge}
              onChange={(e) => setInputs({ ...inputs, currentBatchAge: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              min="1"
              max="56"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl">
          <div className="text-center">
            <div className="text-xs text-neutral-500 mb-1">Daily Feed</div>
            <div className="text-xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
              {feedReq.dailyFeed} kg
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500 mb-1">Monthly Feed</div>
            <div className="text-xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
              {feedReq.monthlyFeed} kg
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500 mb-1">In Quintals</div>
            <div className="text-xl font-bold text-brandGreen700" style={{ fontFamily: "'Sora', system-ui" }}>
              {feedReq.monthlyFeedQtls} qtl
            </div>
          </div>
        </div>
      </div>

      {/* Commodity Prices */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">
            Feed Commodity Prices
          </h3>
          <span className="text-xs text-neutral-500">
            Source: AgMarknet (updated daily)
          </span>
        </div>

        <div className="space-y-4">
          {/* Maize */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900">Maize (Corn)</div>
              <div className="text-xs text-neutral-500">Per quintal</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{commodityPrices.maize.current}
              </div>
              <div className={`text-xs flex items-center justify-end gap-1 ${
                commodityPrices.maize.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {commodityPrices.maize.change > 0 ? <TrendUp size={12} /> : <TrendDown size={12} />}
                {commodityPrices.maize.change > 0 ? '+' : ''}{commodityPrices.maize.change}
              </div>
            </div>
          </div>

          {/* Soybean */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900">Soybean Meal</div>
              <div className="text-xs text-neutral-500">Per quintal</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{commodityPrices.soybean.current}
              </div>
              <div className={`text-xs flex items-center justify-end gap-1 ${
                commodityPrices.soybean.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {commodityPrices.soybean.change > 0 ? <TrendUp size={12} /> : <TrendDown size={12} />}
                {commodityPrices.soybean.change > 0 ? '+' : ''}{commodityPrices.soybean.change}
              </div>
            </div>
          </div>

          {/* Broiler Feed */}
          <div className="flex items-center justify-between p-4 bg-brandGreen50 rounded-xl border border-brandGreen200">
            <div className="flex-1">
              <div className="text-sm font-semibold text-brandGreen800">Broiler Feed Complete</div>
              <div className="text-xs text-brandGreen600">Per quintal</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-brandGreen800" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{commodityPrices.broilerFeed.current}
              </div>
              <div className={`text-xs flex items-center justify-end gap-1 text-brandGreen600`}>
                <TrendUp size={12} />
                +{commodityPrices.broilerFeed.change}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">
          Recommendation
        </h3>

        <div className={`p-4 rounded-xl ${
          recommendation.action === 'अभी खरीदें' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              recommendation.action === 'अभी खरीदें'
                ? 'bg-green-200 text-green-700'
                : 'bg-amber-200 text-amber-700'
            }`}>
              {recommendation.action === 'अभी खरीदें' ? (
                <TrendUp size={20} weight="bold" />
              ) : (
                <TrendDown size={20} weight="bold" />
              )}
            </div>
            <div className="flex-1">
              <div className={`text-lg font-bold mb-1 ${
                recommendation.action === 'अभी खरीदें'
                  ? 'text-green-800'
                  : 'text-amber-800'
              }`}>
                {recommendation.action}
              </div>
              <div className="text-sm text-neutral-700 mb-2">
                {recommendation.reason}
              </div>
              <div className="text-sm font-semibold">
                Potential Savings: ₹{recommendation.savings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-800"
        >
          {showDetails ? 'Hide' : 'Show'} Cost Breakdown
          <CaretDown size={16} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {showDetails && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Feed Required:</span>
              <span className="font-semibold text-neutral-900">{feedReq.monthlyFeedQtls} qtl</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Rate:</span>
              <span className="font-semibold text-neutral-900">₹{commodityPrices.broilerFeed.current}/qtl</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Total Cost:</span>
              <span className="font-bold text-brandGreen700" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
