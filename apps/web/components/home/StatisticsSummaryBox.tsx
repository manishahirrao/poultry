// FlockIQ — Statistics Summary Box (v3.2)
// Redesigned: 5-cell animated CountUp dashboard widget → 3-stat editorial proof block
// The 5-cell dashboard template was an AI slop anti-pattern on a marketing page.
// Now: 3 headline proof points in editorial format, linking to /accuracy.

'use client';

import ScrollReveal from '../animations/ScrollReveal';
import { SectionShell } from '@/components/ui/SectionShell';

const proofStats = [
  {
    value: '96.2%',
    label: 'Directional Accuracy',
    context: 'Validated in private beta (Public release coming soon)',
  },
  {
    value: '₹3–5/kg',
    label: 'Average Profit Improvement',
    context: 'Per batch, from better sell timing',
  },
  {
    value: '200+',
    label: 'Farms Already Using FlockIQ',
    context: 'Gorakhpur belt — Deoria, Kushinagar, Maharajganj',
  },
];

export default function StatisticsSummaryBox() {
  return (
    <SectionShell bg="white" ariaLabel="Verified impact statistics">
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 rounded-2xl overflow-hidden border border-neutral-200">
          {proofStats.map((stat, i) => (
            <div
              key={i}
              className="bg-white px-8 py-10 flex flex-col justify-between"
            >
              <p
                className="font-sora font-extrabold text-signal-500 tabular-nums leading-none mb-3"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)' }}
              >
                {stat.value}
              </p>
              <div>
                <p className="font-jakarta font-semibold text-neutral-900 text-[1rem] leading-snug mb-1">
                  {stat.label}
                </p>
                <p className="font-jakarta text-sm text-neutral-500 leading-relaxed">
                  {stat.context}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <div className="mt-6 text-center">
          <a
            href="/accuracy"
            className="inline-flex items-center text-brand-700 font-semibold hover:text-brand-600 transition-colors duration-150 font-jakarta text-sm"
          >
            View Accuracy Validation (Beta) →
          </a>
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
