// FlockIQ — Directory Pages Hub
// File: apps/web/app/(marketing)/directory/page.tsx
// Version: v1.0 | May 2026

import { Metadata } from 'next';
import directoryData from '@/lib/data/directory.json';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Poultry Farming Tools Directory — Best Software & Equipment',
  description: 'Discover the best tools for poultry farming: price intelligence software, farm management systems, disease alerts, and equipment.',
  keywords: ['poultry farming tools', 'farm management software', 'price intelligence tools', 'poultry equipment India'],
  openGraph: {
    title: 'Poultry Farming Tools Directory',
    description: 'Directory of tools and software for poultry farmers in India.',
    url: 'https://FlockIQ.ai/directory',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/directory',
  },
};

export default function DirectoryHubPage() {
  const categories = directoryData.categories;

  return (
    <div className="min-h-screen bg-neutral50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brandGreen700 to-brandGreen900 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Poultry Farming Tools Directory
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Discover the best tools for poultry farming: price intelligence software, 
              farm management systems, disease alerts, and equipment.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Tool Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/directory/${category.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral200"
              >
                <div className="mb-4">
                  <span className="text-xs bg-brandGreen100 text-brandGreen700 px-2 py-1 rounded-full font-semibold">
                    {category.tools.length} Tools
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral900 mb-1">
                  {category.name}
                </h3>
                <p className="text-neutral500 text-sm mb-3">{category.nameHi}</p>
                <p className="text-neutral600 text-sm line-clamp-3 mb-4">
                  {category.description}
                </p>
                <div className="pt-4 border-t border-neutral100">
                  <span className="text-brandGreen600 font-semibold text-sm">
                    Explore Category →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            Featured Tools
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.flatMap((cat: any) => cat.tools).slice(0, 4).map((tool: any, index: number) => (
              <div
                key={`${tool.id}-${index}`}
                className="flex items-start gap-4 p-4 rounded-lg bg-neutral50"
              >
                <div className="w-10 h-10 bg-brandGreen100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brandGreen700 font-bold">{tool.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-neutral900 mb-1">{tool.name}</h3>
                    <span className="text-xs bg-brandGreen100 text-brandGreen700 px-2 py-1 rounded-full font-semibold">
                      {tool.userRating}
                    </span>
                  </div>
                  <p className="text-neutral500 text-sm mb-2">{tool.description}</p>
                  <p className="text-neutral600 text-sm font-semibold">{tool.pricing}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Choose */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-neutral900 mb-8">
            How to Choose the Right Tools
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Match Farm Size
              </h3>
              <p className="text-neutral600 text-sm">
                Choose tools designed for your farm size. Small farms need different solutions than large integrators.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Consider ROI
              </h3>
              <p className="text-neutral600 text-sm">
                Calculate the return on investment. A ₹2,000/month tool that saves ₹50,000 is worth it.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-brandGreen100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗣️</span>
              </div>
              <h3 className="text-lg font-bold text-neutral900 mb-2">
                Language Support
              </h3>
              <p className="text-neutral600 text-sm">
                Ensure tools support Hindi if your team is more comfortable in Hindi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Recommendation */}
      <section className="py-16 bg-neutral900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Why FlockIQ?
              </h2>
              <p className="text-xl text-white/90 mb-6">
                We're not just another tool in the directory. We're built specifically for Indian poultry farmers with:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green300 text-xl">✓</span>
                  <span>95%+ verified accuracy on price predictions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green300 text-xl">✓</span>
                  <span>Hindi-first interface designed for farmers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green300 text-xl">✓</span>
                  <span>Daily WhatsApp delivery at 6:30 AM</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green300 text-xl">✓</span>
                  <span>District-specific predictions for UP</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">Start Free Trial</h3>
              <p className="text-white/90 mb-6">
                Try FlockIQ for 14 days. No credit card required.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-white text-brandGreen700 px-8 py-4 rounded-full font-semibold hover:bg-neutral50 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
