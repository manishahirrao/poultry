// FlockIQ — Stat Block Component
// File: apps/web/components/home/AccuracySection/StatBlock.tsx
// Version: v1.0 | May 2026
// Task Reference: B-04 (sub-component)

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface StatBlockProps {
  value: number;
  label: string;
  sub: string;
  suffix?: string;
  color?: string;
}

export default function StatBlock({ value, label, sub, suffix = '', color = 'text-white' }: StatBlockProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isVisible) {
      const duration = 1000;
      const steps = 60;
      const stepDuration = duration / steps;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current * 10) / 10);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isVisible, value]);

  return (
    <div ref={ref} className="bg-brand-800 rounded-2xl p-6 text-center border border-brand-600">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className={`text-4xl lg:text-5xl font-sora font-extrabold ${color} mb-2 tabular-nums`}>
          {count}{suffix}
        </div>
        <div className="text-white font-semibold text-sm mb-1">{label}</div>
        <div className="text-white/60 text-xs">{sub}</div>
      </motion.div>
    </div>
  );
}
