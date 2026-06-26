// FlockIQ — Sell Signal Glossary Page
// File: apps/web/app/(marketing)/glossary/sell-signal/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import glossaryData from '@/lib/data/glossary.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateDefinitionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'What is a Sell Signal? — Poultry Farming Explained',
  description: 'A sell signal is a daily recommendation telling you whether to sell, hold, or wait based on AI price prediction. Learn signal types and how to use them.',
  keywords: ['sell signal meaning', 'poultry sell signal', 'AI sell recommendation', 'price timing signal', 'सेल सिग्नल'],
  openGraph: {
    title: 'What is a Sell Signal?',
    description: 'Understand sell signals in poultry farming - AI-powered daily recommendations for optimal selling.',
    url: 'https://FlockIQ.ai/glossary/sell-signal',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/glossary/sell-signal',
  },
};

export default function SellSignalPage() {
  const terms = glossaryData.terms;
  const term = terms.find((t: any) => t.slug === 'sell-signal');
  
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

      {/* Signal Types */}
      {term.signalTypes && term.signalTypes.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Signal Types
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {term.signalTypes.map((signal: any, index: number) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border-2 border-brandGreen200">
                  <h3 className="text-xl font-bold text-brandGreen900 mb-2">{signal.type}</h3>
                  <p className="text-neutral600 text-sm mb-3">{signal.meaning}</p>
                  <p className="text-brandGreen700 font-semibold text-sm">{signal.action}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Delivery */}
      {term.delivery && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              How Signals Are Delivered
            </h2>
            <div className="bg-neutral50 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-neutral500 text-sm mb-2">Time</p>
                  <p className="text-2xl font-bold text-brandGreen700">{term.delivery.time}</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral500 text-sm mb-2">Channels</p>
                  <p className="text-2xl font-bold text-brandGreen700">{term.delivery.channels.join(', ')}</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral500 text-sm mb-2">Frequency</p>
                  <p className="text-2xl font-bold text-brandGreen700">{term.delivery.frequency}</p>
                </div>
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
            Get Daily Sell Signals with FlockIQ
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Our platform provides AI-powered sell signals at 6:30 AM daily via WhatsApp and app to help you sell at the right time.
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
