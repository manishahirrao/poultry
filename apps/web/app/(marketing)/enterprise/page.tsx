// FlockIQ — Enterprise Page
// File: apps/web/app/(marketing)/enterprise/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-005
// Requirements: FR-ENTERPRISE-001

import { Metadata } from 'next';
import EnterprisePageClient from './EnterprisePageClient';
import ServiceSchema from './ServiceSchema';
import DemoModal from '@/components/popups/DemoModal';

export const metadata: Metadata = {
  title: 'Enterprise Solutions — API & Data Licensing | FlockIQ',
  description: 'Enterprise solutions for integrators, QSR chains, insurers, feed companies, and data platforms. REST API, historical data, white-label options, and custom district coverage.',
  keywords: ['enterprise poultry AI', 'poultry price API', 'data licensing', 'white-label solution', 'FlockIQ enterprise'],
  openGraph: {
    title: 'Enterprise Solutions — API & Data Licensing | FlockIQ',
    description: 'Enterprise solutions for large-scale poultry operations.',
    url: 'https://flockiq.com/enterprise',
  },
  alternates: {
    canonical: 'https://flockiq.com/enterprise',
    languages: {
      'hi-IN': 'https://flockiq.com/enterprise',
      'en-IN': 'https://flockiq.com/enterprise?lang=en',
      'x-default': 'https://flockiq.com/enterprise',
    },
  },
};

export default function EnterprisePage() {
  return (
    <>
      <ServiceSchema />
      <EnterprisePageClient />
      <DemoModal />
    </>
  );
}
