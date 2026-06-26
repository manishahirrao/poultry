// FlockIQ — MDX Farmer Quote Component
// File: apps/web/components/blog/mdx/FarmerQuote.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-02
// Design Reference: 11_industry_pages_components_master.md §2.1

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface FarmerQuoteProps {
  quote: string;
  quoteHi: string;
  name: string;
  location: string;
  outcome?: string;
  className?: string;
}

export function FarmerQuote({
  quote,
  quoteHi,
  name,
  location,
  outcome,
  className,
}: FarmerQuoteProps) {
  return (
    <blockquote className={cn('bg-brandGreen50 rounded-lg p-6 my-6 ring-1 ring-brandGreen200', className)}>
      <p className="text-lg italic text-neutral-800 font-[Noto_Sans_Devanagari]">"{quoteHi}"</p>
      <p className="text-sm text-neutral-500 mt-2 italic">"{quote}"</p>
      <footer className="mt-3">
        <p className="font-semibold text-neutral-900">{name}</p>
        <p className="text-sm text-neutral-500">{location}</p>
        {outcome && (
          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
            {outcome}
          </span>
        )}
      </footer>
    </blockquote>
  );
}
