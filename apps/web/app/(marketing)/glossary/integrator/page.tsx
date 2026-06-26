// FlockIQ — Integrator Glossary Page
// File: apps/web/app/(marketing)/glossary/integrator/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import glossaryData from '@/lib/data/glossary.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateDefinitionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'What is an Integrator? — Poultry Farming Explained',
  description: 'An integrator is a large poultry company that provides chicks, feed, and medicine to contract farmers, then buys back the birds. Learn the contract farming model.',
  keywords: ['integrator meaning', 'poultry integrator', 'contract farming poultry', 'integrator model', 'इंटीग्रेटर'],
  openGraph: {
    title: 'What is an Integrator?',
    description: 'Understand integrator model in poultry farming - contract farming, pros, and cons.',
    url: 'https://FlockIQ.ai/glossary/integrator',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/glossary/integrator',
  },
};

export default function IntegratorPage() {
  const terms = glossaryData.terms;
  const term = terms.find((t: any) => t.slug === 'integrator');
  
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

      {/* Contract Model */}
      {term.contractModel && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Contract Farming Model
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
                <h3 className="text-xl font-bold text-brandGreen900 mb-4">
                  Integrator Provides
                </h3>
                <ul className="space-y-3">
                  {term.contractModel.integratorProvides.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-brandGreen600 text-xl">✓</span>
                      <span className="text-brandGreen900">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neutral50 rounded-xl p-6 border border-neutral200">
                <h3 className="text-xl font-bold text-neutral900 mb-4">
                  Farmer Provides
                </h3>
                <ul className="space-y-3">
                  {term.contractModel.farmerProvides.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-brandGreen600 text-xl">✓</span>
                      <span className="text-neutral700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-lg text-brandGreen700 font-semibold">
                Payment: {term.contractModel.payment}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Pros and Cons */}
      {(term.pros && term.pros.length > 0) || (term.cons && term.cons.length > 0) && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Pros and Cons
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {term.pros && term.pros.length > 0 && (
                <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
                  <h3 className="text-xl font-bold text-brandGreen900 mb-4">Pros</h3>
                  <ul className="space-y-3">
                    {term.pros.map((pro: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-brandGreen600 text-xl">✓</span>
                        <span className="text-brandGreen900">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {term.cons && term.cons.length > 0 && (
                <div className="bg-red50 rounded-xl p-6 border border-red200">
                  <h3 className="text-xl font-bold text-red900 mb-4">Cons</h3>
                  <ul className="space-y-3">
                    {term.cons.map((con: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-red600 text-xl">✗</span>
                        <span className="text-red900">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            Multi-Farm Price Intelligence for Integrators
          </h2>
          <p className="text-xl text-white/90 mb-8">
            FlockIQ provides multi-farm analytics and price intelligence to optimize sell timing across all contract farms.
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
