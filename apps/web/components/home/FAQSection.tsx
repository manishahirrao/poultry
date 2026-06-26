// FlockIQ — FAQ Accordion Section
// File: apps/web/components/home/FAQSection.tsx
// Version: v3.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: HOME-009
// Requirements: FR-HOME-009, FR-SEO-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How accurate is FlockIQ?',
    answer: 'FlockIQ achieves 96.2% directional accuracy — meaning 96+ out of 100 predictions get the right direction (up/down). MAPE is 4.8% — average error under ₹8/kg when price is ₹160. This was verified in our private beta.',
  },
  {
    question: 'Does it work on both iPhone and Android?',
    answer: 'Yes. FlockIQ works on both iOS and Android. It also works well on basic Android phones (₹8,000–15,000 range). The app loads in under 2 seconds even on slow 3G connections.',
  },
  {
    question: 'What happens after the 14-day trial?',
    answer: "After 14 days, you can continue with FlockIQ FARM (₹5,000/month) or upgrade to FlockIQ PRO (₹8,000/month). We only charge after you manually confirm — no automatic charges without permission.",
  },
  {
    question: "What if I don't have internet?",
    answer: "The app always shows the last cached data with a timestamp. We never show a blank screen. WhatsApp messages will still be delivered when you're back online.",
  },
  {
    question: 'Is my data safe?',
    answer: 'Your data is stored on Supabase (AWS ap-south-1, Mumbai). DPDP Act 2023 compliant. Your data is never sold to third parties.',
  },
  {
    question: 'Does FlockIQ work outside India?',
    answer: "FlockIQ is currently available in India, Indonesia, Vietnam, Thailand, and 11 other countries across 4 continents. We're expanding to more markets in Phase 2.",
  },
  {
    question: 'What time do WhatsApp messages arrive?',
    answer: 'Daily at 6:30 AM — 7 days a week. This timing was chosen based on farmer feedback as the most suitable time for making decisions.',
  },
  {
    question: 'Can I cancel at any time?',
    answer: 'Yes, at any time. No lock-in period, no penalty. Just go to the app and cancel — it takes effect instantly.',
  },
];

// FAQ Item Component — uses grid-template-rows for height animation (no layout property animation)
function FAQAccordionItem({ item, index, isOpen, onToggle }: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-brand-tint transition-shadow duration-200"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left bg-white hover:bg-neutral-50 transition-colors duration-150 active:bg-neutral-100"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="font-jakarta font-semibold text-[0.9375rem] text-neutral-900 pr-4 leading-[1.45]">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <CaretDown size={18} className="text-brand-700" />
        </motion.div>
      </button>

      {/* Height animation via grid-template-rows — avoids animating layout properties */}
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 280ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div className="overflow-hidden">
          <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200">
            <p className="font-jakarta text-sm text-neutral-700 leading-relaxed max-w-[65ch]">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <SectionShell bg="white" className="relative overflow-hidden" ariaLabel="Frequently asked questions">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-noise-pattern" aria-hidden="true" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative">
        <SectionHeader
          eyebrow="FAQ"
          heading="Frequently Asked Questions"
          body="Everything you need to know about FlockIQ"
          align="center"
        />

        {/* Two-column FAQ grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqItems.map((item, index) => (
            <FAQAccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Link to full FAQ page */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="/faq"
            className="inline-flex items-center text-brand-700 font-semibold hover:text-brand-600 transition-colors duration-150"
          >
            View all questions →
          </a>
        </motion.div>
      </div>
    </SectionShell>
  );
}
