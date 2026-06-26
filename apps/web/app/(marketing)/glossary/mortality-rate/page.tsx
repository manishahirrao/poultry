// FlockIQ — Mortality Rate Glossary Page
// File: apps/web/app/(marketing)/glossary/mortality-rate/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import glossaryData from '@/lib/data/glossary.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateDefinitionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'What is Mortality Rate? — Poultry Farming Explained',
  description: 'Mortality rate is the percentage of birds that die before reaching market age. Industry standard is 3–5%. Learn calculation and improvement strategies.',
  keywords: ['mortality rate meaning', 'poultry mortality', 'bird death rate', 'mortality calculation', 'मृत्यु दर'],
  openGraph: {
    title: 'What is Mortality Rate?',
    description: 'Understand mortality rate in poultry farming - calculation, standards, and reduction strategies.',
    url: 'https://FlockIQ.ai/glossary/mortality-rate',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/glossary/mortality-rate',
  },
};

export default function MortalityRatePage() {
  const terms = glossaryData.terms;
  const term = terms.find((t: any) => t.slug === 'mortality-rate');
  
  if (!term) {
    return <div>Term not found</div>;
  }

  const definitionSchema = generateDefinitionSchema(term.term, term.shortDefinition);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://FlockIQ.ai' },
    { name: 'Glossary', url: 'https://FlockIQ.ai/glossary' },
    { name: term.term, url: `https://FlockIQ.ai/glossary/${term.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-neutral50">
      <Schema schema={definitionSchema} />
      <Schema schema={breadcrumbSchema} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-4">
              <Link href="/glossary" className="text-white/70 hover:text-white text-sm">
                ← Back to Glossary
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              What is {term.term}?
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {term.termHi} — {term.shortDefinition}
            </p>
          </div>
        </div>
      </section>

      {/* Answer Box */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-brandGreen50 rounded-xl p-8 border border-brandGreen200">
            <h2 className="text-lg font-bold text-brandGreen900 mb-4">
              संक्षेप में (In Brief):
            </h2>
            <p className="text-brandGreen900 text-lg leading-relaxed">
              {term.shortDefinitionHi}
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Definition */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Detailed Explanation
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-neutral700 text-lg leading-relaxed mb-6">
              {term.detailedDefinition}
            </p>
            <p className="text-neutral700 text-lg leading-relaxed">
              {term.detailedDefinitionHi}
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Why It Matters
          </h2>
          <div className="bg-brandGreen50 rounded-xl p-8 border border-brandGreen200">
            <p className="text-brandGreen900 text-lg leading-relaxed mb-4">
              {term.whyItMatters}
            </p>
            <p className="text-brandGreen800 text-lg leading-relaxed">
              {term.whyItMattersHi}
            </p>
          </div>
        </div>
      </section>

      {/* Calculation */}
      {term.calculation && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              How to Calculate
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="bg-neutral50 rounded-lg p-6 mb-6">
                <code className="text-xl text-brandGreen700 font-mono">
                  {term.calculation}
                </code>
              </div>
              <p className="text-neutral600">
                Example: If you placed 20,000 chicks and 600 birds died, your mortality rate is (600 / 20,000) × 100 = 3%.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Industry Standards */}
      {term.industryStandards && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Industry Standards
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green50 rounded-xl p-6 border border-green200">
                <h3 className="text-lg font-bold text-green900 mb-2">Good</h3>
                <p className="text-3xl font-bold text-green700">{term.industryStandards.good}</p>
              </div>
              <div className="bg-amber50 rounded-xl p-6 border border-amber200">
                <h3 className="text-lg font-bold text-amber900 mb-2">Average</h3>
                <p className="text-3xl font-bold text-amber700">{term.industryStandards.average}</p>
              </div>
              <div className="bg-red50 rounded-xl p-6 border border-red200">
                <h3 className="text-lg font-bold text-red900 mb-2">Poor</h3>
                <p className="text-3xl font-bold text-red700">{term.industryStandards.poor}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Common Mistakes */}
      {term.commonMistakes && term.commonMistakes.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Common Mistakes to Avoid
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <ul className="space-y-4">
                {term.commonMistakes.map((mistake: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red600 text-xl">✗</span>
                    <span className="text-neutral700">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Related Terms */}
      {term.relatedTerms && term.relatedTerms.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Related Terms
            </h2>
            <div className="flex flex-wrap gap-3">
              {term.relatedTerms.map((relatedSlug: string) => {
                const relatedTerm = terms.find((t: any) => t.slug === relatedSlug);
                return relatedTerm ? (
                  <Link
                    key={relatedSlug}
                    href={`/glossary/${relatedSlug}`}
                    className="px-4 py-2 rounded-full bg-neutral100 text-neutral700 hover:bg-neutral200 transition-all"
                  >
                    {relatedTerm.term}
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Track Mortality with FlockIQ
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Our platform helps you monitor mortality patterns and provides HPAI alerts to prevent mortality spikes.
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
