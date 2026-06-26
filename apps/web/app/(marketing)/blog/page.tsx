// FlockIQ — Blog Index Page
// File: apps/web/app/(marketing)/blog/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-004
// Requirements: FR-BLOG-001

import { Metadata } from 'next';
import BlogIndexClient from './BlogIndexClient';
import { getAllBlogPosts } from './lib/blog-utils';

export const metadata: Metadata = {
  title: 'Blog — Poultry Management Insights | FlockIQ',
  description: 'Expert insights on poultry farm management, WhatsApp automation, price intelligence, and best practices for integrators and farms globally.',
  keywords: ['poultry farming blog', 'broiler price insights', 'poultry management', 'WhatsApp automation', 'FCR optimization'],
  openGraph: {
    title: 'Blog — Poultry Management Insights',
    description: 'Expert insights on poultry farm management, WhatsApp automation, and price intelligence.',
    url: 'https://flockiq.com/blog',
  },
  alternates: {
    canonical: 'https://flockiq.com/blog',
    languages: {
      'hi-IN': 'https://flockiq.com/blog',
      'en-IN': 'https://flockiq.com/blog?lang=en',
      'x-default': 'https://flockiq.com/blog',
    },
  },
};

// ISR with 1-hour revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();
  return <BlogIndexClient posts={posts} />;
}
