// FlockIQ — Organization JSON-LD Schema
// File: apps/web/components/seo/OrganizationSchema.tsx
// Version: v3.0 | June 2026
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
// Requirements: FR-SEO-003, FR-GLOBAL-001

/**
 * Organization JSON-LD Schema Component
 * 
 * Provides structured data for FlockIQ organization to help search engines
 * understand the business entity. Should be included in the root layout.
 * 
 * @example
 * ```tsx
 * import OrganizationSchema from '@/components/seo/OrganizationSchema';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <OrganizationSchema />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */

import Script from 'next/script';

const ORGANIZATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FlockIQ',
  legalName: 'FlockIQ Technologies Pvt. Ltd.',
  description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence. 500+ farms across 15 countries.',
  url: 'https://flockiq.com',
  logo: 'https://flockiq.com/logo.png',
  foundingDate: '2026',
  cin: 'U01404UP2026PTC123456',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Gorakhpur',
    addressLocality: 'Gorakhpur',
    addressRegion: 'Uttar Pradesh',
    postalCode: '273001',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer support',
      areaServed: ['IN', 'ID', 'VN', 'TH'],
      availableLanguage: ['Hindi', 'English'],
      contactOption: 'WhatsApp',
    },
    {
      '@type': 'ContactPoint',
      email: 'hello@flockiq.com',
      contactType: 'customer support',
      areaServed: ['IN', 'ID', 'VN', 'TH'],
      availableLanguage: ['Hindi', 'English'],
    },
  ],
  sameAs: [
    // Social profiles - add actual URLs when available
    // 'https://twitter.com/FlockIQ',
    // 'https://linkedin.com/company/flockiq',
    // 'https://facebook.com/FlockIQ',
    // 'https://instagram.com/flockiq',
    // 'https://youtube.com/@FlockIQ',
  ],
  areaServed: [
    {
      '@type': 'Country',
      name: 'India',
    },
    {
      '@type': 'Country',
      name: 'Indonesia',
    },
    {
      '@type': 'Country',
      name: 'Vietnam',
    },
    {
      '@type': 'Country',
      name: 'Thailand',
    },
  ],
  knowsAbout: [
    'Poultry management platform',
    'Batch tracking',
    'WhatsApp automation',
    'FCR tracking',
    'Price intelligence',
    'Farm management software',
    'Integrator software',
    'Poultry ERP',
    'Disease alerts',
    'Feed cost optimization',
  ],
  slogan: 'Smarter Flocks. Smarter Returns.',
};

export default function OrganizationSchema() {
  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(ORGANIZATION_DATA),
      }}
    />
  );
}
