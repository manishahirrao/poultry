'use client';

import { useState } from 'react';
import { PencilSimple, Info } from '@phosphor-icons/react';

interface PLSummary {
  chick_total: number;
  feed_total: number;
  medicine_total: number;
  labour_total: number;
  overhead_total: number;
  other_total: number;
  grand_total: number;
  live_cost_per_bird: number;
  estimated_revenue: number;
  target_margin: number;
  target_cost_per_bird: number;
  days_to_harvest: number;
  current_price_p50?: number;
}

interface PLSummaryBannerProps {
  plSummary: PLSummary;
  currency: string;
  batchDay: number;
  batchName: string;
}

export function PLSummaryBanner({ plSummary, currency, batchDay, batchName }: PLSummaryBannerProps) {
  const [targetMargin, setTargetMargin] = useState(plSummary.target_margin);
  const [isEditingMargin, setIsEditingMargin] = useState(false);
  const [showRevenueTooltip, setShowRevenueTooltip] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  const grossProfit = plSummary.estimated_revenue - plSummary.grand_total;
  
  // Calculate revenue if sold today at current P50 (GAP-015)
  const revenueAtP50 = plSummary.current_price_p50 
    ? plSummary.current_price_p50 * (plSummary.grand_total / plSummary.live_cost_per_bird) 
    : null;
  
  // Color logic for Live Cost/Bird based on spec
  const costColour = 
    plSummary.live_cost_per_bird <= plSummary.target_cost_per_bird ? '#16A34A' :
    plSummary.live_cost_per_bird <= plSummary.target_cost_per_bird * 1.1 ? '#D97706' : '#DC2626';

  // Calculate progress percentage based on batch day vs target harvest day
  const progressPercentage = Math.min((batchDay / (batchDay + plSummary.days_to_harvest)) * 100, 100);

  return (
    <div className="bg-white border-b border-[#E3EDE7] shadow-sm p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{batchName} · Day {batchDay}</h2>
        <p className="text-sm text-gray-600">Active Batch</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Revenue if Sold Today at P50 (GAP-015) */}
        {revenueAtP50 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Revenue at P50 / P50 पर आय</p>
            <p className="text-lg font-semibold text-blue-700" style={{ fontFamily: 'Sora, sans-serif' }}>
              {currency}{formatNumber(revenueAtP50)}
            </p>
            <p className="text-xs text-blue-600">If sold today</p>
          </div>
        )}

        {/* Est. Revenue */}
        <div className="bg-gray-50 rounded-lg p-3 relative">
          <p className="text-xs text-gray-600 mb-1">Est. Revenue / अनुमानित आय</p>
          <p className="text-lg font-semibold text-gray-400" style={{ fontFamily: 'Sora, sans-serif' }}>
            {currency}{formatNumber(plSummary.estimated_revenue)}
          </p>
          <p className="text-xs text-gray-500">(at harvest)</p>
        </div>

        {/* Total Cost */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Total Cost / कुल लागत</p>
          <p className="text-lg font-semibold text-green-700" style={{ fontFamily: 'Sora, sans-serif' }}>
            {currency}{formatNumber(plSummary.grand_total)}
          </p>
          <p className="text-xs text-green-600">● Tracked</p>
        </div>

        {/* Gross Profit */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Gross Profit / सकल लाभ</p>
          <p className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            {currency}{formatNumber(grossProfit)}
          </p>
          <p className="text-xs text-gray-500">(pre-harvest)</p>
        </div>

        {/* Live Cost/Bird */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Live Cost/Bird / प्रति पक्षी लागत</p>
          <p 
            className="text-lg font-semibold"
            style={{ color: costColour, fontFamily: 'Sora, sans-serif' }}
          >
            {currency}{plSummary.live_cost_per_bird.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">Target: ≤{currency}{plSummary.target_cost_per_bird.toFixed(0)} ✓</p>
        </div>

        {/* Target Margin */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-600">Target Margin / लक्ष्य मार्जिन</p>
            <button
              onClick={() => setIsEditingMargin(!isEditingMargin)}
              className="text-gray-400 hover:text-gray-600"
            >
              <PencilSimple size={14} />
            </button>
          </div>
          {isEditingMargin ? (
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              onBlur={() => setIsEditingMargin(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingMargin(false)}
              className="text-lg font-semibold text-gray-900 w-16 bg-transparent border-b border-gray-300 focus:outline-none focus:border-green-700"
              style={{ fontFamily: 'Sora, sans-serif' }}
              autoFocus
            />
          ) : (
            <p className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>{targetMargin}%</p>
          )}
        </div>

        {/* Days to Harvest */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Days to Harvest / कटाई तक दिन</p>
          <p className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            ~{plSummary.days_to_harvest} days
          </p>
          <a 
            href="#"
            className="text-xs text-green-600 hover:text-green-700"
            onClick={(e) => e.preventDefault()}
          >
            See Harvest Forecast →
          </a>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Progress</span>
          <span className="text-xs text-gray-600">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Cost is building — Harvest on time</p>
      </div>
    </div>
  );
}
