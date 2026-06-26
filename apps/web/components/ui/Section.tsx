// FlockIQ — Section Wrapper Component
// File: apps/web/components/ui/Section.tsx
// Version: v1.0 | May 2026
// Task Reference: UI-03
// Design Reference: 11_industry_pages_components_master.md §5.3

import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

type SectionBackground = 'white' | 'tinted' | 'dark' | 'gradient';
type SectionSize = 'sm' | 'md' | 'lg';
type SectionTag = 'section' | 'div' | 'article';

interface SectionProps {
  children: React.ReactNode;
  background?: SectionBackground;
  size?: SectionSize;
  className?: string;
  as?: SectionTag;
  id?: string;
}

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const backgroundClasses: Record<SectionBackground, string> = {
  white: 'bg-white text-neutral-900',
  tinted: 'bg-brandOrange50 text-neutral-900',
  dark: 'bg-neutral-900 text-white',
  gradient: 'bg-gradient-to-b from-white to-brandOrange50 text-neutral-900',
};

const sizeClasses: Record<SectionSize, string> = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20',
  lg: 'py-20 sm:py-24',
};

export const Section = forwardRef<HTMLDivElement, SectionProps>(({
  children,
  background = 'white',
  size = 'md',
  className = '',
  as: Tag = 'section',
  id,
}, ref) => {
  const containerClasses = `
    mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 xl:px-12
  `.trim().replace(/\s+/g, ' ');

  const sectionClasses = `
    ${backgroundClasses[background]} ${sizeClasses[size]} ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Tag ref={ref as any} className={sectionClasses} id={id}>
      <div className={containerClasses}>
        {children}
      </div>
    </Tag>
  );
});

Section.displayName = 'Section';

export default Section;
