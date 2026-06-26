// PoultryPulse AI — i18n Initialization for Mobile
// File: apps/mobile/src/lib/i18n.ts
// Version: v1.0 | May 2026
// Design Reference: UI/UX v1.0 §1.1, TRD v1.0 §4

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

// Import translation files from @poultrypulse/i18n package
import hiTranslations from '@poultrypulse/i18n/src/locales/hi.json';
import enTranslations from '@poultrypulse/i18n/src/locales/en.json';
import bhoTranslations from '@poultrypulse/i18n/src/locales/bho.json';

/**
 * Get device language
 * Priority: Stored preference > Device locale > Default to 'en' (English)
 */
const getDeviceLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem('preferredLanguage');
    if (storedLanguage && (storedLanguage === 'hi' || storedLanguage === 'en' || storedLanguage === 'bho')) {
      return storedLanguage;
    }
  } catch (error) {
    console.error('Error reading stored language:', error);
  }

  // Get device locale - prioritize English as default
  const deviceLocale = getLocales()[0]?.languageCode || 'en';
  if (deviceLocale === 'en') {
    return 'en'; // Prioritize English
  }
  if (deviceLocale === 'hi' || deviceLocale === 'bho') {
    return deviceLocale;
  }

  return 'en'; // Default to English for all new users
};

/**
 * Initialize i18next for mobile
 */
export const initializeI18n = async (): Promise<void> => {
  const initialLanguage = await getDeviceLanguage();

  const resources = {
    hi: {
      translation: hiTranslations,
    },
    en: {
      translation: enTranslations,
    },
    bho: {
      translation: bhoTranslations,
    },
  };

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en', // Fallback to English
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    ns: ['common', 'forecast', 'sell_signal', 'alerts', 'calculator', 'onboarding', 'errors', 'subscription'],
    defaultNS: 'common',
  });
};

/**
 * Change language and store preference
 */
export const changeLanguage = async (language: 'hi' | 'en' | 'bho') => {
  await i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem('preferredLanguage', language);
  } catch (error) {
    console.error('Error storing language preference:', error);
  }
};

export { i18n };
