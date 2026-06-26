'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/providers/LanguageProvider';

// Dynamically import leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] sm:h-[280px] bg-neutral-100 rounded-lg flex items-center justify-center">
      <div className="text-neutral-400 text-sm">Loading map / मैप लोड हो रहा है...</div>
    </div>
  ),
});

interface DistrictMapProps {
  onDistrictSelect?: (district: string) => void;
  selectedDistrict?: string;
}

export function DistrictMap({ onDistrictSelect, selectedDistrict }: DistrictMapProps) {
  const { language } = useLanguage();
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">{language === 'hi' ? 'कवरेज क्षेत्र' : 'District Coverage'}</h2>
        {selectedDistrict && (
          <span className="text-xs text-neutral-500">
            {language === 'hi' ? 'चयनित:' : 'Selected:'} {selectedDistrict.charAt(0).toUpperCase() + selectedDistrict.slice(1)}
          </span>
        )}
      </div>
      
      <LeafletMap onDistrictSelect={onDistrictSelect} selectedDistrict={selectedDistrict} />
      
      <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#1A6B3C]"></span>
            <span>{language === 'hi' ? 'गोरखपुर (प्राथमिक)' : 'Gorakhpur (Primary)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#7CC49A]"></span>
            <span>{language === 'hi' ? 'आसपास के जिले' : 'Adjacent Districts'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
