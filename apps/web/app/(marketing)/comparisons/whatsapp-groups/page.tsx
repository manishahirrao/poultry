// FlockIQ — WhatsApp Groups Comparison Page
// File: apps/web/app/(marketing)/comparisons/whatsapp-groups/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import comparisonsData from '@/lib/data/comparisons.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'FlockIQ vs WhatsApp Mandi Groups — Which is Better?',
  description: 'Compare FlockIQ with WhatsApp mandi groups. See why 7-day forecasts and 95% accuracy beat yesterday\'s news.',
  keywords: ['FlockIQ vs WhatsApp', 'WhatsApp mandi groups', 'poultry price app comparison'],
  openGraph: {
    title: 'FlockIQ vs WhatsApp Mandi Groups',
    description: 'See why AI-powered price intelligence beats WhatsApp groups for poultry farmers.',
    url: 'https://FlockIQ.ai/comparisons/whatsapp-groups',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/comparisons/whatsapp-groups',
  },
};

export default function WhatsAppGroupsComparisonPage() {
  const comparisons = comparisonsData.comparisons;
  const comparison = comparisons.find((c: any) => c.slug === 'whatsapp-groups');
  
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
              FlockIQ vs WhatsApp Mandi Groups
            </h1>
            <p className="text-xl text-white/90 mb-6">
              See why AI-powered 7-day forecasts with 95% accuracy beat yesterday's news from WhatsApp groups.
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
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">WhatsApp Groups</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Forward Visibility</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.forwardVisibility}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.forwardVisibility}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.accuracy}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.accuracy}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.hpaiAlerts}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.hpaiAlerts}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Time to Get Signal</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.timeToSignal}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.timeToSignal}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Hindi Support</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.hindiSupport}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.hindiSupport}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Data Sources</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.dataSources}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.dataSources}</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">P10/P50/P90 Range</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">{comparison.features.p10p50p90 ? '✓' : '✗'}</td>
                  <td className="p-4 border-b text-center text-neutral500">{comparison.features.p10p50p90 ? '✓' : '✗'}</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 text-neutral700 font-semibold">Monthly Cost</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">{comparison.pricing.type}</td>
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
            <div className="bg-red50 rounded-xl p-6 border border-red200">
              <h3 className="text-xl font-bold text-red900 mb-4">
                WhatsApp Groups Limitations
              </h3>
              <ul className="space-y-3">
                {comparison.cons.map((con: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red600 text-xl">✗</span>
                    <span className="text-red900">{con}</span>
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
                Stick with WhatsApp Groups If:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-neutral500">•</span>
                  <span className="text-neutral700">You have &lt; 10,000 birds</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral500">•</span>
                  <span className="text-neutral700">Community connection is more important than accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neutral500">•</span>
                  <span className="text-neutral700">No other alternatives available in your area</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Real Farmer Stories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Farmers Who Switched
          </h2>
          <div className="bg-neutral50 rounded-xl p-8">
            <p className="text-neutral700 text-lg mb-4">
              "पहले मैं 3 WhatsApp groups में था — एक group में कोई post करता, दूसरे में कोई और। कौन सही है पता नहीं था। FlockIQ ने एक clear answer दिया। अब मैं बिना डर के बेचता हूँ।"
            </p>
            <p className="text-neutral500 text-sm">
              — राजेश यादव, गोरखपुर (25,000 पक्षी)
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Relying on Yesterday's News
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
