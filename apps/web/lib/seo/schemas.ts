// SEO Schema Generators for FlockIQ
// File: apps/web/lib/seo/schemas.ts
// Version: v3.0 | June 2026
// Task Reference: FR-SEO-001, FR-GLOBAL-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

/**
 * Generate Organization Schema
 * Used in root layout
 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlockIQ',
    legalName: 'FlockIQ Technologies Pvt. Ltd.',
    url: 'https://flockiq.com',
    logo: 'https://flockiq.com/logo.png',
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence. 500+ farms across 15 countries.',
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
      contactOption: 'WhatsApp',
      areaServed: ['IN', 'ID', 'VN', 'TH'],
    },
    foundingDate: '2026',
    knowsAbout: [
      'Poultry management platform',
      'Batch tracking',
      'WhatsApp automation',
      'FCR tracking',
      'Price intelligence',
      'Farm management software',
    ],
    sameAs: [
      'https://www.facebook.com/flockiq',
      'https://www.twitter.com/flockiq',
      'https://www.linkedin.com/company/flockiq',
    ],
  };
}

/**
 * Generate WebSite Schema with SearchAction
 * Used in root layout
 */
export function generateWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://flockiq.com',
    name: 'FlockIQ',
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://flockiq.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate FAQ Page Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): Record<string, unknown> {
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

/**
 * Generate HowTo Schema
 * Used for How It Works section
 */
export function generateHowToSchema(steps: Array<{ name: string; text: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How FlockIQ Works',
    description: '3 steps to understand how FlockIQ helps you manage your poultry operation',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      position: index + 1,
    })),
  };
}

/**
 * Generate LocalBusiness Schema for district pages
 */
export function generateLocalBusinessSchema(district: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `FlockIQ — ${district}`,
    description: `Poultry management platform for commercial farmers in ${district} district.`,
    url: `https://flockiq.com/locations/${district.toLowerCase()}`,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: district,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Uttar Pradesh',
        containedInPlace: {
          '@type': 'Country',
          name: 'India',
        },
      },
    },
    knowsAbout: `Poultry management in ${district}, farm tracking ${district}`,
  };
}

/**
 * Generate BlogPosting Schema with BreadcrumbList
 */
export function generateBlogPostingSchema(post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    url: post.url,
    image: post.image,
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flockiq.com/logo.png',
      },
    },
  };
}

/**
 * Generate Product Schema for Pricing
 */
export function generateProductSchema(plan: {
  name: string;
  price: string;
  currency: string;
  description: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.name,
    description: plan.description,
    offers: {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: plan.currency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
    },
  };
}

/**
 * Generate Dataset Schema for /accuracy page
 */
export function generateDatasetSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'FlockIQ Accuracy Dataset',
    description: 'Historical accuracy metrics for FlockIQ price prediction model including 30-day MAPE, directional accuracy, and conformal coverage.',
    url: 'https://flockiq.com/accuracy',
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
    },
  };
}

/**
 * Generate Article Schema for Case Studies
 */
export function generateArticleSchema(caseStudy: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: caseStudy.title,
    description: caseStudy.description,
    author: {
      '@type': 'Person',
      name: caseStudy.author,
    },
    datePublished: caseStudy.datePublished,
    dateModified: caseStudy.dateModified,
    url: caseStudy.url,
    image: caseStudy.image,
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flockiq.com/logo.png',
      },
    },
  };
}

/**
 * Generate Service Schema for /enterprise page
 */
export function generateServiceSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Enterprise Poultry Market Intelligence',
    description: 'API access, historical data, and white-label solutions for integrators, feed companies, and QSR chains.',
    provider: {
      '@type': 'Organization',
      name: 'FlockIQ',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

/**
 * Generate BreadcrumbList Schema
 * Used for blog posts and case studies
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
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

/**
 * Generate SoftwareApplication Schema
 * Used for SaaS product pages
 */
export function generateSoftwareApplicationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlockIQ',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android, iOS, Web',
    offers: {
      '@type': 'Offer',
      price: '2000',
      priceCurrency: 'INR',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '500',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence.',
    featureList: [
      'Batch lifecycle tracking',
      'WhatsApp log automation',
      'FCR tracking',
      'Price intelligence',
      'Health alerts',
      'Farm management',
      'Multi-language support',
    ],
    screenshot: 'https://flockiq.com/screenshots/app-screenshot.png',
    downloadUrl: 'https://flockiq.com/download',
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      url: 'https://flockiq.com',
    },
  };
}
