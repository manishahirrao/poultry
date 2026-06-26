// FlockIQ — Structured Data Utilities
// File: apps/web/lib/structured-data.ts
// Task Reference: SEO-002 (Phase 5)
// Version: v3.0 | June 2026
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md (FR-SEO-003)

/**
 * Generate Organization Schema
 * Used in root layout for global brand identity
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlockIQ',
    legalName: 'FlockIQ Technologies Pvt. Ltd.',
    url: 'https://flockiq.com',
    logo: 'https://flockiq.com/logo.png',
    description: 'The poultry management platform for integrators and farms globally.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gorakhpur',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['Hindi', 'English', 'Indonesian', 'Vietnamese', 'Thai'],
      contactOption: 'TollFree',
      areaServed: ['IN', 'ID', 'VN', 'TH', 'KE', 'NG', 'BD', 'PK'],
    },
    foundingDate: '2026',
    knowsAbout: [
      'Poultry farm management',
      'Broiler batch tracking',
      'FCR monitoring',
      'WhatsApp automation',
      'Price intelligence',
      'Disease alerts',
      'Farm operations analytics',
    ],
    sameAs: [
      'https://linkedin.com/company/flockiq',
      'https://twitter.com/flockiq',
      'https://youtube.com/@flockiq',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

/**
 * Generate SoftwareApplication Schema
 * Used for feature pages (farm-management, price-intel, whatsapp-log)
 * 
 * @param page - Feature page identifier
 */
export function softwareApplicationSchema(page: 'farm-management' | 'price-intel' | 'whatsapp-log') {
  const descriptions: Record<typeof page, string> = {
    'farm-management': 'Complete poultry farm management — batch lifecycle, FCR, mortality, health, FSSAI traceability. Built for integrators and commercial farms.',
    'price-intel': 'AI-powered broiler price forecasting with 96.2% directional accuracy. 7-day forecast, sell signals, middleman verification. India, Indonesia, Vietnam, Thailand.',
    'whatsapp-log': 'WhatsApp-based daily farm log automation. Farmers reply via WhatsApp — dashboard auto-updates. Zero app install required. Hindi & English supported.',
  };

  const featureLists: Record<typeof page, string[]> = {
    'farm-management': [
      'Batch lifecycle tracking',
      'FCR monitoring vs breed benchmarks',
      'Mortality intelligence',
      'Weight & growth tracking',
      'Health & vaccination scheduler',
      'Full batch P&L tracking',
      'FSSAI traceability reports',
      'Bird lifting & sales management',
      'Medication & withdrawal tracking',
    ],
    'price-intel': [
      '7-day price forecast with confidence bands',
      'Daily SELL/HOLD/WAIT signal',
      'Batch ROI optimizer',
      'Middleman price verification',
      'Historical accuracy dashboard',
      'District-level coverage',
      'Cross-country comparison',
    ],
    'whatsapp-log': [
      'Daily WhatsApp reminders',
      'Natural language parsing',
      'Auto FCR calculation',
      'Hindi & English support',
      'Zero app for farmers',
      'Instant dashboard updates',
      'Escalation alerts',
      'Compliance tracking',
    ],
  };

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
      description: 'Starting at ₹2,000/month',
      availability: 'https://schema.org/InStock',
    },
    description: descriptions[page],
    featureList: featureLists[page],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '500',
      bestRating: '5',
      worstRating: '1',
    },
    screenshot: `https://flockiq.com/screenshots/${page}.png`,
    downloadUrl: 'https://flockiq.com/download',
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      url: 'https://flockiq.com',
    },
  };
}

/**
 * Generate HowTo Schema
 * Used for WhatsApp Log Automation feature page
 * Describes the 3-step WhatsApp workflow
 */
export function howToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How FlockIQ WhatsApp Log Automation Works',
    description: 'Automate daily farm data collection via WhatsApp in 3 steps. Farmers reply with 3 numbers — system parses, validates, and updates dashboard instantly.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'FlockIQ sends a daily reminder',
        text: 'At your configured time (e.g., 6:30 PM), FlockIQ sends a WhatsApp message to each farmer for their active batch. Message is in Hindi or English based on farm preference.',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Farmer replies with 3 numbers',
        text: 'The farmer replies with birds dead, feed kg, and optional weight. Natural language parser understands variations like "2 1250 1680" or "2 deaths, 1250kg feed".',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Data auto-logged and FCR calculated',
        text: 'Within 60 seconds, the reply is parsed, validated, and saved to the batch record. FCR is automatically calculated. Manager sees updated dashboard instantly.',
        position: 3,
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'WhatsApp Business API',
      },
      {
        '@type': 'HowToTool',
        name: 'FlockIQ NLP Parser',
      },
    ],
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: '0',
    },
    totalTime: 'PT2M',
  };
}

/**
 * Generate WebSite Schema with SearchAction
 * Used in root layout for sitelinks search
 */
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://flockiq.com',
    name: 'FlockIQ',
    description: 'The poultry management platform for integrators and farms globally.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://flockiq.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate FAQPage Schema
 * Used for FAQ pages
 * 
 * @param faqs - Array of FAQ objects with question and answer
 */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
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
 * Generate BreadcrumbList Schema
 * Used for page navigation hierarchy
 * 
 * @param items - Array of breadcrumb items with name and url
 */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
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
 * Generate Article Schema for blog posts and case studies
 * 
 * @param article - Article metadata
 */
export function articleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: 'FlockIQ',
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    url: article.url,
    image: article.image,
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
 * Generate Product Schema for pricing plans
 * 
 * @param plan - Plan metadata
 */
export function productSchema(plan: {
  name: string;
  price: string;
  currency: string;
  description: string;
}) {
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
