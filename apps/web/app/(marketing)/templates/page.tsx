// FlockIQ — Template Pages Hub
// File: apps/web/app/(marketing)/templates/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import templatesData from '@/lib/data/templates.json';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Poultry Farm Templates — Download Excel & PDF Templates',
  description: 'Download free poultry farm management templates: feed records, mortality logs, profit calculators, biosecurity checklists, and more.',
  keywords: ['poultry farm templates', 'free farm templates', 'feed record template', 'profit calculator template', 'biosecurity checklist'],
  openGraph: {
    title: 'Free Poultry Farm Templates',
    description: 'Download free Excel and PDF templates for poultry farm management.',
    url: 'https://FlockIQ.ai/templates',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/templates',
  },
};

export default function TemplatesHubPage() {
  const templates = templatesData.templates;
  const categories = [...new Set(templates.map((t: any) => t.category))];

  return (
    <div className="min-h-screen bg-neutral50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Free Poultry Farm Templates
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Download free Excel and PDF templates for poultry farm management. 
              Feed records, mortality logs, profit calculators, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-2">
            <Link href="/templates" className="px-4 py-2 rounded-full bg-brandGreen700 text-white text-sm font-semibold">
              All Templates
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/templates?category=${category}`}
                className="px-4 py-2 rounded-full bg-neutral100 text-neutral700 text-sm font-semibold hover:bg-neutral200 transition-all"
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            All Templates
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => (
              <Link
                key={template.id}
                href={`/templates/${template.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <div className="mb-4">
                  <span className="text-xs bg-brandGreen100 text-brandGreen700 px-2 py-1 rounded-full font-semibold">
                    {template.fileType}
                  </span>
                  <span className="text-xs bg-neutral100 text-neutral700 px-2 py-1 rounded-full font-semibold ml-2">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral900 mb-1">
                  {template.name}
                </h3>
                <p className="text-neutral500 text-sm mb-3">{template.nameHi}</p>
                <p className="text-neutral600 text-sm line-clamp-3 mb-4">
                  {template.description}
                </p>
                <div className="pt-4 border-t border-neutral100">
                  <span className="text-brandGreen600 font-semibold text-sm">
                    Download Template →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Most Popular Templates
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {templates.slice(0, 4).map((template: any) => (
              <Link
                key={template.id}
                href={`/templates/${template.slug}`}
                className="flex items-start gap-4 p-4 rounded-lg bg-neutral50 hover:bg-neutral100 transition-all"
              >
                <div className="w-10 h-10 bg-brandGreen100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brandGreen700 font-bold">📄</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral900 mb-1">{template.name}</h3>
                  <p className="text-neutral500 text-sm">{template.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            How to Use These Templates
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⬇️</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                1. Download
              </h3>
              <p className="text-neutral600 text-sm">
                Click on any template to download the Excel or PDF file to your device.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                2. Customize
              </h3>
              <p className="text-neutral600 text-sm">
                Add your farm details, shed numbers, and other specific information.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                3. Track Daily
              </h3>
              <p className="text-neutral600 text-sm">
                Use the template daily to record data and track your farm performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brandGreen700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Automate Your Farm Management
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Templates are great, but FlockIQ automates tracking and provides AI-powered insights.
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
