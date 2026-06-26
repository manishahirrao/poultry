'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Shield, Lock, Server } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "FlockIQ helped me save ₹1.2 lakh on my last batch by selling at the right time. The WhatsApp alerts are a game-changer.",
    author: "Ramesh Yadav",
    location: "Gorakhpur, UP",
    birds: "25,000 birds",
  },
  {
    quote: "Managing 8 farms was chaos before FlockIQ. Now I see all my data in one dashboard. The WhatsApp log automation saves me 2 hours daily.",
    author: "Suresh Kumar Patel",
    location: "Deoria, UP",
    birds: "2,00,000 birds",
  },
  {
    quote: "The price predictions are incredibly accurate. I've been using FlockIQ for 6 months and my margins have improved by 15%.",
    author: "David Chen",
    location: "Jakarta, Indonesia",
    birds: "50,000 birds",
  },
];

export function LoginBrandPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full text-white">
      {/* Top section: Logo and tagline */}
      <div>
        <div className="mb-12">
          <h1 className="font-sora text-[1.75rem] font-bold mb-2 leading-[1.1] tracking-[-0.03em]">FlockIQ</h1>
          <p className="font-jakarta text-white/70 text-[0.9375rem] leading-[1.55]">Smarter Flocks. Smarter Returns.</p>
        </div>

        {/* Testimonial — fixed height container, no absolute positioning */}
        <div className="h-56">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col"
            >
              <Quote className="w-7 h-7 text-brand-400 mb-4 flex-shrink-0" />
              <p className="font-jakarta text-white/90 text-[1rem] leading-[1.7] flex-1">
                {TESTIMONIALS[currentIndex].quote}
              </p>
              <div className="mt-4">
                <p className="font-jakarta font-semibold text-[0.9375rem] text-white">{TESTIMONIALS[currentIndex].author}</p>
                <p className="font-jakarta text-white/60 text-sm mt-0.5">
                  {TESTIMONIALS[currentIndex].location} · {TESTIMONIALS[currentIndex].birds}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Testimonial indicators */}
        <div className="flex gap-2 mt-6">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-brand-400' : 'w-2 bg-white/25 hover:bg-white/40'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom section: Trust badges */}
      <div className="border-t border-white/15 pt-6">
        <p className="text-[11px] font-jakarta text-white/50 mb-4 uppercase tracking-[0.16em]">Trusted & Secure</p>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Shield, label: 'DPDP Compliant' },
            { icon: Lock, label: 'SSL Encrypted' },
            { icon: Server, label: 'AWS Mumbai' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/8 border border-white/10 px-3 py-2 rounded-lg">
              <Icon className="w-4 h-4 text-brand-400" />
              <span className="font-jakarta text-sm text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
