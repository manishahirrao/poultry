// FlockIQ — Testimonials + Press Section with Video Support
// File: apps/web/components/home/TestimonialsSection.tsx
// Version: v2.0 | June 2026
// Task Reference: HOME-REMAINING-002
// Requirements: FR-HOME-007
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §H-07

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Play } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import Image from 'next/image';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface TestimonialCardProps {
  name: string;
  location: string;
  flock: string;
  outcome: string;
  outcomeVerified?: boolean;
  quoteHi?: string;
  quoteEn: string;
  videoUrl?: string;
  videoThumbnail?: string;
  avatarInitials: string;
  fcrBadge?: string;
  whatsappBadge?: boolean;
  isPrimary?: boolean;
}

const testimonials: TestimonialCardProps[] = [
  {
    name: 'राजेश यादव (Rajesh Yadav)',
    location: 'गोरखपुर, उत्तर प्रदेश',
    flock: '25,000 पक्षी (birds)',
    outcome: '₹1,24,000 saved in 6 months',
    outcomeVerified: true,
    quoteHi: 'पहले 3 व्यापारियों को फोन करके भी सही time नहीं पता चलता था। अब FlockIQ का एक message सब बता देता है।',
    quoteEn: 'Before, even calling 3 traders didn\'t give me the right timing. Now one FlockIQ message tells me everything.',
    avatarInitials: 'RY',
    fcrBadge: 'FCR 1.78 — Above industry average',
    whatsappBadge: true,
    isPrimary: true,
  },
  {
    name: 'Suresh Kumar Patel',
    location: 'Deoria, UP — 8 farms managed',
    flock: 'Integrator',
    outcome: '₹3.2L saved from HPAI early warning',
    quoteHi: 'HPAI alert aaya 48 ghante pahle — humne Ross 308 flock sell kar liya transport block se pehle. ₹3.2 lakh ki sambhavit hani se bache.',
    quoteEn: 'HPAI alert came 48 hours early — we sold the Ross 308 flock before transport block. Saved ₹3.2 lakh potential loss.',
    avatarInitials: 'SP',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder - replace with actual video
  },
  {
    name: 'David Chen',
    location: 'Jakarta, Indonesia',
    flock: '120,000 birds (integrator)',
    outcome: 'FCR improved 0.12 in 3 months',
    quoteEn: 'We manage 12 farms across West Java. FlockIQ\'s WhatsApp log automation saved us from hiring 2 additional data collectors. The benchmark comparison shows exactly which farms need intervention.',
    avatarInitials: 'DC',
  },
];

const pressLogos = [
  { name: 'Krishi Jagran', label: 'कृषि जागरण' },
  { name: 'AgroStar', label: 'AgroStar' },
  { name: 'NABARD', label: 'NABARD' },
  { name: 'Economic Times', label: 'The Economic Times' },
];

// Video Modal Component
function VideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-white/80 transition-colors"
            aria-label="Close video"
          >
            <X size={32} />
          </button>
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src={videoUrl}
              title="Testimonial Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Video Thumbnail Component
function VideoThumbnail({ thumbnail, onClick }: { thumbnail?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-100 group cursor-pointer"
      aria-label="Play video testimonial"
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt="Video testimonial thumbnail"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center">
          <div className="text-center">
            <Play size={48} className="text-white/80 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Watch Video</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play size={24} className="text-brand-700 fill-brand-700 ml-1" />
        </div>
      </div>
    </button>
  );
}

// Avatar Component
function Avatar({ initials, isPrimary }: { initials: string; isPrimary?: boolean }) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
        isPrimary ? 'bg-brand-700' : 'bg-brand-600'
      }`}
    >
      {initials}
    </div>
  );
}

// Individual Testimonial Card
function TestimonialCard({ testimonial, index }: { testimonial: TestimonialCardProps; index: number }) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className={`relative bg-white border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
          testimonial.isPrimary
            ? 'lg:col-span-2 border-brand-200 bg-brand-50/40 ring-1 ring-brand-300/50'
            : 'border-neutral-150'
        }`}
      >
        {testimonial.outcomeVerified && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            <CheckCircle size={14} />
            <span>Verified against Gorakhpur APMC records</span>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <Avatar initials={testimonial.avatarInitials} isPrimary={testimonial.isPrimary} />
          <div>
            <h3 className="font-sora font-bold text-[1.0625rem] leading-[1.2] tracking-[-0.015em] text-neutral-900">{testimonial.name}</h3>
            <p className="font-jakarta text-sm text-neutral-600">{testimonial.location}</p>
            <p className="font-jakarta text-sm text-neutral-500">{testimonial.flock}</p>
            {testimonial.fcrBadge && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full mt-1">
                {testimonial.fcrBadge}
              </span>
            )}
            {testimonial.whatsappBadge && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full mt-1 ml-2">
                Daily logs via WhatsApp ✓
              </span>
            )}
          </div>
        </div>

        {testimonial.videoUrl ? (
          <div className="mb-4">
            <VideoThumbnail
              thumbnail={testimonial.videoThumbnail}
              onClick={() => setVideoOpen(true)}
            />
          </div>
        ) : (
          <blockquote className="font-jakarta text-[0.9375rem] text-neutral-700 leading-[1.7] mb-4">
            &quot;{testimonial.quoteEn}&quot;
          </blockquote>
        )}

        <div className="inline-flex items-center gap-1.5 bg-signal-light text-signal-700 px-4 py-2 rounded-full text-sm font-semibold">
          {testimonial.outcome}
        </div>
      </motion.div>

      {videoOpen && testimonial.videoUrl && (
        <VideoModal videoUrl={testimonial.videoUrl} onClose={() => setVideoOpen(false)} />
      )}
    </>
  );
}

export default function TestimonialsSection() {
  return (
    <SectionShell bg="white" ariaLabel="Customer testimonials">
      {/* Section Header */}
      <SectionHeader
        eyebrow="REAL RESULTS"
        heading="Farms That Made the Switch"
        body="See how poultry operations across India and Southeast Asia transformed their outcomes with FlockIQ"
        align="center"
      />

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Press Logos Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-neutral-200 pt-12"
        >
            <p className="text-center font-jakarta text-neutral-500 text-[0.8125rem] mb-8">
              As featured in
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {pressLogos.map((logo, index) => (
                <motion.div
                  key={logo.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.08) }}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors duration-200 cursor-pointer"
                >
                  <div className="font-jakarta text-[1rem] font-semibold tracking-[-0.01em]">{logo.label}</div>
                </motion.div>
              ))}
            </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="/case-studies"
            className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:text-brand-600 transition-colors"
          >
            Read All Case Studies →
          </a>
        </motion.div>
    </SectionShell>
  );
}
