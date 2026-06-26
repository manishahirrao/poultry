// FlockIQ — Disease Alert Systems Directory Page
// File: apps/web/app/(marketing)/directory/disease-alert-systems/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import directoryData from '@/lib/data/directory.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateItemListSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'Best Disease Alert Systems for Poultry Farmers — 2026 Directory',
  description: 'Discover the best poultry disease alert systems: FlockIQ, NECC alerts, government disease portals. Compare features, pricing, and early warning capabilities.',
  keywords: ['poultry disease alert system', 'HPAI alert system', 'bird flu warning', 'disease outbreak notification'],
  openGraph: {
    title: 'Best Disease Alert Systems for Poultry Farmers',
    description: 'Directory of disease alert systems for poultry farmers in India.',
    url: 'https://FlockIQ.ai/directory/disease-alert-systems',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/directory/disease-alert-systems',
  },
};

export default function DiseaseAlertSystemsPage() {
  const categories = directoryData.categories;
  const category = categories.find((c: any) => c.slug === 'disease-alert-systems');
  
  if (!category) {
    return <div>Category not found</div>;
  }

  const itemListSchema = generateItemListSchema(
    category.tools.map((tool: any) => ({
      name: tool.name,
      url: tool.url,
      description: tool.description,
    }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://FlockIQ.ai' },
    { name: 'Directory', url: 'https://FlockIQ.ai/directory' },
    { name: category.name, url: `https://FlockIQ.ai/directory/${category.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-neutral50">
      <Schema schema={itemListSchema} />
      <Schema schema={breadcrumbSchema} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-4">
              <Link href="/directory" className="text-white/70 hover:text-white text-sm">
                ← Back to Directory
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {category.name}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {category.nameHi} — {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            About This Category
          </h2>
          <div className="bg-neutral50 rounded-xl p-8">
            <p className="text-neutral700 text-lg leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Available Tools ({category.tools.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.tools.map((tool: any) => (
              <div
                key={tool.id}
                className={`bg-white rounded-xl p-6 shadow-sm border ${
                  tool.isOurProduct ? 'border-brandGreen300 ring-2 ring-brandGreen100' : 'border-neutral200'
                }`}
              >
                {tool.isOurProduct && (
                  <div className="mb-4">
                    <span className="bg-brandGreen100 text-brandGreen700 text-xs px-3 py-1 rounded-full font-semibold">
                      Our Product
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-neutral900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-neutral500 text-sm mb-4">{tool.description}</p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral500">Pricing:</span>
                    <span className="text-neutral700 font-semibold">{tool.pricing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral500">Rating:</span>
                    <span className="text-neutral700 font-semibold">{tool.userRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral500">Platform:</span>
                    <span className="text-neutral700">{tool.platform.join(', ')}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral100">
                  {tool.url && tool.url !== 'N/A' && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brandGreen600 font-semibold text-sm hover:underline"
                    >
                      Visit Tool →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selection Criteria */}
      {category.selectionCriteria && category.selectionCriteria.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Selection Criteria
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {category.selectionCriteria.map((criterion: string, index: number) => (
                <div key={index} className="bg-neutral50 rounded-xl p-6 flex items-start gap-4">
                  <div className="w-8 h-8 bg-brandGreen100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brandGreen700 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-neutral700">{criterion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Recommendation */}
      {category.ourRecommendation && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Our Recommendation
            </h2>
            <div className="bg-brandGreen700 text-white rounded-xl p-8">
              <p className="text-lg mb-4">
                {category.ourRecommendation}
              </p>
              <p className="text-white/90">
                {category.ourRecommendationHi}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get 48-Hour HPAI Early Warnings
          </h2>
          <p className="text-xl text-white/90 mb-8">
            FlockIQ provides the fastest disease alerts with 48-hour early warning via WhatsApp and app.
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
