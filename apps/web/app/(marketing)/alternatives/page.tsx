// FlockIQ — Alternatives Hub Page (v3.0)
// File: apps/web/app/(marketing)/alternatives/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SEO-ALT-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 11
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-ALT-001

import { Metadata } from 'next';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'FlockIQ Alternatives — Compare Price Intelligence Tools',
  description: 'Compare FlockIQ alternatives including PoultryApp, Farmioc, and poultry rate apps. Find the best poultry price forecasting tool for your farm.',
  keywords: ['FlockIQ alternatives', 'poultry price forecasting tools', 'broiler price prediction apps', 'agri intelligence platforms'],
  openGraph: {
    title: 'FlockIQ Alternatives',
    description: 'Compare the best poultry price intelligence tools.',
    url: 'https://flockiq.com/alternatives',
  },
  alternates: {
    canonical: 'https://flockiq.com/alternatives',
  },
};

export default function AlternativesHubPage() {
  const faqSchema = generateFAQSchema([
    { question: 'What are the best alternatives to FlockIQ?', answer: 'The best alternatives depend on your needs. For farm management, PoultryApp is excellent. For broad agri intelligence, Farmioc covers 200+ crops. For quick rate checks, poultry rate apps work well. However, for specialized broiler price forecasting with 95% accuracy, FlockIQ remains the top choice.' },
    { question: 'Is there a free alternative to FlockIQ?', answer: 'PoultryApp and poultry rate apps are free, but they don\'t provide price forecasting. They only show current rates. For price intelligence and planning, FlockIQ costs ₹2,000/month but typically saves farmers ₹20,000+ per month.' },
    { question: 'Should I use multiple tools?', answer: 'Yes. Many successful farmers use multiple tools: PoultryApp for farm management, rate apps for quick checks, and FlockIQ for price forecasting. Each tool has its strength.' },
  ]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://flockiq.com' },
    { name: 'Alternatives', url: 'https://flockiq.com/alternatives' },
  ]);

  const singularAlternatives = [
    { name: 'PoultryApp Alternative', slug: 'poultryapp', description: 'Farm management software with daily rates' },
    { name: 'Farmioc Alternative', slug: 'farmioc', description: 'Broad agri intelligence for 200+ crops' },
    { name: 'Poultry Rate Apps Alternative', slug: 'poultry-rate-apps', description: 'Free apps for daily rate checking' },
  ];

  const pluralAlternatives = [
    { name: 'PoultryApp Alternatives', slug: 'poultryapp-alternatives', description: 'Compare tools for farm management' },
    { name: 'Farmioc Alternatives', slug: 'farmioc-alternatives', description: 'Compare agri intelligence platforms' },
    { name: 'Poultry Rate Apps Alternatives', slug: 'poultry-rate-apps-alternatives', description: 'Compare price forecasting tools' },
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
              FlockIQ Alternatives
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Compare the best poultry price intelligence tools. Find the right solution for your farm's needs.
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

      {/* Quick Summary */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Quick Summary
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
              <h3 className="text-xl font-bold text-brandGreen900 mb-2">FlockIQ</h3>
              <p className="text-brandGreen700 mb-4">Specialized broiler price forecasting</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brandGreen600">Accuracy:</span>
                  <span className="text-brandGreen900 font-semibold">95%+ verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brandGreen600">Forecast:</span>
                  <span className="text-brandGreen900 font-semibold">7 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brandGreen600">Language:</span>
                  <span className="text-brandGreen900 font-semibold">Hindi-first</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brandGreen600">Price:</span>
                  <span className="text-brandGreen900 font-semibold">₹2,000/month</span>
                </div>
              </div>
            </div>
            <div className="bg-blue50 rounded-xl p-6 border border-blue200">
              <h3 className="text-xl font-bold text-blue900 mb-2">PoultryApp</h3>
              <p className="text-blue700 mb-4">Farm management software</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue600">Accuracy:</span>
                  <span className="text-blue900 font-semibold">N/A (current rates)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue600">Forecast:</span>
                  <span className="text-blue900 font-semibold">None</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue600">Language:</span>
                  <span className="text-blue900 font-semibold">English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue600">Price:</span>
                  <span className="text-blue900 font-semibold">Free</span>
                </div>
              </div>
            </div>
            <div className="bg-purple50 rounded-xl p-6 border border-purple200">
              <h3 className="text-xl font-bold text-purple900 mb-2">Farmioc</h3>
              <p className="text-purple700 mb-4">Broad agri intelligence</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple600">Accuracy:</span>
                  <span className="text-purple900 font-semibold">Not disclosed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple600">Forecast:</span>
                  <span className="text-purple900 font-semibold">Short-term</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple600">Language:</span>
                  <span className="text-purple900 font-semibold">English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple600">Price:</span>
                  <span className="text-purple900 font-semibold">Custom (sales)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Singular Alternatives */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Switching from a Specific Tool?
          </h2>
          <p className="text-neutral600 mb-6">
            Looking for an alternative to a specific tool? Compare detailed breakdowns:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {singularAlternatives.map((alt) => (
              <Link
                key={alt.slug}
                href={`/alternatives/${alt.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <h3 className="text-xl font-bold text-neutral900 mb-2">{alt.name}</h3>
                <p className="text-neutral600 mb-4">{alt.description}</p>
                <span className="text-brandGreen600 font-semibold text-sm">
                  View Comparison →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Plural Alternatives */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Researching Multiple Options?
          </h2>
          <p className="text-neutral600 mb-6">
            Compare multiple tools side by side to find the best fit:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {pluralAlternatives.map((alt) => (
              <Link
                key={alt.slug}
                href={`/alternatives/${alt.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <h3 className="text-xl font-bold text-neutral900 mb-2">{alt.name}</h3>
                <p className="text-neutral600 mb-4">{alt.description}</p>
                <span className="text-brandGreen600 font-semibold text-sm">
                  View Comparison →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Comparisons */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Direct Comparisons
          </h2>
          <p className="text-neutral600 mb-6">
            See how FlockIQ compares directly to other tools:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/comparisons/poultryapp"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
            >
              <h3 className="text-xl font-bold text-neutral900 mb-2">FlockIQ vs PoultryApp</h3>
              <p className="text-neutral600 mb-4">Price intelligence vs farm management</p>
              <span className="text-brandGreen600 font-semibold text-sm">
                View Comparison →
              </span>
            </Link>
            <Link
              href="/comparisons/farmioc"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
            >
              <h3 className="text-xl font-bold text-neutral900 mb-2">FlockIQ vs Farmioc</h3>
              <p className="text-neutral600 mb-4">Specialized vs broad agri intelligence</p>
              <span className="text-brandGreen600 font-semibold text-sm">
                View Comparison →
              </span>
            </Link>
            <Link
              href="/comparisons/poultry-rate-apps"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
            >
              <h3 className="text-xl font-bold text-neutral900 mb-2">FlockIQ vs Rate Apps</h3>
              <p className="text-neutral600 mb-4">Forecasting vs rate checking</p>
              <span className="text-brandGreen600 font-semibold text-sm">
                View Comparison →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Competitor vs Competitor */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Competitor Comparisons
          </h2>
          <p className="text-neutral600 mb-6">
            See how competitors compare to each other:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/compare/poultryapp-vs-farmioc"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
            >
              <h3 className="text-xl font-bold text-neutral900 mb-2">PoultryApp vs Farmioc</h3>
              <p className="text-neutral600 mb-4">Farm management vs agri intelligence</p>
              <span className="text-brandGreen600 font-semibold text-sm">
                View Comparison →
              </span>
            </Link>
            <Link
              href="/compare/poultryapp-vs-poultry-rate-apps"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
            >
              <h3 className="text-xl font-bold text-neutral900 mb-2">PoultryApp vs Rate Apps</h3>
              <p className="text-neutral600 mb-4">Management vs rate checking</p>
              <span className="text-brandGreen600 font-semibold text-sm">
                View Comparison →
              </span>
            </Link>
            <Link
              href="/compare/farmioc-vs-poultry-rate-apps"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
            >
              <h3 className="text-xl font-bold text-neutral900 mb-2">Farmioc vs Rate Apps</h3>
              <p className="text-neutral600 mb-4">Broad intelligence vs simple rates</p>
              <span className="text-brandGreen600 font-semibold text-sm">
                View Comparison →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why FlockIQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-brandGreen700 text-white rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose FlockIQ?
            </h2>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-3xl font-bold mb-2">95%+</div>
                <div className="text-white/80">Accuracy verified</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">7 days</div>
                <div className="text-white/80">Forward visibility</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">Hindi</div>
                <div className="text-white/80">First language</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">WhatsApp</div>
                <div className="text-white/80">Auto delivery</div>
              </div>
            </div>
            <p className="text-white/90 mb-6">
              While alternatives have their strengths, FlockIQ is the only tool specialized for broiler price forecasting with verified accuracy, Hindi support, and WhatsApp delivery — built specifically for Indian commercial poultry farmers.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-brandGreen700 px-8 py-4 rounded-full font-semibold hover:bg-neutral50 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-neutral900 mb-4">
            Still Deciding?
          </h2>
          <p className="text-xl text-neutral600 mb-8">
            Start a 14-day free trial and see the difference 7-day forecasts make for your farm.
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
