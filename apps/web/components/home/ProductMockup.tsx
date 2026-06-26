// FlockIQ — Product Mockup Component
// File: apps/web/components/home/ProductMockup.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-006
// Requirements: Design Spec §3.1
// CSS-only HTML mockup (no images) for instant loading on 3G

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ProductMockup() {
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
    <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-center">
      {/* Phone Mockup (Left) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.3 }}
        className="relative"
      >
        {/* Phone Frame */}
        <div className="w-[200px] h-[400px] bg-white rounded-[2.5rem] p-3 shadow-2xl border-4 border-neutral-200">
          {/* Phone Screen */}
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-white rounded-[2rem] overflow-hidden relative">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-neutral-900 rounded-b-xl z-10" />
            
            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full p-4">
              {/* Price Display */}
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-700 mb-1">
                  {mounted ? '₹162.40' : '₹---'}
                </div>
                <div className="text-sm text-neutral-500 mb-2">/kg</div>
                
                {/* Direction Badge */}
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-3">
                  <span>↑</span>
                  <span>+2.3% vs yesterday</span>
                </div>
                
                {/* Sell Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.3, delay: prefersReducedMotion ? 0 : 0.6 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded-full text-sm font-semibold"
                >
                  <span>🚧</span>
                  <span>PRIVATE BETA</span>
                </motion.div>
              </div>
              
              {/* Range */}
              <div className="mt-4 text-xs text-neutral-400">
                Range: ₹158 – ₹168
              </div>
            </div>
          </div>
        </div>
        
        {/* WhatsApp Badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, delay: prefersReducedMotion ? 0 : 0.8 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
        >
          Daily 6:30 AM
        </motion.div>
      </motion.div>

      {/* Dashboard Mockup (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.4 }}
        className="relative hidden lg:block"
      >
        {/* Browser Window */}
        <div className="w-[320px] h-[240px] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Browser Header */}
          <div className="h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-neutral-400">
              flockiq.com/dashboard
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-white h-[calc(100%-32px)]">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white rounded-lg p-2 border border-neutral-200 shadow-sm">
                <div className="text-[10px] text-neutral-500 mb-1">Today's Price</div>
                <div className="text-lg font-bold text-orange-700">₹162.40</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-neutral-200 shadow-sm">
                <div className="text-[10px] text-neutral-500 mb-1">Signal</div>
                <div className="text-lg font-bold text-neutral-400">Beta</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-neutral-200 shadow-sm">
                <div className="text-[10px] text-neutral-500 mb-1">7-Day Trend</div>
                <div className="text-lg font-bold text-orange-700">↑ +2.3%</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-neutral-200 shadow-sm">
                <div className="text-[10px] text-neutral-500 mb-1">Accuracy</div>
                <div className="text-lg font-bold text-orange-700">96.2%</div>
              </div>
            </div>
            
            {/* Mini Chart Mockup */}
            <div className="bg-white rounded-lg p-2 border border-neutral-200 shadow-sm">
              <div className="text-[10px] text-neutral-500 mb-2">7-Day Forecast (Beta)</div>
              <div className="flex items-end gap-1 h-12">
                {[60, 45, 70, 55, 80, 65, 75].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-orange-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
