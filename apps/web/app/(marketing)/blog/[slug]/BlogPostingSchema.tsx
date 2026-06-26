// FlockIQ — BlogPosting JSON-LD Schema
// File: apps/web/app/(marketing)/blog/[slug]/BlogPostingSchema.tsx
// Version: v3.0 | June 2026
// Task Reference: QA-002 (SEO Pre-Launch Checklist)

import type { BlogPostWithContent } from '../lib/blog-types';

interface BlogPostingSchemaProps {
  post: BlogPostWithContent;
  slug: string;
}

export default function BlogPostingSchema({ post, slug }: BlogPostingSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titleEn || post.title,
    description: post.excerptEn || post.excerpt,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flockiq.com/logo.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `https://flockiq.com/blog/${slug}`,
    keywords: post.keywords?.join(', '),
    inLanguage: post.language === 'hi' ? 'hi-IN' : 'en-IN',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
