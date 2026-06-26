// FlockIQ — S6 Insurer/Bank Page
// File: apps/web/app/(marketing)/solutions/insurers/page.tsx
// Version: v1.0 | May 2026
// Task Reference: IP-06
// Requirements: FR-SEO-002, FR-SEO-003
// Design Reference: 11_industry_pages_components_master.md §1.5

import type { Metadata } from 'next';
import { Section } from '../../../../components/ui/Section';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import Link from 'next/link';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FlockIQ for Insurers & Banks — Actuarially Sound Poultry Price Data for Parametric Insurance',
    description: 'Agri insurers, NABARD, regional co-operative banks के लिए verified poultry price data। Historical price database, price volatility analytics, HPAI event attribution, forward-looking risk indicator।',
    keywords: ['poultry insurance data', 'parametric insurance design', 'actuarial poultry pricing', 'NABARD agriculture data', 'livestock price history'],
    openGraph: {
      type: 'website',
      locale: 'hi_IN',
      alternateLocale: ['en_IN'],
      url: 'https://FlockIQ.ai/solutions/insurers',
      siteName: 'FlockIQ',
      title: 'FlockIQ for Insurers & Banks — Actuarially Sound Poultry Price Data for Parametric Insurance',
      description: 'Agri insurers, NABARD, regional co-operative banks के लिए verified poultry price data।',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Insurers & Banks',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FlockIQ for Insurers & Banks — Actuarially Sound Poultry Price Data for Parametric Insurance',
      description: 'Agri insurers, NABARD, regional co-operative banks के लिए verified poultry price data।',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: 'https://FlockIQ.ai/solutions/insurers',
      languages: {
        'hi-IN': 'https://FlockIQ.ai/solutions/insurers',
        'en-IN': 'https://FlockIQ.ai/solutions/insurers?lang=en',
        'x-default': 'https://FlockIQ.ai/solutions/insurers',
      },
    },
  };
}

// JSON-LD Schema for Insurer Page
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Insurers & Banks',
      description: 'Actuarially sound poultry price data for parametric insurance design',
      url: 'https://FlockIQ.ai/solutions/insurers',
    },
    {
      '@type': 'Service',
      name: 'Poultry Price Data Service for Insurance',
      description: 'Actuarially sound historical and forward-looking poultry price data for parametric insurance design',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
      serviceType: 'Data Service',
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    },
    {
      '@type': 'DataCatalog',
      name: 'FlockIQ Price Database',
      description: 'Historical and forward-looking poultry price data for insurance and banking',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
    },
  ],
};

export default function InsurersPage() {
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
            Parametric Insurance के लिए Actuarially Sound Data
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8">
            Verified poultry price data for parametric insurance products
          </p>
        </div>
      </Section>

      {/* Insurer Value Proposition */}
      <Section background="tinted" size="lg">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 font-[Sora] mb-4">
                Traditional poultry insurance pays out on mortality.
              </h2>
              <h2 className="text-2xl font-bold text-brandGreen700 font-[Sora] mb-4">
                Parametric poultry insurance can pay out on price movements.
              </h2>
              <p className="text-neutral-700 text-lg leading-relaxed">
                For that, you need: reliable, auditable district-level price history.
                That's exactly what FlockIQ provides.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Data Product for Insurers */}
      <Section background="white" size="lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            Insurers के लिए Data Product
          </h2>

          {/* Feature 1: Historical Price Database */}
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Historical Price Database (12 months)
                </h3>
                <p className="text-neutral-700 mb-3">
                  District-level: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
                </p>
                <p className="text-neutral-700">
                  AGMARKNET-validated: every data point cross-checked
                  Format: CSV, JSON, via API
                  Coverage: daily data, 5 mandis, 12 months
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">📊</div>
                  <p className="text-sm text-neutral-600">Price History</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature 2: Price Volatility Analytics */}
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Price Volatility Analytics
                </h3>
                <p className="text-neutral-700">
                  Monthly MAPE, standard deviation, seasonal pattern analysis
                  Useful for: actuarial table construction, premium pricing
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">📈</div>
                  <p className="text-sm text-neutral-600">Volatility Data</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature 3: HPAI Event Attribution */}
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  HPAI Event Attribution
                </h3>
                <p className="text-neutral-700">
                  Historical HPAI events mapped to price impact
                  Data: event date, affected zone, price impact (₹/kg), recovery timeline
                  Useful for: event-triggered insurance product design
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">🦠</div>
                  <p className="text-sm text-neutral-600">Event Mapping</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature 4: Forward-Looking Risk Indicator */}
          <Card variant="elevated" padding="lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Forward-Looking Risk Indicator
                </h3>
                <p className="text-neutral-700">
                  7-day P10 (downside) as risk signal for claim likelihood estimation
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">⚠️</div>
                  <p className="text-sm text-neutral-600">Risk Signal</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* NABARD Alignment */}
      <Section background="tinted" size="lg">
        <div className="max-w-3xl mx-auto">
          <Card variant="default" padding="lg" className="border-brandGreen200">
            <div className="text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                NABARD Alignment
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                FlockIQ data aligns with NABARD's Digital Agriculture Mission
                objective of data-driven agri-financial products.
                We support data licensing for NABARD empanelled insurer products.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white" size="lg">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-4">
            Parametric insurance products design करने ready हैं?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            हमारी team आपके actuarial team के साथ मिलकर 
            data licensing agreement structure करेगी।
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            href="/contact?type=insurer-partnership"
            trailingArrow={true}
          >
            Data Partnership Enquiry
          </Button>
        </div>
      </Section>
    </>
  );
}
