// FlockIQ — LocalBusiness Schema for Kushinagar
// File: apps/web/app/(marketing)/kushinagar/LocalBusinessSchema.tsx
// Version: v1.0 | May 2026
// Task Reference: C-03a

interface LocalBusinessSchemaProps {
  districtName: string;
}

export default function LocalBusinessSchema({ districtName }: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'FlockIQ',
    description: `AI-powered broiler price prediction service for ${districtName} poultry farmers`,
    url: 'https://FlockIQ.ai',
    areaServed: [districtName],
    priceRange: '₹2,000 - ₹8,000/month',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
