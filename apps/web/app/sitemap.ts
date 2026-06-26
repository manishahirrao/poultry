// FlockIQ — Sitemap Generation
// File: apps/web/app/sitemap.ts
// Version: v3.0 | June 2026
// Task Reference: SEO-001, TEST-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import locations from '@/lib/data/locations.json';
import comparisons from '@/lib/data/comparisons.json';
import glossary from '@/lib/data/glossary.json';
import templates from '@/lib/data/templates.json';
import directory from '@/lib/data/directory.json';

const SITE_URL = 'https://flockiq.com';

// Static pages with priorities and change frequencies
// Priority 1.0 for homepage, 0.9 for key pages, 0.8 for important pages, 0.7 for blog posts
// Task Reference: TASK-WEB-022
// Requirement Refs: GWEB-003
const staticPages = [
  { path: '', priority: 1.0, changeFreq: 'daily' },
  // Core marketing pages (from Website Requirements v1.0)
  { path: 'features', priority: 0.9, changeFreq: 'weekly' },
  { path: 'pricing', priority: 0.9, changeFreq: 'weekly' },
  { path: 'accuracy', priority: 0.8, changeFreq: 'hourly' },
  // Solutions pages
  { path: 'solutions/commercial-farms', priority: 0.9, changeFreq: 'weekly' },
  { path: 'solutions/integrators', priority: 0.8, changeFreq: 'weekly' },
  { path: 'solutions/feed-companies', priority: 0.7, changeFreq: 'monthly' },
  { path: 'solutions/enterprise', priority: 0.7, changeFreq: 'monthly' },
  // Additional marketing pages
  { path: 'farm-intelligence', priority: 0.8, changeFreq: 'weekly' },
  { path: 'developers', priority: 0.7, changeFreq: 'monthly' },
  { path: 'compliance', priority: 0.6, changeFreq: 'monthly' },
  { path: 'about', priority: 0.6, changeFreq: 'monthly' },
  { path: 'demo', priority: 0.8, changeFreq: 'daily' },
  { path: 'login', priority: 0.5, changeFreq: 'monthly' },
  // District pages (legacy)
  { path: 'gorakhpur', priority: 0.9, changeFreq: 'daily' },
  { path: 'deoria', priority: 0.8, changeFreq: 'daily' },
  { path: 'kushinagar', priority: 0.8, changeFreq: 'daily' },
  { path: 'basti', priority: 0.8, changeFreq: 'daily' },
  { path: 'maharajganj', priority: 0.7, changeFreq: 'daily' },
  // Content pages
  { path: 'case-studies', priority: 0.8, changeFreq: 'weekly' },
  { path: 'blog', priority: 0.8, changeFreq: 'daily' },
  { path: 'faq', priority: 0.7, changeFreq: 'weekly' },
  { path: 'enterprise', priority: 0.7, changeFreq: 'monthly' },
  { path: 'press', priority: 0.5, changeFreq: 'weekly' },
  { path: 'contact', priority: 0.5, changeFreq: 'monthly' },
  { path: 'try-whatsapp', priority: 0.7, changeFreq: 'monthly' },
  { path: 'refer', priority: 0.6, changeFreq: 'monthly' },
  { path: 'privacy', priority: 0.2, changeFreq: 'yearly' },
  { path: 'terms', priority: 0.2, changeFreq: 'yearly' },
  // Programmatic SEO hub pages
  { path: 'locations', priority: 0.8, changeFreq: 'weekly' },
  { path: 'comparisons', priority: 0.7, changeFreq: 'monthly' },
  { path: 'glossary', priority: 0.7, changeFreq: 'monthly' },
  { path: 'templates', priority: 0.7, changeFreq: 'monthly' },
  { path: 'directory', priority: 0.7, changeFreq: 'monthly' },
  // New SEO pages
  { path: 'how-to-choose-poultry-price-prediction-tool', priority: 0.7, changeFreq: 'monthly' },
  { path: 'research/up-poultry-timing-loss-report-2025', priority: 0.6, changeFreq: 'monthly' },
  // District-specific pages
  { path: 'districts/gorakhpur/poultry-price-ai', priority: 0.8, changeFreq: 'daily' },
  { path: 'districts/deoria/poultry-price-ai', priority: 0.8, changeFreq: 'daily' },
  { path: 'districts/kushinagar/poultry-price-ai', priority: 0.8, changeFreq: 'daily' },
];

async function getBlogPosts(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts for sitemap:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

async function getCaseStudies(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('case_studies')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching case studies for sitemap:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching case studies for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const sitemap: MetadataRoute.Sitemap = [];

  // Add static pages
  for (const page of staticPages) {
    sitemap.push({
      url: page.path ? `${baseUrl}/${page.path}` : baseUrl,
      lastModified: new Date(),
      changeFrequency: page.changeFreq as any,
      priority: page.priority,
    });
  }

  // Add dynamic blog posts (priority 0.7 as per spec)
  const blogPosts = await getBlogPosts();
  for (const post of blogPosts) {
    sitemap.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Add dynamic case studies (priority 0.8 as per spec)
  const caseStudies = await getCaseStudies();
  for (const study of caseStudies) {
    sitemap.push({
      url: `${baseUrl}/case-studies/${study.slug}`,
      lastModified: new Date(study.updated_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // Add dynamic location pages
  for (const location of locations.locations) {
    sitemap.push({
      url: `${baseUrl}/locations/${location.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: location.status === 'live' ? 0.8 : 0.6,
    });
  }

  // Add dynamic comparison pages
  for (const comparison of comparisons.comparisons) {
    sitemap.push({
      url: `${baseUrl}/comparisons/${comparison.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // Add dynamic glossary pages
  for (const term of glossary.terms) {
    sitemap.push({
      url: `${baseUrl}/glossary/${term.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  // Add dynamic template pages
  for (const template of templates.templates) {
    sitemap.push({
      url: `${baseUrl}/templates/${template.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  // Add dynamic directory category pages
  for (const category of directory.categories) {
    sitemap.push({
      url: `${baseUrl}/directory/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return sitemap;
}
