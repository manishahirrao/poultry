// FlockIQ — Blog Post Template
// File: apps/web/app/(marketing)/blog/[slug]/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-004
// Requirements: FR-BLOG-001

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import BlogPostingSchema from './BlogPostingSchema';
import BreadcrumbListSchema from './BreadcrumbListSchema';
import { getBlogPostBySlug, getRelatedPosts, getAllBlogPosts } from '../lib/blog-utils';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const title = post.titleEn || post.title;
  const description = post.excerptEn || post.excerpt;

  return {
    title: `${title} | FlockIQ Blog`,
    description,
    keywords: post.keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://flockiq.com/blog/${slug}`,
      languages: {
        'hi-IN': `https://flockiq.com/blog/${slug}?lang=hi`,
        'en-IN': `https://flockiq.com/blog/${slug}?lang=en`,
        'x-default': `https://flockiq.com/blog/${slug}`,
      },
    },
  };
}

// ISR with 1-hour revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug, post.category, 3);

  return (
    <>
      <BlogPostingSchema post={post} slug={slug} />
      <BreadcrumbListSchema post={post} slug={slug} />
      <BlogPostClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
