// FlockIQ — Organization JSON-LD Schema
// File: apps/web/app/(marketing)/about/OrganizationSchema.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-001
// Requirements: FR-GLOBAL-001 (brand migration)

export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlockIQ',
    description: 'The poultry management platform for integrators and farms globally. Complete batch tracking, WhatsApp log automation, price intelligence, and operational command centre.',
    url: 'https://flockiq.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://flockiq.com/logo.png',
    },
    foundingDate: '2025',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gorakhpur',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91XXXXXXXXXX',
      contactType: 'customer service',
      areaServed: ['IN', 'ID', 'VN', 'TH'],
      availableLanguage: ['Hindi', 'English'],
    },
    sameAs: [
      'https://twitter.com/flockiq',
      'https://linkedin.com/company/flockiq',
      'https://www.facebook.com/flockiq',
    ],
    knowsAbout: [
      'Poultry management platform',
      'Batch tracking',
      'WhatsApp log automation',
      'Price intelligence',
      'FCR tracking',
      'Mortality monitoring',
      'Farm operations',
      'Integrator analytics',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
