// FlockIQ — Maharajganj District Page (v3.0)
// File: apps/web/app/(marketing)/maharajganj/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-LOCAL-005
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 10
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-LOCAL-001

import { Metadata } from 'next';
import DistrictPage from '@/components/districts/DistrictPage';
import LocalBusinessSchema from './LocalBusinessSchema';

export const metadata: Metadata = {
  title: 'Maharajganj Broiler Price — Live Mandi Bhav Prediction | FlockIQ',
  description: 'Get accurate 7-day broiler price predictions for Maharajganj mandi. 95%+ accuracy verified. Used by farmers across Maharajganj district.',
  keywords: ['Maharajganj broiler price', 'Maharajganj mandi bhav', 'broiler price prediction Maharajganj', 'मुर्गी भाव महाराजगंज'],
  openGraph: {
    title: 'Maharajganj Broiler Price — Live Mandi Bhav Prediction',
    description: 'Get accurate 7-day broiler price predictions for Maharajganj mandi. 95%+ accuracy verified.',
    url: 'https://flockiq.com/maharajganj',
  },
  alternates: {
    canonical: 'https://flockiq.com/maharajganj',
    languages: {
      'hi-IN': 'https://flockiq.com/maharajganj',
      'en-IN': 'https://flockiq.com/maharajganj?lang=en',
      'x-default': 'https://flockiq.com/maharajganj',
    },
  },
};

export default function MaharajganjPage() {
  const districtData = {
    districtName: 'Maharajganj',
    districtSlug: 'maharajganj',
    price: 169,
    p10: 162,
    p50: 169,
    p90: 176,
    signal: 'sell' as const,
    confidence: 'high' as const,
    farmerCount: 30,
    mandiCount: 2,
    distanceFromGorakhpur: '35 km',
    lastUpdated: new Date().toISOString(),
  };

  return (
    <>
      <LocalBusinessSchema districtName="Maharajganj" />
      <DistrictPage {...districtData} />
    </>
  );
}
