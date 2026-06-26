// FlockIQ — Content Utilities
// File: apps/web/lib/content/index.ts
// Version: v1.0 | May 2026
// Purpose: Blog post retrieval, metadata, and publishing workflow

import fs from 'fs';
import path from 'path';

// Types
export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  authorCredentials: string;
  category: string;
  readTime: string;
  language: 'hi' | 'en';
  keywords: string[];
  excerpt: string;
  content: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  publishedAt: string;
  category: string;
  readTime: string;
  language: 'hi' | 'en';
  excerpt: string;
}

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), 'apps/web/content/blog');

/**
 * Get all blog post slugs
 */
export async function getBlogPostSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    const slugs = files
      .filter(file => file.endsWith('.mdx'))
      .map(file => {
        const slug = file.replace('.mdx', '');
        const filePath = path.join(CONTENT_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          slug,
          updatedAt: stats.mtime.toISOString(),
        };
      });
    return slugs;
  } catch (error) {
    console.error('Error reading blog directory:', error);
    return [];
  }
}

/**
 * Get all blog posts metadata (for index pages)
 */
export async function getBlogPosts(): Promise<BlogPostMetadata[]> {
  const slugs = await getBlogPostSlugs();
  const posts: BlogPostMetadata[] = [];

  for (const { slug } of slugs) {
    try {
      const post = await getBlogPost(slug);
      posts.push({
        slug: post.slug,
        title: post.title,
        publishedAt: post.publishedAt,
        category: post.category,
        readTime: post.readTime,
        language: post.language,
        excerpt: post.excerpt,
      });
    } catch (error) {
      console.error(`Error reading post ${slug}:`, error);
    }
  }

  // Sort by publishedAt descending
  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Blog post not found: ${slug}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse frontmatter (simple implementation)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error(`Invalid frontmatter in ${slug}`);
  }

  const frontmatter = frontmatterMatch[1];
  const body = content.replace(frontmatterMatch[0], '');

  // Parse YAML frontmatter
  const metadata: Partial<BlogPost> = {};
  const lines = frontmatter.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      metadata[key as keyof BlogPost] = cleanValue as any;
    }
  }

  return {
    slug,
    title: metadata.title || '',
    publishedAt: metadata.publishedAt || '',
    updatedAt: metadata.updatedAt || metadata.publishedAt || '',
    author: metadata.author || '',
    authorCredentials: metadata.authorCredentials || '',
    category: metadata.category || '',
    readTime: metadata.readTime || '',
    language: (metadata.language === 'en' ? 'en' : 'hi'),
    keywords: metadata.keywords ? (Array.isArray(metadata.keywords) ? metadata.keywords : JSON.parse(metadata.keywords as string)) : [],
    excerpt: metadata.excerpt || '',
    content: body,
  };
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<BlogPostMetadata[]> {
  const posts = await getBlogPosts();
  return posts.filter(post => post.category === category);
}

/**
 * Get related blog posts (same category, excluding current)
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit: number = 3
): Promise<BlogPostMetadata[]> {
  const posts = await getBlogPostsByCategory(category);
  return posts
    .filter(post => post.slug !== currentSlug)
    .slice(0, limit);
}

/**
 * Search blog posts by keyword
 */
export async function searchBlogPosts(query: string): Promise<BlogPostMetadata[]> {
  const posts = await getBlogPosts();
  const lowerQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Validate blog post against CONTENT_CHECKLIST.md
 */
export function validateBlogPost(post: BlogPost): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!post.title) errors.push('Missing title');
  if (!post.publishedAt) errors.push('Missing publishedAt');
  if (!post.author) errors.push('Missing author');
  if (!post.category) errors.push('Missing category');
  if (!post.readTime) errors.push('Missing readTime');
  if (!post.excerpt) errors.push('Missing excerpt');

  // Check content structure
  if (!post.content.includes('## संक्षेप में:') && !post.content.includes('## Summary:')) {
    errors.push('Missing answer box (संक्षेप में:/Summary:)');
  }

  if (!post.content.includes('## मुख्य बातें') && !post.content.includes('## Key Takeaways')) {
    errors.push('Missing key takeaways section');
  }

  if (!post.content.includes('## Sources & References') && !post.content.includes('## स्रोत और संदर्भ')) {
    errors.push('Missing sources section');
  }

  // Check for internal links (at least 2)
  const internalLinkCount = (post.content.match(/\[.*?\]\(\/[^)]+\)/g) || []).length;
  if (internalLinkCount < 2) {
    errors.push('Less than 2 internal links found');
  }

  // Check for external authoritative links
  const hasAuthoritativeLink = /dahd\.nic\.in|agmarknet\.gov\.in|nabard\.org|imd\.gov\.in/.test(post.content);
  if (!hasAuthoritativeLink) {
    errors.push('Missing authoritative external link (DADF, AGMARKNET, NABARD, or IMD)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
