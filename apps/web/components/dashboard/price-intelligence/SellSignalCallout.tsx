'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface SellSignalCalloutProps {
  mandi: string;
}

interface OptimalWindowData {
  windowStart: string;
  windowEnd: string;
  expectedP50Min: number;
  expectedP50Max: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function SellSignalCallout({ mandi }: SellSignalCalloutProps) {
  const { data, error, isLoading } = useSWR<OptimalWindowData>(
    `/api/price-intelligence/optimal-window?mandi=${mandi}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000,
    }
  );

  if (isLoading) {
    return (
      <div className="border border-[#E3EDE7] rounded-xl p-4 bg-[#EDF7F1] animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-48 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-40"></div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getConfidenceStars = (confidence: string) => {
    const stars = confidence === 'HIGH' ? 5 : confidence === 'MEDIUM' ? 3 : 1;
    return '●'.repeat(stars) + '○'.repeat(5 - stars);
  };

  const getConfidenceColor = (confidence: string) => {
    return confidence === 'HIGH' ? 'text-green-600' : confidence === 'MEDIUM' ? 'text-amber-600' : 'text-red-600';
  };

  return (
    <div className="border border-[#E3EDE7] rounded-xl p-4 bg-[#EDF7F1]">
      <h3 className="text-sm font-semibold text-[#1A5C34] mb-2">📅 Optimal Sell Window</h3>
      <p className="text-sm text-gray-700 mb-1">
        {formatDate(data.windowStart)}–{formatDate(data.windowEnd)} (D+2 to D+5)
      </p>
      <p className="text-sm text-gray-700 mb-2">
        Expected P50: ₹{data.expectedP50Min}–₹{data.expectedP50Max}/kg
      </p>
      <p className={`text-xs font-semibold ${getConfidenceColor(data.confidence)}`}>
        Confidence: {getConfidenceStars(data.confidence)}
      </p>
    </div>
  );
}
