// FlockIQ — Product JSON-LD Schemas
// File: apps/web/components/seo/PricingSchema.tsx
// Version: v2.0 | May 2026
// Design Reference: 01_prelogin_design_master.md §H-06
// Requirements: FR-SEO-003, FR-PRICING-001

/**
 * Product JSON-LD Schema Component
 * 
 * Generates structured data for pricing plans to help search engines understand
 * the product offerings. Used on the pricing page.
 * 
 * @example
 * ```tsx
 * import PricingSchema from '@/components/seo/PricingSchema';
 * 
 * export default function PricingPage() {
 *   return (
 *     <>
 *       <PricingSchema />
 *       <PricingSection />
 *     </>
 *   );
 * }
 * ```
 */

import Script from 'next/script';

const PRODUCT_SCHEMAS = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'FlockIQ FARM',
    description: 'Live today\'s mandi price, 7-day price forecast, daily sell signal (WhatsApp), batch ROI calculator, middleman check, HPAI/disease alerts, weather warnings, and farm management for individual poultry farmers.',
    image: 'https://flockiq.com/products/FlockIQ-FARM.jpg',
    offers: {
      '@type': 'Offer',
      url: 'https://flockiq.com/pricing',
      priceCurrencyDollar: 'INR',
      price: '5000',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'FlockIQ',
    },
    category: 'Agriculture Software',
    audience: {
      '@type': 'Audience',
      audienceType: 'Commercial Poultry Farmers',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'FlockIQ PRO',
    description: 'Everything in FlockIQ FARM plus 30-day AI forecast (P10/P50/P90), multi-farm dashboard, unlimited farms & batches, optimal sell window analysis, price driver analysis (SHAP), employee management, and API access for integrators and large farms.',
    image: 'https://flockiq.com/products/FlockIQ-PRO.jpg',
    offers: {
      '@type': 'Offer',
      url: 'https://flockiq.com/pricing',
      priceCurrencyDollar: 'INR',
      price: '8000',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'FlockIQ',
    },
    category: 'Agriculture Software',
    audience: {
      '@type': 'Audience',
      audienceType: 'Poultry Integrators and Large Farms',
    },
  },
];

export default function PricingSchema() {
  return (
    <>
      {PRODUCT_SCHEMAS.map((schema, index) => (
        <Script
          key={`product-schema-${index}`}
          id={`product-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
