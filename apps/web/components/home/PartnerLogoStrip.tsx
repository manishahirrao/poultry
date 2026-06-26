// FlockIQ AI — Partner Logo Strip Component
// File: apps/web/components/home/PartnerLogoStrip.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-006
// Requirements: Design Spec §3.1
// Greyscale SVG logos with "Powered by verified government data" label

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const partners = [
  { name: 'AGMARKNET', label: 'Agmarknet' },
  { name: 'IMD', label: 'IMD Weather' },
  { name: 'NECC', label: 'NECC' },
  { name: 'DAHDF', label: 'DAHDF' },
  { name: 'NCDEX', label: 'NCDEX' },
];

export default function PartnerLogoStrip() {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.7 }}
      className="mt-8 pt-6 border-t border-neutral-200"
    >
      <p className="font-jakarta text-[11px] text-neutral-500 text-center mb-4 font-medium tracking-[0.14em] uppercase">
        Powered by verified government data
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
        {partners.map((partner, index) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.01 : 0.3, 
              delay: prefersReducedMotion ? 0 : 0.8 + (index * 0.05) 
            }}
            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            {/* Greyscale Logo Placeholder - In production, replace with actual SVG logos */}
            <div className="w-8 h-8 bg-neutral-200 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold text-neutral-500">{partner.name[0]}</span>
            </div>
            <span className="font-jakarta text-[0.8125rem] font-semibold text-neutral-600">{partner.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

