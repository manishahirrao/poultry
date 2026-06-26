// FlockIQ — Compare Hub Page (v3.0)
// File: apps/web/app/(marketing)/compare/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-COMPARE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 14
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-COMPARE-001

import { Metadata } from 'next';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'Compare Poultry Price Intelligence Tools — FlockIQ vs Competitors',
  description: 'Compare FlockIQ with competitors including PoultryApp, Farmioc, and poultry rate apps. Find the best tool for broiler price forecasting and farm management.',
  keywords: ['compare poultry tools', 'FlockIQ vs competitors', 'poultry price forecasting comparison', 'agri intelligence comparison'],
  openGraph: {
    title: 'Compare Poultry Price Intelligence Tools',
    description: 'Compare FlockIQ with competitors.',
    url: 'https://flockiq.com/compare',
  },
  alternates: {
    canonical: 'https://flockiq.com/compare',
  },
};

export default function CompareHubPage() {
  const faqSchema = generateFAQSchema([
    { question: 'How do I compare different poultry tools?', answer: 'Use our comparison pages to see detailed breakdowns of features, pricing, and use cases. Compare FlockIQ with PoultryApp, Farmioc, rate apps, and more.' },
    { question: 'Which comparison should I read first?', answer: 'If you\'re looking for price intelligence, start with FlockIQ vs PoultryApp or FlockIQ vs Rate Apps. If you\'re researching broadly, check out the competitor vs competitor comparisons.' },
    { question: 'Are these comparisons unbiased?', answer: 'Yes, we provide accurate information about each tool\'s strengths and limitations. We highlight where FlockIQ excels but also acknowledge when other tools may be better for specific use cases.' },
  ]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://flockiq.com' },
    { name: 'Compare', url: 'https://flockiq.com/compare' },
  ]);

  const flockIQComparisons = [
    { name: 'FlockIQ vs PoultryApp', slug: '/comparisons/poultryapp', description: 'Price intelligence vs farm management' },
    { name: 'FlockIQ vs Farmioc', slug: '/comparisons/farmioc', description: 'Specialized vs broad agri intelligence' },
    { name: 'FlockIQ vs Rate Apps', slug: '/comparisons/poultry-rate-apps', description: 'Forecasting vs rate checking' },
    { name: 'FlockIQ vs WhatsApp Groups', slug: '/comparisons/whatsapp-groups', description: 'AI predictions vs community information' },
    { name: 'FlockIQ vs Manual Calling', slug: '/comparisons/manual-mandi-calling', description: 'Automated vs manual price gathering' },
  ];

  const competitorComparisons = [
    { name: 'PoultryApp vs Farmioc', slug: '/compare/poultryapp-vs-farmioc', description: 'Farm management vs agri intelligence' },
    { name: 'PoultryApp vs Rate Apps', slug: '/compare/poultryapp-vs-poultry-rate-apps', description: 'Management vs rate checking' },
    { name: 'Farmioc vs Rate Apps', slug: '/compare/farmioc-vs-poultry-rate-apps', description: 'Broad intelligence vs simple rates' },
  ];

  return (
    <div className="min-h-screen bg-neutral50">
      <Schema schema={faqSchema} />
      <Schema schema={breadcrumbSchema} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Compare Poultry Tools
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Detailed comparisons between FlockIQ and other poultry price intelligence tools. Make an informed decision for your farm.
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

      {/* FlockIQ vs Competitors */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            FlockIQ vs Competitors
          </h2>
          <p className="text-neutral600 mb-6">
            See how FlockIQ compares directly to other tools:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {flockIQComparisons.map((comp) => (
              <Link
                key={comp.slug}
                href={comp.slug}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <h3 className="text-xl font-bold text-neutral900 mb-2">{comp.name}</h3>
                <p className="text-neutral600 mb-4">{comp.description}</p>
                <span className="text-brandGreen600 font-semibold text-sm">
                  View Comparison →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor vs Competitor */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Competitor vs Competitor
          </h2>
          <p className="text-neutral600 mb-6">
            See how competitors compare to each other:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {competitorComparisons.map((comp) => (
              <Link
                key={comp.slug}
                href={comp.slug}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <h3 className="text-xl font-bold text-neutral900 mb-2">{comp.name}</h3>
                <p className="text-neutral600 mb-4">{comp.description}</p>
                <span className="text-brandGreen600 font-semibold text-sm">
                  View Comparison →
                </span>
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
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-neutral50">
                  <th className="text-left p-4 font-semibold text-neutral900 border-b">Feature</th>
                  <th className="text-center p-4 font-semibold text-brandGreen700 border-b">FlockIQ</th>
                  <th className="text-center p-4 font-semibold text-blue700 border-b">PoultryApp</th>
                  <th className="text-center p-4 font-semibold text-purple700 border-b">Farmioc</th>
                  <th className="text-center p-4 font-semibold text-orange700 border-b">Rate Apps</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Price Prediction</td>
                  <td className="p-4 border-b text-center text-brandGreen600 font-semibold">7-day forecasts</td>
                  <td className="p-4 border-b text-center text-blue600">None</td>
                  <td className="p-4 border-b text-center text-purple600">Short-term</td>
                  <td className="p-4 border-b text-center text-orange600">None</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Accuracy</td>
                  <td className="p-4 border-b text-center text-brandGreen600 font-semibold">95%+ verified</td>
                  <td className="p-4 border-b text-center text-blue600">N/A</td>
                  <td className="p-4 border-b text-center text-purple600">Not disclosed</td>
                  <td className="p-4 border-b text-center text-orange600">N/A</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">Farm Management</td>
                  <td className="p-4 border-b text-center text-brandGreen600">✗</td>
                  <td className="p-4 border-b text-center text-blue600 font-semibold">✓ Comprehensive</td>
                  <td className="p-4 border-b text-center text-purple600">Limited</td>
                  <td className="p-4 border-b text-center text-orange600">✗</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">Hindi Support</td>
                  <td className="p-4 border-b text-center text-brandGreen600 font-semibold">✓ Full</td>
                  <td className="p-4 border-b text-center text-blue600">✗</td>
                  <td className="p-4 border-b text-center text-purple600">✗</td>
                  <td className="p-4 border-b text-center text-orange600">Varies</td>
                </tr>
                <tr>
                  <td className="p-4 border-b text-neutral700 font-semibold">WhatsApp Delivery</td>
                  <td className="p-4 border-b text-center text-brandGreen600 font-semibold">✓</td>
                  <td className="p-4 border-b text-center text-blue600">✗</td>
                  <td className="p-4 border-b text-center text-purple600">✗</td>
                  <td className="p-4 border-b text-center text-orange600">✗</td>
                </tr>
                <tr className="bg-neutral50">
                  <td className="p-4 border-b text-neutral700 font-semibold">HPAI Alerts</td>
                  <td className="p-4 border-b text-center text-brandGreen600 font-semibold">✓ 48h early</td>
                  <td className="p-4 border-b text-center text-blue600">✗</td>
                  <td className="p-4 border-b text-center text-purple600">✗</td>
                  <td className="p-4 border-b text-center text-orange600">✗</td>
                </tr>
                <tr>
                  <td className="p-4 text-neutral700 font-semibold">Pricing</td>
                  <td className="p-4 text-center text-brandGreen600 font-semibold">₹2,000/month</td>
                  <td className="p-4 text-center text-blue600">Free</td>
                  <td className="p-4 text-center text-purple600">Custom (sales)</td>
                  <td className="p-4 text-center text-orange600">Free (ads)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Choose by Need */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Choose by Your Need
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
              <h3 className="text-xl font-bold text-brandGreen900 mb-4">
                For Price Intelligence
              </h3>
              <p className="text-brandGreen800 mb-4">
                <strong>FlockIQ</strong> is the clear choice for commercial farmers needing price predictions.
              </p>
              <Link
                href="/comparisons/poultryapp"
                className="inline-block bg-brandGreen600 hover:bg-brandGreen500 text-white px-6 py-2 rounded-full font-semibold transition-all"
              >
                Compare FlockIQ
              </Link>
            </div>
            <div className="bg-blue50 rounded-xl p-6 border border-blue200">
              <h3 className="text-xl font-bold text-blue900 mb-4">
                For Farm Management
              </h3>
              <p className="text-blue800 mb-4">
                <strong>PoultryApp</strong> is excellent for comprehensive farm management operations.
              </p>
              <Link
                href="/comparisons/poultryapp"
                className="inline-block bg-blue600 hover:bg-blue500 text-white px-6 py-2 rounded-full font-semibold transition-all"
              >
                Compare PoultryApp
              </Link>
            </div>
            <div className="bg-purple50 rounded-xl p-6 border border-purple200">
              <h3 className="text-xl font-bold text-purple900 mb-4">
                For Broad Agri Intelligence
              </h3>
              <p className="text-purple800 mb-4">
                <strong>Farmioc</strong> is better for businesses needing intelligence across multiple commodities.
              </p>
              <Link
                href="/comparisons/farmioc"
                className="inline-block bg-purple600 hover:bg-purple500 text-white px-6 py-2 rounded-full font-semibold transition-all"
              >
                Compare Farmioc
              </Link>
            </div>
            <div className="bg-orange50 rounded-xl p-6 border border-orange200">
              <h3 className="text-xl font-bold text-orange900 mb-4">
                For Quick Rate Checks
              </h3>
              <p className="text-orange800 mb-4">
                <strong>Rate Apps</strong> work well for farmers who just need today's rates.
              </p>
              <Link
                href="/comparisons/poultry-rate-apps"
                className="inline-block bg-orange600 hover:bg-orange500 text-white px-6 py-2 rounded-full font-semibold transition-all"
              >
                Compare Rate Apps
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Tip */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-neutral50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-neutral900 mb-4">
              Pro Tip: Use Multiple Tools
            </h2>
            <p className="text-neutral700 text-lg mb-4">
              The most successful farmers use multiple tools for different purposes:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600">•</span>
                <span className="text-neutral700"><strong>PoultryApp</strong> for farm management (production, feed, vaccination)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600">•</span>
                <span className="text-neutral700"><strong>FlockIQ</strong> for price intelligence (forecasts, selling decisions)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brandGreen600">•</span>
                <span className="text-neutral700"><strong>Rate apps</strong> for quick verification when needed</span>
              </li>
            </ul>
            <p className="text-neutral600 mt-4">
              Each tool has its strength. Use the right tool for each job.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-neutral900 mb-4">
            Ready to Add Price Intelligence?
          </h2>
          <p className="text-xl text-neutral600 mb-8">
            Start your 14-day free trial of FlockIQ. See the difference 7-day forecasts make.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-brandGreen600 hover:bg-brandGreen500 text-white px-8 py-4 rounded-full font-semibold transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
