// FlockIQ — How It Works Page
// File: apps/web/app/(marketing)/how-it-works/page.tsx
// Version: v1.1 | June 2026

import { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient';
import { WhatsAppLogSection } from '@/components/marketing/sections/WhatsAppLogSection';
import AppDownloadSection from '@/components/home/AppDownloadSection';
import FinalCTASection from '@/components/home/FinalCTASection';

export const metadata: Metadata = {
  title: 'How It Works — FlockIQ Price Prediction',
  description: 'Learn how FlockIQ uses 47 public data sources and advanced ML models to predict broiler prices 7 days ahead with 95%+ accuracy.',
  keywords: ['how it works', 'price prediction', 'AI model', 'data sources', 'accuracy'],
  openGraph: {
    title: 'How It Works — FlockIQ',
    description: '3 simple steps to know exactly when to sell your flock.',
    url: 'https://FlockIQ.ai/how-it-works',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/how-it-works',
    languages: {
      'hi-IN': 'https://FlockIQ.ai/how-it-works',
      'en-IN': 'https://FlockIQ.ai/how-it-works?lang=en',
      'x-default': 'https://FlockIQ.ai/how-it-works',
    },
  },
};

export default function HowItWorksPage() {
  return (
    <>
      {/* Step-by-step pipeline: data → AI → WhatsApp signal */}
      <HowItWorksClient />

      {/* WhatsApp Log Automation — flagship feature detail, fits naturally after
          the 3-step pipeline since it explains how farmer data gets collected */}
      <WhatsAppLogSection />

      {/* App download — "you've seen how it works, now get it" */}
      <AppDownloadSection />

      <FinalCTASection />
    </>
  );
}
