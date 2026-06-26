// FlockIQ — Gorakhpur Local SEO Page (v3.0)
// File: apps/web/app/(marketing)/gorakhpur/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-LOCAL-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 10
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-LOCAL-001

import { Metadata } from 'next';
import GorakhpurPageClient from './GorakhpurPageClient';
import LocalBusinessSchema from './LocalBusinessSchema';
import FAQSchema from './FAQSchema';

export const metadata: Metadata = {
  title: 'Gorakhpur Broiler Price — Live Mandi Bhav Prediction | FlockIQ',
  description: 'Get accurate 7-day broiler price predictions for Gorakhpur mandi. 95%+ accuracy verified. Used by 200+ farmers in Gorakhpur, Deoria, Kushinagar.',
  keywords: ['Gorakhpur broiler price', 'Gorakhpur mandi bhav', 'broiler price prediction Gorakhpur', 'मुर्गी भाव गोरखपुर', 'poultry price Gorakhpur'],
  openGraph: {
    title: 'Gorakhpur Broiler Price — Live Mandi Bhav Prediction',
    description: 'Get accurate 7-day broiler price predictions for Gorakhpur mandi. 95%+ accuracy verified.',
    url: 'https://flockiq.com/gorakhpur',
  },
  alternates: {
    canonical: 'https://flockiq.com/gorakhpur',
    languages: {
      'hi-IN': 'https://flockiq.com/gorakhpur',
      'en-IN': 'https://flockiq.com/gorakhpur?lang=en',
      'x-default': 'https://flockiq.com/gorakhpur',
    },
  },
};

export default function GorakhpurPage() {
  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema />
      <GorakhpurPageClient />
    </>
  );
}
