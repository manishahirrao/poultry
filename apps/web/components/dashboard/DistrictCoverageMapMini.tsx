'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('./overview/LeafletMapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] bg-neutral-100 rounded-lg flex items-center justify-center">
      <div className="text-neutral-400 text-sm">Loading map...</div>
    </div>
  ),
});

interface DistrictCoverageMapMiniProps {
  onDistrictSelect?: (district: string) => void;
  selectedDistrict?: string;
}

export function DistrictCoverageMapMini({ onDistrictSelect, selectedDistrict }: DistrictCoverageMapMiniProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E3EDE7] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">District Coverage</h2>
        {selectedDistrict && (
          <span className="text-xs text-gray-500">
            {selectedDistrict.charAt(0).toUpperCase() + selectedDistrict.slice(1)}
          </span>
        )}
      </div>
      
      <LeafletMap onDistrictSelect={onDistrictSelect} selectedDistrict={selectedDistrict} />
      
      <div className="px-4 py-2 border-t border-[#E3EDE7] bg-[#F4F7F5]">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1A5C34]"></span>
            <span>High Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            <span>Low Price</span>
          </div>
        </div>
      </div>
    </div>
  );
}
