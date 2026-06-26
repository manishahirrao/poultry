// FlockIQ — Press/Media Page Client Component
// File: apps/web/app/(marketing)/press/PressPageClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-007

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, FileText, Image, Copy, Check } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeUp } from '@/components/motion/FadeUp';

export default function PressPageClient() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pressReleases = [
    {
      id: 'pr-1',
      title: 'FlockIQ Launches Global Poultry Management Platform',
      date: '2026-06-01',
      summary: 'FlockIQ Technologies Pvt. Ltd. announced the global launch of its AI-powered poultry management platform, bringing advanced price intelligence and farm management tools to poultry farmers across India and Southeast Asia.',
      pdfUrl: '/press-releases/flockiq-launch-global-platform.pdf',
    },
  ];

  const mediaAssets = [
    {
      id: 'logo-svg-dark',
      name: 'Company Logo (SVG - Dark)',
      size: '24 KB',
      format: 'SVG',
      lastUpdated: '2026-06-01',
      url: '/assets/logo/flockiq-logo-dark.svg',
      type: 'logo',
    },
    {
      id: 'logo-svg-light',
      name: 'Company Logo (SVG - Light)',
      size: '24 KB',
      format: 'SVG',
      lastUpdated: '2026-06-01',
      url: '/assets/logo/flockiq-logo-light.svg',
      type: 'logo',
    },
    {
      id: 'logo-png-dark',
      name: 'Company Logo (PNG - Dark)',
      size: '128 KB',
      format: 'PNG',
      lastUpdated: '2026-06-01',
      url: '/assets/logo/flockiq-logo-dark.png',
      type: 'logo',
    },
    {
      id: 'logo-png-light',
      name: 'Company Logo (PNG - Light)',
      size: '128 KB',
      format: 'PNG',
      lastUpdated: '2026-06-01',
      url: '/assets/logo/flockiq-logo-light.png',
      type: 'logo',
    },
    {
      id: 'brand-guidelines',
      name: 'Brand Guidelines PDF',
      size: '2.4 MB',
      format: 'PDF',
      lastUpdated: '2026-06-01',
      url: '/assets/brand/flockiq-brand-guidelines.pdf',
      type: 'document',
    },
    {
      id: 'screenshots',
      name: 'Product Screenshots (ZIP)',
      size: '15.6 MB',
      format: 'ZIP',
      lastUpdated: '2026-06-01',
      url: '/assets/screenshots/flockiq-screenshots.zip',
      type: 'image',
    },
    {
      id: 'founder-photo',
      name: 'Founder Photo',
      size: '1.8 MB',
      format: 'JPG',
      lastUpdated: '2026-06-01',
      url: '/assets/team/founder-photo.jpg',
      type: 'image',
    },
  ];

  const featuredIn = [
    { name: 'Krishi Jagran', logo: '/logos/krishi-jagran.svg' },
    { name: 'AgroStar', logo: '/logos/agrostar.svg' },
    { name: 'NABARD', logo: '/logos/nabard.svg' },
    { name: 'UP Digital Agriculture', logo: '/logos/up-digital-agriculture.svg' },
    { name: 'The Economic Times', logo: '/logos/economic-times.svg' },
  ];

  const handleDownload = async (assetId: string, assetName: string) => {
    // Track download via analytics
    try {
      await fetch('/api/analytics/press-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, assetName }),
      });
    } catch (error) {
      console.error('Failed to track download:', error);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-pageBg">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brand-900 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center">
            <p className="font-jakarta font-bold text-[11px] text-brand-200 uppercase tracking-[0.16em] mb-4">
              Press & Media
            </p>
            <h1 className="font-sora font-extrabold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              Media Resources & Press Kit
            </h1>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 max-w-3xl mx-auto mb-8 leading-[1.7]">
              Download assets, read press releases, and get company information for journalists and media professionals covering FlockIQ.
            </p>
            <Button
              variant="accent"
              size="lg"
              pill
              asChild
            >
              <a href="#media-assets">
                <Download className="mr-2 h-5 w-5" />
                Download Press Kit
              </a>
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <h2 className="font-sora font-extrabold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              FlockIQ — Company Overview
            </h2>
          </FadeUp>

          <FadeUp delay={0.1} className="prose prose-lg max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              FlockIQ Technologies Pvt. Ltd. is an agri-tech company building the world's most advanced AI-powered poultry management platform. Founded in 2026, FlockIQ uses machine learning models trained on 47+ public and private data sources to predict broiler prices 7 days in advance with 95%+ directional accuracy.
            </p>

            <p className="text-neutral-700 leading-relaxed mb-6">
              The platform delivers daily WhatsApp sell signals, comprehensive farm management tools including WhatsApp Daily Log automation, batch P&L tracking, medication withdrawal alerts, and breed-matched benchmarking. FlockIQ serves poultry farmers across India and is expanding to Southeast Asia, with coverage across Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj districts and growing.
            </p>

            <p className="text-neutral-700 leading-relaxed mb-6">
              FlockIQ is committed to making advanced price intelligence and farm management accessible to farmers of all sizes through affordable pricing, Hindi-first mobile app, and WhatsApp-first delivery. The company is currently in Phase 1 (Seed stage) with plans for pan-India expansion by 2027.
            </p>

            <Card className="bg-brand-50 rounded-2xl p-6 mt-8">
              <h3 className="font-sora font-semibold text-neutral-900 mb-4">Key Facts</h3>
              <ul className="space-y-2 text-neutral-700">
                <li>• Headquarters: Gorakhpur, Uttar Pradesh, India</li>
                <li>• Founded: 2026</li>
                <li>• Stage: Phase 1 (Seed)</li>
                <li>• Coverage: 5+ districts in UP Gorakhpur belt, expanding to Southeast Asia</li>
                <li>• Accuracy: 95%+ directional accuracy (verified)</li>
                <li>• Pricing: From ₹2,000/month (PulseFarm)</li>
              </ul>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-section-vertical bg-neutral50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <h2 className="font-sora font-extrabold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Press Releases
            </h2>
          </FadeUp>

          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <FadeUp key={release.id} delay={index * 0.1}>
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-brand-700" />
                    <span className="text-sm text-neutral-500">{release.date}</span>
                  </div>
                  <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">{release.title}</h3>
                  <p className="text-neutral-700 mb-4">{release.summary}</p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(release.id, release.title)}
                      asChild
                    >
                      <a href={release.pdfUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(release.summary, release.id)}
                    >
                      {copiedId === release.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Text
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section id="media-assets" className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <h2 className="font-sora font-extrabold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Media Assets
            </h2>
            <p className="text-lg text-neutral-700">
              Download logos, images, and brand guidelines for use in media coverage.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaAssets.map((asset, index) => (
              <FadeUp key={asset.id} delay={index * 0.1}>
                <Card className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {asset.type === 'logo' ? (
                      <Image className="h-8 w-8 text-brand-700" />
                    ) : asset.type === 'image' ? (
                      <Image className="h-8 w-8 text-brand-700" />
                    ) : (
                      <FileText className="h-8 w-8 text-brand-700" />
                    )}
                    <div>
                      <p className="font-sora font-semibold text-neutral-900">{asset.name}</p>
                      <p className="text-sm text-neutral-500">{asset.size} • {asset.format} • Updated {asset.lastUpdated}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(asset.id, asset.name)}
                    asChild
                  >
                    <a href={asset.url} download>
                      <Download className="h-5 w-5" />
                    </a>
                  </Button>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Featured In */}
      <section className="py-section-vertical bg-neutral50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <h2 className="font-sora font-extrabold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Featured In
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {featuredIn.map((publication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-4 bg-white rounded-xl grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <span className="font-sora font-semibold text-neutral-500 text-lg">
                    {publication.name}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-section-vertical bg-brand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="font-sora font-extrabold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] mb-4">
              Media Contact
            </h2>
            <p className="text-lg text-brand-100 mb-8">
              For press inquiries, interview requests, or additional information.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="accent"
                size="lg"
                pill
                asChild
              >
                <a href="mailto:press@flockiq.com">
                  <Mail className="mr-2 h-5 w-5" />
                  press@flockiq.com
                </a>
              </Button>
              <p className="text-brand-200 text-sm">
                Response time: within 24 hours
              </p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
