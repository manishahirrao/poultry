// FlockIQ — i18n Library
// File: apps/web/lib/i18n.ts
// Version: v2.0 | June 2026
// Task Reference: T-INFRA-003
// Purpose: i18n utilities and helpers for bilingual support

import hiTranslations from '../public/locales/hi/common.json';
import enTranslations from '../public/locales/en/common.json';
import { useLanguage } from '@/providers/LanguageProvider';

type Language = 'hi' | 'en';

const translations = {
  hi: hiTranslations,
  en: enTranslations,
};

/**
 * Get translation for a key
 * @param key - Translation key in dot notation (e.g., 'nav.overview')
 * @param language - Language code (default: 'hi')
 * @returns Translated string or key if not found
 */
export function t(key: string, language: Language = 'hi'): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation missing
      value = translations['en'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  return value;
}

/**
 * Translation hook for client components
 * Usage: const { t, language } = useTranslation();
 */
export function useTranslation(overrideLanguage?: Language) {
  const { language: contextLanguage } = useLanguage();
  const currentLanguage = overrideLanguage || contextLanguage;
  
  return {
    t: (key: string) => t(key, currentLanguage),
    language: currentLanguage,
  };
}

/**
 * Language detection utility
 * Priority: Stored preference > Browser locale > Default to 'en'
 */
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  // Check stored preference
  const stored = localStorage.getItem('pp-locale') as Language | null;
  if (stored === 'hi' || stored === 'en') return stored;

  // Check browser locale
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'en') return 'en';
  if (browserLang === 'hi') return 'hi';

  // Default to English
  return 'en';
}

/**
 * Store language preference
 */
export function setLanguagePreference(language: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pp-locale', language);
  }
}

/**
 * Get current locale from URL or default
 */
export function getCurrentLocale(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const path = window.location.pathname;
  if (path.startsWith('/en')) return 'en';
  if (path.startsWith('/hi')) return 'hi';
  
  return detectLanguage();
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Language = 'hi'): string {
  return new Intl.DateTimeFormat(locale === 'hi' ? 'en-IN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Language = 'hi'): string {
  return new Intl.NumberFormat(locale === 'hi' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, locale: Language = 'hi'): string {
  return new Intl.NumberFormat(locale === 'hi' ? 'en-IN' : 'en-US').format(num);
}
