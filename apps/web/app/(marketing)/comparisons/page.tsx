// FlockIQ — Comparison Pages Hub (v3.0)
// File: apps/web/app/(marketing)/comparisons/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-COMP-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 12
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-COMP-001

import { Metadata } from 'next';
import comparisonsData from '@/lib/data/comparisons.json';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FlockIQ Comparisons — See Why We\'re Different',
  description: 'Compare FlockIQ with WhatsApp groups, manual mandi calling, and other alternatives. See why 95%+ accuracy matters.',
  keywords: ['FlockIQ vs WhatsApp', 'poultry price app comparison', 'best poultry price tool'],
  openGraph: {
    title: 'FlockIQ Comparisons',
    description: 'See how FlockIQ compares to alternatives for poultry price intelligence.',
    url: 'https://flockiq.com/comparisons',
  },
  alternates: {
    canonical: 'https://flockiq.com/comparisons',
  },
};

export default function ComparisonsHubPage() {
  const comparisons = comparisonsData.comparisons;
  return (
    <div className="min-h-screen bg-neutral50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              FlockIQ vs Alternatives
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              See how FlockIQ compares to WhatsApp groups, manual mandi calling, and other alternatives.
              Understand why 95%+ accuracy and 7-day forecasts matter.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-brandGreen500 hover:bg-brandGreen400 text-white px-8 py-4 rounded-full font-semibold transition-all"
            >
              Try FlockIQ Free
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Detailed Comparisons
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.id}
                href={`/comparisons/${comparison.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral900 mb-1">
                      FlockIQ vs {comparison.name}
                    </h3>
                    <p className="text-neutral500 text-sm">{comparison.nameHi}</p>
                  </div>
                  <span className="bg-neutral100 text-neutral700 text-xs px-3 py-1 rounded-full font-semibold">
                    {comparison.category}
                  </span>
                </div>
                <p className="text-neutral600 text-sm mb-4 line-clamp-3">
                  {comparison.description}
                </p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral500">Forward Visibility:</span>
                    <span className="text-neutral700">{comparison.features.forwardVisibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral500">Accuracy:</span>
                    <span className="text-neutral700">{comparison.features.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral500">Cost:</span>
                    <span className="text-neutral700">{comparison.pricing.type}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral100">
                  <span className="text-brandGreen600 font-semibold text-sm">
                    View Full Comparison →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Quick Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral50">
                  <th className="text-left p-4 font-semibold text-neutral900 border-b">Feature</th>
                  <th className="text-center p-4 font-semibold text-brandGreen700 border-b">FlockIQ</th>
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">WhatsApp Groups</th>
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">Manual Calling</th>
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">No Tool</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700">Forward Visibility</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">7 days</td>
                  <td className="p-4 border-b text-center text-neutral500">0 days</td>
                  <td className="p-4 border-b text-center text-neutral500">1 day max</td>
                  <td className="p-4 border-b text-center text-neutral500">None</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-neutral500">Unverified</td>
                  <td className="p-4 border-b text-center text-neutral500">Varies</td>
                  <td className="p-4 border-b text-center text-neutral500">N/A</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">48 hours early</td>
                  <td className="p-4 border-b text-center text-neutral500">When news spreads</td>
                  <td className="p-4 border-b text-center text-neutral500">When you hear</td>
                  <td className="p-4 border-b text-center text-neutral500">Never</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700">Time to Get Signal</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">6:30 AM auto</td>
                  <td className="p-4 border-b text-center text-neutral500">Whenever posted</td>
                  <td className="p-4 border-b text-center text-neutral500">30+ min calling</td>
                  <td className="p-4 border-b text-center text-neutral500">N/A</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700">Hindi Support</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Full ✓</td>
                  <td className="p-4 border-b text-center text-neutral500">Mixed</td>
                  <td className="p-4 border-b text-center text-neutral500">Depends</td>
                  <td className="p-4 border-b text-center text-neutral500">N/A</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700">P10/P50/P90 Range</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">✓</td>
                  <td className="p-4 border-b text-center text-neutral500">✗</td>
                  <td className="p-4 border-b text-center text-neutral500">✗</td>
                  <td className="p-4 border-b text-center text-neutral500">✗</td>
                </tr>
                <tr>
                  <td className="p-4 text-neutral700">Monthly Cost</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">₹2,000</td>
                  <td className="p-4 text-center text-neutral500">Free</td>
                  <td className="p-4 text-center text-neutral500">30 min/day</td>
                  <td className="p-4 text-center text-neutral500">₹50K+ loss</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why FlockIQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Why Choose FlockIQ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                95%+ Accuracy
              </h3>
              <p className="text-neutral600 text-sm">
                Verified accuracy on 6-month Gorakhpur holdout data.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                7-Day Forecast
              </h3>
              <p className="text-neutral600 text-sm">
                Know prices a week ahead, not just yesterday's news.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Hindi-First
              </h3>
              <p className="text-neutral600 text-sm">
                Designed for Indian farmers. Full Hindi support.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                HPAI Alerts
              </h3>
              <p className="text-neutral600 text-sm">
                48-hour early warning to protect your flock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Guessing, Start Knowing
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 200+ farmers using FlockIQ to make better selling decisions.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-brandGreen700 px-8 py-4 rounded-full font-semibold hover:bg-neutral50 transition-all"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
