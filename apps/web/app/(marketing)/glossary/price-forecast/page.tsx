// FlockIQ — Glossary Term Page: Price Forecast
// File: apps/web/app/(marketing)/glossary/price-forecast/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import glossaryData from '@/lib/data/glossary.json';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Price Forecast — Poultry Farming Glossary',
  description: 'Price forecast is the prediction of future poultry prices using AI models and historical data analysis. Learn how 7-day forecasts help farmers time sales optimally.',
  keywords: ['price forecast poultry', 'AI price prediction', 'broiler price forecast', 'poultry price intelligence'],
  openGraph: {
    title: 'Price Forecast — Poultry Farming Glossary',
    description: 'Understand price forecasting in poultry farming with AI-powered predictions.',
    url: 'https://FlockIQ.ai/glossary/price-forecast',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/glossary/price-forecast',
  },
};

export default function PriceForecastPage() {
  const term = glossaryData.terms.find((t: any) => t.slug === 'price-forecast');
  
  if (!term) {
    return <div>Term not found</div>;
  }

  return (
    <div className="min-h-screen bg-neutral50">
      {/* Breadcrumb */}
      <section className="py-4 bg-white border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-neutral600 hover:text-neutral900">Home</Link>
            <span className="text-neutral400">/</span>
            <Link href="/glossary" className="text-neutral600 hover:text-neutral900">Glossary</Link>
            <span className="text-neutral400">/</span>
            <span className="text-neutral900 font-semibold">{term.term}</span>
          </nav>
        </div>
      </section>

      {/* Term Header */}
      <section className="py-16 bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-semibold">
                {term.category.charAt(0).toUpperCase() + term.category.slice(1)}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {term.term}
            </h1>
            <p className="text-xl text-white/90 mb-4">
              {term.termHi}
            </p>
            <p className="text-lg text-white/80">
              {term.shortDefinition}
            </p>
          </div>
        </div>
      </section>

      {/* AI-Optimized Definition */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-brandGreen50 rounded-xl p-8 border border-brandGreen200 mb-8">
            <h2 className="text-2xl font-bold text-brandGreen900 mb-4">
              AI-Optimized Definition
            </h2>
            <p className="text-brandGreen800 text-lg mb-4">
              {term.aiDefinition}
            </p>
            <p className="text-brandGreen700 italic">
              {term.aiDefinitionHi}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-neutral900 mb-4">
                Who This Is For
              </h3>
              <p className="text-neutral700">
                {term.whoThisIsFor}
              </p>
              <p className="text-neutral600 mt-2 italic">
                {term.whoThisIsForHi}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-neutral900 mb-4">
                Key Takeaway
              </h3>
              <p className="text-neutral700">
                {term.keyTakeaway}
              </p>
              <p className="text-neutral600 mt-2 italic">
                {term.keyTakeawayHi}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Definition */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Detailed Explanation
          </h2>
          <div className="prose max-w-none text-neutral700 mb-8">
            <p>{term.detailedDefinition}</p>
          </div>
          <div className="prose max-w-none text-neutral600 italic">
            <p>{term.detailedDefinitionHi}</p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Why It Matters
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-lg text-neutral700">
              {term.whyItMatters}
            </p>
            <p className="text-neutral600 mt-4 italic">
              {term.whyItMattersHi}
            </p>
          </div>
        </div>
      </section>

      {/* Related Terms */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Related Terms
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {term.relatedTerms.map((relatedSlug: string) => {
              const relatedTerm = glossaryData.terms.find((t: any) => t.slug === relatedSlug);
              if (!relatedTerm) return null;
              return (
                <Link
                  key={relatedTerm.id}
                  href={`/glossary/${relatedTerm.slug}`}
                  className="bg-neutral50 rounded-xl p-6 hover:bg-neutral100 transition-all"
                >
                  <h3 className="font-bold text-neutral900 mb-2">{relatedTerm.term}</h3>
                  <p className="text-neutral600 text-sm">{relatedTerm.shortDefinition}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Price Forecasts for Your Farm
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 200+ farmers using FlockIQ for 7-day price forecasts with 95%+ accuracy.
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
