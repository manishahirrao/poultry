// FlockIQ — Deoria District Page (v3.0)
// File: apps/web/app/(marketing)/deoria/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-LOCAL-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 10
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-LOCAL-001

import { Metadata } from 'next';
import DistrictPage from '@/components/districts/DistrictPage';
import LocalBusinessSchema from './LocalBusinessSchema';

export const metadata: Metadata = {
  title: 'Deoria Broiler Price — Live Mandi Bhav Prediction | FlockIQ',
  description: 'Get accurate 7-day broiler price predictions for Deoria mandi. 95%+ accuracy verified. Used by farmers across Deoria district.',
  keywords: ['Deoria broiler price', 'Deoria mandi bhav', 'broiler price prediction Deoria', 'मुर्गी भाव देवरिया'],
  openGraph: {
    title: 'Deoria Broiler Price — Live Mandi Bhav Prediction',
    description: 'Get accurate 7-day broiler price predictions for Deoria mandi. 95%+ accuracy verified.',
    url: 'https://flockiq.com/deoria',
  },
  alternates: {
    canonical: 'https://flockiq.com/deoria',
    languages: {
      'hi-IN': 'https://flockiq.com/deoria',
      'en-IN': 'https://flockiq.com/deoria?lang=en',
      'x-default': 'https://flockiq.com/deoria',
    },
  },
};

export default function DeoriaPage() {
  const districtData = {
    districtName: 'Deoria',
    districtSlug: 'deoria',
    price: 167,
    p10: 160,
    p50: 167,
    p90: 174,
    signal: 'sell' as const,
    confidence: 'high' as const,
    farmerCount: 50,
    mandiCount: 3,
    distanceFromGorakhpur: '45 km',
    lastUpdated: new Date().toISOString(),
  };

  return (
    <>
      <LocalBusinessSchema districtName="Deoria" />
      <DistrictPage {...districtData} />
    </>
  );
}
