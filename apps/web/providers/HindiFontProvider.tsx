// FlockIQ — Hindi Font Provider (Dynamic Loading)
// File: apps/web/providers/HindiFontProvider.tsx
// Version: v3.0 | June 2026
// Task Reference: PERF-002
// PERF-002: Dynamic import for Noto Sans Devanagari when Hindi mode activates

'use client';

import { useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export function HindiFontProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  useEffect(() => {
    // Only load Noto Sans Devanagari when Hindi mode is active
    if (language === 'hi') {
      // Dynamic import of the font to reduce initial bundle size
      import('next/font/google').then((fontModule) => {
        const { Noto_Sans_Devanagari } = fontModule;
        
        // Load the font dynamically
        const notoDevanagari = Noto_Sans_Devanagari({
          subsets: ['devanagari'],
          weight: ['400', '500', '600', '700'],
          display: 'optional',
          variable: '--font-noto-devanagari',
        });

        // Add the font variable to the document
        document.documentElement.classList.add(notoDevanagari.variable);
      });
    }
  }, [language]);

  return <>{children}</>;
}

export default HindiFontProvider;
