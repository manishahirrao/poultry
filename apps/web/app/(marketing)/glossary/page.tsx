// FlockIQ — Glossary Pages Hub
// File: apps/web/app/(marketing)/glossary/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import glossaryData from '@/lib/data/glossary.json';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Poultry Farming Glossary — Terms Explained for Farmers',
  description: 'Understand poultry farming terminology in simple Hindi and English. FCR, HPAI, mandi bhav, and more explained clearly.',
  keywords: ['poultry farming glossary', 'FCR meaning', 'HPAI bird flu', 'mandi bhav', 'poultry terms Hindi'],
  openGraph: {
    title: 'Poultry Farming Glossary',
    description: 'Poultry farming terminology explained simply for Indian farmers.',
    url: 'https://FlockIQ.ai/glossary',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/glossary',
  },
};

export default function GlossaryHubPage() {
  const terms = glossaryData.terms;
  const categories = [...new Set(terms.map((t: any) => t.category))];

  return (
    <div className="min-h-screen bg-neutral50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Poultry Farming Glossary
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Understand poultry farming terminology in simple Hindi and English. 
              FCR, HPAI, mandi bhav, and more explained clearly for farmers.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-2">
            <Link href="/glossary" className="px-4 py-2 rounded-full bg-brandGreen700 text-white text-sm font-semibold">
              All Terms
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/glossary?category=${category}`}
                className="px-4 py-2 rounded-full bg-neutral100 text-neutral700 text-sm font-semibold hover:bg-neutral200 transition-all"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            All Terms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terms.map((term: any) => (
              <Link
                key={term.id}
                href={`/glossary/${term.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <div className="mb-4">
                  <span className="text-xs bg-brandGreen100 text-brandGreen700 px-2 py-1 rounded-full font-semibold">
                    {term.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral900 mb-1">
                  {term.term}
                </h3>
                <p className="text-neutral500 text-sm mb-3">{term.termHi}</p>
                <p className="text-neutral600 text-sm line-clamp-3 mb-4">
                  {term.shortDefinition}
                </p>
                <div className="pt-4 border-t border-neutral100">
                  <span className="text-brandGreen600 font-semibold text-sm">
                    Read Full Definition →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Terms */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Popular Terms
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {terms.slice(0, 6).map((term: any) => (
              <Link
                key={term.id}
                href={`/glossary/${term.slug}`}
                className="flex items-start gap-4 p-4 rounded-lg bg-neutral50 hover:bg-neutral100 transition-all"
              >
                <div className="w-10 h-10 bg-brandGreen100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brandGreen700 font-bold">{term.term.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral900 mb-1">{term.term}</h3>
                  <p className="text-neutral500 text-sm">{term.shortDefinition}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Understanding Terms Matters */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Why Understanding These Terms Matters
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Make Better Decisions
              </h3>
              <p className="text-neutral600 text-sm">
                Understanding FCR, timing loss, and other terms helps you make profitable decisions for your farm.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Track Performance
              </h3>
              <p className="text-neutral600 text-sm">
                Know what metrics to track and how to calculate them to improve farm efficiency.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Protect Your Flock
              </h3>
              <p className="text-neutral600 text-sm">
                Understanding disease terms like HPAI and biosecurity helps prevent outbreaks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Apply This Knowledge with FlockIQ
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Use our AI-powered price intelligence to make data-driven decisions for your farm.
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
