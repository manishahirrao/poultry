// FlockIQ — SectionShell Component
// Replaces the repeated manual section shell across all pre-login pages.
// Every pre-login section wraps children in py-section-vertical + max-w container.
// Previously: each component copy-pasted this structure. Now: one component.
//
// Usage:
//   <SectionShell bg="white">...</SectionShell>
//   <SectionShell bg="tinted" id="accuracy">...</SectionShell>
//   <SectionShell bg="dark" size="sm">...</SectionShell>

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type SectionBg =
  | 'white'        // bg-white — default
  | 'tinted'       // bg-neutral-50 — alternating section rhythm
  | 'brand-tint'   // bg-brand-50/40 — very subtle brand hint
  | 'brand-50'     // bg-brand-50 — used for trust/accuracy sections
  | 'dark'         // bg-brand-700 — full dark green (CTA, hero)
  | 'hero'         // linear-gradient hero — used only for final-CTA
  | 'none';        // no background class applied — caller controls it

type SectionSize =
  | 'xs'   // py-8 sm:py-12
  | 'sm'   // py-12 sm:py-16
  | 'md'   // py-16 sm:py-20
  | 'lg'   // py-section-vertical (clamp 5rem→9rem) — default
  | 'xl'   // py-[clamp(6rem,10vw,11rem)]

type SectionTag = 'section' | 'div' | 'article' | 'aside';

export interface SectionShellProps {
  children: React.ReactNode;
  bg?: SectionBg;
  size?: SectionSize;
  id?: string;
  as?: SectionTag;
  className?: string;
  containerClassName?: string;
  /** Pass aria-label for landmark sections */
  ariaLabel?: string;
}

const bgClasses: Record<SectionBg, string> = {
  white:       'bg-white',
  tinted:      'bg-neutral-50',
  'brand-tint':'bg-brand-50/40',
  'brand-50':  'bg-brand-50',
  dark:        'bg-brand-700 text-white',
  hero:        'bg-brand-900 text-white',
  none:        '',
};

const sizeClasses: Record<SectionSize, string> = {
  xs: 'py-8 sm:py-12',
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20',
  lg: 'py-section-vertical',
  xl: 'py-section-vertical',
};

export const SectionShell = forwardRef<HTMLElement, SectionShellProps>(
  (
    {
      children,
      bg = 'white',
      size = 'lg',
      id,
      as: Tag = 'section',
      className,
      containerClassName,
      ariaLabel,
    },
    ref,
  ) => {
    const Component = Tag as any;
    return (
      <Component
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        className={cn(bgClasses[bg], sizeClasses[size], className)}
      >
        <div
          className={cn(
            'max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8',
            containerClassName,
          )}
        >
          {children}
        </div>
      </Component>
    );
  },
);

SectionShell.displayName = 'SectionShell';

export default SectionShell;
