'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion.
 * Returns true if the user has requested reduced motion via system preferences.
 * This hook listens to changes in the prefers-reduced-motion media query.
 * 
 * @returns boolean - true if reduced motion is preferred, false otherwise
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial value
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook that returns motion configuration based on reduced motion preference.
 * Returns an object with:
 * - shouldReduce: boolean indicating if motion should be reduced
 * - transition: appropriate transition config (empty if reduced motion)
 * - animate: appropriate animate value (final state if reduced motion)
 * 
 * @param defaultTransition - default transition config to use when motion is allowed
 * @param defaultAnimate - default animate value to use when motion is allowed
 * @returns object with motion configuration
 */
export function useMotionConfig<T extends Record<string, any>>(
  defaultTransition: T = {} as T,
  defaultAnimate: any = { opacity: 1, y: 0 }
) {
  const shouldReduce = useReducedMotion();

  return {
    shouldReduce,
    transition: shouldReduce ? {} : defaultTransition,
    animate: shouldReduce ? defaultAnimate : undefined,
  };
}
