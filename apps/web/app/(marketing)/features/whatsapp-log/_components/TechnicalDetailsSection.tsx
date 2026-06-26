// FlockIQ — WhatsApp Log Automation Technical Details Section
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/TechnicalDetailsSection.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 SECTION B-01-06
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md FR-FEAT-002

'use client';

import { useState } from 'react';
import { FadeUp } from '@/components/motion/FadeUp';
import { ChevronDown, ChevronUp, Server, Zap, Shield, Clock, CheckCircle, Activity } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

interface TechDetail {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}

const TECH_DETAILS: TechDetail[] = [
  {
    label: 'WhatsApp Integration',
    value: 'Meta WhatsApp Business API (WABA)',
    detail: 'Approved templates, verified sender',
    icon: <Server size={20} />,
  },
  {
    label: 'NLP Parser',
    value: 'Custom rule-based + LLM fallback',
    detail: 'Handles 10+ input formats including Hindi',
    icon: <Zap size={20} />,
  },
  {
    label: 'Response Time',
    value: '< 60 seconds from farmer reply',
    detail: 'P95: 23 seconds (Vercel Edge + Supabase)',
    icon: <Clock size={20} />,
  },
  {
    label: 'Audit Log',
    value: 'Every message stored with timestamp',
    detail: 'Raw message + parsed values + validation status',
    icon: <Activity size={20} />,
  },
  {
    label: 'Compliance',
    value: 'DPDP Act 2023 | WABA Terms of Service',
    detail: 'Explicit consent at onboarding, STOP command supported',
    icon: <Shield size={20} />,
  },
  {
    label: 'Uptime SLA',
    value: '99.9% — tied to Meta WABA uptime',
    detail: 'Fallback: manual log entry always available',
    icon: <CheckCircle size={20} />,
  },
];

export function TechnicalDetailsSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-24" style={{ background: '#F4F8F5' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 font-sora">
              Built for Enterprise-Grade Operations
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Technical specifications for IT and compliance teams
            </p>
          </div>
        </FadeUp>

        {/* Expand Button */}
        <FadeUp delay={0.1}>
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-6 py-3 rounded-full font-semibold text-neutral-700 hover:border-brand-400 hover:text-brand-700 transition-all shadow-sm"
            >
              {isExpanded ? (
                <>
                  Hide Technical Details
                  <ChevronUp size={18} />
                </>
              ) : (
                <>
                  See Technical Details
                  <ChevronDown size={18} />
                </>
              )}
            </button>
          </div>
        </FadeUp>

        {/* Technical Details Table */}
        {isExpanded && (
          <FadeUp delay={0.2}>
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                        Specification
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                        Value
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {TECH_DETAILS.map((detail, index) => (
                      <tr key={index} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700">
                              {detail.icon}
                            </div>
                            <span className="font-medium text-neutral-900">{detail.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-neutral-700 font-medium">{detail.value}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-neutral-600 text-sm">{detail.detail}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-900">Note:</span> All data
                  processing happens within India (Vercel Edge Mumbai region) in compliance
                  with DPDP Act 2023. WhatsApp messages are processed via Meta's
                  Business API with explicit user consent.
                </p>
              </div>
            </div>
          </FadeUp>
        )}

        {/* Security Badges */}
        <FadeUp delay={0.3}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { label: 'DPDP Compliant', icon: Shield },
              { label: 'SOC 2 Type II', icon: CheckCircle },
              { label: 'ISO 27001', icon: Activity },
              { label: 'GDPR Ready', icon: Shield },
            ].map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700"
              >
                <badge.icon size={14} className="text-brand-700" />
                {badge.label}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
