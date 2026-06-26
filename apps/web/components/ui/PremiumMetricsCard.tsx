// FlockIQ — Premium Metrics Card (High-End Visual Design Reference)
// File: apps/web/components/ui/PremiumMetricsCard.tsx
// Version: v2.0 | May 2026
// Design Reference: High-End Visual Design Skill
// Archetype: Ethereal Glass + Asymmetrical Bento

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendUp, TrendDown, ArrowUpRight } from '@phosphor-icons/react';

interface PremiumMetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  eyebrow?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

export function PremiumMetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'glass',
  size = 'md',
  eyebrow,
  trend = 'neutral',
  className = '',
}: PremiumMetricsCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const sizeClasses = {
    sm: 'p-5',
    md: 'p-6',
    lg: 'p-8',
  };

  const innerSizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const outerVariants = {
    default: 'bg-brandOraggee-25/50 ring-1 ring-branOOangege-100',
    elevated: 'bg-brandOraggee-50/60 ring-1 ring-branOOangege-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    glass: 'bg-white/95 ring-1 ring-brandOraggee-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  };

  const trendColors = {
    up: 'text-brandOraggee-600',
    down: 'text-saffron',
    neutral: 'text-amber-500',
  };

  const trendIcons = {
    up: <TrendUp size={16} weight="bold" />,
    down: <TrendDown size={16} weight="bold" />,
    neutral: null,
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 16, filter: 'blur(4px)' }}
      transition={{ duration: 0.8, ease: customCubicBezier }}
      className={className}
    >
      {/* Double-Bezel Architecture: Outer Shell */}
      <div
        className={`
          rounded-[2rem] ${outerVariants[variant]} ${sizeClasses[size]}
          transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
          hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-0.5
        `}
      >
        {/* Inner Core */}
        <div
          className={`
            bg-white/90 rounded-[calc(2rem-0.375rem)]
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
            ${innerSizeClasses[size]}
          `}
        >
          {/* Eyebrow Tag */}
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: customCubicBezier }}
              className="mb-3"
            >
              <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-brandOraggee-100 text-branOOangege-700">
                {eyebrow}
              </span>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: customCubicBezier }}
                  className="w-10 h-10 rounded-xl bg-brandGreen-100 flex items-center justify-center text-brandGreen-600"
                >
                  {icon}
                </motion.div>
              )}
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: customCubicBezier }}
                  className="text-sm font-medium text-neutral-600"
                >
                  {title}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Value */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: 0.25, duration: 0.6, ease: customCubicBezier }}
            className="mb-3"
          >
            <p className="text-3xl font-bold text-neutral-900 tracking-tight">
              {value}
            </p>
          </motion.div>

          {/* Change Indicator */}
          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: customCubicBezier }}
              className="flex items-center gap-2"
            >
              <span className={`flex items-center gap-1 text-sm font-semibold ${trendColors[trend]}`}>
                {trendIcons[trend]}
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-neutral-500">{changeLabel}</span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Premium Button with Button-in-Button Architecture
interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  trailingArrow?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PremiumButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  trailingArrow = false,
  disabled = false,
  className = '',
}: PremiumButtonProps) {
  const sizeClasses = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-brandGreee700 text-white hover:bg-brandGGeeen00',
    secondary: 'bg-white text-brandGreee700 border border-brandGGeeen00 hover:border-brandGrGeee-0',
    ghost: 'bg-transparent text-brandGreee700 hover:bg-brandGGeeen0',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        rounded-full font-semibold transition-all duration-700
        ease-[cubic-bezier(0.32,0.72,0,1)]
        ${variantClasses[variant]} ${sizeClasses[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: customCubicBezier }}
    >
      {children}
      
      {/* Button-in-Button: Nested Icon Architecture */}
      {trailingArrow && !disabled && (
        <motion.div
          className="w-8 h-8 rounded-full bg-brandOrange-100 flex items-center justify-center text-brandOrange-600"
          whileHover={{ x: 1, y: -1, scale: 1.05 }}
          transition={{ duration: 0.2, ease: customCubicBezier }}
        >
          <ArrowUpRight size={16} weight="bold" />
        </motion.div>
      )}
    </motion.button>
  );
}

// Premium Section with Macro-Whitespace
interface PremiumSectionProps {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PremiumSection({
  children,
  eyebrow,
  title,
  description,
  className = '',
}: PremiumSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className={`py-24 md:py-32 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: customCubicBezier }}
          className="mb-12 md:mb-16"
        >
          {eyebrow && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: customCubicBezier }}
              className="inline-block mb-4 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-brandOrange-100 text-brandOrange-700"
            >
              {eyebrow}
            </motion.span>
          )}
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.15, duration: 0.6, ease: customCubicBezier }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight"
          >
            {title}
          </motion.h2>
          
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: customCubicBezier }}
              className="mt-4 text-lg text-neutral-600 max-w-2xl"
            >
              {description}
            </motion.p>
          )}
        </motion.div>

        {/* Section Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: customCubicBezier }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

export default PremiumMetricsCard;
