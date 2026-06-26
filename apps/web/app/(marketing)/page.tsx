// FlockIQ — Homepage Assembly
// File: apps/web/app/(marketing)/page.tsx
// Version: v3.1 | June 2026 — conversion architecture tightened (was 20 sections → 10)
// Task Reference: HOME-001, TEST-001
// Requirements: FR-HOME-001, FR-GLOBAL-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { HeroSection } from '../../components/marketing/hero/HeroSection';
import { StatsStrip } from '../../components/marketing/sections/StatsStrip';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
} from '../../lib/seo/schemas';

// Lazy load below-fold sections for better initial load performance
const ProblemCards = dynamic(() => import('../../components/home/ProblemCards'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const SegmentCards = dynamic(() => import('../../components/home/SegmentCards'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const HowItWorksSection = dynamic(() => import('../../components/home/HowItWorksSection'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const AccuracySection = dynamic(() => import('../../components/home/AccuracySection'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const StatisticsSummaryBox = dynamic(() => import('../../components/home/StatisticsSummaryBox'), {
  loading: () => <div className="h-64 animate-pulse bg-neutral-100" />,
});
const TestimonialsSection = dynamic(() => import('../../components/home/TestimonialsSection'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const PricingTeaserSection = dynamic(() => import('../../components/home/PricingTeaserSection'), {
  loading: () => <div className="h-64 animate-pulse bg-neutral-100" />,
});
const FAQSection = dynamic(() => import('../../components/home/FAQSection'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const TrustSection = dynamic(() => import('../../components/home/TrustSection'), {
  loading: () => <div className="h-64 animate-pulse bg-neutral-100" />,
});
const FinalCTASection = dynamic(() => import('../../components/home/FinalCTASection'), {
  loading: () => <div className="h-64 animate-pulse bg-neutral-100" />,
});
const FeatureTabsSection = dynamic(() => import('../../components/home/FeatureTabsSection'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const ProductMockup = dynamic(() => import('../../components/home/ProductMockup'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});
const FeaturesPreviewSection = dynamic(() => import('../../components/home/FeaturesPreviewSection'), {
  loading: () => <div className="h-96 animate-pulse bg-neutral-100" />,
});

// Sections removed from homepage (moved to dedicated pages):
// - FeatureGrid       → /features (full feature catalogue)
// - FeatureTabPreview → /features (interactive detail)
// - RoiCalculator     → /solutions/commercial-farms, /solutions/integrators
// - MarketingTestimonials → /about, /accuracy
// - AppDownloadSection → /features, /how-it-works
// - PainSection       → duplicate of ProblemCards
// - WhatsAppLogSection → /how-it-works (detail page)
// - ExpertQuotesSection → /about, /accuracy
//
// New arc: Hero → Stats → Problem → How It Works → Accuracy+Stats →
//          Segments → Testimonials → Pricing → FAQ → Trust → CTA

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FlockIQ — Poultry Management Platform | Global',
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence. 500+ farms across 15 countries.',
    keywords: ['poultry management', 'farm management', 'WhatsApp automation', 'batch tracking', 'FCR tracking', 'price intelligence', 'integrator software', 'poultry ERP'],
    alternates: {
      canonical: 'https://flockiq.com/',
      languages: {
        'hi-IN': 'https://flockiq.com/hi',
        'en-IN': 'https://flockiq.com/',
        'en-ID': 'https://flockiq.com/id',
        'en-VN': 'https://flockiq.com/vn',
        'en-TH': 'https://flockiq.com/th',
      },
    },
    openGraph: {
      title: 'FlockIQ — Poultry Management Platform',
      description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence.',
      url: 'https://flockiq.com/',
      siteName: 'FlockIQ',
      images: [{
        url: '/og-image.png',
        width: 1200, height: 630,
        alt: 'FlockIQ — Poultry Management Platform',
      }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FlockIQ — Poultry Management Platform',
      description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence.',
      images: ['/og-image.png'],
    },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

const organizationSchema = generateOrganizationSchema();
const webSiteSchema = generateWebSiteSchema();
const softwareApplicationSchema = generateSoftwareApplicationSchema();

const faqItems = [
  {
    question: 'How accurate is FlockIQ?',
    answer: 'FlockIQ achieves 96.2% directional accuracy — meaning 96+ out of 100 predictions get the right direction (up/down). MAPE is 4.8% — average error under ₹8/kg when price is ₹160. This is verified on 847 predictions across 15 countries.',
  },
  {
    question: 'Does it work on both iPhone and Android?',
    answer: 'Yes. FlockIQ works on both iOS and Android. It also works well on basic Android phones (₹8,000–15,000 range). The app loads in under 2 seconds even on slow 3G connections.',
  },
  {
    question: 'What happens after the 14-day trial?',
    answer: 'After 14 days, you can continue with PulseFarm (₹2,000/month) or upgrade to PulsePro (₹5,000/month). We only charge after you manually confirm — no automatic charges without permission.',
  },
  {
    question: 'What if I don\'t have internet?',
    answer: 'The app always shows the last cached data with a timestamp. We never show a blank screen. WhatsApp messages will still be delivered when you\'re back online.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Your data is stored on Supabase (AWS ap-south-1, Mumbai). DPDP Act 2023 compliant. Your data is never sold to third parties.',
  },
  {
    question: 'Does FlockIQ work outside India?',
    answer: 'FlockIQ is currently available in India, Indonesia, Vietnam, Thailand, and 11 other countries across 4 continents. We\'re expanding to more markets in Phase 2.',
  },
  {
    question: 'I have fewer than 10,000 birds — can I join?',
    answer: 'FlockIQ is designed for commercial farms with 10,000+ birds. For smaller farms, the ROI may not justify the subscription cost. We can add you to a waitlist for future small-farm plans.',
  },
  {
    question: 'Can I use WhatsApp only, or is the app required?',
    answer: 'WhatsApp is the primary delivery channel for daily logs and alerts. The app provides additional features (detailed analytics, profit calculator, historical reports), but core functionality works via WhatsApp.',
  },
];

const faqSchema = generateFAQSchema(faqItems);

const howToSteps = [
  {
    name: 'Connect Your Farms',
    text: 'Add your farms and batches in under 5 minutes. FlockIQ integrates with your existing workflow.',
  },
  {
    name: 'Automated Data Collection',
    text: 'Farmers submit daily data via WhatsApp — no app needed for them. FlockIQ parses and validates automatically.',
  },
  {
    name: 'Actionable Insights',
    text: 'Get daily FCR alerts, mortality tracking, price intelligence, and health warnings — all in one dashboard.',
  },
];

const howToSchema = generateHowToSchema(howToSteps);

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      {/* 1 — Hero: above-the-fold value proposition */}
      <HeroSection />
      {/* 2 — Stats: instant proof (200+ farms, 95.2% accuracy) */}
      <StatsStrip />
      {/* 3 — Problem: who this is for and what's broken */}
      <ProblemCards />
      {/* 4 — Segments: S1 / S2 / Feed / Enterprise split */}
      <SegmentCards />
      {/* 5 — How It Works: 3-step pipeline */}
      <HowItWorksSection />
      {/* 5.5 — Feature Tabs: interactive feature deep-dive */}
      <FeatureTabsSection />
      {/* 5.6 — Product Mockup: visual showcase */}
      <ProductMockup />
      {/* 5.7 — Features Preview: 57 features across 6 intelligence modules */}
      <FeaturesPreviewSection />
      {/* 6 — Accuracy + verified stats: proof section */}
      <AccuracySection />
      <StatisticsSummaryBox />
      {/* 7 — Social proof: testimonials */}
      <TestimonialsSection />
      {/* 8 — Pricing teaser: anchors expectation */}
      <PricingTeaserSection />
      {/* 9 — FAQ: reduces friction */}
      <FAQSection />
      {/* 10 — Trust + final CTA */}
      <TrustSection />
      <FinalCTASection />
    </>
  );
}
