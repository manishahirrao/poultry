// FlockIQ — Language Context Provider
// File: apps/web/providers/LanguageProvider.tsx
// Version: v1.0 | May 2026
// Task Reference: UI-06
// Design Reference: 13_full_platform_tasks_master.md §UI-06

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import enDict from '../locales/en.json';
import hiDict from '../locales/hi.json';

type Language = 'hi' | 'en';
type Dictionary = typeof enDict;

const dictionaries: Record<Language, Dictionary> = {
  en: enDict,
  hi: hiDict,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage first
    const storedLang = localStorage.getItem('pp-locale') as Language | null;
    if (storedLang && (storedLang === 'hi' || storedLang === 'en')) {
      setLanguageState(storedLang);
    } else {
      // Default to English for new users
      setLanguageState('en');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pp-locale', lang);
    // Set cookie for SSR hydration with proper attributes
    document.cookie = `pp-locale=${lang}; SameSite=Lax; Path=/; Max-Age=31536000`;
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  // Update HTML lang attribute on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  // Translation function: supports dot.notation.keys
  const t = useCallback((keyPath: string, variables?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let value: any = dictionaries[language];
    
    for (const key of keys) {
      if (value === undefined) break;
      value = value[key];
    }
    
    // Fallback to English if key is missing in current language
    if (value === undefined && language !== 'en') {
      let fallbackValue: any = dictionaries['en'];
      for (const key of keys) {
        if (fallbackValue === undefined) break;
        fallbackValue = fallbackValue[key];
      }
      value = fallbackValue;
    }

    if (value === undefined) {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath;
    }

    let translatedStr = String(value);

    // Replace variables e.g., "Hello {{name}}" -> "Hello Manish"
    if (variables) {
      Object.keys(variables).forEach((varKey) => {
        translatedStr = translatedStr.replace(
          new RegExp(`{{${varKey}}}`, 'g'),
          String(variables[varKey])
        );
      });
    }

    return translatedStr;
  }, [language]);

  // Always provide context to prevent hydration errors
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
