// FlockIQ — Price Display Component
// File: apps/web/components/ui/PriceDisplay.tsx
// Version: v1.0 | May 2026
// Task Reference: UI-08
// Design Reference: 13_full_platform_tasks_master.md §UI-08

'use client';

import { Warning } from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

type PriceSignal = 'SELL_NOW' | 'HOLD' | 'CAUTION';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface PriceDisplayProps {
  p10: number;
  p50: number;
  p90: number;
  signal: PriceSignal;
  mandi: string;
  predictedAt: string;
  isDemo?: boolean;
  isStale?: boolean;
  compact?: boolean;
  className?: string;
}

const signalConfig: Record<PriceSignal, { label: string; bg: string; text: string }> = {
  SELL_NOW: { label: 'SELL_NOW', bg: 'bg-red-100', text: 'text-red-700' },
  HOLD: { label: 'HOLD', bg: 'bg-amber-100', text: 'text-amber-700' },
  CAUTION: { label: 'CAUTION', bg: 'bg-brandOrange100', text: 'text-brandOrange700' },
};

const formatPrice = (value: number) => `₹${value.toFixed(0)}`;

const isDataStale = (predictedAt: string): boolean => {
  const predictionTime = new Date(predictedAt).getTime();
  const now = Date.now();
  const hoursDiff = (now - predictionTime) / (1000 * 60 * 60);
  return hoursDiff > 24;
};

export default function PriceDisplay({
  p10,
  p50,
  p90,
  signal,
  mandi,
  predictedAt,
  isDemo = false,
  isStale: isStaleProp,
  compact = false,
  className = '',
}: PriceDisplayProps) {
  const isStale = isStaleProp !== undefined ? isStaleProp : isDataStale(predictedAt);
  const signalConfigData = signalConfig[signal];
  const signalLabel = isDemo ? `${signalConfigData.label} (Demo)` : signalConfigData.label;

  const ariaLabel = `₹${p50} per kilogram, ${signalLabel} signal, Mandi: ${mandi}`;

  if (compact) {
    return (
      <div className={cn('inline-flex items-center gap-3', className)} aria-label={ariaLabel}>
        <span className="text-xl font-space-grotesk font-bold text-neutral-900">
          {formatPrice(p50)}
        </span>
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', signalConfigData.bg, signalConfigData.text)}>
          {signalLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex flex-col items-start gap-2', className)} aria-label={ariaLabel}>
      <div className="flex items-center gap-3">
        <span className="text-3xl lg:text-4xl font-space-grotesk font-bold text-neutral-900">
          {formatPrice(p50)}
        </span>
        <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', signalConfigData.bg, signalConfigData.text)}>
          {signalLabel}
        </span>
      </div>

      <div className="text-sm text-neutral-600">
        ₹{p10} – ₹{p90}/kg
      </div>

      {isStale && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
          <Warning size={12} weight="fill" />
          <span>डेटा पुराना है</span>
        </div>
      )}
    </div>
  );
}
