// FlockIQ — PoultryApp Alternative Page
// File: apps/web/app/(marketing)/alternatives/poultryapp/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'PoultryApp Alternative — Why FlockIQ is Better for Price Intelligence',
  description: 'Looking for a PoultryApp alternative? See why FlockIQ provides 7-day price forecasts with 95% accuracy for commercial poultry farmers.',
  keywords: ['PoultryApp alternative', 'alternative to PoultryApp', 'poultry price prediction app', 'broiler price forecasting'],
  openGraph: {
    title: 'PoultryApp Alternative — FlockIQ',
    description: 'Why FlockIQ is the better alternative for poultry price intelligence.',
    url: 'https://FlockIQ.ai/alternatives/poultryapp',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/alternatives/poultryapp',
  },
};

export default function PoultryAppAlternativePage() {
  const faqSchema = generateFAQSchema([
    { question: 'Why switch from PoultryApp to FlockIQ?', answer: 'FlockIQ provides 7-day price forecasts with 95% accuracy, while PoultryApp only shows current rates. If you need to plan your selling timing, FlockIQ is the better choice.' },
    { question: 'Is FlockIQ a complete replacement for PoultryApp?', answer: 'No - they serve different purposes. PoultryApp is excellent for farm management (production tracking, feed inventory, vaccination schedules). FlockIQ is specialized for price intelligence and selling decisions. Many farmers use both.' },
    { question: 'How much does FlockIQ cost compared to PoultryApp?', answer: 'PoultryApp is free. FlockIQ costs ₹2,000/month for commercial farmers (10K+ birds). The ROI is typically 6-10x from better selling timing.' },
  ]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://FlockIQ.ai' },
    { name: 'Alternatives', url: 'https://FlockIQ.ai/alternatives' },
    { name: 'PoultryApp Alternative', url: 'https://FlockIQ.ai/alternatives/poultryapp' },
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
              PoultryApp Alternative for Price Intelligence
            </h1>
            <p className="text-xl text-white/90 mb-6">
              PoultryApp is great for farm management. FlockIQ is built for price intelligence. Here's why commercial farmers switch.
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

      {/* Why People Look for Alternatives */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Why Farmers Look Beyond PoultryApp
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red50 rounded-xl p-6 border border-red200">
              <h3 className="text-xl font-bold text-red900 mb-4">
                PoultryApp Limitations
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">No price prediction - only shows current rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">No forward visibility for planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">English-only interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">No HPAI or disease outbreak alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red600 text-xl">✗</span>
                  <span className="text-red900">No WhatsApp integration</span>
                </li>
              </ul>
            </div>
            <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
              <h3 className="text-xl font-bold text-brandGreen900 mb-4">
                What Commercial Farmers Need
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">7-day price forecasts to plan harvest timing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">95%+ accuracy they can trust</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">Hindi-first interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">HPAI alerts 48 hours early</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brandGreen600 text-xl">✓</span>
                  <span className="text-brandGreen900">WhatsApp delivery - no app navigation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FlockIQ as the Alternative */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            FlockIQ: The Price Intelligence Alternative
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-neutral700 text-lg mb-6">
              <strong className="text-brandGreen700">FlockIQ is not a farm management tool — it's a price intelligence tool.</strong> While PoultryApp helps you manage your farm operations, FlockIQ helps you make better selling decisions.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-brandGreen700 mb-2">7 days</div>
                <div className="text-neutral600">Forward visibility vs 0 days</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brandGreen700 mb-2">95%+</div>
                <div className="text-neutral600">Accuracy vs current rates only</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brandGreen700 mb-2">₹20K+</div>
                <div className="text-neutral600">Avg monthly savings vs ₹0 cost</div>
              </div>
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
                  <th className="text-center p-4 font-semibold text-neutral700 border-b">PoultryApp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Primary Purpose</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Price intelligence</td>
                  <td className="p-4 border-b text-center text-neutral500">Farm management</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Price Prediction</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">7-day forecasts</td>
                  <td className="p-4 border-b text-center text-neutral500">None</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-neutral500">N/A</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">48 hours early</td>
                  <td className="p-4 border-b text-center text-neutral500">None</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Language</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">Hindi-first</td>
                  <td className="p-4 border-b text-center text-neutral500">English only</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Delivery</td>
                  <td className="p-4 border-b text-center text-brandGreen700 font-semibold">WhatsApp + App</td>
                  <td className="p-4 border-b text-center text-neutral500">App only</td>
                </tr>
                <tr>
                  <td className="p-4 text-neutral700 font-semibold">Cost</td>
                  <td className="p-4 text-center text-brandGreen700 font-semibold">₹2,000/month</td>
                  <td className="p-4 text-center text-neutral500">Free</td>
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
            Who Should Switch to FlockIQ
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Commercial farmers (10K+ birds)</strong> — You have measurable losses from bad timing and can afford ₹2,000/month for intelligence that saves ₹20,000+</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Farmers needing forward visibility</strong> — You want to plan your harvest 7 days ahead, not react to today's rates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Hindi-speaking farmers</strong> — You prefer an interface in your language</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600 text-xl">✓</span>
                <span className="text-neutral700"><strong>Farmers losing ₹50K+ per batch</strong> — You feel the pain of bad timing acutely and need a solution</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Both */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Pro Tip: Use Both
          </h2>
          <div className="bg-neutral50 rounded-xl p-8">
            <p className="text-neutral700 text-lg mb-4">
              <strong className="text-brandGreen700">Many successful farmers use both tools:</strong>
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600">•</span>
                <span className="text-neutral700"><strong>PoultryApp</strong> for farm management — production tracking, feed inventory, vaccination schedules, mortality records</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600">•</span>
                <span className="text-neutral700"><strong>FlockIQ</strong> for price intelligence — 7-day forecasts, HPAI alerts, selling decisions</span>
              </li>
            </ul>
            <p className="text-neutral600 mt-4">
              They solve different problems. You don't have to choose — you can use the best tool for each job.
            </p>
          </div>
        </div>
      </section>

      {/* Migration Path */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Easy Migration
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-neutral700 text-lg mb-6">
              Switching to FlockIQ is simple:
            </p>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-neutral700">Sign up for FlockIQ (2-minute process)</li>
              <li className="text-neutral700">Connect your WhatsApp number for daily delivery</li>
              <li className="text-neutral700">Get your first 7-day forecast within 24 hours</li>
              <li className="text-neutral700">Continue using PoultryApp for farm management</li>
            </ol>
            <p className="text-neutral600 mt-6">
              No data migration needed — FlockIQ works independently alongside your existing tools.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Add Price Intelligence to Your Farm
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your 14-day free trial. See the difference 7-day forecasts make.
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
