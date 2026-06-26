// FlockIQ — Pricing JSON-LD Schema (v3.0)
// File: apps/web/app/(marketing)/pricing/PricingSchema.tsx
// Version: v3.0 | June 2026
// Task Reference: PRICING-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 05
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-PRICING-001

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  target: string;
  features: string[];
  excludedFeatures: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

interface PricingSchemaProps {
  plans: PricingPlan[];
  isAnnual: boolean;
}

export default function PricingSchema({ plans, isAnnual }: PricingSchemaProps) {
  const productSchemas = plans.map((plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: plan.name,
      description: plan.target,
      offers: {
        '@type': 'Offer',
        price: price > 0 ? price : undefined,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billingDuration: isAnnual ? 'P1Y' : 'P1M',
      },
      featureList: plan.features,
    };
  });

  return (
    <>
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
