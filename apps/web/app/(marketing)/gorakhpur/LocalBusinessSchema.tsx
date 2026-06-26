// FlockIQ — LocalBusiness JSON-LD Schema
// File: apps/web/app/(marketing)/gorakhpur/LocalBusinessSchema.tsx
// Version: v1.0 | May 2026
// Task Reference: C-03
// Requirements: FR-GORAKHPUR-001

export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'FlockIQ',
    description: 'AI-powered broiler price prediction service for Gorakhpur poultry farmers',
    url: 'https://FlockIQ.ai',
    telephone: '+91XXXXXXXXXX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gorakhpur',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.7483,
      longitude: 83.3725,
    },
    areaServed: [
      'Gorakhpur',
      'Deoria',
      'Kushinagar',
      'Basti',
      'Maharajganj',
    ],
    priceRange: '₹2,000 - ₹8,000/month',
    openingHours: 'Mo-Su 00:00-23:59',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
