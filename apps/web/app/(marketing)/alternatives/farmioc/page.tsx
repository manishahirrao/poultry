// FlockIQ — Farmioc Alternative Page
// File: apps/web/app/(marketing)/alternatives/farmioc/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'Farmioc Alternative — Why FlockIQ is Better for Poultry Farmers',
  description: 'Looking for a Farmioc alternative for poultry price intelligence? See why FlockIQ provides specialized broiler forecasting with 95% accuracy.',
  keywords: ['Farmioc alternative', 'alternative to Farmioc', 'poultry price intelligence', 'broiler price forecasting'],
  openGraph: {
    title: 'Farmioc Alternative — FlockIQ',
    description: 'Why FlockIQ is the better alternative for poultry farmers.',
    url: 'https://FlockIQ.ai/alternatives/farmioc',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/alternatives/farmioc',
  },
};

export default function FarmiocAlternativePage() {
  const faqSchema = generateFAQSchema([
    { question: 'Why switch from Farmioc to FlockIQ?', answer: 'Farmioc is a broad agri intelligence platform for 200+ crops. FlockIQ is specialized for broiler price forecasting with 95% accuracy, Hindi support, and WhatsApp delivery — built specifically for poultry farmers.' },
    { question: 'Is FlockIQ cheaper than Farmioc?', answer: 'Farmioc requires custom pricing (contact sales). FlockIQ has transparent pricing at ₹2,000/month for commercial farmers. No sales calls needed.' },
    { question: 'Who should use FlockIQ instead of Farmioc?', answer: 'Individual poultry farmers (10K+ birds) who need specialized broiler price intelligence. Farmioc is better for agri-businesses, traders, and researchers who need broad commodity data.' },
  ]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://FlockIQ.ai' },
    { name: 'Alternatives', url: 'https://FlockIQ.ai/alternatives' },
    { name: 'Farmioc Alternative', url: 'https://FlockIQ.ai/alternatives/farmioc' },
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
              <Link href="/alternatives" className="text-white/70 hover:text-white text-sm">
                ← Back to All Alternatives
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Farmioc Alternative for Poultry Farmers
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Farmioc is powerful for agri-businesses. FlockIQ is built for poultry farmers. Here's why specialists win.
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

      {/* Why Farmers Look for Alternatives */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Why Poultry Farmers Look Beyond Farmioc
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red50 rounded-xl p-6 border border-red200">
              <h3 className="text-xl font-bold text-red900 mb-4">
                Farmioc Limitations for Farmers
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">Not poultry-specific — covers 200+ crops</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">Pricing not transparent (custom quotes)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">English-only interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">Complex platform (not farmer-friendly)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">Targeted at businesses, not individual farmers</span>
                </li>
              </ul>
            </div>
            <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
              <h3 className="text-xl font-bold text-brandGreen900 mb-4">
                What Poultry Farmers Need
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Specialized broiler price forecasting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Transparent pricing (₹2,000/month)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Hindi-first interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Simple, farmer-friendly design</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">WhatsApp delivery — no complex platform</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist vs Generalist */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Specialist vs Generalist
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-neutral700 text-lg mb-6">
              <strong className="text-brandGreen700">Farmioc is a generalist:</strong> It provides market intelligence for 200+ crops across agriculture. Powerful for traders, researchers, and agri-businesses who need broad commodity data.
            </p>
            <p className="text-neutral700 text-lg mb-6">
              <strong className="text-brandGreen700">FlockIQ is a specialist:</strong> It does one thing exceptionally well — broiler price forecasting for Indian poultry farmers. 95%+ accuracy, Hindi-first, WhatsApp delivery.
            </p>
            <div className="bg-neutral50 rounded-lg p-6 mt-6">
              <p className="text-neutral600 italic">
                "When you have a specific problem, you want a specialist, not a generalist. If you're a poultry farmer trying to decide when to sell your flock, FlockIQ is built for exactly that."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Detailed Comparison
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
                  <td className="p-4 border-b text-neutral700 font-semibold">Target User</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Individual farmers</td>
                  <td className="p-4 border-b text-center text-neutral500">Businesses & traders</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-neutral500">Not publicly disclosed</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Language</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Hindi-first</td>
                  <td className="p-4 border-b text-center text-neutral500">English only</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Delivery</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">WhatsApp + App</td>
                  <td className="p-4 border-b text-center text-neutral500">Web Platform + API</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Pricing</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">₹2,000/month</td>
                  <td className="p-4 border-b text-center text-neutral500">Custom (contact sales)</td>
                </tr>
                <tr>
                  <td className="p-4 text-neutral700 font-semibold">Setup Time</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">2 minutes</td>
                  <td className="p-4 text-center text-neutral500">Sales process + setup</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Who Should Switch */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Who Should Choose FlockIQ
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Commercial poultry farmers (10K+ birds)</strong> — You need specialized broiler intelligence, not broad commodity data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Hindi-speaking farmers</strong> — You prefer an interface in your language</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Farmers wanting transparent pricing</strong> — You don't want to go through a sales process</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>WhatsApp-first users</strong> — You want intelligence delivered, not a complex platform to navigate</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Farmers needing HPAI alerts</strong> — You need 48-hour early warning for disease outbreaks</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who Should Stay with Farmioc */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Farmioc is Better For:
          </h2>
          <div className="bg-neutral50 rounded-xl p-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-neutral500 text-xl">•</span>
                <span className="text-neutral700"><strong>Agri-businesses and traders</strong> — Who need intelligence across multiple commodities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neutral500 text-xl">•</span>
                <span className="text-neutral700"><strong>Researchers and analysts</strong> — Who need comprehensive agricultural data and analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neutral500 text-xl">•</span>
                <span className="text-neutral700"><strong>Large farmers with diverse crops</strong> — Who need broad market intelligence beyond poultry</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neutral500 text-xl">•</span>
                <span className="text-neutral700"><strong>Enterprises needing API access</strong> — Who want to integrate market data into their systems</span>
              </li>
            </ul>
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
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
