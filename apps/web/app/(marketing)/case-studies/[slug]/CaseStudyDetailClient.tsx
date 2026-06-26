// FlockIQ — Case Study Detail Client Component
// File: apps/web/app/(marketing)/case-studies/[slug]/CaseStudyDetailClient.tsx
// Version: v2.0 | June 2026
// Task Reference: CS-001
// Requirements: FR-CASESTUDIES-001

'use client';

import { motion } from 'framer-motion';
import { TrendUp, MapPin, Calendar, ArrowLeft, CheckCircle, User } from '@phosphor-icons/react';
import Link from 'next/link';
import { CaseStudyHero } from '../../../../components/case-studies/CaseStudyHero';
import { CaseStudyTimeline } from '../../../../components/case-studies/CaseStudyTimeline';
import { type CaseStudy } from '../lib/case-study-types';

interface CaseStudyDetailClientProps {
  study: CaseStudy & { content: string };
  relatedStudies?: (CaseStudy & { content?: string })[];
}

export default function CaseStudyDetailClient({ study, relatedStudies = [] }: CaseStudyDetailClientProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-section-small bg-brandGreen25">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/case-studies"
            className="inline-flex items-center text-brandGreen700 font-semibold mb-6 hover:underline"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Case Studies
          </Link>
        </div>
      </section>

      {/* Hero */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-brandGreen700 bg-brandGreen100 px-2 py-1 rounded-full">
                {study.category}
              </span>
              <span className="text-xs text-neutral500">{study.readTime}</span>
            </div>

            <h1 className="font-space-grotesk font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] text-neutral900 leading-[1.1] mb-4">
              {study.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-neutral500 mb-6">
              <div className="flex items-center gap-2">
                <User size={20} />
                <span>{study.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>{new Date(study.publishedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
            </div>

            <p className="font-space-grotesk text-lg text-neutral700">{study.excerpt}</p>
          </motion.div>
        </div>
      </section>

      {/* Hero Component */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CaseStudyHero
            farmerName={study.farmerName}
            location={study.farmerLocation}
            birdCount={study.farmSize}
            farmType={study.planUsed}
            financialOutcome={study.heroStat}
            outcomeType="saved"
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:font-space-grotesk prose-headings:font-bold prose-a:text-brandGreen700 prose-p:leading-relaxed prose-p:text-neutral-700 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-ol:text-neutral-700 prose-li:text-neutral-700 prose-blockquote:text-neutral-600 prose-code:text-neutral-900 prose-pre:text-neutral-900"
            dangerouslySetInnerHTML={{ __html: study.content.replace(/\n/g, '<br/>') }}
          />
        </div>
      </section>

      {/* Related Case Studies */}
      {relatedStudies.length > 0 && (
        <section className="py-section-vertical bg-brandGreen25">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-space-grotesk font-bold text-2xl text-neutral900 mb-2">Related Case Studies</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedStudies.map((related, index) => (
                <motion.a
                  key={related.slug}
                  href={`/case-studies/${related.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-neutral900 mb-2">{related.title}</h3>
                  <div className="flex items-center text-brandGreen700 font-semibold">
                    Read more
                    <TrendUp size={20} className="ml-2" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              आपकी कहानी भी हो सकती है अगली
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700 mb-8">
              Start your 14-day free trial today
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-brandGreen700 text-white font-semibold rounded-full hover:bg-brandGreen500 transition-all"
            >
              14 दिन मुफ़्त शुरू करें
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
