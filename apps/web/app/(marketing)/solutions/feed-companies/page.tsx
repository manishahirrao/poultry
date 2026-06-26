// FlockIQ — S3 Feed Companies Page
// File: apps/web/app/(marketing)/solutions/feed-companies/page.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-013
// Requirements: REQ-WEB-005 §W5.3

import type { Metadata } from 'next';
import SolutionsPageTemplate, { 
  type SolutionsPageProps, 
  type PainPoint, 
  type Feature 
} from '../components/SolutionsPageTemplate';
import PageViewTracker from '../components/PageViewTracker';

// Generate metadata for SEO
// Task Reference: TASK-WEB-022
// Requirement Refs: GWEB-003
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Feed Demand Forecasting | FlockIQ for Feed Companies',
    description: 'Know where feed demand will surge 6 weeks before it happens. Commodity futures dashboard, 30-day production planning, demand signal index for feed manufacturers.',
    keywords: ['feed demand forecasting', 'poultry feed production planning', 'commodity price intelligence', 'maize procurement timing', 'soybean price forecast'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://FlockIQ.ai/solutions/feed-companies',
      siteName: 'FlockIQ',
      title: 'Feed Demand Forecasting | FlockIQ for Feed Companies',
      description: 'AI-powered demand forecasting for feed manufacturers with 6-week forward visibility.',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Feed Companies',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Feed Demand Forecasting | FlockIQ for Feed Companies',
      description: 'AI-powered demand forecasting for feed manufacturers with 6-week forward visibility.',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: 'https://FlockIQ.ai/solutions/feed-companies',
      languages: {
        'hi-IN': 'https://FlockIQ.ai/solutions/feed-companies',
        'en-IN': 'https://FlockIQ.ai/solutions/feed-companies?lang=en',
        'x-default': 'https://FlockIQ.ai/solutions/feed-companies',
      },
    },
  };
}

// JSON-LD Schema for Feed Companies Page
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Feed Companies',
      description: 'AI-powered demand forecasting and commodity intelligence for poultry feed manufacturers',
      url: 'https://FlockIQ.ai/solutions/feed-companies',
    },
    {
      '@type': 'Service',
      name: 'Feed Demand Forecasting Service',
      description: 'AI-powered demand forecasting and commodity intelligence for poultry feed manufacturers',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
      serviceType: 'Demand Forecasting',
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    },
  ],
};

// Segment-specific content for feed companies
const feedCompaniesContent: SolutionsPageProps = {
  segment: 'feed-companies',
  metadata: {
    title: 'Feed Demand Forecasting | FlockIQ for Feed Companies',
    description: 'Know where feed demand will surge 6 weeks before it happens. Commodity futures dashboard, 30-day production planning.',
    keywords: ['feed demand forecasting', 'poultry feed production planning', 'commodity price intelligence'],
  },
  hero: {
    headline: {
      en: 'Know Where Feed Demand Will Surge — 6 Weeks Before It Happens',
    },
    subheadline: {
      en: 'Farmer sell signals predict feed demand patterns. Plan production, procurement, and distribution with AI-powered forward visibility.',
    },
    background: 'white',
  },
  stats: [
    { value: '6 weeks', label: 'Forward demand visibility' },
    { value: '47 sources', label: 'Data signals integrated' },
    { value: '95%+', label: 'Directional accuracy' },
    { value: '30-day', label: 'Production planning horizon' },
  ],
  painPoints: [
    {
      emoji: '📦',
      title: 'Feed Overstock from Demand Mis-Forecasting',
      description: 'Without forward visibility, you produce based on historical patterns. When farmers delay harvest by 2 weeks, feed sits in inventory. Working capital tied up, shelf life risk.',
      impact: '10% overstock on 5,000 MT production = 500 MT inventory carrying cost + risk',
    },
    {
      emoji: '💰',
      title: 'Procurement Cost from Poor Timing',
      description: 'Maize and soybean prices swing ₹200-400/quintal monthly. Buying at peak vs trough means ₹10-20L difference on a single procurement order. No reliable signals.',
      impact: '₹200/quintal × 5,000 MT = ₹10L savings potential per procurement cycle',
    },
    {
      emoji: '⚠️',
      title: 'No Early Warning for Supply Shocks',
      description: 'HPAI outbreaks, transport strikes, or festival demand shifts happen with no warning. You learn about demand changes when orders stop coming. Reactive, not proactive.',
      impact: '2-3 week reaction time = missed production windows worth ₹25-50L',
    },
  ],
  features: [
    {
      emoji: '📊',
      title: 'Demand Signal Index',
      description: 'District-level forecast of feed demand based on farmer sell signals. See which districts will have 100K+ birds selling in the next 30 days and plan distribution accordingly.',
      benefit: '6-week forward visibility enables optimal production scheduling',
    },
    {
      emoji: '📈',
      title: 'Commodity Futures Dashboard',
      description: 'Real-time intelligence on maize, soybean, and other key feed ingredients. Price forecasts, volatility alerts, and optimal procurement timing signals.',
      benefit: 'Procurement at optimal timing saves ₹10-20L per cycle',
    },
    {
      emoji: '📅',
      title: '30-Day Production Planning',
      description: 'AI-powered production schedules based on demand forecasts. Plan pre-starter, starter, and finisher feed production with precision. Reduce overstock by 15-20%.',
      benefit: 'Working capital optimization through precise production planning',
    },
    {
      emoji: '🗺️',
      title: 'Multi-District Heat Map',
      description: 'Visual map of production concentration and demand hotspots. Identify emerging markets and allocate distribution resources efficiently.',
      benefit: 'Strategic distribution planning based on real-time demand data',
    },
    {
      emoji: '🔔',
      title: 'Supply Shock Early Warning',
      description: 'Alerts for HPAI zones, transport disruptions, and demand anomalies. Get 48-72 hour advance notice before demand shifts impact your orders.',
      benefit: 'Proactive response prevents ₹25-50L in missed opportunities',
    },
    {
      emoji: '📋',
      title: 'Breed-Specific Formulation Planning',
      description: 'Demand forecasts segmented by breed (Cobb 400, Ross 308, Hubbard). Plan nutrient-specific feed production with accurate volume estimates.',
      benefit: 'Precision formulation reduces waste and improves margins',
    },
    {
      emoji: '🔗',
      title: 'API Integration',
      description: 'RESTful API for seamless integration with your ERP and production planning systems. Automated data flow eliminates manual reconciliation.',
      benefit: 'Zero manual data entry, 100% data accuracy',
    },
    {
      emoji: '📊',
      title: 'Historical Demand Analytics',
      description: '12-month historical data with pattern recognition. Identify seasonal trends, festival impacts, and long-term demand shifts for strategic planning.',
      benefit: 'Data-driven strategic decisions for capacity planning',
    },
  ],
  primaryCta: {
    label: 'Talk to Sales',
    href: '/demo?segment=feed-company',
  },
  finalCta: {
    headline: 'Ready to Transform Your Feed Production Planning?',
    subheadline: 'Schedule a consultation to see how demand forecasting can optimize your operations and reduce costs.',
    trustSignals: [
      '✅ 6-week forward visibility',
      '✅ Commodity intelligence included',
      '✅ API integration ready',
      '✅ Dedicated support team',
    ],
  },
};

export default function FeedCompaniesPage() {
  return (
    <>
      <PageViewTracker segment="feed-companies" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SolutionsPageTemplate {...feedCompaniesContent} />
    </>
  );
}
