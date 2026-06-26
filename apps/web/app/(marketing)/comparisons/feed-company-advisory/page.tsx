// FlockIQ — Feed Company Advisory Comparison Page
// File: apps/web/app/(marketing)/comparisons/feed-company-advisory/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import comparisonsData from '@/lib/data/comparisons.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'FlockIQ vs Feed Company Advisory — Which is Better?',
  description: 'Compare FlockIQ with feed company advisory. See why independent AI forecasts beat biased sales rep advice.',
  keywords: ['FlockIQ vs feed company', 'feed company advisory', 'poultry price app comparison', 'sales rep price advice'],
  openGraph: {
    title: 'FlockIQ vs Feed Company Advisory',
    description: 'See why independent AI-powered price intelligence beats biased feed company advisory.',
    url: 'https://FlockIQ.ai/comparisons/feed-company-advisory',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/comparisons/feed-company-advisory',
  },
};

export default function FeedCompanyAdvisoryComparisonPage() {
  const comparisons = comparisonsData.comparisons;
  const comparison = comparisons.find((c: any) => c.slug === 'feed-company-advisory');
  
  if (!comparison) {
    return <div>Comparison not found</div>;
  }

  const faqSchema = generateFAQSchema([
    { question: `What is ${comparison.name}?`, answer: comparison.description },
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
              FlockIQ vs Feed Company Advisory
            </h1>
            <p className="text-xl text-white/90 mb-6">
              See why independent AI forecasts with 95% accuracy beat biased sales rep advice.
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
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">Feed Company Advisory</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Forward Visibility</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">7 days</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.forwardVisibility}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.accuracy}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">48-hour early warning</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.hpaiAlerts}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Time to Get Signal</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">6:30 AM daily</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.timeToSignal}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Hindi Support</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Full Hindi interface</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.hindiSupport}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Data Sources</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">2,000+ mandis</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.dataSources}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">P10/P50/P90 Range</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.p10p50p90 ? '✓' : '✗'}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.p10p50p90 ? '✓' : '✗'}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 text-neutral700 font-semibold">Monthly Cost</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">₹2,000</td>
                  <td className="p-4 text-center text-neutral500">{comparison.pricing.type}</td>
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
                Why FlockIQ Wins
              </h3>
              <ul className="space-y-3">
                {comparison.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-brandGreen600 text-xl">✓</span>
                    <span className="text-brandGreen900">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber50 rounded-xl p-6 border border-amber200">
              <h3 className="text-xl font-bold text-amber900 mb-4">
                Feed Company Advisory Limitations
              </h3>
              <ul className="space-y-3">
                {comparison.cons.map((con: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-amber600 text-xl">✗</span>
                    <span className="text-amber900">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Conflict of Interest Warning */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            The Conflict of Interest Problem
          </h2>
          <div className="bg-red50 rounded-xl p-8 border border-red200">
            <p className="text-red900 text-lg mb-4">
              Feed company sales reps have a natural conflict of interest — they earn more when you buy more feed. This can lead to:
            </p>
            <ul className="space-y-3 text-red800">
              <li className="flex items-start gap-3">
                <span className="text-red600 text-xl">⚠</span>
                <span>Biased timing advice to maximize feed sales</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red600 text-xl">⚠</span>
                <span>Infrequent updates (only when sales rep visits)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red600 text-xl">⚠</span>
                <span>No AI prediction or data-driven insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red600 text-xl">⚠</span>
                <span>Dependent on individual sales rep's knowledge</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* When to Choose Each */}
      <section className="py-16 bg-white">
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
                {comparison.bestFor.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-brandGreen600">•</span>
                    <span className="text-neutral700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-neutral700 mb-4">
                Stick with Feed Company Advisory If:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-neutral500">•</span>
                  <span className="text-neutral700">You are loyal to one feed company</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral500">•</span>
                  <span className="text-neutral700">Small to medium farms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral500">•</span>
                  <span className="text-neutral700">You value personal relationships</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Independent, Unbiased Price Intelligence
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
