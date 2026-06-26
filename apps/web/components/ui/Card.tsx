// FlockIQ — Card Component
// File: apps/web/components/ui/Card.tsx
// Version: v1.0 | June 2026 — created to resolve missing module
//
// Usage:
//   <Card className="p-6">...</Card>
//   <Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>...</CardContent></Card>

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional hover style — adds lift shadow and slight translate on hover */
  hover?: boolean;
  /** Optional highlighted style — adds brand ring for featured/selected state */
  highlighted?: boolean;
  /** Optional variant style */
  variant?: 'default' | 'elevated' | 'ghost' | string;
  /** Optional padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, highlighted, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white border border-neutral-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        hover && 'transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5',
        highlighted && 'border-brand-400 ring-2 ring-brand-400/30',
        padding === 'lg' && 'p-8',
        padding === 'md' && 'p-6',
        padding === 'sm' && 'p-4',
        padding === 'none' && 'p-0',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

// ─── CardHeader ───────────────────────────────────────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

// ─── CardTitle ────────────────────────────────────────────────────────────────

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-jakarta font-semibold text-neutral-900 text-lg leading-snug tracking-[-0.01em]', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

// ─── CardContent ──────────────────────────────────────────────────────────────

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  ),
);
CardContent.displayName = 'CardContent';

// ─── CardFooter ───────────────────────────────────────────────────────────────

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export default Card;
