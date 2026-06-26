// FlockIQ — Badge / Pill Component (v3.0)
// File: apps/web/components/ui/badge.tsx
// Version: v3.0 | June 2026
// Task Reference: TOKEN-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §1.4

import { cn } from '@/lib/utils';

type BadgeVariant = 'brand' | 'orange' | 'success' | 'warning' | 'error' | 'grey' | 'whatsapp' | 'glass';

const variants: Record<BadgeVariant, string> = {
  brand:    'bg-brand-50 text-brand-700 border border-brand-100',
  orange:   'bg-signal-light text-signal-700 border border-signal-300',
  success:  'bg-green-50 text-green-700',
  warning:  'bg-amber-50 text-amber-700',
  error:    'bg-red-50 text-red-600',
  grey:     'bg-neutral-100 text-neutral-600',
  whatsapp: 'bg-[#ECF8F1] text-[#075E54]',
  glass:    'bg-white/10 text-white border border-white/15',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ variant = 'brand', size = 'md', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export default Badge;
