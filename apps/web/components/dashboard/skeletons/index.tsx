// Skeleton components — shapes match content they replace (never generic spinner)
// All use skeleton-shimmer CSS animation from styles/animations.css

import React from 'react';

// Base skeleton element
function SkeletonBox({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// 4 KPI metric cards
export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-100">
          <SkeletonBox className="h-3 w-24 mb-4" />
          <SkeletonBox className="h-8 w-32 mb-2" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// Forecast AreaChart skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 border border-neutral-100"
      style={{ height: height + 48 }}
    >
      <SkeletonBox className="h-4 w-40 mb-4" />
      {/* Chart bands skeleton */}
      <div className="relative" style={{ height }}>
        <SkeletonBox className="absolute top-0 left-0 right-0 h-2 opacity-40 rounded-full" style={{ top: '20%' }} />
        <SkeletonBox className="absolute left-0 right-0 h-2 rounded-full" style={{ top: '50%' }} />
        <SkeletonBox className="absolute left-0 right-0 h-2 opacity-40 rounded-full" style={{ top: '75%' }} />
      </div>
    </div>
  );
}

// Mandi price table skeleton (5 rows)
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 flex gap-4">
        {[40, 24, 24, 20, 30].map((w, i) => (
          <SkeletonBox key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={`px-6 py-4 flex gap-4 items-center ${i % 2 === 0 ? '' : 'bg-neutral-50'}`}
        >
          {[40, 24, 24, 20, 30].map((w, j) => (
            <SkeletonBox key={j} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Alert cards skeleton (3 cards)
export function AlertCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-neutral-100">
          <SkeletonBox className="h-4 w-48 mb-2" />
          <SkeletonBox className="h-3 w-full mb-1" />
          <SkeletonBox className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Customer table row skeleton
export function CustomerTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-6 py-3 border-b border-neutral-100 flex gap-3">
        {[15,12,10,10,10,10,15,10].map((w, i) => (
          <SkeletonBox key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`px-6 py-4 flex gap-3 items-center ${i%2===0 ? '' : 'bg-neutral-50'}`}>
          {[15,12,10,10,10,10,15,10].map((w, j) => (
            <SkeletonBox key={j} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
