// FlockIQ — Robots.txt Generation
// File: apps/web/app/robots.ts
// Version: v3.0 | June 2026
// Task Reference: SEO-001, TEST-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

import { MetadataRoute } from 'next';

const SITE_URL = 'https://flockiq.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Standard crawlers + all major AI crawlers
        userAgent: [
          '*',
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'Claude-Web',
          'anthropic-ai',
          'Applebot-Extended',
          'Google-Extended', // Gemini training
          'Googlebot',
          'Bingbot',
          'BingPreview',
          'DuckDuckBot',
          'FacebookBot',
          'LinkedInBot',
          'Twitterbot',
        ],
        allow: [
          '/',
          // Core marketing pages (from Website Requirements v1.0)
          '/features',
          '/pricing',
          '/accuracy',
          // Solutions pages
          '/solutions/commercial-farms',
          '/solutions/integrators',
          '/solutions/feed-companies',
          '/solutions/enterprise',
          // Additional marketing pages
          '/farm-intelligence',
          '/developers',
          '/compliance',
          '/about',
          '/demo',
          '/login',
          // District pages (legacy)
          '/gorakhpur',
          '/deoria',
          '/kushinagar',
          '/basti',
          '/maharajganj',
          // Content pages
          '/case-studies',
          '/blog',
          '/faq',
          '/enterprise',
          '/press',
          '/contact',
          '/refer',
          '/try-whatsapp',
          '/api/og', // Dynamic OG images
          // Programmatic SEO hub pages
          '/locations',
          '/comparisons',
          '/glossary',
          '/templates',
          '/directory',
        ],
        disallow: [
          '/dashboard/',
          '/api/', // Except /api/og above
          '/admin/',
          '/onboarding/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
