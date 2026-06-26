// FlockIQ — MDX Callout Box Component
// File: apps/web/components/blog/mdx/CalloutBox.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-02
// Design Reference: 11_industry_pages_components_master.md §2.1

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface CalloutBoxProps {
  type: 'info' | 'warning' | 'source' | 'tip' | 'result';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const STYLES = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚠️',
  },
  source: {
    bg: 'bg-neutral-50',
    border: 'border-neutral-200',
    icon: '📋',
  },
  tip: {
    bg: 'bg-brandGreen50',
    border: 'border-brandGreen200',
    icon: '💡',
  },
  result: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: '✅',
  },
};

export function CalloutBox({
  type,
  title,
  children,
  className,
}: CalloutBoxProps) {
  const style = STYLES[type];

  return (
    <div className={cn(style.bg, style.border, 'border rounded-xl p-4 my-6', className)}>
      {title && (
        <p className="font-semibold text-sm mb-2">
          {style.icon} {title}
        </p>
      )}
      <div className="text-sm text-neutral-700">{children}</div>
    </div>
  );
}
