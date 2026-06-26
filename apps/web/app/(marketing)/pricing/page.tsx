// FlockIQ — Pricing Page
// File: apps/web/app/(marketing)/pricing/page.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-010, TASK-WEB-022
// Requirements: REQ-WEB-003, GWEB-003
// Design Reference: Design Spec §4.1–§4.2

import { Metadata } from 'next';
import { Suspense } from 'react';
import PricingPageClient from './PricingPageClient';
import DemoModal from '@/components/popups/DemoModal';
import PartnerLogoStrip from '@/components/home/PartnerLogoStrip';
import { generateProductSchema, generateFAQSchema } from '@/lib/seo/schemas';

// Product JSON-LD Schema for FLOCKIQ_FARM, FLOCKIQ_PRO
// Task Reference: QA-002 (SEO Pre-Launch Checklist)
const flockIQFarmProductSchema = generateProductSchema({
  name: 'FlockIQ FARM',
  price: '5000',
  currency: 'INR',
  description: 'Poultry management platform for individual farms (10K–500K birds). Batch tracking, WhatsApp log automation, FCR monitoring, price intelligence, and health alerts.',
});

const flockIQProProductSchema = generateProductSchema({
  name: 'FlockIQ PRO',
  price: '8000',
  currency: 'INR',
  description: 'Advanced poultry management for integrators (50K–5M birds). Multi-farm dashboard, WhatsApp automation, price intelligence, analytics, and priority support.',
});

// FAQPage JSON-LD Schema for pricing FAQ section
// Task Reference: TASK-WEB-022
const pricingFAQSchema = generateFAQSchema([
  {
    question: 'क्या कोई free trial है?',
    answer: 'हाँ, 14 दिन का free trial है। कोई credit card required नहीं है।',
  },
  {
    question: 'रद्द करने की प्रक्रिया क्या है?',
    answer: 'आप anytime से settings में जाकर cancel कर सकते हैं। कोई lock-in नहीं है।',
  },
  {
    question: 'क्या Enterprise pricing custom होती है?',
    answer: 'हाँ, Enterprise pricing custom होती है। Contact sales team for quote.',
  },
  {
    question: 'क्या data secure है?',
    answer: 'हाँ, DPDP Act 2023 compliant है। Data encrypted at rest और AWS Mumbai (ap-south-1) में hosted है।',
  },
  {
    question: 'WhatsApp alerts सभी plans में हैं?',
    answer: 'हाँ, WhatsApp alerts सभी plans में included हैं।',
  },
  {
    question: 'Multi-user access कब से?',
    answer: 'Team add-on से ₹500/user/month से multi-user access available है।',
  },
]);

export const metadata: Metadata = {
  title: 'Pricing — Simple Plans, Big Returns | FlockIQ',
  description: 'Choose the perfect plan for your farm. FARM (₹5,000/mo), PRO (₹8,000/mo), or Lifetime Deal. 14-day free trial, no credit card required.',
  keywords: ['poultry pricing', 'farm management pricing', 'WhatsApp automation pricing', 'integrator software pricing', 'poultry ERP cost'],
  openGraph: {
    title: 'Pricing — Simple Plans, Big Returns | FlockIQ',
    description: 'Choose the perfect plan for your farm. FARM (₹5,000/mo), PRO (₹8,000/mo), or Lifetime Deal. 14-day free trial.',
    url: 'https://flockiq.com/pricing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlockIQ Pricing Plans',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Simple Plans, Big Returns | FlockIQ',
    description: 'Choose the perfect plan for your farm. FARM (₹5,000/mo), PRO (₹8,000/mo), or Lifetime Deal. 14-day free trial.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://flockiq.com/pricing',
    languages: {
      'hi-IN': 'https://flockiq.com/pricing',
      'en-IN': 'https://flockiq.com/pricing?lang=en',
      'x-default': 'https://flockiq.com/pricing',
    },
  },
};

export default function PricingPage() {
  return (
    <>
      {/* Product JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flockIQFarmProductSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flockIQProProductSchema) }}
      />
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFAQSchema) }}
      />
      <Suspense fallback={<div>Loading pricing...</div>}>
        <PricingPageClient />
      </Suspense>
      {/* PartnerLogoStrip — builds trust with government data sources */}
      <PartnerLogoStrip />
      {/* DemoModal scoped to pricing page — relevant to enterprise CTA */}
      <DemoModal />
    </>
  );
}
