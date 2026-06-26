// FlockIQ — Button Component (v3.0)
// File: apps/web/components/ui/Button.tsx
// Version: v3.0 | June 2026
// Task Reference: TOKEN-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §1.4

'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'whatsapp' | 'cta' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'hero';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
  trailingArrow?: boolean;
  fullWidth?: boolean;
  href?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-700 hover:bg-brand-600 active:bg-brand-800 text-white shadow-[0_4px_16px_rgba(26,92,52,0.25)] hover:shadow-[0_6px_24px_rgba(26,92,52,0.35)]',
  accent: 'bg-signal-500 hover:bg-signal-700 text-white shadow-[0_4px_16px_rgba(232,97,26,0.25)]',
  cta: 'bg-signal-500 hover:bg-signal-700 text-white shadow-[0_4px_16px_rgba(232,97,26,0.25)]',
  secondary: 'bg-transparent hover:bg-brand-50 border-[1.5px] border-brand-700 text-brand-700',
  ghost: 'bg-transparent hover:bg-brand-50/60 text-neutral-700',
  whatsapp: 'bg-[#25D366] hover:bg-[#1DA85A] text-white shadow-[0_4px_16px_rgba(37,211,102,0.30)]',
  outline: 'bg-transparent border-[1.5px] border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-12 px-4 text-sm', // Increased from h-9 to meet 48x48dp touch target minimum
  md: 'h-[52px] px-7 text-[0.9375rem]',
  lg: 'h-14 px-8 text-base',
  hero: 'h-[60px] px-8 text-base font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', pill = false, loading, icon, iconPosition = 'right', className, children, disabled, asChild = false, trailingArrow, fullWidth, href, ...props }, ref) => {
    const buttonContent = (
      <>
        {loading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    );

    const buttonClasses = cn(
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant],
      sizes[size],
      pill ? 'rounded-full' : 'rounded-[10px]',
      fullWidth && 'w-full',
      className,
    );

    if (asChild) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
          className={buttonClasses}
        >
          {buttonContent}
        </motion.div>
      );
    }

    // Omit drag and animation event handlers to avoid type conflicts with framer-motion
    const { onDrag, onDragStart, onDragEnd, onDragEnter, onDragExit, onDragOver, onDrop, onAnimationStart, onAnimationComplete, onUpdate, ...rest } = props as any;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
        className={buttonClasses}
        disabled={disabled || loading}
        {...rest}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
