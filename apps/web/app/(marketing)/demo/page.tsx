// FlockIQ — Demo Page (v3.0)
// File: apps/web/app/(marketing)/demo/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-008
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 09
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-DEMO-001

import { Metadata } from 'next';
import DemoPageClient from './DemoPageClient';
import DemoPageSchema from './DemoPageSchema';

export const metadata: Metadata = {
  title: 'Request a Demo — See FlockIQ in Action',
  description: 'Schedule a personalized demo of FlockIQ poultry management platform. See WhatsApp automation, price intelligence, and farm management features.',
  openGraph: {
    title: 'Request a Demo — See FlockIQ in Action',
    description: 'Schedule a personalized demo of FlockIQ poultry management platform.',
    url: 'https://flockiq.com/demo',
  },
  alternates: {
    canonical: 'https://flockiq.com/demo',
    languages: {
      'hi-IN': 'https://flockiq.com/demo',
      'en-IN': 'https://flockiq.com/demo?lang=en',
      'x-default': 'https://flockiq.com/demo',
    },
  },
};

export default function DemoPage() {
  return (
    <>
      <DemoPageSchema />
      <DemoPageClient />
    </>
  );
}
