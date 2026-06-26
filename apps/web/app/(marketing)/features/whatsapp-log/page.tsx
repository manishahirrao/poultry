// FlockIQ — WhatsApp Log Automation Feature Page
// File: apps/web/app/(marketing)/features/whatsapp-log/page.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md FR-FEAT-002

import type { Metadata } from 'next';
import { HeroWhatsApp } from './_components/HeroWhatsApp';
import { HowItWorksSteps } from './_components/HowItWorksSteps';
import { FarmerInputExamples } from './_components/FarmerInputExamples';
import { ComplianceImprovementSection } from './_components/ComplianceImprovementSection';
import { TechnicalDetailsSection } from './_components/TechnicalDetailsSection';
import { MedicineReportingSection } from './_components/MedicineReportingSection';
import { PricingInclusion } from './_components/PricingInclusion';
import Schema from '@/components/seo/Schema';
import { howToSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'WhatsApp Daily Log Automation | FlockIQ',
  description: 'Farmers reply on WhatsApp. Dashboard updates automatically. 97% log compliance. Zero calls. Zero spreadsheets. Set up in 10 minutes.',
  alternates: {
    canonical: 'https://flockiq.com/features/whatsapp-log',
    languages: {
      'hi-IN': 'https://flockiq.com/features/whatsapp-log?lang=hi',
      'en-IN': 'https://flockiq.com/features/whatsapp-log',
      'x-default': 'https://flockiq.com/features/whatsapp-log',
    },
  },
  openGraph: {
    title: 'FlockIQ WhatsApp Daily Log Automation',
    description: 'The only poultry platform where farmers log daily data via WhatsApp — no app install required.',
    url: 'https://flockiq.com/features/whatsapp-log',
    images: [{ url: '/api/og?title=WhatsApp+Daily+Log+Automation&subtitle=Farmers+reply+on+WhatsApp.+You+see+everything.', width: 1200, height: 630 }],
  },
};

export default function WhatsAppLogPage() {
  return (
    <>
      <Schema schema={howToSchema()} />
      <HeroWhatsApp />
      <HowItWorksSteps />
      <FarmerInputExamples />
      <ComplianceImprovementSection />
      <MedicineReportingSection />
      <TechnicalDetailsSection />
      <PricingInclusion />
    </>
  );
}
