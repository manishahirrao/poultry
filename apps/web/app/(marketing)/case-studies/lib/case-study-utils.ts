// FlockIQ — Case Study Content Utilities
// File: apps/web/app/(marketing)/case-studies/lib/case-study-utils.ts
// Version: v1.0 | June 2026
// Task Reference: CS-001
// Requirements: FR-CASESTUDIES-001

'use server';

import fs from 'fs';
import path from 'path';
import { type CaseStudy, type CaseStudyWithContent } from './case-study-types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'case-studies');

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
 * Get all case studies from MDX files
 */
export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    const studies: CaseStudy[] = [];

    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter } = parseFrontmatter(fileContent);

        const slug = frontmatter.slug || file.replace('.mdx', '');
        
        studies.push({
          slug,
          title: frontmatter.title || '',
          excerpt: frontmatter.excerpt || '',
          category: frontmatter.category || 'Case Study',
          publishedAt: frontmatter.publishedAt || new Date().toISOString(),
          updatedAt: frontmatter.updatedAt || new Date().toISOString(),
          author: frontmatter.author || 'FlockIQ Research Team',
          authorCredentials: frontmatter.authorCredentials,
          readTime: frontmatter.readTime || '5 min',
          language: frontmatter.language || 'hi',
          keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
          heroStat: frontmatter.heroStat || '',
          heroStatLabel: frontmatter.heroStatLabel || '',
          farmerName: frontmatter.farmerName || '',
          farmerLocation: frontmatter.farmerLocation || '',
          farmSize: frontmatter.farmSize || '',
          planUsed: frontmatter.planUsed || '',
          verifiedBy: frontmatter.verifiedBy || '',
        });
      }
    }

    // Sort by published date (newest first)
    return studies.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading case studies:', error);
    return [];
  }
}

/**
 * Get case study by slug with content
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyWithContent | null> {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    
    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, content } = parseFrontmatter(fileContent);

        const studySlug = frontmatter.slug || file.replace('.mdx', '');
        
        if (studySlug === slug) {
          return {
            slug: studySlug,
            title: frontmatter.title || '',
            excerpt: frontmatter.excerpt || '',
            category: frontmatter.category || 'Case Study',
            publishedAt: frontmatter.publishedAt || new Date().toISOString(),
            updatedAt: frontmatter.updatedAt || new Date().toISOString(),
            author: frontmatter.author || 'FlockIQ Research Team',
            authorCredentials: frontmatter.authorCredentials,
            readTime: frontmatter.readTime || '5 min',
            language: frontmatter.language || 'hi',
            keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
            heroStat: frontmatter.heroStat || '',
            heroStatLabel: frontmatter.heroStatLabel || '',
            farmerName: frontmatter.farmerName || '',
            farmerLocation: frontmatter.farmerLocation || '',
            farmSize: frontmatter.farmSize || '',
            planUsed: frontmatter.planUsed || '',
            verifiedBy: frontmatter.verifiedBy || '',
            content,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading case study:', error);
    return null;
  }
}

/**
 * Get case studies by category
 */
export async function getCaseStudiesByCategory(categoryId: string): Promise<CaseStudy[]> {
  const allStudies = await getAllCaseStudies();
  
  return allStudies.filter(study => study.category === categoryId);
}

/**
 * Get related case studies (same category, excluding current)
 */
export async function getRelatedCaseStudies(currentSlug: string, category: string, limit: number = 3): Promise<CaseStudy[]> {
  const allStudies = await getAllCaseStudies();
  
  return allStudies
    .filter(study => study.slug !== currentSlug && study.category === category)
    .slice(0, limit);
}
