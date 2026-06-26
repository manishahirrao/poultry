// FlockIQ — WhatsApp Log Automation Medicine Reporting Section (GAP 3)
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/MedicineReportingSection.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 SECTION B-01-05
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md FR-GAP-003

'use client';

import { FadeUp } from '@/components/motion/FadeUp';
import { Pill, Shield, AlertTriangle } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

export function MedicineReportingSection() {
  return (
    <section className="py-24" style={{ background: '#EDF7F1' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <AlertTriangle size={16} />
              GAP 3 — Now Solved
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 font-sora">
              Farmers Can Also Report Medicine Via WhatsApp
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              When a vet prescribes treatment, the farmer types the medicine name and
              dose on WhatsApp. FlockIQ parses it, calculates the withdrawal period,
              and alerts you if birds are approaching sale-date before it clears.
            </p>
          </div>
        </FadeUp>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left — WhatsApp Example */}
          <FadeUp delay={0.1}>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <span className="text-white text-lg">💬</span>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">WhatsApp Message</div>
                  <div className="text-sm text-neutral-500">Farmer reply</div>
                </div>
              </div>

              {/* Chat Mockup */}
              <div className="bg-[#E5DDD5] rounded-xl p-4 space-y-3">
                {/* FlockIQ message */}
                <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 max-w-[90%] shadow-sm">
                  <div className="text-neutral-800 text-sm font-medium mb-1">
                    🐔 FlockIQ — Shivaji Farm
                  </div>
                  <div className="text-neutral-600 text-xs">
                    Any treatment today? Reply format: MEDICINE [name] [dose] Day-[start]-[end]
                  </div>
                </div>

                {/* Farmer reply */}
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-4 py-2 max-w-[90%] shadow-sm ml-auto">
                  <div className="text-neutral-800 text-sm font-medium">
                    MEDICINE Tylosin 2ml/L Day5-8
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <div className="text-neutral-400 text-[10px]">6:15 PM</div>
                    <svg className="w-4 h-4 text-[#34B7F1]" viewBox="0 0 16 11" fill="currentColor">
                      <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                </div>

                {/* FlockIQ confirmation */}
                <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 max-w-[90%] shadow-sm">
                  <div className="text-neutral-800 text-sm font-medium mb-1">
                    ✅ Treatment logged
                  </div>
                  <div className="text-neutral-600 text-xs">
                    Medicine: Tylosin<br />
                    Dose: 2ml/L<br />
                    Days: 5-8<br />
                    Withdrawal ends: Day 15
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Right — Dashboard Treatment Card */}
          <FadeUp delay={0.2}>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <Pill size={20} className="text-brand-700" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">Dashboard Treatment Card</div>
                  <div className="text-sm text-neutral-500">Manager view</div>
                </div>
              </div>

              {/* Treatment Card */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-neutral-900">Tylosin</div>
                    <div className="text-sm text-neutral-600">2ml/L in water</div>
                  </div>
                  <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold">
                    Active
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Treatment Days</span>
                    <span className="font-medium text-neutral-900">Day 5–8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Withdrawal Period</span>
                    <span className="font-medium text-neutral-900">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Withdrawal Ends</span>
                    <span className="font-medium text-brand-700">Day 15</span>
                  </div>
                </div>

                {/* Alert */}
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <span className="font-semibold">Withdrawal Period Protection:</span>{' '}
                      Birds cannot be sold until Day 15. FlockIQ will block sale
                      attempts and alert you.
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-4 space-y-2">
                {[
                  'Auto-calculates withdrawal period from medicine database',
                  'Blocks sale during withdrawal — prevents FSSAI violations',
                  'AB-Free badge auto-applied when no antibiotics used',
                  'Treatment cost flows into Batch P&L',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-brand-700 text-xs">✓</span>
                    </div>
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Bottom Note */}
        <FadeUp delay={0.3}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-neutral-200 shadow-sm">
              <Shield size={18} className="text-brand-700" />
              <span className="text-sm text-neutral-700">
                FSSAI-compliant medicine tracking — audit-ready in seconds
              </span>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
