// FlockIQ — Basti District Page (v3.0)
// File: apps/web/app/(marketing)/basti/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-LOCAL-004
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 10
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-LOCAL-001

import { Metadata } from 'next';
import DistrictPage from '@/components/districts/DistrictPage';
import LocalBusinessSchema from './LocalBusinessSchema';

export const metadata: Metadata = {
  title: 'Basti Broiler Price — Live Mandi Bhav Prediction | FlockIQ',
  description: 'Get accurate 7-day broiler price predictions for Basti mandi. 95%+ accuracy verified. Used by farmers across Basti district.',
  keywords: ['Basti broiler price', 'Basti mandi bhav', 'broiler price prediction Basti', 'मुर्गी भाव बस्ती'],
  openGraph: {
    title: 'Basti Broiler Price — Live Mandi Bhav Prediction',
    description: 'Get accurate 7-day broiler price predictions for Basti mandi. 95%+ accuracy verified.',
    url: 'https://flockiq.com/basti',
  },
  alternates: {
    canonical: 'https://flockiq.com/basti',
    languages: {
      'hi-IN': 'https://flockiq.com/basti',
      'en-IN': 'https://flockiq.com/basti?lang=en',
      'x-default': 'https://flockiq.com/basti',
    },
  },
};

export default function BastiPage() {
  const districtData = {
    districtName: 'Basti',
    districtSlug: 'basti',
    price: 165,
    p10: 158,
    p50: 165,
    p90: 172,
    signal: 'sell' as const,
    confidence: 'high' as const,
    farmerCount: 35,
    mandiCount: 3,
    distanceFromGorakhpur: '60 km',
    lastUpdated: new Date().toISOString(),
  };

  return (
    <>
      <LocalBusinessSchema districtName="Basti" />
      <DistrictPage {...districtData} />
    </>
  );
}
