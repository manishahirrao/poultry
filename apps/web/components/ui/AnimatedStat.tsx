// FlockIQ — Animated Stat Component
// File: apps/web/components/ui/AnimatedStat.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-005
// Requirements: Design Spec §3.4, GWEB-005
// Animated number display with Framer Motion

'use client';

import { motion, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedStat({
  value,
  suffix = '',
  prefix = '',
  decimals = 1,
  duration = 1.5,
  className = '',
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      let startTime: number;
      let startValue = 0;
      
      const animateValue = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const currentValue = startValue + (value - startValue) * easeProgress;
        setDisplayValue(currentValue.toFixed(decimals));
        
        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };
      
      requestAnimationFrame(animateValue);
    }
  }, [value, duration, decimals]);

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
