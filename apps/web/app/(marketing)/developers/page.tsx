// FlockIQ — Developer & API Page (v3.0)
// File: apps/web/app/(marketing)/developers/page.tsx
// Version: v3.0 | June 2026
// Task Reference: DEV-API-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 13
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-DEV-001

import { Metadata } from 'next';
import { Suspense } from 'react';
import DevelopersPageClient from './DevelopersPageClient';

export const metadata: Metadata = {
  title: 'Poultry Price API India — Broiler Price Forecast API | FlockIQ Developers',
  description: 'Production-ready poultry price forecast API with 95%+ accuracy. Get 7-30 day broiler price predictions, real-time mandi prices, and FSSAI traceability data via REST API.',
  keywords: ['poultry price API India', 'broiler price forecast API', 'poultry farm API', 'broiler price prediction API', 'mandi price API', 'FSSAI traceability API'],
  openGraph: {
    title: 'Poultry Price API India — Broiler Price Forecast API | FlockIQ Developers',
    description: 'Production-ready poultry price forecast API with 95%+ accuracy. Get 7-30 day broiler price predictions via REST API.',
    url: 'https://flockiq.com/developers',
    images: [
      {
        url: 'https://flockiq.com/og/developers.jpg',
        width: 1200,
        height: 630,
        alt: 'Poultry Price API Documentation',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poultry Price API India — Broiler Price Forecast API | FlockIQ Developers',
    description: 'Production-ready poultry price forecast API with 95%+ accuracy. Get 7-30 day broiler price predictions via REST API.',
    images: ['https://flockiq.com/og/developers.jpg'],
  },
  alternates: {
    canonical: 'https://flockiq.com/developers',
    languages: {
      'hi-IN': 'https://flockiq.com/developers',
      'en-IN': 'https://flockiq.com/developers?lang=en',
      'x-default': 'https://flockiq.com/developers',
    },
  },
};

export default function DevelopersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DevelopersPageClient />
    </Suspense>
  );
}
