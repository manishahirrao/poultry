// FlockIQ — Trust & Transparency Section
// File: apps/web/components/home/TrustSection.tsx
// Version: v3.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: HOME-008
// Requirements: FR-HOME-008
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, Brain, ClipboardText } from '@phosphor-icons/react';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface TransparencyPoint {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const transparencyPoints: TransparencyPoint[] = [
  {
    icon: <CheckCircle size={28} />,
    title: '95%+ accuracy before launch',
    description: 'We will not onboard a single customer until our model hits 95%+ directional accuracy on Gorakhpur holdout data. Not one rupee before this gate.',
  },
  {
    icon: <Users size={28} />,
    title: 'All data is public',
    description: 'We use only public, zero-cost data. AGMARKNET, NECC, IMD. No black-box proprietary feeds. You can verify our sources.',
  },
  {
    icon: <Brain size={28} />,
    title: 'Accuracy always visible',
    description: "Our live accuracy dashboard is public. If our model underperforms, you see it before we do. We don't hide bad days.",
  },
  {
    icon: <ClipboardText size={28} />,
    title: 'Below 95% = money back',
    description: 'If our rolling 30-day accuracy drops below 95%, you get that month free. Automatically. No claim needed.',
  },
];

export default function TrustSection() {
  return (
    <SectionShell bg="white" ariaLabel="Our commitment to transparency">
      <SectionHeader
        eyebrow="WHY WE'RE TRANSPARENT"
        heading="We will never lie to a farmer. That's why we tell you all this."
        body="Radical transparency is how we build trust that lasts."
        align="center"
      />

      {/* Transparency points — 2-col grid with left-aligned content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {transparencyPoints.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.08, type: 'spring', stiffness: 100, damping: 20 }}
            className="flex items-start gap-5"
          >
            <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700 flex-shrink-0 mt-0.5">
              {point.icon}
            </div>
            <div>
              <h3 className="font-sora font-bold text-neutral-900 text-[1.0625rem] leading-[1.2] tracking-[-0.02em] mb-2">
                {point.title}
              </h3>
              <p className="font-jakarta text-sm text-neutral-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team credibility block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4, type: 'spring', stiffness: 100, damping: 20 }}
        className="max-w-4xl mx-auto bg-brand-50 rounded-2xl p-8 lg:p-10"
      >
        <h3 className="font-sora font-bold text-[1.25rem] leading-[1.2] tracking-[-0.02em] text-neutral-900 mb-2">
          About Our Team
        </h3>
        <p className="font-jakarta text-sm text-neutral-600 mb-8 leading-relaxed">
          We combine deep technical expertise with real field experience — because models need to be validated at the mandi gate, not just in a notebook.
        </p>
        <div className="grid md:grid-cols-3 gap-8 md:divide-x divide-brand-200">
          {[
            {
              icon: <Users size={20} />,
              title: 'Senior Architect',
              body: '30+ years building large-scale agri-tech systems',
            },
            {
              icon: <Brain size={20} />,
              title: 'Data Science',
              body: 'IIT-trained ML engineers, commodity forecasting background',
            },
            {
              icon: <ClipboardText size={20} />,
              title: 'Ground Truth',
              body: 'Our team spent 30+ days visiting mandis to verify predictions in person',
            },
          ].map((member) => (
            <div key={member.title} className="md:pl-8 first:pl-0">
              <div className="flex items-center gap-2 text-brand-700 mb-2">
                {member.icon}
                <h4 className="font-jakarta font-semibold text-neutral-900 text-[0.8125rem] tracking-[0.02em]">{member.title}</h4>
              </div>
              <p className="font-jakarta text-sm text-neutral-600 leading-relaxed">{member.body}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionShell>
  );
}
