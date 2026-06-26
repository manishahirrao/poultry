// FlockIQ — App Download Section
// File: apps/web/components/home/AppDownloadSection.tsx
// Version: v1.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: TASK-WEB-009

'use client';

import { motion } from 'framer-motion';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

export default function AppDownloadSection() {
  return (
    <SectionShell bg="tinted" ariaLabel="Download the app">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            eyebrow="MOBILE APP"
            heading="In the field, at home — always with you"
            body="Works offline. Hindi-first. 200ms price load from cache."
            mb="md"
            animate={false}
          />

          {/* Store Badges */}
          <div className="flex flex-wrap gap-4">
            <a
              href="https://apps.apple.com/app/FlockIQ-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors duration-200"
              aria-label="Download on the App Store"
            >
              <svg className="w-7 h-7 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] leading-none text-white/70">Download on the</span>
                <span className="text-sm font-semibold mt-0.5">App Store</span>
              </div>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.FlockIQ.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors duration-200"
              aria-label="Get it on Google Play"
            >
              <svg className="w-7 h-7 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.3,13.1L18.06,14.37L15.28,11.59L18.06,8.81L20.3,10.08C20.97,10.47 20.97,11.53 20.3,13.1M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] leading-none text-white/70">GET IT ON</span>
                <span className="text-sm font-semibold mt-0.5">Google Play</span>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Right: CSS-only Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center"
          aria-hidden="true"
        >
          <div className="relative w-[264px] h-[540px] bg-neutral-900 rounded-[40px] p-3 shadow-2xl">
            <div className="relative w-full h-full bg-white rounded-[32px] overflow-hidden">
              {/* Status bar */}
              <div className="bg-brand-700 px-4 py-2 flex justify-between items-center">
                <span className="text-white text-xs">9:41</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-1.5 bg-white/70 rounded-sm" />
                  <div className="w-3 h-1.5 bg-white/70 rounded-sm" />
                </div>
              </div>

              {/* App content */}
              <div className="p-4">
                <div className="mb-4">
                  <p className="font-jakarta text-[10px] text-neutral-500 uppercase tracking-[0.12em]">Today's Price</p>
                  <p className="font-sora text-[1.375rem] font-extrabold text-signal-500 tabular-nums leading-tight tracking-[-0.03em]">₹162.40/kg</p>
                  <p className="font-jakarta text-sm text-brand-600 font-medium">↑ +2.3% vs yesterday</p>
                </div>

                <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-4">
                  <p className="font-jakarta text-xs font-bold text-brand-700 uppercase tracking-wider">✓ SELL NOW</p>
                  <p className="font-jakarta text-[11px] text-brand-600 mt-1">Sell today — best window this week</p>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3 mb-4">
                  <p className="font-jakarta text-[11px] text-neutral-500">7-day range: ₹158 – ₹168</p>
                </div>

                <div className="space-y-2">
                  {[['P10', '₹158.20'], ['P50', '₹162.40'], ['P90', '₹168.80']].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-[11px]">
                      <span className="font-jakarta text-neutral-400">{label}</span>
                      <span className="font-sora text-neutral-700 font-medium tabular-nums">{val}</span>
                    </div>
                  ))}
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                    <div className="bg-brand-400 h-1.5 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>

              {/* Bottom nav */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-2.5">
                <div className="flex justify-around">
                  {[['Price', true], ['Batch', false], ['Settings', false]].map(([label, active]) => (
                    <div key={label as string} className="text-center">
                      <div className={`w-5 h-5 rounded-full mx-auto mb-1 ${active ? 'bg-brand-700' : 'bg-neutral-200'}`} />
                      <span className={`text-[10px] ${active ? 'text-brand-700' : 'text-neutral-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
