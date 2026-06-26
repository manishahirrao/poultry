// FlockIQ — Marketing Testimonials Section
// File: apps/web/components/home/MarketingTestimonials.tsx
// Version: v1.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: TASK-WEB-009
// Requirements: REQ-WEB-001 §W1.12

'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { CaretLeft, CaretRight, Star } from '@phosphor-icons/react';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface Testimonial {
  id: number;
  quote: string;
  attribution: string;
  flockSize: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: 'पहले बिचौलिया जो भाव बोलता था, वो मान लेता था। अब FlockIQ देखकर ₹4/kg ज़्यादा माँगते हैं।',
    attribution: 'R.Y., Gorakhpur',
    flockSize: '25,000 bird farm',
    rating: 5,
  },
  {
    id: 2,
    quote: '3 batches में ₹1.8 lakh extra kamaaya. Subscription ka 50x return pehle saal mein hi.',
    attribution: 'M.S., Deoria',
    flockSize: '40,000 bird farm',
    rating: 5,
  },
  {
    id: 3,
    quote: 'Feed cost timing alerts se ek batch mein ₹45,000 bachaye. Pehle kabhi aisa koi tool nahi tha.',
    attribution: 'S.K., Kushinagar',
    flockSize: 'Integrator, 8 farms',
    rating: 5,
  },
];

// Shared testimonial card content
function TestimonialContent({ testimonial }: { testimonial: Testimonial }) {
  return (
    <>
      {/* Decorative opening quote */}
      <div
        className="text-[80px] leading-none text-brand-200 absolute top-3 left-4 font-serif pointer-events-none select-none"
        aria-hidden="true"
      >
        &quot;
      </div>

      <blockquote className="font-devanagari text-[1.0625rem] text-neutral-900 leading-[1.7] mb-6 pt-10">
        {testimonial.quote}
      </blockquote>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-sora font-bold text-[0.9375rem] text-neutral-900 leading-snug">{testimonial.attribution}</p>
          <p className="font-jakarta text-sm text-neutral-500 mt-0.5 leading-snug">{testimonial.flockSize}</p>
        </div>
        <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} size={18} weight="fill" className="text-amber-400" />
          ))}
        </div>
      </div>
    </>
  );
}

export default function MarketingTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.velocity.x) > 200 || Math.abs(info.offset.x) > 100) {
      if (info.offset.x < 0 || info.velocity.x < 0) {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
    }
  };

  return (
    <SectionShell bg="white" ariaLabel="Customer testimonials carousel">
      <SectionHeader
        eyebrow="WHAT FARMERS SAY"
        heading="Real results from real operations"
        body="Farms across India and Southeast Asia — in their own words."
        align="center"
      />

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-brand-50/50 border border-brand-100 rounded-2xl p-6 relative"
          >
            <TestimonialContent testimonial={testimonial} />
          </motion.div>
        ))}
      </div>

      {/* Mobile: swipeable carousel */}
      <div className="md:hidden">
        <motion.div
          className="relative overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-brand-50/50 border border-brand-100 rounded-2xl p-6 relative"
            >
              <TestimonialContent testimonial={testimonials[currentIndex]} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Nav arrows */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentIndex((p) => (p - 1 + testimonials.length) % testimonials.length)}
            className="p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
            aria-label="Previous testimonial"
          >
            <CaretLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentIndex((p) => (p + 1) % testimonials.length)}
            className="p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
            aria-label="Next testimonial"
          >
            <CaretRight size={20} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Testimonial slides">
          {testimonials.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-brand-700' : 'bg-neutral-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
