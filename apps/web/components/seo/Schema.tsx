// FlockIQ — Schema Markup Component
// File: apps/web/components/seo/Schema.tsx
// Version: v1.0 | May 2026

import Script from 'next/script';

interface SchemaProps {
  schema: Record<string, any>;
}

export default function Schema({ schema }: SchemaProps) {
  return (
    <Script
      id="schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
