// FlockIQ — Scroll Progress Indicator Component
// File: apps/web/components/ui/ScrollProgress.tsx
// Version: v1.0 | May 2026
// Task Reference: F-10
// Requirements: FR-SEO-004

'use client';

import { useEffect, useState, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: string;
}

export default function ScrollProgress({
  className,
  color = 'bg-brandOrange700',
  height = 'h-1',
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);
  const [supportsScrollTimeline, setSupportsScrollTimeline] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if browser supports CSS scroll-driven animations
    const supports = CSS.supports('animation-timeline: scroll()');
    setSupportsScrollTimeline(supports);

    // Fallback: JS-based scroll event listener for Firefox and older browsers
    if (!supports) {
      const handleScroll = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progressPercent = (scrolled / documentHeight) * 100;
        setProgress(Math.min(100, Math.max(0, progressPercent)));
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call

      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // If browser supports CSS scroll-driven animations, use CSS-only approach
  if (supportsScrollTimeline) {
    return (
      <div
        className={cn('fixed top-0 left-0 right-0 z-50', className)}
        style={{ height: height === 'h-1' ? '4px' : height }}
      >
        <style jsx>{`
          @supports (animation-timeline: scroll()) {
            .scroll-progress-bar {
              width: 0%;
              animation: scroll-progress linear;
              animation-timeline: scroll();
              animation-range: 0% 100%;
            }
            
            @keyframes scroll-progress {
              to {
                width: 100%;
              }
            }
          }
        `}</style>
        <div
          ref={progressRef}
          className={cn('scroll-progress-bar', color, height)}
        />
      </div>
    );
  }

  // Fallback: JS-based progress bar
  return (
    <div
      className={cn('fixed top-0 left-0 right-0 z-50 bg-neutral100', className)}
      style={{ height: height === 'h-1' ? '4px' : height }}
    >
      <div
        ref={progressRef}
        className={cn(color, height, 'transition-all duration-150 ease-out')}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
