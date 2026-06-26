// FlockIQ — Case Studies Index Page (v3.0)
// File: apps/web/app/(marketing)/case-studies/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 06
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-CASESTUDIES-001

import { Metadata } from 'next';
import CaseStudiesIndexClient from './CaseStudiesIndexClient';

export const metadata: Metadata = {
  title: 'Case Studies — Real Farmer Success Stories | FlockIQ',
  description: 'Read how farmers across Gorakhpur, Deoria, Kushinagar saved ₹1-3 lakhs per batch using FlockIQ price predictions.',
  keywords: ['case studies', 'farmer success stories', 'poultry farming profits', 'broiler price timing'],
  openGraph: {
    title: 'Case Studies — Real Farmer Success Stories',
    description: 'Read how farmers saved ₹1-3 lakhs per batch using FlockIQ.',
    url: 'https://flockiq.com/case-studies',
  },
  alternates: {
    canonical: 'https://flockiq.com/case-studies',
    languages: {
      'hi-IN': 'https://flockiq.com/case-studies',
      'en-IN': 'https://flockiq.com/case-studies?lang=en',
      'x-default': 'https://flockiq.com/case-studies',
    },
  },
};

export default function CaseStudiesIndexPage() {
  return <CaseStudiesIndexClient />;
}
