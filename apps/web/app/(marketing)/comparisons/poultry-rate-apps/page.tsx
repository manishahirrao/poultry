// FlockIQ — Poultry Rate Apps Comparison Page
// File: apps/web/app/(marketing)/comparisons/poultry-rate-apps/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import comparisonsData from '@/lib/data/comparisons.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'FlockIQ vs Poultry Rate Apps — Which is Better?',
  description: 'Compare FlockIQ with poultry rate apps. See why AI-powered 7-day forecasts beat daily rate checking apps for selling decisions.',
  keywords: ['FlockIQ vs poultry rate apps', 'poultry rate app comparison', 'broiler price prediction app'],
  openGraph: {
    title: 'FlockIQ vs Poultry Rate Apps',
    description: 'See why AI-powered price intelligence beats daily rate checking apps for poultry farmers.',
    url: 'https://FlockIQ.ai/comparisons/poultry-rate-apps',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/comparisons/poultry-rate-apps',
  },
};

export default function PoultryRateAppsComparisonPage() {
  const comparisons = comparisonsData.comparisons;
  const comparison = comparisons.find((c: any) => c.slug === 'poultry-rate-apps');
  
  if (!comparison) {
    return <div>Comparison not found</div>;
  }

  const faqSchema = generateFAQSchema([
    { question: `What are ${comparison.name}?`, answer: comparison.description },
    { question: `What are the pros of ${comparison.name}?`, answer: comparison.pros.join(', ') },
    { question: `What are the cons of ${comparison.name}?`, answer: comparison.cons.join(', ') },
  ]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://FlockIQ.ai' },
    { name: 'Comparisons', url: 'https://FlockIQ.ai/comparisons' },
    { name: comparison.name, url: `https://FlockIQ.ai/comparisons/${comparison.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-neutral50">
      <Schema schema={faqSchema} />
      <Schema schema={breadcrumbSchema} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-4">
              <Link href="/comparisons" className="text-white/70 hover:text-white text-sm">
                ← Back to All Comparisons
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              FlockIQ vs Poultry Rate Apps
            </h1>
            <p className="text-xl text-white/90 mb-6">
              See why AI-powered 7-day forecasts beat daily rate checking apps for selling decisions.
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

      {/* Quick Verdict */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Quick Verdict
          </h2>
          <div className="bg-brandGreen50 rounded-xl p-8 border border-brandGreen200">
            <p className="text-xl text-brandGreen900 font-semibold mb-4">
              {comparison.verdict}
            </p>
            <p className="text-brandGreen800 text-lg">
              {comparison.verdictHi}
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Feature-by-Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-neutral50">
                  <th className="text-left p-4 font-semibold text-neutral900 border-b">Feature</th>
                  <th className="text-center p-4 font-semibold text-brandGreen700 border-b">FlockIQ</th>
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">Poultry Rate Apps</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Forward Visibility</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">7 days</td>
                  <td className="p-4 border-b text-center text-neutral500">0 days (current rates only)</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-neutral500">Varies by app</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">48 hours early</td>
                  <td className="p-4 border-b text-center text-neutral500">None</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Time to Get Signal</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">6:30 AM auto</td>
                  <td className="p-4 border-b text-center text-neutral500">When you check app</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Hindi Support</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Full ✓</td>
                  <td className="p-4 border-b text-center text-neutral500">Varies by app</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Data Sources</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">47 public sources + AI</td>
                  <td className="p-4 border-b text-center text-neutral500">Public rate aggregation</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">P10/P50/P90 Range</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">✓</td>
                  <td className="p-4 border-b text-center text-neutral500">✗</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 text-neutral700 font-semibold">Monthly Cost</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">₹2,000</td>
                  <td className="p-4 text-center text-neutral500">Free (ad-supported)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deep Dive */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Deep Dive: Key Differences
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
              <h3 className="text-xl font-bold text-brandGreen900 mb-4">
                Why FlockIQ Wins for Selling Decisions
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">7-day price forecasts with 95%+ accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">HPAI disease alerts 48 hours early</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">WhatsApp delivery - no app navigation needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">P10/P50/P90 confidence ranges</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">No ads, clean experience</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue50 rounded-xl p-6 border border-blue200">
              <h3 className="text-xl font-bold text-blue900 mb-4">
                Why Poultry Rate Apps Win for Quick Checks
              </h3>
              <ul className="space-y-3">
                {comparison.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue600 text-xl">✓</span>
                    <span className="text-blue900">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* When to Choose Each */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            When to Choose Each
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-brandGreen700 mb-4">
                Choose FlockIQ If:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You have 10,000+ birds and need selling intelligence</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You want to plan ahead (7-day forecasts)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You're losing ₹50K+ per batch from bad timing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You need disease outbreak alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You prefer WhatsApp over app navigation</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-neutral700 mb-4">
                Choose Poultry Rate Apps If:
              </h3>
              <ul className="space-y-3">
                {comparison.bestFor.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-neutral500">•</span>
                    <span className="text-neutral700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem with Rate Apps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            The Problem with Rate-Only Apps
          </h2>
          <div className="bg-neutral50 rounded-xl p-8">
            <p className="text-neutral700 text-lg mb-4">
              <strong className="text-brandGreen700">Rate apps tell you today's price — but that's already too late.</strong> By the time you check the app, the market has already moved. You're always reacting, never planning ahead.
            </p>
            <p className="text-neutral600 mb-4">
              FlockIQ tells you what the price will be 7 days from now, so you can plan your harvest timing, feed procurement, and selling strategy in advance.
            </p>
            <p className="text-neutral500 text-sm">
              Rajesh from Gorakhpur: "पहले मैं app check करता था — लेकिन तब तक price बदल चुका होता था। अब FlockIQ मुझे 7 दिन पहले बता देता है।"
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Checking, Start Planning
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get 7-day forecasts with 95%+ accuracy. Start your free trial today.
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
