// FlockIQ — View Transitions Component
// File: apps/web/components/animations/ViewTransition.tsx
// Version: v1.0 | May 2026
// Trust-Focused Extraordinary: Smooth page transitions using View Transitions API

'use client';

import { useEffect, useRef } from 'react';

interface ViewTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function ViewTransition({ children, className = '' }: ViewTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      return;
    }

    // Add view-transition-name to elements that should morph
    const elements = containerRef.current?.querySelectorAll('[data-view-transition-name]');
    elements?.forEach((el) => {
      (el as HTMLElement).style.viewTransitionName = (el as HTMLElement).dataset.viewTransitionName || '';
    });
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Hook to trigger view transitions programmatically
export function useViewTransition() {
  const triggerTransition = (callback: () => void) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        callback();
      });
    } else {
      // Fallback for browsers without View Transitions API
      callback();
    }
  };

  return { triggerTransition };
}
