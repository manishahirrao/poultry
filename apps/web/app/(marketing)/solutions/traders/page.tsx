// FlockIQ — S4 Trader/Broker Page
// File: apps/web/app/(marketing)/solutions/traders/page.tsx
// Version: v1.0 | May 2026
// Task Reference: IP-04
// Requirements: FR-SEO-002, FR-SEO-003
// Design Reference: 11_industry_pages_components_master.md §1.3

import type { Metadata } from 'next';
import { Section } from '../../../../components/ui/Section';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import Link from 'next/link';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FlockIQ for Traders — Know When to Buy From Farmers, When to Sell to Processors',
    description: 'Poultry traders and brokers के लिए AI-powered price intelligence। Farmer sell-signal intelligence, district-level supply forecast, price negotiation intelligence, interstate arbitrage signal।',
    keywords: ['poultry trader intelligence', 'broker price signals', 'mandi supply forecast', 'price negotiation data', 'interstate arbitrage poultry'],
    openGraph: {
      type: 'website',
      locale: 'hi_IN',
      alternateLocale: ['en_IN'],
      url: 'https://FlockIQ.ai/solutions/traders',
      siteName: 'FlockIQ',
      title: 'FlockIQ for Traders — Know When to Buy From Farmers, When to Sell to Processors',
      description: 'Poultry traders and brokers के लिए AI-powered price intelligence।',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Traders',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FlockIQ for Traders — Know When to Buy From Farmers, When to Sell to Processors',
      description: 'Poultry traders and brokers के लिए AI-powered price intelligence।',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: 'https://FlockIQ.ai/solutions/traders',
      languages: {
        'hi-IN': 'https://FlockIQ.ai/solutions/traders',
        'en-IN': 'https://FlockIQ.ai/solutions/traders?lang=en',
        'x-default': 'https://FlockIQ.ai/solutions/traders',
      },
    },
  };
}

// JSON-LD Schema for Trader Page
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Traders',
      description: 'AI-powered price intelligence for poultry traders and brokers',
      url: 'https://FlockIQ.ai/solutions/traders',
    },
    {
      '@type': 'Service',
      name: 'Poultry Trader Price Intelligence Service',
      description: 'AI-powered price signals and market intelligence for poultry traders and brokers',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
      serviceType: 'Price Intelligence',
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    },
  ],
};

export default function TradersPage() {
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
            खरीदने का सही वक्त, बेचने का सही वक्त — दोनों AI से
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8">
            Farmers को 7-day forecast नहीं पता। आपको पता होगा।
          </p>
        </div>
      </Section>

      {/* Trader Intelligence Value Prop */}
      <Section background="tinted" size="lg">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 font-[Sora] mb-4">
                Farmers don't know the 7-day forecast. You will.
              </h2>
              <p className="text-neutral-700 text-lg leading-relaxed">
                Buy when signals show a 5-day hold recommendation (farmers will hold, 
                prices may dip 1-2 days before reversing). Sell when signals say sell.
                That's the arbitrage window — ethically, using public data. Live bird vs dressed bird price spreads tracked (₹10-15/kg typical).
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Features for Traders */}
      <Section background="white" size="lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            Features for Traders
          </h2>

          {/* Feature 1: Farmer Sell-Signal Intelligence */}
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Farmer Sell-Signal Intelligence
                </h3>
                <p className="text-neutral-700">
                  See which mandis will see high sell pressure today vs this week.
                  High supply (Cobb 400, Ross 308, Hubbard batches reaching 35-42 days) = price pressure. Low supply = buying opportunity.
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">📊</div>
                  <p className="text-sm text-neutral-600">Sell Pressure</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature 2: District-Level Supply Forecast */}
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  District-Level Supply Forecast
                </h3>
                <p className="text-neutral-700">
                  Gorakhpur vs Deoria vs Kushinagar — where is supply peaking?
                  Where is it thin? Routing intelligence for truck procurement (₹0.50-1.00/kg transport cost for 50-100km).
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">🗺️</div>
                  <p className="text-sm text-neutral-600">Supply Map</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature 3: Price Negotiation Intelligence */}
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Price Negotiation Intelligence
                </h3>
                <p className="text-neutral-700">
                  When farmer offers ₹162 (live bird), but our P50 forecast is ₹168 in 3 days —
                  that's negotiation data. When forecast shows drop, offer accordingly. FCR-adjusted pricing (1.6 vs 1.8) factored.
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">💰</div>
                  <p className="text-sm text-neutral-600">Negotiation Data</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature 4: Interstate Arbitrage Signal */}
          <Card variant="elevated" padding="lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Interstate Arbitrage Signal
                </h3>
                <p className="text-neutral-700">
                  Gorakhpur vs Hyderabad/Vijayawada price differential (₹8-12/kg typical).
                  When AP surplus (Cobb 400, Ross 308) moves north, it depresses UP prices 3-5 days later.
                  We track the differential daily with transport cost factoring.
                </p>
              </div>
              <div className="w-full md:w-1/3 bg-brandGreen50 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-5xl mb-2">🔄</div>
                  <p className="text-sm text-neutral-600">Arbitrage Signal</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Ethical Framing Note */}
      <Section background="tinted" size="lg">
        <div className="max-w-3xl mx-auto">
          <Card variant="default" padding="lg" className="border-brandGreen200">
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Ethical Market Intelligence
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                This is public data used intelligently. AGMARKNET records prices for everyone.
                We simply analyze faster. Using market intelligence is standard practice
                in commodity trading globally.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white" size="lg">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-4">
            Arbitrage edge पाने ready हैं?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            PulsePro plan gives you daily signals, district-level forecasts, 
            and interstate arbitrage intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              href="/pricing"
              trailingArrow={true}
            >
              Trader Intelligence Plan
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              href="/enterprise"
            >
              Enterprise Demo
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
