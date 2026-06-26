// FlockIQ — Location Pages (Dynamic Route)
// File: apps/web/app/(marketing)/locations/[slug]/page.tsx
// Version: v3.0 | June 2026

import { Metadata } from 'next';
import Link from 'next/link';
import { getLocationData, getNearbyDistricts, fetchCurrentPrice, fetchPriceHistory, fetchPriceForecast, type LocationData, type LocationWithDistance } from '@/lib/location-data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { FadeUp } from '@/components/motion/FadeUp';
import { CountUp } from '@/components/motion/CountUp';

// STATIC GENERATION: Pre-generate pages for all live districts
export async function generateStaticParams() {
  return [
    { slug: 'gorakhpur' },
    { slug: 'deoria' },
    { slug: 'kushinagar' },
    { slug: 'basti' },
    { slug: 'maharajganj' },
  ];
}

// DYNAMIC METADATA: Includes live price from Supabase
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationData(slug);
  if (!location) {
    return {
      title: 'Location Not Found | FlockIQ',
    };
  }

  const currentPrice = await fetchCurrentPrice(slug);

  return {
    title: `FlockIQ ${location.nameEn} — Broiler Price ₹${currentPrice}/kg + 7-Day Forecast`,
    description: `Today's ${location.nameEn} broiler price: ₹${currentPrice}/kg. AI forecast for 7 days. ${location.farms}+ farms using FlockIQ in ${location.nameEn} district.`,
    keywords: [
      `${location.nameEn} broiler price`,
      `${location.nameEn} mandi bhav`,
      `${location.nameHi} मुर्गी भाव`,
      'broiler price prediction',
      'poultry price forecast',
    ],
    openGraph: {
      title: `${location.nameEn} Broiler Price — Live Mandi Bhav + AI Forecast`,
      description: `Today's ${location.nameEn} broiler price: ₹${currentPrice}/kg. 7-day AI forecast with 96.2% accuracy.`,
      url: `https://flockiq.com/locations/${slug}`,
      siteName: 'FlockIQ',
      locale: 'en_US',
      alternateLocale: ['hi_IN'],
    },
    alternates: {
      canonical: `https://flockiq.com/locations/${slug}`,
      languages: {
        'en': `https://flockiq.com/locations/${slug}`,
        'hi-IN': `https://flockiq.com/locations/${slug}?lang=hi`,
      },
    },
  };
}

