// FlockIQ — Enterprise JSON-LD Schema
// File: apps/web/app/(marketing)/enterprise/ServiceSchema.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-005
// Requirements: FR-ENTERPRISE-001

export default function ServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlockIQ Enterprise',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Enterprise solutions for integrators, QSR chains, insurers, feed companies, and data platforms. REST API, historical data, white-label options, and custom district coverage.',
    provider: {
      '@type': 'Organization',
      name: 'FlockIQ Technologies Pvt. Ltd.',
      url: 'https://flockiq.com',
    },
    offers: {
      '@type': 'Offer',
      price: 'Custom',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'REST API Access',
      'Historical Data (12 months)',
      'Custom District Coverage',
      'Dedicated Account Manager',
      'White-label Solutions',
      'Multi-farm Dashboard',
      'WhatsApp Log Automation',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: ['Integrators', 'QSR Chains', 'Insurers', 'Feed Companies', 'Data Platforms'],
    },
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
