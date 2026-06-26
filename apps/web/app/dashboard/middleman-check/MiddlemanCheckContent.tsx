'use client';

import { useState } from 'react';
import { Handshake, ChartLineUp, Warning, CheckCircle } from '@phosphor-icons/react';
import { SpreadHistoryChart } from './components/SpreadHistoryChart';
import { NegotiationScriptCard } from './components/NegotiationScriptCard';
import { FeatureGate } from '@/components/plans/FeatureGate';
import { FEATURES } from '@/lib/plans/featureGates';

interface MiddlemanCheckContentProps {
  benchmarkData: any;
}

export default function MiddlemanCheckContent({ benchmarkData }: MiddlemanCheckContentProps) {
  const [middlemanPrice, setMiddlemanPrice] = useState(170); // Mock middleman price for demo
  const benchmark = benchmarkData?.benchmark || 162;
  const spread = middlemanPrice - benchmark;
  const spreadPercent = ((spread / benchmark) * 100).toFixed(1);
  const isFair = parseFloat(spreadPercent) < 5;
  
  // Determine verdict for negotiation script
  const verdict: 'fair' | 'caution' | 'exploit' = 
    parseFloat(spreadPercent) < 5 ? 'fair' :
    parseFloat(spreadPercent) < 8 ? 'caution' : 'exploit';

  const handleCompare = () => {
    // In a real implementation, this would trigger a comparison
    // For now, the comparison is already calculated reactively
    console.log('Comparing price:', middlemanPrice);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Middleman Check</h1>
        <p className="text-sm text-gray-600 mt-1">
          Compare middleman prices against mandi benchmarks to ensure fair pricing
        </p>
      </div>

      {/* Price Comparison Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Handshake size={24} className="text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Price Comparison</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mandi Benchmark */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Mandi Benchmark</p>
            <p className="text-3xl font-bold text-gray-900">₹{benchmark}/kg</p>
            <p className="text-xs text-gray-500 mt-1">
              {benchmarkData?.source === 'prediction_adjusted' ? 'Based on predictions' : 'Default fallback'}
            </p>
          </div>

          {/* Middleman Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Middleman Price</p>
            <p className="text-3xl font-bold text-gray-900">₹{middlemanPrice}/kg</p>
            <p className="text-xs text-gray-500 mt-1">Enter your actual price</p>
          </div>

          {/* Spread */}
          <div className={`rounded-lg p-4 ${isFair ? 'bg-green-50' : 'bg-amber-50'}`}>
            <p className="text-sm text-gray-600 mb-2">Spread</p>
            <p className={`text-3xl font-bold ${isFair ? 'text-green-700' : 'text-amber-700'}`}>
              {spread > 0 ? '+' : ''}₹{spread}/kg
            </p>
            <p className={`text-xs mt-1 ${isFair ? 'text-green-600' : 'text-amber-600'}`}>
              {spreadPercent}% {isFair ? 'Fair' : 'High'}
            </p>
          </div>
        </div>
      </div>

      {/* Fairness Indicator */}
      <div className={`bg-white border rounded-lg p-6 ${isFair ? 'border-green-200' : 'border-amber-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isFair ? 'bg-green-100' : 'bg-amber-100'}`}>
            {isFair ? (
              <CheckCircle size={24} className="text-green-700" />
            ) : (
              <Warning size={24} className="text-amber-700" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${isFair ? 'text-green-900' : 'text-amber-900'}`}>
              {isFair ? 'Fair Pricing' : 'Price Above Benchmark'}
            </h3>
            <p className={`text-sm ${isFair ? 'text-green-700' : 'text-amber-700'}`}>
              {isFair
                ? `The middleman price is within acceptable range (${spreadPercent}% spread). This appears to be fair market pricing.`
                : `The middleman price is ${spreadPercent}% above the mandi benchmark. Consider negotiating for a better rate or exploring alternative buyers.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Negotiation Script Card */}
      <FeatureGate feature={FEATURES.NEGOTIATION_SCRIPT_AI} blurChildren>
        <NegotiationScriptCard
          mandiP50={benchmark}
          middlemanPrice={middlemanPrice}
          spread={spread}
          spreadPct={parseFloat(spreadPercent)}
          verdict={verdict}
        />
      </FeatureGate>

      {/* 30-Day Spread History Chart */}
      <FeatureGate feature={FEATURES.MIDDLEMAN_SPREAD_HISTORY} blurChildren>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <SpreadHistoryChart mandiId={benchmarkData?.district || 'gorakhpur'} />
        </div>
      </FeatureGate>

      {/* Price Input Form (Demo) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Check Your Price</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="priceInput" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Middleman Price (₹/kg)
            </label>
            <input
              type="number"
              id="priceInput"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter price per kg"
              value={middlemanPrice}
              onChange={(e) => setMiddlemanPrice(Number(e.target.value))}
            />
          </div>
          <button 
            onClick={handleCompare}
            className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors mt-6"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
