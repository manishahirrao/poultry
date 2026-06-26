// FlockIQ — Mortality Log Template Page
// File: apps/web/app/(marketing)/templates/mortality-log/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import templatesData from '@/lib/data/templates.json';
import Link from 'next/link';
import Schema from '@/components/seo/Schema';
import { generateSoftwareApplicationSchema, generateBreadcrumbSchema } from '@/lib/seo/schema-utils';

export const metadata: Metadata = {
  title: 'Mortality Log Template — Free Download for Poultry Farmers',
  description: 'Download free mortality log Excel template. Track daily bird deaths with causes to identify disease outbreaks early.',
  keywords: ['mortality log template', 'bird death tracking', 'poultry mortality Excel', 'disease outbreak tracking'],
  openGraph: {
    title: 'Mortality Log Template — Free Download',
    description: 'Free Excel template for tracking daily bird mortality in poultry farms.',
    url: 'https://FlockIQ.ai/templates/mortality-log',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/templates/mortality-log',
  },
};

export default function MortalityLogPage() {
  const templates = templatesData.templates;
  const template = templates.find((t: any) => t.slug === 'mortality-log');
  
  if (!template) {
    return <div>Template not found</div>;
  }

  const softwareSchema = generateSoftwareApplicationSchema(template.name, template.description, template.downloadUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://FlockIQ.ai' },
    { name: 'Templates', url: 'https://FlockIQ.ai/templates' },
    { name: template.name, url: `https://FlockIQ.ai/templates/${template.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-neutral50">
      <Schema schema={softwareSchema} />
      <Schema schema={breadcrumbSchema} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-4">
              <Link href="/templates" className="text-white/70 hover:text-white text-sm">
                ← Back to All Templates
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {template.name}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {template.nameHi} — {template.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={template.downloadUrl}
                download
                className="bg-brandGreen500 hover:bg-brandGreen400 text-white px-8 py-4 rounded-full font-semibold transition-all"
              >
                Download Free Template
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Template Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral50 rounded-xl p-6">
              <p className="text-neutral500 text-sm mb-2">File Type</p>
              <p className="text-2xl font-bold text-neutral900">{template.fileType}</p>
            </div>
            <div className="bg-neutral50 rounded-xl p-6">
              <p className="text-neutral500 text-sm mb-2">Category</p>
              <p className="text-2xl font-bold text-neutral900 capitalize">{template.category.replace('-', ' ')}</p>
            </div>
            <div className="bg-neutral50 rounded-xl p-6">
              <p className="text-neutral500 text-sm mb-2">Cost</p>
              <p className="text-2xl font-bold text-brandGreen700">FREE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Fields */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            What This Template Tracks
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-4">
              {template.keyFields.map((field: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral50 rounded-lg">
                  <span className="text-brandGreen600 font-bold">{index + 1}.</span>
                  <span className="text-neutral700">{field}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            How to Use This Template
          </h2>
          <div className="bg-brandGreen50 rounded-xl p-8 border border-brandGreen200">
            <p className="text-brandGreen900 text-lg mb-4">
              {template.instructions}
            </p>
            <p className="text-brandGreen800 text-lg">
              {template.instructionsHi}
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      {template.bestPractices && template.bestPractices.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Best Practices
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {template.bestPractices.map((practice: string, index: number) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 bg-brandGreen100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brandGreen700 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-neutral700">{practice}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Common Mistakes */}
      {template.commonMistakes && template.commonMistakes.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Common Mistakes to Avoid
            </h2>
            <div className="bg-red50 rounded-xl p-8 border border-red200">
              <ul className="space-y-3">
                {template.commonMistakes.map((mistake: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red600 text-xl">✗</span>
                    <span className="text-red900">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Integration with FlockIQ */}
      {template.integrationWithFlockIQ && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Integration with FlockIQ
            </h2>
            <div className="bg-brandGreen700 text-white rounded-xl p-8">
              <p className="text-lg mb-4">
                {template.integrationWithFlockIQ}
              </p>
              <p className="text-white/90">
                {template.integrationWithFlockIQHi}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Related Templates */}
      {template.relatedTemplates && template.relatedTemplates.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-neutral900 mb-8">
              Related Templates
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {template.relatedTemplates.map((relatedSlug: string) => {
                const relatedTemplate = templates.find((t: any) => t.slug === relatedSlug);
                return relatedTemplate ? (
                  <Link
                    key={relatedSlug}
                    href={`/templates/${relatedSlug}`}
                    className="bg-neutral50 rounded-xl p-6 hover:bg-neutral100 transition-all"
                  >
                    <h3 className="text-lg font-bold text-neutral900 mb-2">{relatedTemplate.name}</h3>
                    <p className="text-neutral500 text-sm">{relatedTemplate.description}</p>
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
            Automate Mortality Tracking with FlockIQ
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Templates are great, but our platform provides HPAI alerts and disease warnings to prevent mortality spikes.
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
