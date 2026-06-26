'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, Children } from 'react';

interface StaggerGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;   // seconds between children, default 0.08
  initialDelay?: number;   // before first child, default 0
  distance?: number;
  className?: string;
}

const containerVariants = (staggerDelay: number, initialDelay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
});

const childVariants = (distance: number) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] }, // easeOutQuart
  },
});

export function StaggerGroup({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  distance = 16,
  className,
}: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate effective stagger delay based on child count
  const childrenArray = Children.toArray(children as any);
  const effectiveStaggerDelay = shouldReduceMotion 
    ? 0 
    : childrenArray.length > 5 ? 0.04 : staggerDelay;

  // If reduced motion, render children without animation
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants(effectiveStaggerDelay, initialDelay)}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants(distance)}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={childVariants(distance)}>{children}</motion.div>
      }
    </motion.div>
  );
}
