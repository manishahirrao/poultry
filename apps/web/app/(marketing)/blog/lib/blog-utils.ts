// FlockIQ — Blog Content Utilities
// File: apps/web/app/(marketing)/blog/lib/blog-utils.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-021
// Requirements: REQ-WEB-011

'use server';

import fs from 'fs';
import path from 'path';
import { BLOG_CATEGORIES, type BlogPost, type BlogPostWithContent } from './blog-types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Parse frontmatter from MDX file
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, any>, content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }

  const frontmatterLines = match[1].split('\n');
  const frontmatter: Record<string, any> = {};

  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        (frontmatter as any)[key] = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
        continue;
      }
      
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: match[2] };
}

/**
 * Get all blog posts from MDX files
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    const posts: BlogPost[] = [];

    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter } = parseFrontmatter(fileContent);

        const slug = frontmatter.slug || file.replace('.mdx', '');
        
        posts.push({
          slug,
          title: frontmatter.title || '',
          titleEn: frontmatter.titleEn,
          titleHi: frontmatter.titleHi,
          excerpt: frontmatter.excerpt || '',
          excerptEn: frontmatter.excerptEn,
          excerptHi: frontmatter.excerptHi,
          category: frontmatter.category || 'product-updates',
          publishedAt: frontmatter.publishedAt || new Date().toISOString(),
          updatedAt: frontmatter.updatedAt || new Date().toISOString(),
          author: frontmatter.author || 'FlockIQ Team',
          authorCredentials: frontmatter.authorCredentials,
          readTime: frontmatter.readTime || '5 min',
          language: frontmatter.language || 'hi',
          keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
          featured: frontmatter.featured === 'true',
        });
      }
    }

    // Sort by published date (newest first)
    return posts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get blog post by slug with content
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    
    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, content } = parseFrontmatter(fileContent);

        const postSlug = frontmatter.slug || file.replace('.mdx', '');
        
        if (postSlug === slug) {
          return {
            slug: postSlug,
            title: frontmatter.title || '',
            titleEn: frontmatter.titleEn,
            titleHi: frontmatter.titleHi,
            excerpt: frontmatter.excerpt || '',
            excerptEn: frontmatter.excerptEn,
            excerptHi: frontmatter.excerptHi,
            category: frontmatter.category || 'product-updates',
            publishedAt: frontmatter.publishedAt || new Date().toISOString(),
            updatedAt: frontmatter.updatedAt || new Date().toISOString(),
            author: frontmatter.author || 'FlockIQ Team',
            authorCredentials: frontmatter.authorCredentials,
            readTime: frontmatter.readTime || '5 min',
            language: frontmatter.language || 'hi',
            keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
            featured: frontmatter.featured === 'true',
            content,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading blog post:', error);
    return null;
  }
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(categoryId: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  const category = BLOG_CATEGORIES.find(c => c.id === categoryId);
  
  if (!category) {
    return [];
  }

  return allPosts.filter(post => post.category === category.name || post.category === category.nameHi);
}

/**
 * Get related posts (same category, excluding current post)
 */
export async function getRelatedPosts(currentSlug: string, category: string, limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  
  return allPosts
    .filter(post => post.slug !== currentSlug && (post.category === category))
    .slice(0, limit);
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  
  return allPosts
    .filter(post => post.featured)
    .slice(0, limit);
}
