// FlockIQ — Farmioc Comparison Page
// File: apps/web/app/(marketing)/comparisons/farmioc/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import comparisonsData from '@/lib/data/comparisons.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'FlockIQ vs Farmioc — Which is Better for Poultry Farmers?',
  description: 'Compare FlockIQ with Farmioc. See why specialized poultry price intelligence beats broad agri platforms for broiler farmers.',
  keywords: ['FlockIQ vs Farmioc', 'agri intelligence platform', 'poultry price forecasting comparison'],
  openGraph: {
    title: 'FlockIQ vs Farmioc',
    description: 'See why specialized poultry price intelligence beats broad agri platforms for broiler farmers.',
    url: 'https://FlockIQ.ai/comparisons/farmioc',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/comparisons/farmioc',
  },
};

export default function FarmiocComparisonPage() {
  const comparisons = comparisonsData.comparisons;
  const comparison = comparisons.find((c: any) => c.slug === 'farmioc');
  
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
              FlockIQ vs Farmioc
            </h1>
            <p className="text-xl text-white/90 mb-6">
              See why specialized poultry price intelligence beats broad agri platforms for broiler farmers.
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
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">Farmioc</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Focus</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Poultry-specific (broiler)</td>
                  <td className="p-4 border-b text-center text-neutral500">200+ crops (broad agri)</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Forward Visibility</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">7 days</td>
                  <td className="p-4 border-b text-center text-neutral500">Short-term forecasts</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-neutral500">Not publicly disclosed</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">48 hours early</td>
                  <td className="p-4 border-b text-center text-neutral500">None</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Hindi Support</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Full ✓</td>
                  <td className="p-4 border-b text-center text-neutral500">English only</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Target User</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Farmers</td>
                  <td className="p-4 border-b text-center text-neutral500">Businesses & Traders</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Delivery</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">WhatsApp + App</td>
                  <td className="p-4 border-b text-center text-neutral500">Web Platform + API</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 text-neutral700 font-semibold">Pricing</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">₹2,000/month</td>
                  <td className="p-4 text-center text-neutral500">Custom (contact sales)</td>
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
                Why FlockIQ Wins for Poultry Farmers
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Specialized for broiler price forecasting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">95%+ accuracy publicly verified</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Hindi-first, WhatsApp delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Transparent pricing (₹2,000/month)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">HPAI disease alerts (48 hours early)</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue50 rounded-xl p-6 border border-blue200">
              <h3 className="text-xl font-bold text-blue900 mb-4">
                Why Farmioc Wins for Agri-Businesses
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
                  <span className="text-neutral700">You're a commercial poultry farmer (10K+ birds)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You need specialized broiler price intelligence</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You prefer Hindi interface and WhatsApp delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You want transparent, farmer-friendly pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600">•</span>
                  <span className="text-neutral700">You need HPAI and disease outbreak alerts</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-neutral700 mb-4">
                Choose Farmioc If:
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

      {/* Different Tools for Different Jobs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Different Tools for Different Jobs
          </h2>
          <div className="bg-neutral50 rounded-xl p-8">
            <p className="text-neutral700 text-lg mb-4">
              <strong className="text-brandGreen700">Key insight:</strong> Farmioc is a powerful platform for agri-businesses, traders, and researchers who need broad commodity intelligence across 200+ crops. FlockIQ is specialized for individual poultry farmers who need accurate, actionable price predictions for their broiler operations.
            </p>
            <p className="text-neutral600">
              If you're a poultry farmer trying to decide when to sell your flock, FlockIQ is built specifically for your use case with verified accuracy, Hindi support, and WhatsApp delivery.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Specialized Poultry Intelligence
          </h2>
          <p className="text-xl text-white/90 mb-8">
            95%+ accuracy, Hindi-first, WhatsApp delivery. Start your free trial today.
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
