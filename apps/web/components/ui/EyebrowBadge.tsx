// FlockIQ — Eyebrow Badge Component (v3.0)
// File: apps/web/components/ui/EyebrowBadge.tsx
// Updated: June 2026 — migrated from legacy brandOrange tokens to brand-* system
// Task Reference: UI-04, EXTRACT-001
//
// Usage:
//   <EyebrowBadge>THE PROBLEM</EyebrowBadge>
//   <EyebrowBadge variant="dark">VERIFIED ACCURACY</EyebrowBadge>
//   <EyebrowBadge variant="signal" icon={<AlertCircle size={12} />}>DISEASE ALERT</EyebrowBadge>

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type EyebrowBadgeVariant =
  | 'default'   // brand-50 bg, brand-700 text — default for light sections
  | 'dark'      // white/15 bg, white/90 text — for dark (brand-700) sections
  | 'signal'    // signal-light bg, signal-700 text — for urgency/alert contexts
  | 'neutral'   // neutral-100 bg, neutral-600 text — de-emphasized
  | 'white';    // white bg, brand-700 text — on tinted/medium-bg sections

export interface EyebrowBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: React.ReactNode;
  variant?: EyebrowBadgeVariant;
  icon?: React.ReactNode;
}

const variantClasses: Record<EyebrowBadgeVariant, string> = {
  default:  'bg-brand-50 text-brand-700 border border-brand-100',
  dark:     'bg-white/15 text-white/90',
  signal:   'bg-signal-light text-signal-700',
  neutral:  'bg-neutral-100 text-neutral-600',
  white:    'bg-white text-brand-700 shadow-sm',
};

export default function EyebrowBadge({
  children,
  variant = 'default',
  icon,
  className,
  ...props
}: EyebrowBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full',
        'text-[11px] font-bold uppercase tracking-[0.16em] whitespace-nowrap leading-none',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
