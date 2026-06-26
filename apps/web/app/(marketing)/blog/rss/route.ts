// FlockIQ — Blog RSS Feed
// File: apps/web/app/(marketing)/blog/rss/route.ts
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-004
// Requirements: FR-BLOG-001

import { getAllBlogPosts } from '../lib/blog-utils';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const posts = await getAllBlogPosts();
  const siteUrl = 'https://flockiq.com';

  const rssItems = posts.map((post) => {
    const title = post.titleEn || post.title;
    const description = post.excerptEn || post.excerpt;
    const pubDate = new Date(post.publishedAt).toUTCString();
    const url = `${siteUrl}/blog/${post.slug}`;

    return `
      <item>
        <title>${title}</title>
        <description>${description}</description>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${pubDate}</pubDate>
        <category>${post.category}</category>
        <author>${post.author}</author>
      </item>
    `;
  }).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FlockIQ Blog — Poultry Management Insights</title>
    <description>Expert insights on poultry farm management, WhatsApp automation, price intelligence, and best practices for integrators and farms globally.</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
