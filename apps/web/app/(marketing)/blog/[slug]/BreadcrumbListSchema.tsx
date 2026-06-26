// FlockIQ — BreadcrumbList JSON-LD Schema
// File: apps/web/app/(marketing)/blog/[slug]/BreadcrumbListSchema.tsx
// Version: v1.0 | May 2026
// Task Reference: C-05a
// Requirements: FR-SEO-004

interface BreadcrumbListSchemaProps {
  post: any;
  slug: string;
}

export default function BreadcrumbListSchema({ post, slug }: BreadcrumbListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://FlockIQ.ai',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://FlockIQ.ai/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://FlockIQ.ai/blog/${slug}`,
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
