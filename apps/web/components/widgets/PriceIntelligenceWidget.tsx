// FlockIQ — Price Intelligence Widget
// File: apps/web/components/widgets/PriceIntelligenceWidget.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-01
// Design Reference: 11_industry_pages_components_master.md §4.1

'use client';

import useSWR from 'swr';
import { Warning, ArrowClockwise } from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj';

export interface PredictionData {
  mandi: string;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  confidence: number;
}

interface PriceIntelligenceWidgetProps {
  mandi: MandiSlug;
  showChart?: boolean;
  compact?: boolean;
  initialData?: PredictionData | null;
}

const MANDI_NAMES: Record<MandiSlug, string> = {
  gorakhpur: 'गोरखपुर',
  deoria: 'देवरिया',
  kushinagar: 'कुशीनगर',
  basti: 'बस्ती',
  maharajganj: 'महाराजगंज',
};

const SIGNAL_CONFIG = {
  SELL_NOW: {
    labelHi: '✅ आज बेचें',
    labelEn: '✅ Sell Today',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: '📈',
  },
  HOLD: {
    labelHi: '⏳ रुकें',
    labelEn: '⏳ Hold',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: '📊',
  },
  CAUTION: {
    labelHi: '⚠️ सावधान',
    labelEn: '⚠️ Caution',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: '📉',
  },
};

const fetcher = async (url: string): Promise<PredictionData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch prediction: ${response.statusText}`);
  }
  return response.json();
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'अभी';
  if (diffMins < 60) return `${diffMins} मिनट पहले`;
  if (diffHours < 24) return `${diffHours} घंटे पहले`;
  return `${Math.floor(diffHours / 24)} दिन पहले`;
};

export function PriceIntelligenceWidget({
  mandi,
  showChart = true,
  compact = false,
  initialData,
}: PriceIntelligenceWidgetProps) {
  const { data, error, isLoading, mutate } = useSWR<PredictionData>(
    `/api/public/predictions?mandi=${mandi}`,
    fetcher,
    {
      fallbackData: initialData || undefined,
      refreshInterval: 600_000,
      revalidateOnFocus: true,
    }
  );

  if (isLoading && !initialData) return <PriceWidgetSkeleton compact={compact} />;
  if (error && !data) return <PriceWidgetError mandi={mandi} onRetry={() => mutate()} />;
  if (!data) return <PriceWidgetEmpty />;

  const signal = SIGNAL_CONFIG[data.sell_signal];
  const isStale = new Date().getTime() - new Date(data.predicted_at).getTime() > 86_400_000;

  return (
    <div
      className={cn(
        signal.bg,
        signal.border,
        'border rounded-2xl relative',
        compact ? 'p-4' : 'p-6'
      )}
    >


      {/* Stale warning */}
      {isStale && (
        <div className="bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 mb-3 flex items-center gap-2">
          <Warning size={12} className="text-amber-600" />
          <span className="text-amber-700 text-xs">
            डेटा पुराना है — अगला update 6:30 AM पर
          </span>
        </div>
      )}

      {/* Mandi label */}
      <p className="text-xs font-semibold text-neutral-500 mb-1">
        {MANDI_NAMES[mandi]} · {formatRelativeTime(data.predicted_at)}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className={cn(
            'font-bold text-neutral-900 font-space-grotesk',
            compact ? 'text-2xl' : 'text-3xl'
          )}
        >
          ₹{data.p50}
        </span>
        <span className="text-sm text-neutral-500">/kg</span>
      </div>

      {/* P10–P90 range */}
      <p className="text-xs text-neutral-500 mb-3">
        Range: ₹{data.p10} – ₹{data.p90}/kg (P10–P90)
      </p>

      {/* Signal badge */}
      <span
        className={cn(
          'inline-block px-3 py-1 rounded-full text-sm font-semibold',
          signal.badge
        )}
      >
        {signal.labelHi}
      </span>

      {/* Confidence */}
      {!compact && (
        <p className="text-xs text-neutral-400 mt-2">
          Confidence: {Math.round(data.confidence * 100)}%
        </p>
      )}

      {/* Sparkline chart placeholder */}
      {showChart && !compact && (
        <div className="mt-4 h-16 bg-white/50 rounded-lg flex items-center justify-center" aria-hidden="true">
          <span className="text-xs text-neutral-400">7-day price trend</span>
        </div>
      )}
    </div>
  );
}

// Skeleton component
export function PriceWidgetSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'bg-neutral-50 border border-neutral-200 rounded-2xl',
        compact ? 'p-4' : 'p-6'
      )}
    >
      <div className="animate-pulse">
        <div className="h-3 bg-neutral-200 rounded w-1/3 mb-2" />
        <div className={cn('h-8 bg-neutral-200 rounded w-1/2 mb-2', compact ? 'h-6' : 'h-8')} />
        <div className="h-3 bg-neutral-200 rounded w-1/4 mb-3" />
        <div className="h-8 bg-neutral-200 rounded w-1/3" />
        {!compact && <div className="h-16 bg-neutral-200 rounded mt-4" />}
      </div>
    </div>
  );
}

// Error component
export function PriceWidgetError({
  mandi,
  onRetry,
}: {
  mandi: MandiSlug;
  onRetry: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Warning size={16} className="text-red-600" />
        <span className="text-sm font-semibold text-red-800">
          डेटा लोड करने में विफल
        </span>
      </div>
      <p className="text-xs text-red-600 mb-3">
        {MANDI_NAMES[mandi]} के लिए price prediction लोड नहीं हो सका।
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
      >
        <ArrowClockwise size={12} />
        पुनः प्रयास करें
      </button>
    </div>
  );
}

// Empty state component
export function PriceWidgetEmpty() {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
      <p className="text-sm text-neutral-500 text-center">
        कोई डेटा उपलब्ध नहीं
      </p>
    </div>
  );
}
