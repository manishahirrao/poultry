// FlockIQ — MDX Article Stat Block Component
// File: apps/web/components/blog/mdx/ArticleStatBlock.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-02
// Design Reference: 11_industry_pages_components_master.md §2.1

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ArticleStatBlockProps {
  value: string;
  label: string;
  source?: string;
  sourceUrl?: string;
  className?: string;
}

export function ArticleStatBlock({
  value,
  label,
  source,
  sourceUrl,
  className,
}: ArticleStatBlockProps) {
  return (
    <div className={cn('bg-brandGreen50 border border-brandGreen200 rounded-xl p-6 my-6 text-center', className)}>
      <p className="text-4xl font-bold text-brandGreen700 font-space-grotesk">{value}</p>
      <p className="text-neutral-700 font-semibold mt-1">{label}</p>
      {source && (
        <p className="text-xs text-neutral-400 mt-2">
          Source:{' '}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              className="underline hover:text-brandGreen700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {source}
            </a>
          ) : (
            source
          )}
        </p>
      )}
    </div>
  );
}
