// FlockIQ — Features Page
// File: apps/web/app/(marketing)/features/page.tsx
// Version: v3.0 | June 2026

import { Metadata } from 'next';
import FeaturesPageClient from './FeaturesPageClient';
import PartnerLogoStrip from '@/components/home/PartnerLogoStrip';
import AppDownloadSection from '@/components/home/AppDownloadSection';

export const metadata: Metadata = {
  title: 'Features — Poultry Intelligence Platform | FlockIQ',
  description: 'Discover the advanced features of FlockIQ including real-time farm tracking, WhatsApp Log Automation, 30-day price forecasting, and comprehensive analytics.',
  keywords: ['poultry tracking', 'price forecasting API', 'farm management software', 'WhatsApp log automation', 'poultry analytics'],
  openGraph: {
    title: 'Features — Poultry Intelligence Platform | FlockIQ',
    description: 'Advanced features of FlockIQ including price forecasting and WhatsApp log automation.',
    url: 'https://flockiq.com/features',
  },
  alternates: {
    canonical: 'https://flockiq.com/features',
    languages: {
      'hi-IN': 'https://flockiq.com/features',
      'en-IN': 'https://flockiq.com/features?lang=en',
      'x-default': 'https://flockiq.com/features',
    },
  },
};

export default function FeaturesPage() {
  return (
    <>
      <FeaturesPageClient />
      {/* PartnerLogoStrip — shows government data sources */}
      <PartnerLogoStrip />
      {/* AppDownloadSection — shows mobile app availability */}
      <AppDownloadSection />
    </>
  );
}
