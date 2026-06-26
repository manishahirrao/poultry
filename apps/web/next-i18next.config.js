// FlockIQ — next-i18next Configuration
// File: apps/web/next-i18next.config.js
// Version: v2.0 | June 2026
// Task Reference: T-INFRA-003
// Purpose: Configure next-i18next for Hindi/English bilingual support

module.exports = {
  i18n: {
    defaultLocale: 'hi',
    locales: ['hi', 'en'],
  },
  defaultNS: 'common',
  localePath: './public/locales',
  localeDetection: true,
  react: {
    useSuspense: false,
  },
};
