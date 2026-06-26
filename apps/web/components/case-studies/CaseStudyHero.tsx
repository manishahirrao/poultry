// FlockIQ — Case Study Hero Component
// File: apps/web/components/case-studies/CaseStudyHero.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-03
// Design Reference: 11_industry_pages_components_master.md §2.2

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface CaseStudyHeroProps {
  farmerName: string;
  location: string;
  birdCount: string;
  farmType: string;
  financialOutcome: string;
  outcomeType: 'saved' | 'earned';
  coverImageAlt?: string;
  className?: string;
}

export function CaseStudyHero({
  farmerName,
  location,
  birdCount,
  farmType,
  financialOutcome,
  outcomeType,
  coverImageAlt,
  className,
}: CaseStudyHeroProps) {
  return (
    <div className={cn('bg-brandGreen700 text-white rounded-3xl p-8 mb-8', className)}>
      <div className="flex flex-wrap gap-3 mb-4">
        <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
          Case Study
        </span>
        <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
          {location}
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">{farmerName}</h1>
      <div className="flex flex-wrap gap-4 text-white/70 text-sm mb-6">
        <span>📍 {location}</span>
        <span>🐔 {birdCount} birds</span>
        <span>🏢 {farmType}</span>
      </div>
      <div className="bg-white/10 rounded-2xl p-4 inline-block">
        <p className="text-white/70 text-xs mb-1">Financial Outcome</p>
        <p className="text-3xl font-bold font-space-grotesk">{financialOutcome}</p>
        <p className="text-white/70 text-sm">
          {outcomeType === 'saved' ? 'saved in losses' : 'in additional revenue'}
        </p>
      </div>
    </div>
  );
}
