// FlockIQ — i18n Hook
// File: apps/web/app/(marketing)/i18n/useTranslation.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-003
// Purpose: Translation hook for marketing pages

import enTranslations from './en.json';
import hiTranslations from './hi.json';
import { useLanguage } from '@/providers/LanguageProvider';

type Language = 'en' | 'hi';

const translations = {
  en: enTranslations,
  hi: hiTranslations,
};

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string | any[] => {
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
  };

  return { t, language };
}
