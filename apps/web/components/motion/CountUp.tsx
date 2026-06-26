// FlockIQ — CountUp Stat Component (v3.0)
// File: apps/web/components/motion/CountUp.tsx
// Version: v3.0 | June 2026
// Task Reference: TOKEN-005
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §1.4

'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({ end, duration = 1200, prefix = '', suffix = '', decimals = 0, className }: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!inView) return;

    // prefers-reduced-motion: skip to end value instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setValue(parseFloat((easeOutExpo(progress) * end).toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [inView, end, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString('en-IN')}{suffix}
    </span>
  );
}
