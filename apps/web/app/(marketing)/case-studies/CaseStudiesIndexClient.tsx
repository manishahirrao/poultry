// FlockIQ — Case Studies Index Client Component
// File: apps/web/app/(marketing)/case-studies/CaseStudiesIndexClient.tsx
// Version: v1.0 | May 2026
// Task Reference: C-04
// Requirements: FR-CASESTUDIES-001

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendUp, CheckCircle } from '@phosphor-icons/react';

const caseStudies = [
  {
    slug: 'rajesh-yadav-gorakhpur-timing-saves-124000',
    title: '₹1,24,000 Saved in 6 Months: How a Gorakhpur Farmer Finally Stopped Losing Money on Timing',
    subtitle: 'Price Intelligence + Sell Signal helped Rajesh Yadav achieve 100% correct sell timing',
    farmer: 'राजेश यादव (Rajesh Yadav)',
    location: 'गोरखपुर, उत्तर प्रदेश',
    flockSize: '25,000 पक्षी (birds)',
    outcome: '₹1,24,000 saved in 6 months',
    category: 'Price Intelligence',
    readTime: '6 min read',
    image: '/case-studies/rajesh-yadav.jpg',
  },
  {
    slug: 'suresh-patel-deoria-hpai-alert-saves-320000',
    title: 'The HPAI Alert That Saved ₹3,20,000: A Deoria Farmer\'s Story',
    subtitle: 'Disease Alert / HPAI Early Warning helped sell 48 hours before official announcement',
    farmer: 'सुरेश कुमार पटेल (Suresh Kumar Patel)',
    location: 'देवरिया, उत्तर प्रदेश',
    flockSize: '18,000 पक्षी (birds)',
    outcome: '₹3,20,000 loss avoided in 72 hours',
    category: 'Disease Alert',
    readTime: '7 min read',
    image: '/case-studies/suresh-patel.jpg',
  },
  {
    slug: 'anand-mehta-integrator-whatsapp-automation-8-farms',
    title: 'From 4 Hours of Daily Calls to 12 Minutes: How an Integrator Transformed Operations',
    subtitle: 'WhatsApp Daily Log Automation reduced data collection time by 90% across 8 farms',
    farmer: 'Anand Mehta',
    location: 'Gorakhpur, Uttar Pradesh',
    flockSize: '8 contract farms, 1,85,000 total birds',
    outcome: '90% reduction in data collection time',
    category: 'Integrator',
    readTime: '8 min read',
    image: '/case-studies/anand-mehta.jpg',
  },
  {
    slug: 'manoj-singh-kushinagar',
    title: 'मनोज सिंह — पहले batch में ₹68,000 का फ़ायदा',
    subtitle: 'Hubbard Flex farmer achieved FCR 1.65 with AI timing',
    farmer: 'मनोज सिंह',
    location: 'Kushinagar, UP',
    flockSize: '35,000 Hubbard Flex (FCR 1.65)',
    outcome: 'पहले batch में ₹68,000 का फ़ायदा',
    category: 'Adoption Story',
    readTime: '6 min read',
    image: '/case-studies/manoj-singh.jpg',
  },
];

export default function CaseStudiesIndexClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="font-jakarta font-bold text-[11px] text-brand-100 tracking-[0.16em] uppercase mb-4">
              किसान क्या कहते हैं
            </p>
            <h1 className="font-sora font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              ये नंबर हमने नहीं बनाए — ये हमारे किसानों ने कमाए
            </h1>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 max-w-3xl mx-auto">
              We didn't make these numbers — our farmers earned them
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.a
                key={study.slug}
                href={`/case-studies/${study.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-brand-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image Placeholder */}
                  <div className="aspect-video bg-brand-200 flex items-center justify-center">
                    <CheckCircle size={48} className="text-brand-400" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-1 rounded-full">
                        {study.category}
                      </span>
                      <span className="text-xs text-neutral-500">{study.readTime}</span>
                    </div>

                    <h2 className="font-sora font-bold text-xl text-neutral-900 mb-2 group-hover:text-brand-700 transition-colors">
                      {study.title}
                    </h2>
                    <p className="text-sm text-neutral-700 mb-4">{study.subtitle}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-neutral-900">{study.farmer}</p>
                        <p className="text-neutral-500">{study.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-700">{study.outcome}</p>
                        <p className="text-neutral-500">{study.flockSize}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center text-brand-700 font-semibold">
                      Read full story
                      <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              आपकी कहानी भी हो सकती है अगली
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700 mb-8">
              Join 200+ farmers already saving with FlockIQ
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-500 transition-all"
            >
              14 दिन मुफ़्त शुरू करें
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
