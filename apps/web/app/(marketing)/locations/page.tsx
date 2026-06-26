// FlockIQ — Location Pages Hub
// File: apps/web/app/(marketing)/locations/page.tsx
// Version: v3.0 | June 2026

import { Metadata } from 'next';
import Link from 'next/link';
import { getLiveLocations, getComingSoonLocations } from '@/lib/location-data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { FadeUp } from '@/components/motion/FadeUp';

export const metadata: Metadata = {
  title: 'Poultry Price Intelligence by Location — FlockIQ',
  description: 'Get accurate 7-day broiler price predictions for your district. Covering Gorakhpur belt and expanding across Uttar Pradesh. Hindi-first support.',
  keywords: ['poultry price by location', 'district-wise broiler price', 'UP poultry price', 'मंडी भाव जिला'],
  openGraph: {
    title: 'Poultry Price Intelligence by Location',
    description: 'District-level broiler price forecasts for commercial poultry farmers in UP.',
    url: 'https://flockiq.com/locations',
  },
  alternates: {
    canonical: 'https://flockiq.com/locations',
  },
};

export default function LocationsHubPage() {
  const liveLocations = getLiveLocations();
  const comingSoonLocations = getComingSoonLocations();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-20 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Poultry Price Intelligence by Location
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Get accurate 7-day broiler price predictions for your district. 
                Currently serving the Gorakhpur belt with expansion across Uttar Pradesh.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="accent" size="lg" pill asChild>
                  <Link href="/signup">Start Free Trial — 14 Days</Link>
                </Button>
                <Button variant="ghost" size="lg" pill className="text-white bg-white/15 hover:bg-white/20" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Live Locations */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              Available Locations
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveLocations.map((location, index) => (
              <FadeUp key={location.slug} delay={index * 0.1}>
                <Link href={`/locations/${location.slug}`}>
                  <Card hover className="p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-1">
                          {location.nameEn}
                        </h3>
                        <p className="text-neutral-500 text-sm">{location.nameHi}</p>
                      </div>
                      <Badge variant="success">Live</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">State:</span>
                        <span className="text-neutral-700">{location.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Price Range:</span>
                        <span className="text-neutral-700">₹{location.priceRange.min}–₹{location.priceRange.max}/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Farms:</span>
                        <span className="text-neutral-700">{location.farms.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <span className="text-brand-600 font-semibold text-sm">
                        View Price Forecast →
                      </span>
                    </div>
                  </Card>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoonLocations.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
                Coming Soon
              </h2>
            </FadeUp>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonLocations.map((location, index) => (
                <FadeUp key={location.slug} delay={index * 0.1}>
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-1">
                          {location.nameEn}
                        </h3>
                        <p className="text-neutral-500 text-sm">{location.nameHi}</p>
                      </div>
                      <Badge variant="warning">Coming Soon</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">State:</span>
                        <span className="text-neutral-700">{location.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Farms:</span>
                        <span className="text-neutral-700">{location.farms.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              How Location-Based Price Intelligence Works
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            <FadeUp delay={0.1}>
              <Card className="p-6">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  District-Specific Data
                </h3>
                <p className="text-neutral-600">
                  We analyze AGMARKNET mandi data, NECC rates, and local factors specific to your district for accurate predictions.
                </p>
              </Card>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Card className="p-6">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  AI Price Prediction
                </h3>
                <p className="text-neutral-600">
                  Our AI models predict prices 7 days ahead with 96.2% directional accuracy verified on 847 predictions.
                </p>
              </Card>
            </FadeUp>
            <FadeUp delay={0.3}>
              <Card className="p-6">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  Daily Sell Signals
                </h3>
                <p className="text-neutral-600">
                  Receive daily WhatsApp and app notifications telling you when to sell, hold, or wait.
                </p>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Price Intelligence for Your District
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start your 14-day free trial and see accurate 7-day price predictions for your location.
            </p>
            <Button variant="secondary" size="lg" pill asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