// LIVE PRICE WIDGET COMPONENT (ISR 60s)
async function LivePriceWidget({ slug }: { slug: string }) {
  const currentPrice = await fetchCurrentPrice(slug);
  const priceHistory = await fetchPriceHistory(slug);
  const forecast = await fetchPriceForecast(slug);
  const location = getLocationData(slug);

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Live Price Widget</h3>
        <p className="text-sm text-neutral-500">Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-2">Today's Price</p>
          <p className="text-4xl font-bold text-brand-700">
            ₹<CountUp end={currentPrice} duration={800} />
          </p>
          <p className="text-sm text-neutral-500">per kg</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-2">7-Day Forecast (P50)</p>
          <p className="text-4xl font-bold text-brand-700">
            ₹<CountUp end={forecast.p50} duration={800} />
          </p>
          <p className="text-sm text-neutral-500">per kg</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-2">Forecast Range</p>
          <p className="text-2xl font-bold text-brand-700">
            ₹{forecast.p10} – ₹{forecast.p90}
          </p>
          <p className="text-sm text-neutral-500">P10 – P90</p>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <h4 className="text-sm font-semibold text-neutral-700 mb-4">7-Day Price History</h4>
        <div className="flex items-end gap-2 h-24">
          {priceHistory.map((item, index) => {
            const maxPrice = Math.max(...priceHistory.map(p => p.price));
            const priceMin = location?.priceRange?.min ?? 100;
            const height = ((item.price - priceMin) / (maxPrice - priceMin)) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-brand-400 rounded-t-sm transition-all hover:bg-brand-500"
                  style={{ height: `${Math.max(height, 10)}%` }}
                  title={`${item.date}: ₹${item.price}`}
                />
                <p className="text-xs text-neutral-500 mt-1">{item.date.split('-').slice(1).join('/')}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// DISTRICT MARKET PROFILE COMPONENT
function DistrictMarketProfile({ location }: { location: LocationData }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-4">Market Profile</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {location.nameEn} के किसान हमें भरोसा करते हैं
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {location.nameHi} जिले में {location.farms.toLocaleString()}+ से अधिक वाणिज्यिक पोल्ट्री फार्म FlockIQ का उपयोग करते हैं
            </p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8">
          <FadeUp delay={0.1}>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏭</span>
              </div>
              <p className="text-4xl font-bold text-brand-700 mb-2">
                <CountUp end={location.farms} duration={1200} suffix="+" />
              </p>
              <p className="text-neutral-600">Commercial Farms</p>
            </Card>
          </FadeUp>

          <FadeUp delay={0.2}>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-4xl font-bold text-brand-700 mb-2">96.2%</p>
              <p className="text-neutral-600">Directional Accuracy</p>
            </Card>
          </FadeUp>

          <FadeUp delay={0.3}>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏪</span>
              </div>
              <p className="text-4xl font-bold text-brand-700 mb-2">{location.mandis.length}</p>
              <p className="text-neutral-600">Local Mandis Covered</p>
            </Card>
          </FadeUp>
        </div>

        <FadeUp delay={0.4} className="mt-12">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Local Mandis</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {location.mandis.map((mandi) => (
                <div key={mandi} className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-400 rounded-full" />
                  <span className="text-neutral-700">{mandi}</span>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>
      </div>
    </section>
  );
}

// LOCAL TESTIMONIALS COMPONENT
function LocalTestimonials({ location }: { location: LocationData }) {
  const testimonials = location.testimonials || [];

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-brand-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-4">Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Farmer Stories from {location.nameEn}
            </h2>
            <p className="text-lg text-neutral-600">
              {location.nameHi} के किसानों की आवाज़
            </p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <FadeUp key={index} delay={index * 0.1}>
              <Card className="p-8 bg-brand-50 border border-brand-200">
                <p className="text-lg text-neutral-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">{testimonial.location}</p>
                  </div>
                  <Badge variant="success">{testimonial.savings} Saved</Badge>
                </div>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ COMPONENT WITH STRUCTURED DATA
function FAQSection({ location }: { location: LocationData }) {
  const faqItems = location.faqItems || [];

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600">
              {location.nameEn} के बारे में आम सवाल
            </p>
          </div>
        </FadeUp>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <FadeUp key={index} delay={index * 0.1}>
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-2">{item.q}</h3>
                <p className="text-neutral-600">{item.a}</p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// NEARBY DISTRICTS STRIP COMPONENT
function NearbyDistricts({ location }: { location: LocationData }) {
  const nearbyDistricts = getNearbyDistricts(location.slug);

  if (nearbyDistricts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-4">Nearby Locations</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Nearby Districts
            </h2>
            <p className="text-lg text-neutral-600">
              {location.nameHi} के आस-पास के जिले
            </p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyDistricts.map((district, index) => (
            <FadeUp key={district.slug} delay={index * 0.1}>
              <Link href={`/locations/${district.slug}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <h3 className="font-semibold text-neutral-900 mb-1">{district.nameEn}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{district.nameHi}</p>
                  <div className="flex items-center gap-2 text-sm text-brand-600">
                    <span>{district.distance} km</span>
                    <span>→</span>
                  </div>
                </Card>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// STRUCTURED DATA GENERATOR
function generateStructuredData(location: LocationData, currentPrice: number) {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `FlockIQ - ${location.nameEn}`,
    description: `Poultry price intelligence and management platform for ${location.nameEn} district. Today's broiler price: ₹${currentPrice}/kg.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.nameEn,
      addressRegion: location.state,
      addressCountry: 'IN',
    },
    areaServed: [
      {
        '@type': 'City',
        name: location.nameEn,
      },
      ...location.mandis.map((mandi) => ({
        '@type': 'Place',
        name: mandi,
      })),
    ],
    priceRange: `₹${location.priceRange.min} - ₹${location.priceRange.max}`,
  };

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: location.nameEn,
    alternateName: location.nameHi,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.nameEn,
      addressRegion: location.state,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.lat,
      longitude: location.lng,
    },
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: location.faqItems?.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return { localBusinessSchema, placeSchema, faqPageSchema };
}

// MAIN PAGE COMPONENT
export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = getLocationData(slug);
  
  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Location Not Found</h1>
          <Link href="/locations" className="text-brand-600 hover:text-brand-700">
            ← Back to All Locations
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = await fetchCurrentPrice(slug);
  const { localBusinessSchema, placeSchema, faqPageSchema } = generateStructuredData(location, currentPrice);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-20 md:py-24">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <Link href="/locations" className="text-white/70 hover:text-white text-sm inline-flex items-center gap-2 mb-6">
                ← Back to All Locations
              </Link>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {location.nameEn} मुर्गी भाव — 7 दिन आगे का अनुमान
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl">
                {location.nameHi} में रोज़ सटीक मुर्गी भाव अनुमान। AGMARKNET data + AI model। 7-day forecast for {location.nameEn} belt.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="accent" size="lg" pill asChild>
                  <Link href="/signup">Start Free Trial — 14 Days</Link>
                </Button>
                <Button variant="ghost" size="lg" pill className="text-white bg-white/15 hover:bg-white/20" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* Live Price Widget */}
        <section className="py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <LivePriceWidget slug={slug} />
            </FadeUp>
          </div>
        </section>

        {/* District Market Profile */}
        <DistrictMarketProfile location={location} />

        {/* Local Testimonials */}
        <LocalTestimonials location={location} />

        {/* FAQ Section */}
        <FAQSection location={location} />

        {/* Nearby Districts */}
        <NearbyDistricts location={location} />

        {/* CTA Section */}
        <section className="py-16 bg-brand-700 text-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeUp>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get {location.nameEn} Price Intelligence
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start your 14-day free trial and see accurate 7-day price predictions for {location.nameEn}.
              </p>
              <Button variant="secondary" size="lg" pill asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </FadeUp>
          </div>
        </section>
      </div>
    </>
  );
}
