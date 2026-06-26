'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const DistrictPriceMap = dynamic(
  () => import('@/components/maps/DistrictPriceMap').then(mod => ({ default: mod.DistrictPriceMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-700 mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function DistrictMapPage() {
  const [showPriceDifferential, setShowPriceDifferential] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          District Price Intelligence
        </h1>
        <p className="text-neutral-600">
          Multi-district price comparison for arbitrage decisions
        </p>
      </div>
      <DistrictPriceMap
        showPriceDifferential={showPriceDifferential}
        onPriceDifferentialToggle={setShowPriceDifferential}
      />
    </div>
  );
}
