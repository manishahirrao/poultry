// FlockIQ — Contact Page JSON-LD Schema
// File: apps/web/app/(marketing)/contact/ContactSchema.tsx
// Version: v1.0 | May 2026
// Task Reference: SEO-02
// Requirements: FR-SEO-003

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'FlockIQ',
  description: 'AI-powered broiler price intelligence platform for commercial poultry farmers in Uttar Pradesh.',
  url: 'https://FlockIQ.ai/contact',
  telephone: '+91-XXXXXXXXXX',
  email: 'hello@FlockIQ.ai',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gorakhpur',
    addressRegion: 'Uttar Pradesh',
    addressCountry: 'IN',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '18:00',
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Uttar Pradesh',
  },
  availableLanguage: ['Hindi', 'English'],
};

export default function ContactSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
    />
  );
}
