import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import hiTranslations from './locales/hi.json';
import enTranslations from './locales/en.json';
import bhoTranslations from './locales/bho.json';

// Language detection priority:
// 1. Device locale (from browser or device)
// 2. Stored preference (from localStorage or AsyncStorage)
// 3. Default to 'en' (English)

const getDeviceLanguage = (): string => {
  if (typeof window !== 'undefined' && navigator.language) {
    const browserLanguage = navigator.language.split('-')[0];
    // Map device language codes to our supported languages
    // English is prioritized as default for all users
    if (browserLanguage === 'en') return 'en';
    if (browserLanguage === 'hi') return 'hi';
    if (browserLanguage === 'bho') return 'bho';
  }
  return 'en'; // Default to English
};

const getStoredLanguage = async (): Promise<string | null> => {
  // In a real implementation, this would read from localStorage (web) or AsyncStorage (mobile)
  // For now, we'll return null to fall back to device locale
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('preferredLanguage');
    }
  } catch (error) {
    // localStorage might not be available in all environments
  }
  return null;
};

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

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback to English if translation missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for lazy loading
    },
    // Lazy loading configuration
    ns: ['common', 'forecast', 'sell_signal', 'alerts', 'calculator', 'onboarding', 'errors', 'subscription'],
    defaultNS: 'common',
  });

// Function to change language and store preference
export const changeLanguage = async (language: 'hi' | 'en' | 'bho') => {
  await i18n.changeLanguage(language);
  // In a real implementation, store the preference in localStorage (web) or AsyncStorage (mobile)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('preferredLanguage', language);
    }
  } catch (error) {
    // localStorage might not be available in all environments
  }
};

// Function to detect and set initial language
export const initializeLanguage = async () => {
  const storedLanguage = await getStoredLanguage();
  if (storedLanguage && (storedLanguage === 'hi' || storedLanguage === 'en' || storedLanguage === 'bho')) {
    await i18n.changeLanguage(storedLanguage);
  } else {
    // Always default to English for new users
    const deviceLanguage = getDeviceLanguage();
    // Only use device language if it's explicitly English, otherwise default to English
    if (deviceLanguage === 'en') {
      await i18n.changeLanguage('en');
    } else {
      await i18n.changeLanguage('en'); // Default to English for all new users
    }
  }
};

// Export i18n instance and hook
export { i18n };
export { useTranslation } from 'react-i18next';

// Export language detection utility
export { getDeviceLanguage };
