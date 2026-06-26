// FlockIQ — Final CTA Section
// File: apps/web/components/home/FinalCTASection.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-010, TEST-001
// Requirements: FR-HOME-010, FR-GLOBAL-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { motion } from 'framer-motion';
import { SectionShell } from '@/components/ui/SectionShell';

export default function FinalCTASection() {
  return (
    <SectionShell bg="dark" ariaLabel="Start your free trial">
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
          className="text-center"
        >
          <h2 className="font-sora font-extrabold text-white leading-[1.06] tracking-[-0.03em] mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw + 0.75rem, 3.5rem)' }}
          >
            Get Started — First 14 Days Free
          </h2>
          <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-white/75 max-w-3xl mx-auto mb-6 leading-[1.7]">
            No credit card. Cancel anytime. Setup in 3 minutes.
          </p>
          <p className="font-jakarta text-[0.9375rem] text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed italic">
            &quot;Your first price signal will arrive on WhatsApp tonight at 6:30 PM.&quot;
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-12"
          >
            <a
              href="/login?action=signup"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).posthog) {
                  (window as any).posthog.capture('final_cta_clicked', { location: 'final_cta_section' });
                }
              }}
              className="inline-flex items-center justify-center px-12 py-5 bg-white text-brand-700 font-semibold rounded-full hover:bg-brand-50 transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              Start Now →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {['No credit card required', 'Cancel anytime', 'Setup in 3 minutes', 'Private beta access'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-brand-400" aria-hidden="true">✓</span>
                <span className="font-jakarta text-sm text-white/85">{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
    </SectionShell>
  );
}
