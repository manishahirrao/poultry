// FlockIQ — Stat Metric Block Component
// File: apps/web/components/ui/StatBlock.tsx
// Version: v1.0 | May 2026
// Task Reference: UI-05
// Design Reference: 13_full_platform_tasks_master.md §UI-05

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ColourVariant = 'green' | 'amber' | 'red' | 'neutral';

export interface StatBlockProps {
  value: number | string;
  label: string;
  labelHi?: string;
  prefix?: string;
  suffix?: string;
  sub?: string;
  subHi?: string;
  animate?: boolean;
  colourVariant?: ColourVariant;
  accuracy?: number;
  className?: string;
}

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const bgColours: Record<ColourVariant, string> = {
  green: 'bg-brandOrange50',
  amber: 'bg-amber50',
  red: 'bg-red50',
  neutral: 'bg-neutral50',
};

const textColours: Record<ColourVariant, string> = {
  green: 'text-brandOrange700',
  amber: 'text-amber500',
  red: 'text-red600',
  neutral: 'text-neutral900',
};

// Determine colour variant based on accuracy
const getAccuracyColour = (accuracy: number): ColourVariant => {
  if (accuracy >= 95) return 'green';
  if (accuracy >= 90) return 'amber';
  return 'red';
};

// CountUp animation hook
const useCountUp = (endValue: number, animate: boolean, isVisible: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate || !isVisible) {
      setCount(endValue);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = endValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [animate, isVisible, endValue]);

  return count;
};

export default function StatBlock({
  value,
  label,
  labelHi,
  prefix = '',
  suffix = '',
  sub,
  subHi,
  animate = true,
  colourVariant,
  accuracy,
  className = '',
}: StatBlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Determine final colour variant
  const finalColourVariant: ColourVariant = accuracy !== undefined
    ? getAccuracyColour(accuracy)
    : colourVariant || 'neutral';

  // Parse value for animation
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const displayValue = typeof value === 'string' ? value : undefined;

  const count = useCountUp(numericValue, animate && !prefersReducedMotion, isVisible);
  const finalValue = displayValue || count;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'px-4 py-3 rounded-lg',
        bgColours[finalColourVariant],
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className={cn('text-3xl lg:text-4xl font-space-grotesk font-bold', textColours[finalColourVariant])}>
          {prefix}{finalValue}{suffix}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-1">
          {labelHi || label}
        </div>
        {(sub || subHi) && (
          <div className="text-sm text-neutral-600 mt-0.5">
            {subHi || sub}
          </div>
        )}
      </motion.div>
    </div>
  );
}
