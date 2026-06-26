// FlockIQ — About Page
// File: apps/web/app/(marketing)/about/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-001
// Requirements: FR-GLOBAL-001 (brand migration)

import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';
import OrganizationSchema from './OrganizationSchema';
import MarketingTestimonials from '@/components/home/MarketingTestimonials';
import ExpertQuotesSection from '@/components/home/ExpertQuotesSection';
import FinalCTASection from '@/components/home/FinalCTASection';

export const metadata: Metadata = {
  title: 'About Us — Our Story & Team | FlockIQ',
  description: 'Learn about FlockIQ — the poultry management platform built in Gorakhpur, deployed globally. From price forecasting to full operational command centre.',
  keywords: ['about FlockIQ', 'poultry management platform', 'company story', 'mission'],
  openGraph: {
    title: 'About Us — Our Story & Team',
    description: 'Learn about FlockIQ — the poultry management platform built in Gorakhpur, deployed globally.',
    url: 'https://flockiq.com/about',
  },
  alternates: {
    canonical: 'https://flockiq.com/about',
    languages: {
      'hi-IN': 'https://flockiq.com/about',
      'en-IN': 'https://flockiq.com/about?lang=en',
      'x-default': 'https://flockiq.com/about',
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <OrganizationSchema />
      <AboutPageClient />

      {/* Expert quotes — academic and research validation of our model claims */}
      <ExpertQuotesSection />

      {/* Customer testimonials — real farmers' voices after team story */}
      <MarketingTestimonials />

      <FinalCTASection />
    </>
  );
}
