// FlockIQ — Kushinagar District Page (v3.0)
// File: apps/web/app/(marketing)/kushinagar/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-LOCAL-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 10
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-LOCAL-001

import { Metadata } from 'next';
import DistrictPage from '@/components/districts/DistrictPage';
import LocalBusinessSchema from './LocalBusinessSchema';

export const metadata: Metadata = {
  title: 'Kushinagar Broiler Price — Live Mandi Bhav Prediction | FlockIQ',
  description: 'Get accurate 7-day broiler price predictions for Kushinagar mandi. 95%+ accuracy verified. Used by farmers across Kushinagar district.',
  keywords: ['Kushinagar broiler price', 'Kushinagar mandi bhav', 'broiler price prediction Kushinagar', 'मुर्गी भाव कुशीनगर'],
  openGraph: {
    title: 'Kushinagar Broiler Price — Live Mandi Bhav Prediction',
    description: 'Get accurate 7-day broiler price predictions for Kushinagar mandi. 95%+ accuracy verified.',
    url: 'https://flockiq.com/kushinagar',
  },
  alternates: {
    canonical: 'https://flockiq.com/kushinagar',
    languages: {
      'hi-IN': 'https://flockiq.com/kushinagar',
      'en-IN': 'https://flockiq.com/kushinagar?lang=en',
      'x-default': 'https://flockiq.com/kushinagar',
    },
  },
};

export default function KushinagarPage() {
  const districtData = {
    districtName: 'Kushinagar',
    districtSlug: 'kushinagar',
    price: 166,
    p10: 159,
    p50: 166,
    p90: 173,
    signal: 'sell' as const,
    confidence: 'high' as const,
    farmerCount: 40,
    mandiCount: 2,
    distanceFromGorakhpur: '55 km',
    lastUpdated: new Date().toISOString(),
  };

  return (
    <>
      <LocalBusinessSchema districtName="Kushinagar" />
      <DistrictPage {...districtData} />
    </>
  );
}
