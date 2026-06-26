'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

interface HarvestWindowBannerProps {
  currentWeightG: number;
  targetWeightG: number;
  batchDayNumber: number;
  placementDate: Date;
  farmMandiId: string;
  farmId: string;
}

interface PriceForecastData {
  p50: number;
  sellSignal?: 'SELL_NOW' | 'HOLD' | 'CAUTION';
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch price forecast');
  }
  return response.json();
};

export function HarvestWindowBanner({
  currentWeightG,
  targetWeightG,
  batchDayNumber,
  placementDate,
  farmMandiId,
  farmId,
}: HarvestWindowBannerProps) {
  const [windowStart, setWindowStart] = useState<Date | null>(null);
  const [windowEnd, setWindowEnd] = useState<Date | null>(null);
  const [pctComplete, setPctComplete] = useState(0);

  // VISIBILITY CONDITION: only show when currentWeight >= 85% of targetWeight
  const weightThreshold = targetWeightG * 0.85;
  if (currentWeightG < weightThreshold) {
    return null;
  }

  // Calculate harvest window on mount
  useEffect(() => {
    // Standard broiler ADG = 50-60g/day in weeks 4-6
    const avgDailyGain = 55; // Average of 50-60g/day
    
    // Days to target = (targetWeightG - currentWeightG) / avgDailyGain
    const daysToTarget = Math.ceil((targetWeightG - currentWeightG) / avgDailyGain);
    
    // Window = today + daysToTarget ± 2 days
    const today = new Date();
    const startOffset = Math.max(0, daysToTarget - 2);
    const endOffset = daysToTarget + 2;
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + startOffset);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + endOffset);
    
    setWindowStart(startDate);
    setWindowEnd(endDate);
    setPctComplete((currentWeightG / targetWeightG) * 100);
  }, [currentWeightG, targetWeightG]);

  // FETCH PRICE FORECAST for harvest window dates
  const { data: priceForecast } = useSWR<PriceForecastData>(
    windowStart && windowEnd && farmMandiId
      ? `/api/price-intelligence/forecast?mandi=${farmMandiId}&startDate=${windowStart.toISOString().split('T')[0]}&endDate=${windowEnd.toISOString().split('T')[0]}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // 5-minute refresh
    }
  );

  if (!windowStart || !windowEnd) {
    return null;
  }

  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-[#EDF7F1] border border-[#3DAE72] rounded-xl p-4 flex items-center gap-4">
      <span className="text-2xl">🌟</span>
      <div className="flex-1">
        <h3 className="font-semibold text-[#1A5C34]">
          Harvest Window: Est. {formatDate(windowStart)}–{formatDate(windowEnd)}
        </h3>
        <p className="text-sm text-gray-600">
          Current: {currentWeightG}g | Target: {targetWeightG}g ({pctComplete.toFixed(0)}% of target)
        </p>
        {priceForecast && (
          <p className="text-sm font-semibold text-[#1A5C34]">
            Price forecast for this window: P50 ₹{priceForecast.p50.toFixed(0)}/kg
            {priceForecast.sellSignal === 'SELL_NOW' && ' — आज बेचें ✓'}
          </p>
        )}
      </div>
      <Link
        href={`/dashboard/calculator?farmId=${farmId}`}
        className="ml-auto text-sm underline text-[#1A5C34] hover:text-[#25874D] transition-colors"
      >
        Calculate ROI →
      </Link>
    </div>
  );
}
