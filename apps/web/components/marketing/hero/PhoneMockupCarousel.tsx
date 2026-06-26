// FlockIQ — Phone Mockup Carousel Component (v3.0)
// File: apps/web/components/marketing/hero/PhoneMockupCarousel.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.1

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Screen {
  id: string;
  content: React.ReactNode;
}

const screens: Screen[] = [
  {
    id: 'dashboard',
    content: (
      <div className="bg-white rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-800">FlockIQ</span>
          </div>
          <span className="text-[10px] text-gray-500">9:41 AM</span>
        </div>
        <div className="text-sm font-semibold text-gray-800 mb-3">Good morning, Ramesh ✓</div>
        <div className="border-t pt-3">
          <div className="text-xs font-medium text-gray-600 mb-2">Today's Operations</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
              <span className="text-xs text-gray-700">3 Farms Active</span>
              <span className="text-xs text-green-600">✓</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
              <span className="text-xs text-gray-700">Avg FCR: 1.82</span>
              <span className="text-xs text-green-600">✓</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
              <span className="text-xs text-gray-700">Mortality: 2.1%</span>
              <span className="text-xs text-green-600">✓</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50 rounded-lg p-2">
              <span className="text-xs text-amber-700">1 Log Pending</span>
              <span className="text-xs text-amber-600">⏳</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium text-gray-600 mb-1">🐔 Shivaji Farm D-21</div>
          <div className="text-[10px] text-gray-500">1250kg feed logged ✓</div>
          <div className="text-[10px] text-green-600">[via WhatsApp 6:14PM]</div>
        </div>
      </div>
    ),
  },
  {
    id: 'whatsapp',
    content: (
      <div className="bg-[#ECF8F1] rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
            <span className="text-white text-xs">💬</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">FlockIQ Daily Log</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="bg-white rounded-lg p-2 max-w-[85%]">
            <div className="text-[10px] text-gray-500 mb-1">🐔 Shivaji Farm D-21</div>
            <div className="text-xs text-gray-700">Day 21 data bhejein:</div>
            <div className="text-xs text-gray-600 mt-1">[deaths] [feed kg]</div>
          </div>
          <div className="bg-[#DCF8C6] rounded-lg p-2 max-w-[85%] ml-auto">
            <div className="text-xs text-gray-800 font-medium">"2 1250 1680"</div>
          </div>
          <div className="bg-white rounded-lg p-2 max-w-[85%]">
            <div className="text-xs text-green-600 font-semibold">✅ Log saved!</div>
            <div className="text-[10px] text-gray-600">Deaths: 2 | Feed:1250</div>
            <div className="text-[10px] text-green-600">FCR est: 1.82 ✓</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'price',
    content: (
      <div className="bg-white rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📈</span>
          <span className="text-xs font-semibold text-gray-800">Price Intelligence</span>
        </div>
        <div className="border-t pt-3 flex-1">
          <div className="text-xs text-gray-600 mb-2">Today: ₹168/kg</div>
          <div className="text-xs text-green-600 mb-3">↑ +₹4 vs yesterday</div>
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-gray-700 mb-2">7-Day Forecast:</div>
            <div className="text-sm font-bold text-gray-800 mb-1">₹161 — ₹175 range</div>
            <div className="text-xs text-gray-600 mb-3">P50: ₹168/kg</div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-xs font-semibold text-green-700">🟢 SELL NOW</div>
              <div className="text-[10px] text-green-600">Optimal window: 2-4d</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'fcr',
    content: (
      <div className="bg-white rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <span className="text-xs font-semibold text-gray-800">FCR Analytics</span>
        </div>
        <div className="border-t pt-3 flex-1">
          <div className="text-xs text-gray-600 mb-2">Portfolio Avg FCR: 1.77</div>
          <div className="text-xs text-gray-500 mb-3">Industry avg: 1.90</div>
          <div className="text-xs text-green-600 font-semibold mb-3">✓ 7% better</div>
          <div className="border-t pt-3">
            <div className="h-16 bg-gradient-to-t from-green-50 to-transparent rounded-lg mb-2 relative">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <path d="M0 40 Q25 35 50 30 T100 20" stroke="#1A5C34" strokeWidth="2" fill="none" />
                <path d="M0 40 Q25 35 50 30 T100 20 L100 50 L0 50 Z" fill="rgba(26,92,52,0.1)" />
              </svg>
            </div>
            <div className="text-[10px] text-gray-500">Trend: ↓ improving</div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="text-[10px] text-gray-600">Best farm: Raj Farm</div>
            <div className="text-xs font-semibold text-green-600">FCR: 1.69 (top 10%)</div>
          </div>
        </div>
      </div>
    ),
  },
];

export function PhoneMockupCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screens.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="relative w-[280px] h-[560px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
      {/* Phone Bezel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
      
      {/* Phone Screen */}
      <div className="relative w-full h-full bg-white rounded-[32px] overflow-hidden">
        {!mounted ? (
          // SSR / pre-hydration: render first screen immediately, no animation
          <div className="w-full h-full p-3">
            {screens[0].content}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full h-full p-3"
            >
              {screens[currentIndex].content}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

