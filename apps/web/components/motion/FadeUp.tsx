// FlockIQ — FadeUp Animation Wrapper (v3.0)
// File: apps/web/components/motion/FadeUp.tsx
// Version: v3.0 | June 2026
// Task Reference: TOKEN-004
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §1.4

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: boolean;
  once?: boolean;
  devanagari?: boolean;
  className?: string;
}

export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  distance = 24,
  blur = true,
  once = true,
  devanagari = false,
  className,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-8% 0px' });

  // RULE: Devanagari text — opacity only, no transform (avoids jank on Android)
  const hiddenState = devanagari
    ? { opacity: 0 }
    : { opacity: 0, y: distance, filter: blur ? 'blur(4px)' : 'blur(0px)' };

  const visibleState = devanagari
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: 'blur(0px)' };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: hiddenState,
        visible: {
          ...visibleState,
          transition: {
            duration,
            delay,
            ease: [0.16, 1, 0.3, 1], // easeOutExpo
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
