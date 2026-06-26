// FlockIQ — BlogPosting JSON-LD Schema
// File: apps/web/components/seo/BlogPostingSchema.tsx
// Version: v2.0 | May 2026
// Design Reference: 01_prelogin_design_master.md
// Requirements: FR-SEO-003, FR-BLOG-001

/**
 * BlogPosting JSON-LD Schema Component
 * 
 * Generates structured data for blog posts to help search engines understand
 * the content, author, and publication details. Used on blog post detail pages.
 * 
 * @example
 * ```tsx
 * import BlogPostingSchema from '@/components/seo/BlogPostingSchema';
 * 
 * const blogPost = {
 *   title: 'How to Maximize Your Poultry Farm Profits',
 *   description: 'Learn the strategies top farmers use...',
 *   author: { name: 'Rajesh Kumar', url: '/authors/rajesh-kumar' },
 *   datePublished: '2026-05-15',
 *   dateModified: '2026-05-15',
 *   image: 'https://flockiq.com/blog/profits-og.jpg',
 *   url: 'https://flockiq.com/blog/maximize-profits',
 * };
 * 
 * export default function BlogPostPage() {
 *   return (
 *     <>
 *       <BlogPostingSchema {...blogPost} />
 *       <BlogPostContent {...blogPost} />
 *     </>
 *   );
 * }
 * ```
 */

import Script from 'next/script';

export interface Author {
  name: string;
  url?: string;
  image?: string;
}

export interface BlogPostingSchemaProps {
  title: string;
  description: string;
  author: Author;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
  keywords?: string[];
  category?: string;
}

export default function BlogPostingSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
  keywords = [],
  category,
}: BlogPostingSchemaProps) {
  const blogPostingData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
      image: author.image,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlockIQ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flockiq.com/logo.png',
      },
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords.join(', '),
    articleSection: category,
    inLanguage: 'hi-IN',
  };

  return (
    <Script
      id="blog-posting-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(blogPostingData),
      }}
    />
  );
}
