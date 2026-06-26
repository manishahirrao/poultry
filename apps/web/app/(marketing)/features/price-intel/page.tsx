// FlockIQ — Price Intelligence Feature Page
// File: apps/web/app/(marketing)/features/price-intel/page.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md FR-FEAT-004

import type { Metadata } from 'next';
import { HeroPriceIntel } from './_components/HeroPriceIntel';
import { HowTheModelWorks } from './_components/HowTheModelWorks';
import { WhatsAppMessageMockup } from './_components/WhatsAppMessageMockup';
import { AccuracySection } from './_components/AccuracySection';
import { CoverageMap } from './_components/CoverageMap';
import { IntegrationSection } from './_components/IntegrationSection';
import { SellIntelligenceFeatures } from './_components/SellIntelligenceFeatures';
import { PricingInclusion } from './_components/PricingInclusion';
import Schema from '@/components/seo/Schema';
import { softwareApplicationSchema, breadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Price Intelligence | FlockIQ',
  description: 'Know when to sell — 7 days before the market does. 96.2% directional accuracy verified on 847 predictions. Daily sell signals delivered via WhatsApp.',
  openGraph: {
    title: 'FlockIQ Price Intelligence',
    description: 'AI-powered price forecasting built into your poultry management platform. Not bolted on — built in.',
    images: [{ url: '/api/og?title=Price+Intelligence&subtitle=Know+when+to+sell+7+days+before+the+market+does', width: 1200, height: 630 }],
  },
};

export default function PriceIntelPage() {
  return (
    <>
      <Schema schema={softwareApplicationSchema('price-intel')} />
      <Schema schema={breadcrumbSchema([
        { name: 'Home', url: 'https://flockiq.com' },
        { name: 'Features', url: 'https://flockiq.com/features' },
        { name: 'Price Intelligence', url: 'https://flockiq.com/features/price-intel' },
      ])} />
      <HeroPriceIntel />
      <HowTheModelWorks />
      <WhatsAppMessageMockup />
      <AccuracySection />
      <CoverageMap />
      <IntegrationSection />
      <SellIntelligenceFeatures />
      <PricingInclusion />
    </>
  );
}
