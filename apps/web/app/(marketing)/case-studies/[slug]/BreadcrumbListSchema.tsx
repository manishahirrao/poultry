// FlockIQ — BreadcrumbList JSON-LD Schema for Case Studies
// File: apps/web/app/(marketing)/case-studies/[slug]/BreadcrumbListSchema.tsx
// Version: v2.0 | June 2026
// Task Reference: CS-001
// Requirements: FR-CASESTUDIES-001

import { type CaseStudy } from '../lib/case-study-types';

interface BreadcrumbListSchemaProps {
  study: CaseStudy;
  slug: string;
}

export default function BreadcrumbListSchema({ study, slug }: BreadcrumbListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://flockiq.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Case Studies',
        item: 'https://flockiq.com/case-studies',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: study.title,
        item: `https://flockiq.com/case-studies/${slug}`,
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
