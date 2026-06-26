// FlockIQ — Solutions Index Page
// File: apps/web/app/(marketing)/solutions/page.tsx
// Version: v1.0 | May 2026
// Task Reference: IP-01
// Requirements: FR-SEO-002, FR-SEO-003
// Design Reference: 11_industry_pages_components_master.md §7

import type { Metadata } from 'next';
import { Section } from '../../../components/ui/Section';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';
import PartnerLogoStrip from '@/components/home/PartnerLogoStrip';
import RoiCalculator from '@/components/home/RoiCalculator';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FlockIQ Solutions — Industry-Specific Intelligence | Integrators, Feed Manufacturers, Traders',
    description: 'भारत के poultry industry के हर segment के लिए AI-powered solutions — Integrators, Feed Manufacturers, Traders, QSR Chains, Insurers/Banks। 7 दिन पहले price intelligence।',
    keywords: ['poultry solutions India', 'integrator dashboard', 'feed manufacturer intelligence', 'trader price signals', 'QSR procurement', 'poultry insurance data'],
    openGraph: {
      type: 'website',
      locale: 'hi_IN',
      alternateLocale: ['en_IN'],
      url: 'https://FlockIQ.ai/solutions',
      siteName: 'FlockIQ',
      title: 'FlockIQ Solutions — Industry-Specific Intelligence',
      description: 'भारत के poultry industry के हर segment के लिए AI-powered solutions।',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ — Industry Solutions',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FlockIQ Solutions — Industry-Specific Intelligence',
      description: 'भारत के poultry industry के हर segment के लिए AI-powered solutions।',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: 'https://FlockIQ.ai/solutions',
      languages: {
        'hi-IN': 'https://FlockIQ.ai/solutions',
        'en-IN': 'https://FlockIQ.ai/solutions?lang=en',
        'x-default': 'https://FlockIQ.ai/solutions',
      },
    },
  };
}

// JSON-LD Schema for Solutions Hub
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ Solutions',
      description: 'Industry-specific AI solutions for poultry sector',
      url: 'https://FlockIQ.ai/solutions',
    },
    {
      '@type': 'CollectionPage',
      name: 'Poultry Solutions Hub',
      description: 'Hub page linking to all segment-specific pages',
      hasPart: [
        {
          '@type': 'WebPage',
          name: 'Integrator Solutions',
          url: 'https://FlockIQ.ai/solutions/integrators',
        },
        {
          '@type': 'WebPage',
          name: 'Feed Manufacturer Solutions',
          url: 'https://FlockIQ.ai/solutions/feed-manufacturers',
        },
        {
          '@type': 'WebPage',
          name: 'Trader Solutions',
          url: 'https://FlockIQ.ai/solutions/traders',
        },
        {
          '@type': 'WebPage',
          name: 'QSR Chain Solutions',
          url: 'https://FlockIQ.ai/solutions/qsr',
        },
        {
          '@type': 'WebPage',
          name: 'Insurer/Bank Solutions',
          url: 'https://FlockIQ.ai/solutions/insurers',
        },
      ],
    },
  ],
};

// Segment card data
const segments = [
  {
    id: 'integrators',
    icon: '🏢',
    nameHi: 'Integrators',
    nameEn: 'Contract Farming Companies',
    painHi: '20+ farms का daily tracking manually impossible',
    metricHi: '20+ farms, 1 dashboard में manage',
    link: '/solutions/integrators',
  },
  {
    id: 'feed-manufacturers',
    icon: '🌾',
    nameHi: 'Feed Manufacturers',
    nameEn: 'Commercial Feed Companies',
    painHi: 'Demand unpredictability → overproduction या stockout',
    metricHi: 'Sell signals से demand forecasting',
    link: '/solutions/feed-manufacturers',
  },
  {
    id: 'traders',
    icon: '📊',
    nameHi: 'Traders/Brokers',
    nameEn: 'Poultry Traders & Brokers',
    painHi: 'Price uncertainty से margin compression',
    metricHi: 'Buy & sell timing intelligence',
    link: '/solutions/traders',
  },
  {
    id: 'qsr',
    icon: '🍗',
    nameHi: 'QSR Chains',
    nameEn: 'Quick Service Restaurants',
    painHi: 'Procurement cost volatility → menu pricing instability',
    metricHi: '7-day procurement calendar',
    link: '/solutions/qsr',
  },
  {
    id: 'insurers',
    icon: '🏦',
    nameHi: 'Insurers/Banks',
    nameEn: 'Agri Insurers & Banks',
    painHi: 'Poultry insurance pricing में actuarial uncertainty',
    metricHi: 'Parametric insurance के लिए verified price data',
    link: '/solutions/insurers',
  },
];

export default function SolutionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <Section background="white" size="lg">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 font-[Sora] leading-tight mb-6">
            Industry-Specific Intelligence
            <span className="block text-brandGreen700 mt-2">
              हर segment के लिए AI-powered solutions
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8">
            भारत के poultry industry के हर segment — Integrators, Feed Manufacturers, Traders,
            QSR Chains, Insurers/Banks — के लिए 7 दिन पहले price intelligence।
          </p>
        </div>
      </Section>

      {/* Solutions Grid */}
      <Section background="tinted" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Row 1: Integrators, Feed Manufacturers, Traders */}
          {segments.slice(0, 3).map((segment) => (
            <Link key={segment.id} href={segment.link}>
              <Card variant="default" hover={true} padding="lg">
                <div className="text-4xl mb-4">{segment.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  {segment.nameHi}
                </h3>
                <p className="text-sm text-neutral-500 mb-3">{segment.nameEn}</p>
                <p className="text-neutral-700 mb-4">{segment.painHi}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brandGreen700">
                    {segment.metricHi}
                  </span>
                  <span className="text-brandGreen700 font-semibold">
                    और जानें →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Row 2: QSR Chains, Insurers/Banks (centred) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {segments.slice(3, 5).map((segment) => (
            <Link key={segment.id} href={segment.link}>
              <Card variant="default" hover={true} padding="lg">
                <div className="text-4xl mb-4">{segment.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  {segment.nameHi}
                </h3>
                <p className="text-sm text-neutral-500 mb-3">{segment.nameEn}</p>
                <p className="text-neutral-700 mb-4">{segment.painHi}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brandGreen700">
                    {segment.metricHi}
                  </span>
                  <span className="text-brandGreen700 font-semibold">
                    और जानें →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* S1 Farmers Link */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-brandGreen700 font-semibold hover:text-brandGreen600 transition-colors"
          >
            <span>S1 किसानों के लिए →</span>
          </Link>
          <p className="text-neutral-600 mt-2 text-sm">
            व्यक्तिगत किसान? Homepage पर जाएं — WhatsApp signal free trial
          </p>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white" size="lg">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-4">
            अपने business के लिए सही solution खोजें
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            हमारी enterprise team आपके specific requirements को समझकर
            customized solution design करेगी।
          </p>
          <Button
            variant="primary"
            size="lg"
            href="https://calendly.com/FlockIQ/enterprise-demo"
            trailingArrow={true}
          >
            Enterprise team से बात करें
          </Button>
        </div>
      </Section>

      {/* PartnerLogoStrip — builds trust with government data sources */}
      <PartnerLogoStrip />

      {/* RoiCalculator — shows financial benefits for different segments */}
      <RoiCalculator />
    </>
  );
}
