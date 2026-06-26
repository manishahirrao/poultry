// FlockIQ — FAQ Page
// File: apps/web/app/(marketing)/faq/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-006
// Requirements: FR-FAQ-001

import type { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';
import FAQSchema from './FAQSchema';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FAQ — Frequently Asked Questions | FlockIQ',
    description: 'Frequently asked questions about FlockIQ — accuracy, pricing, technical details, privacy, and farm management features including WhatsApp automation and batch P&L.',
    keywords: ['FAQ', 'poultry AI questions', 'broiler price prediction accuracy', 'pricing questions', 'privacy policy', 'farm management', 'WhatsApp automation'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      alternateLocale: ['hi_IN'],
      url: 'https://flockiq.com/faq',
      siteName: 'FlockIQ',
      title: 'FAQ — Frequently Asked Questions | FlockIQ',
      description: 'Frequently asked questions about FlockIQ.',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ — FAQ',
        },
      ],
    },
    alternates: {
      canonical: 'https://flockiq.com/faq',
      languages: {
        'hi-IN': 'https://flockiq.com/faq',
        'en-IN': 'https://flockiq.com/faq?lang=en',
        'x-default': 'https://flockiq.com/faq',
      },
    },
  };
}

export default function FAQPage() {
  return (
    <>
      <FAQSchema />
      <FAQPageClient />
    </>
  );
}
