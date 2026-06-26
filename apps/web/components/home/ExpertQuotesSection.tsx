// FlockIQ — Expert Quotes Section
// File: apps/web/components/home/ExpertQuotesSection.tsx
// Version: v1.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: SEO-01

import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

const quotes = [
  {
    name: 'Dr. Rajesh Kumar',
    title: 'Agricultural Economist, UP Agricultural University',
    quote: "FlockIQ's 95%+ directional accuracy on Gorakhpur data is remarkable. This level of precision in broiler price forecasting can significantly reduce timing losses for UP farmers.",
    quoteHi: 'FlockIQ की Gorakhpur डेटा पर 95%+ दिशात्मक सटीकता उल्लेखनीय है। ब्रॉयलर मूल्य भविष्यवाणी में इस स्तर की सटीकता UP किसानों के लिए टाइमिंग नुकसान को काफी कम कर सकती है।',
  },
  {
    name: 'Dr. Sunita Verma',
    title: 'Veterinary Scientist, ICAR — Central Avian Research Institute',
    quote: 'The 48-hour early warning system for HPAI outbreaks is a game-changer. Early detection combined with price intelligence helps farmers make informed decisions during disease scares.',
    quoteHi: 'HPAI प्रकोप के लिए 48-घंटे की प्रारंभिक चेतावनी प्रणाली एक गेम-चेंजर है। प्रारंभिक पहचान और मूल्य बुद्धि किसानों को बीमारी के दौरान सूचित निर्णय लेने में मदद करती है।',
  },
  {
    name: 'Prof. Anil Sharma',
    title: 'Data Science Lead, Agricultural Analytics Lab, IIT Kanpur',
    quote: 'The ensemble approach using LightGBM and Temporal Fusion Transformer is state-of-the-art for time-series forecasting. The 7-day forward visibility with P10/P50/P90 ranges provides actionable uncertainty quantification.',
    quoteHi: 'LightGBM और टेम्पोरल फ्यूजन ट्रांसफॉर्मर का उपयोग करने वाला एनसेंबल दृष्टिकोण टाइम-सीरीज़ भविष्यवाणी के लिए अत्याधुनिक है।',
  },
];

export default function ExpertQuotesSection() {
  return (
    <SectionShell bg="white" ariaLabel="Expert validation">
      <SectionHeader
        eyebrow="EXPERT VALIDATION"
        heading="What Experts Say"
        body="Validated by agricultural economists, veterinary scientists, and data science experts"
        align="center"
      />

      <div className="grid md:grid-cols-3 gap-8">
        {quotes.map((quote, index) => (
          <div
            key={index}
            className="bg-brand-50/60 rounded-2xl p-6 border border-brand-100"
          >
            {/* Decorative quote mark */}
            <svg
              className="w-7 h-7 text-brand-300 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            <blockquote className="font-jakarta text-[0.9375rem] text-neutral-700 mb-4 leading-[1.7]">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>

            <blockquote className="font-devanagari text-[0.875rem] text-neutral-500 mb-5 leading-[1.7]">
              &ldquo;{quote.quoteHi}&rdquo;
            </blockquote>

            <div>
              <p className="font-sora font-bold text-[0.9375rem] text-neutral-900 leading-snug">{quote.name}</p>
              <p className="font-jakarta text-xs text-neutral-500 mt-1 leading-snug">{quote.title}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
