// FlockIQ — Coverage Map Section
// File: apps/web/app/(marketing)/features/price-intel/_components/CoverageMap.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Globe } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';

const indiaDistricts = [
  { name: 'Gorakhpur', status: 'live' },
  { name: 'Deoria', status: 'live' },
  { name: 'Basti', status: 'live' },
  { name: 'Kushinagar', status: 'live' },
  { name: 'Maharajganj', status: 'live' },
  { name: 'Azamgarh', status: 'coming' },
  { name: 'Mau', status: 'coming' },
  { name: 'Ballia', status: 'coming' },
];

const seAsiaLocations = [
  { name: 'Jakarta', country: 'Indonesia', status: 'pilot' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', status: 'pilot' },
  { name: 'Bangkok', country: 'Thailand', status: 'pilot' },
];

export function CoverageMap() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-sora font-bold text-neutral-900 text-3xl sm:text-4xl lg:text-5xl mb-4">
              Coverage Map
            </h2>
            <p className="text-lg text-neutral-600">
              Price intelligence available across India's key poultry districts and expanding across Southeast Asia.
            </p>
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* India Coverage */}
          <FadeUp delay={0.1}>
            <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-sora font-semibold text-neutral-900 text-xl">India</h3>
                  <p className="text-neutral-500 text-sm">5 Live Districts · 3 Coming Soon</p>
                </div>
              </div>

              <div className="space-y-3">
                {indiaDistricts.map((district) => (
                  <div
                    key={district.name}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{
                      backgroundColor: district.status === 'live' ? '#EDF7F1' : '#F4F8F5',
                    }}
                  >
                    <span className="text-neutral-900 font-medium">{district.name}</span>
                    {district.status === 'live' ? (
                      <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-1 rounded-full">
                        Live
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={10} />
                        Coming
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-900">Data sources:</span> AGMARKNET, NECC, local mandi reports
                </p>
              </div>
            </div>
          </FadeUp>

          {/* SE Asia Coverage */}
          <FadeUp delay={0.2}>
            <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-sora font-semibold text-neutral-900 text-xl">Southeast Asia</h3>
                  <p className="text-neutral-500 text-sm">Pilot Program · Expanding 2026</p>
                </div>
              </div>

              <div className="space-y-3">
                {seAsiaLocations.map((location) => (
                  <div
                    key={location.name}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-brand-50"
                  >
                    <div>
                      <span className="text-neutral-900 font-medium">{location.name}</span>
                      <span className="text-neutral-500 text-sm ml-2">· {location.country}</span>
                    </div>
                    <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-1 rounded-full">
                      Pilot
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-900">Pilot phase:</span> Limited coverage, expanding to major poultry hubs in Q3 2026
                </p>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Bottom note */}
        <FadeUp delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-neutral-600 text-sm max-w-2xl mx-auto">
              Coverage expands based on data availability and customer demand. 
              <span className="font-semibold text-neutral-900"> Request your district</span> if not listed.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
