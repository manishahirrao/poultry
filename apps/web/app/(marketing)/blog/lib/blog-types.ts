// FlockIQ — Blog Content Types
// File: apps/web/app/(marketing)/blog/lib/blog-types.ts
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-004
// Requirements: FR-BLOG-001

export interface BlogPost {
  slug: string;
  title: string;
  titleEn?: string;
  titleHi?: string;
  excerpt: string;
  excerptEn?: string;
  excerptHi?: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  authorCredentials?: string;
  readTime: string;
  language: 'en' | 'hi' | 'both';
  keywords: string[];
  featured?: boolean;
  whatsappShareText?: string;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

// Blog categories as per CONTENT-PAGE-004
export const BLOG_CATEGORIES = [
  { id: 'bhav-vichar', name: 'Bhav Vichar', nameHi: 'भाव विचार' },
  { id: 'kheti-gyan', name: 'Kheti Gyan', nameHi: 'खेती ज्ञान' },
  { id: 'industry', name: 'Industry', nameHi: 'उद्योग' },
  { id: 'product-updates', name: 'Product Updates', nameHi: 'उत्पाद अपडेट' },
];
