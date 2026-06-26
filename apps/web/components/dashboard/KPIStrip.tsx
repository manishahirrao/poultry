'use client';

// WHY: This is the KPI strip component that displays 5 key performance indicators in a horizontal grid.
// It shows mandi benchmark, middleman spread, active alerts (with hover breakdown), feed cost index (with sparkline),
// and subscription status. Each KPI card is clickable and can navigate to relevant pages. The component uses
// Recharts for sparkline visualizations and Radix UI for hover tooltips showing alert breakdowns.

import { useRouter } from 'next/navigation';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import * as HoverCard from '@radix-ui/react-hover-card';

interface KPICardProps {
  label: string;
  labelHindi?: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; amount: string; label: string };
  subtext?: string;
  href?: string;
  status?: 'ok' | 'warn' | 'alert';
  sparklineData?: number[];
}

interface KPIStripProps {
  mandiBenchmark: KPICardProps;
  middlemanSpread: KPICardProps;
  activeAlerts: KPICardProps & { breakdown?: { disease: number; weather: number; price: number; policy: number } };
  feedCostIndex: KPICardProps & { sparklineData?: number[] };
  subscription: KPICardProps;
  isLoading?: boolean;
}

function KPICardWithTooltip({
  card,
  breakdown,
}: {
  card: KPICardProps;
  breakdown?: { disease: number; weather: number; price: number; policy: number };
}) {
  return (
    <HoverCard.Root openDelay={200} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <div>
          <KPICard {...card} />
        </div>
      </HoverCard.Trigger>
      {breakdown && (
        <HoverCard.Portal>
          <HoverCard.Content
            className="z-50 w-48 bg-white border border-[#E3EDE7] rounded-lg shadow-lg p-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            sideOffset={4}
          >
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">Alert Breakdown:</p>
              <p className="text-gray-600">🦠 Disease: {breakdown.disease}</p>
              <p className="text-gray-600">🌩 Weather: {breakdown.weather}</p>
              <p className="text-gray-600">📉 Price: {breakdown.price}</p>
              <p className="text-gray-600">📋 Policy: {breakdown.policy}</p>
            </div>
            <HoverCard.Arrow className="fill-[#E3EDE7]" />
          </HoverCard.Content>
        </HoverCard.Portal>
      )}
    </HoverCard.Root>
  );
}

function KPICard({
  label,
  labelHindi,
  value,
  unit,
  trend,
  subtext,
  href,
  status,
  sparklineData,
}: KPICardProps) {
  const router = useRouter();
  const handleClick = () => {
    if (href) router.push(href);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok': return 'border-green-200';
      case 'warn': return 'border-amber-200';
      case 'alert': return 'border-red-200';
      default: return 'border-[#E3EDE7]';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'flat': return '→';
      default: return '';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'flat': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl border ${getStatusColor(status)} p-4 cursor-pointer hover:shadow-md transition-shadow ${href ? 'hover:bg-gray-50' : ''} min-h-[48px]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          {labelHindi && <p className="text-xs text-gray-400">{labelHindi}</p>}
        </div>
        {trend && (
          <div className={`text-xs font-medium ${getTrendColor(trend.direction)}`}>
            {getTrendIcon(trend.direction)} {trend.amount}
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">
          {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value}
        </span>
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-8 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData.map((val, i) => ({ value: val }))}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1A5C34"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}

export function KPIStrip({
  mandiBenchmark,
  middlemanSpread,
  activeAlerts,
  feedCostIndex,
  subscription,
  isLoading = false,
}: KPIStripProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E3EDE7] p-4 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Mandi Benchmark */}
      <KPICard {...mandiBenchmark} />

      {/* Middleman Spread */}
      <KPICard {...middlemanSpread} />

      {/* Active Alerts with hover breakdown */}
      <KPICardWithTooltip card={activeAlerts} breakdown={activeAlerts.breakdown} />

      {/* Feed Cost Index with sparkline */}
      <KPICard {...feedCostIndex} sparklineData={feedCostIndex.sparklineData} />

      {/* Subscription */}
      <KPICard {...subscription} />
    </div>
  );
}
