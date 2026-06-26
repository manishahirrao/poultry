// FlockIQ — SectionHeader Component
// The single most-duplicated pattern across all pre-login pages.
// Every marketing section has an eyebrow tag + heading + optional body.
// Previously: ~10 different inline implementations. Now: one component.
//
// Usage:
//   <SectionHeader eyebrow="THE PROBLEM" heading="Most Farms Run on Gut Feel" />
//   <SectionHeader eyebrow="Accuracy" heading="95%+ Verified" body="On 6-month holdout data..." align="center" />
//   <SectionHeader eyebrow="Trust" heading="We're Transparent" dark />
//   <SectionHeader eyebrow="..." heading="..." headingHi="हिंदी शीर्षक" bodyHi="हिंदी विवरण" />

import { cn } from '@/lib/utils';
import { FadeUp } from '@/components/motion/FadeUp';

export interface SectionHeaderProps {
  /** Short uppercase label above the heading — renders as a pill tag */
  eyebrow?: string;
  /** Primary English heading */
  heading: string;
  /** Hindi/Devanagari heading — shown below English heading, smaller */
  headingHi?: string;
  /** Supporting paragraph in English */
  body?: string;
  /** Hindi supporting paragraph */
  bodyHi?: string;
  /** Text alignment — defaults to left (editorial), set to center for symmetrical layouts */
  align?: 'left' | 'center';
  /** Use on dark (green/brand-700) section backgrounds */
  dark?: boolean;
  /** Extra class for the wrapper div */
  className?: string;
  /** Controls bottom margin. Defaults to mb-16 */
  mb?: 'sm' | 'md' | 'lg';
  /** If false, disables the FadeUp entrance animation. Defaults to true */
  animate?: boolean;
}

const mbClasses = {
  sm: 'mb-8',
  md: 'mb-12',
  lg: 'mb-16',
} as const;

export function SectionHeader({
  eyebrow,
  heading,
  headingHi,
  body,
  bodyHi,
  align = 'left',
  dark = false,
  className,
  mb = 'lg',
  animate = true,
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  const content = (
    <div
      className={cn(
        mbClasses[mb],
        isCenter ? 'text-center' : '',
        className,
      )}
    >
      {/* Eyebrow tag */}
      {eyebrow && (
        <span
          className={cn(
            'inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] mb-5',
            dark
              ? 'bg-white/15 text-white/90'
              : 'bg-brand-50 text-brand-700 border border-brand-100',
          )}
        >
          {eyebrow}
        </span>
      )}

      {/* Main heading */}
      <h2
        className={cn(
          'font-sora font-bold leading-[1.1] tracking-[-0.025em] mb-4',
          // Fluid size — matches the scale from FlockIQTypography.h1
          'text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)]',
          dark ? 'text-white' : 'text-neutral-900',
        )}
      >
        {heading}
      </h2>

      {/* Hindi heading — only shown when provided */}
      {headingHi && (
        <p
          className={cn(
            'font-devanagari font-bold leading-[1.4] mb-4',
            'text-[clamp(1.125rem,1.5vw+0.375rem,1.5rem)]',
            dark ? 'text-white/85' : 'text-neutral-700',
          )}
        >
          {headingHi}
        </p>
      )}

      {/* English body copy */}
      {body && (
        <p
          className={cn(
            'font-jakarta font-normal leading-[1.7]',
            'text-[clamp(1rem,0.5vw+0.875rem,1.125rem)]',
            isCenter ? 'mx-auto' : '',
            dark ? 'text-white/75' : 'text-neutral-600',
            'max-w-[65ch]',
          )}
        >
          {body}
        </p>
      )}

      {/* Hindi body copy */}
      {bodyHi && (
        <p
          className={cn(
            'font-devanagari font-normal leading-[1.7] mt-3',
            'text-[clamp(0.9375rem,0.75vw+0.75rem,1.125rem)]',
            isCenter ? 'mx-auto' : '',
            dark ? 'text-white/65' : 'text-neutral-600',
            'max-w-[65ch]',
          )}
        >
          {bodyHi}
        </p>
      )}
    </div>
  );

  if (!animate) return content;

  return <FadeUp>{content}</FadeUp>;
}

export default SectionHeader;
