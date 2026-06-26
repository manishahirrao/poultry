// FlockIQ — Article JSON-LD Schema for Case Studies
// File: apps/web/app/(marketing)/case-studies/[slug]/ArticleSchema.tsx
// Version: v2.0 | June 2026
// Task Reference: CS-001
// Requirements: FR-CASESTUDIES-001

import { type CaseStudy } from '../lib/case-study-types';

interface ArticleSchemaProps {
  study: CaseStudy;
  slug: string;
}

export default function ArticleSchema({ study, slug }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.title,
    description: study.excerpt,
    author: {
      '@type': 'Organization',
      name: study.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flockiq.com/logo.png',
      },
    },
    datePublished: study.publishedAt,
    dateModified: study.updatedAt,
    url: `https://flockiq.com/case-studies/${slug}`,
    keywords: study.keywords.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
