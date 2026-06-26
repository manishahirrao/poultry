// FlockIQ — Farm Intelligence Page
// File: apps/web/app/(marketing)/farm-intelligence/page.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-015, TASK-WEB-022
// Requirements: REQ-WEB-006, GWEB-003

import { Metadata } from 'next';
import FarmIntelligencePageClient from './FarmIntelligencePageClient';

export const metadata: Metadata = {
  title: 'Farm Intelligence — Complete Farm Operations in One Platform | FlockIQ',
  description: 'Complete farm operations management from batch lifecycle to IoT smart farming. Track FCR, mortality, vaccination schedules, and inventory. Make data-driven decisions that enhance your price intelligence.',
  keywords: ['poultry farm management software India', 'FCR tracking app India', 'broiler vaccination schedule app', 'farm operations management', 'poultry batch tracking', 'mortality detection system'],
  openGraph: {
    title: 'Farm Intelligence — Complete Farm Operations in One Platform | FlockIQ',
    description: 'Complete farm operations management from batch lifecycle to IoT smart farming. Track FCR, mortality, vaccination schedules, and inventory.',
    url: 'https://FlockIQ.ai/farm-intelligence',
    images: [
      {
        url: 'https://FlockIQ.ai/og/farm-intelligence.jpg',
        width: 1200,
        height: 630,
        alt: 'Farm Intelligence Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farm Intelligence — Complete Farm Operations in One Platform | FlockIQ',
    description: 'Complete farm operations management from batch lifecycle to IoT smart farming. Track FCR, mortality, vaccination schedules, and inventory.',
    images: ['https://FlockIQ.ai/og/farm-intelligence.jpg'],
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/farm-intelligence',
    languages: {
      'hi-IN': 'https://FlockIQ.ai/farm-intelligence',
      'en-IN': 'https://FlockIQ.ai/farm-intelligence?lang=en',
      'x-default': 'https://FlockIQ.ai/farm-intelligence',
    },
  },
};

export default function FarmIntelligencePage() {
  return <FarmIntelligencePageClient />;
}
