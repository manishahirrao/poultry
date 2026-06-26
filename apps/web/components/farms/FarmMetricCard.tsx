'use client';

import { clsx } from 'clsx';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

interface FarmMetricCardProps {
  label: string;
  labelHi?: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  statusColour?: 'green' | 'amber' | 'red' | 'neutral';
  className?: string;
  onClick?: () => void;
}

export function FarmMetricCard({
  label,
  labelHi,
  value,
  unit,
  trend,
  trendDirection,
  statusColour = 'neutral',
  className,
  onClick,
}: FarmMetricCardProps) {
  const { language } = useLanguage();
  const statusColours = {
    green: 'border-green-200 bg-green-50',
    amber: 'border-amber-200 bg-amber-50',
    red: 'border-red-200 bg-red-50',
    neutral: 'border-gray-200 bg-white',
  };

  const trendIcon = trendDirection === 'up' ? TrendUp : trendDirection === 'down' ? TrendDown : Minus;
  const trendColour = trendDirection === 'up' ? 'text-green-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-400';

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow',
        statusColours[statusColour],
        onClick && 'hover:scale-[1.02] transition-transform',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600">{language === 'hi' && labelHi ? labelHi : label}</p>
        </div>
        {trend !== undefined && trendDirection && (
          <div className={clsx('flex items-center gap-1 text-xs font-semibold', trendColour)}>
            {trendDirection === 'up' && <TrendUp size={16} weight="bold" />}
            {trendDirection === 'down' && <TrendDown size={16} weight="bold" />}
            {trendDirection === 'neutral' && <Minus size={16} weight="bold" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-sm font-normal text-gray-600 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
