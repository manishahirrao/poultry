// FlockIQ — WhatsApp Demo Page
// File: apps/web/app/(marketing)/try-whatsapp/page.tsx
// Version: v1.0 | May 2026
// Task Reference: C-08
// Requirements: FR-WHATSAPP-DEMO-001

import { Metadata } from 'next';
import WhatsAppDemoClient from './WhatsAppDemoClient';

export const metadata: Metadata = {
  title: 'Try WhatsApp Demo — Free Price Signal | FlockIQ',
  description: 'Get a free WhatsApp price signal for your district. No signup required. Experience FlockIQ before committing.',
  keywords: ['WhatsApp demo', 'free price signal', 'try FlockIQ', 'WhatsApp poultry price'],
  openGraph: {
    title: 'Try WhatsApp Demo — Free Price Signal',
    description: 'Get a free WhatsApp price signal for your district.',
    url: 'https://flockiq.com/try-whatsapp',
  },
  alternates: {
    canonical: 'https://flockiq.com/try-whatsapp',
    languages: {
      'hi-IN': 'https://flockiq.com/try-whatsapp',
      'en-IN': 'https://flockiq.com/try-whatsapp?lang=en',
      'x-default': 'https://flockiq.com/try-whatsapp',
    },
  },
};

export default function WhatsAppDemoPage() {
  return <WhatsAppDemoClient />;
}
