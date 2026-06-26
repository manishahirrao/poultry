// FlockIQ — Schema Markup Utilities
// File: apps/web/lib/seo/schema-utils.ts
// Version: v1.0 | May 2026

// Organization Schema for root layout
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlockIQ',
    legalName: 'FlockIQ Technologies Pvt. Ltd.',
    url: 'https://flockiq.com',
    logo: 'https://flockiq.com/logo.png',
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp automation, price intelligence.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gorakhpur',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['Hindi', 'English'],
      contactOption: 'TollFree',
      areaServed: 'IN',
    },
    foundingDate: '2026',
    knowsAbout: [
      'Poultry price forecasting',
      'Broiler market intelligence',
      'Agricultural AI',
      'Machine learning for commodities',
    ],
  };
}

// LocalBusiness Schema for location pages
export function generateLocalBusinessSchema(
  locationName: string,
  locationNameHi: string,
  state: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `FlockIQ — ${locationName}`,
    description: `AI-powered poultry management for integrators and farms in ${locationName} district.`,
    url: `https://flockiq.com/locations/${locationName.toLowerCase().replace(/\s+/g, '-')}`,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: locationName,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: state,
        containedInPlace: {
          '@type': 'Country',
          name: 'India',
        },
      },
    },
    knowsAbout: `${locationNameHi} में मुर्गी भाव, broiler price prediction ${locationName}`,
  };
}

// FAQPage Schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// HowTo Schema for "How It Works" pages — accepts steps array or uses defaults
export function generateHowToSchema(steps?: { name: string; text: string }[]) {
  const howToSteps = steps || [
    { name: 'Connect Your Farms', text: 'Add your farms and batches in under 5 minutes. FlockIQ integrates with your existing workflow.' },
    { name: 'Automated Data Collection', text: 'Farmers submit daily data via WhatsApp — no app needed for them. FlockIQ parses and validates automatically.' },
    { name: 'Actionable Insights', text: 'Get daily FCR alerts, mortality tracking, price intelligence, and health warnings — all in one dashboard.' },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How FlockIQ Works',
    description: 'Three steps to complete visibility over every batch — FCR, mortality, weight, health.',
    step: howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      name: s.name,
      text: s.text,
      position: i + 1,
    })),
  };
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Definition Schema for glossary pages
export function generateDefinitionSchema(term: string, definition: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term,
    description: definition,
    inDefinedTermSet: 'Poultry Farming Glossary',
  };
}

// SoftwareApplication Schema for templates
export function generateSoftwareApplicationSchema(
  name: string,
  description: string,
  downloadUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name,
    description: description,
    downloadUrl: downloadUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };
}

// ItemList Schema for directory pages
export function generateItemListSchema(items: { name: string; url: string; description: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}
