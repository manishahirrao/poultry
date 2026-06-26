// FlockIQ — Case Study Content Types
// File: apps/web/app/(marketing)/case-studies/lib/case-study-types.ts
// Version: v1.0 | June 2026
// Task Reference: CS-001
// Requirements: FR-CASESTUDIES-001

export interface CaseStudy {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  authorCredentials?: string;
  readTime: string;
  language: 'en' | 'hi' | 'both';
  keywords: string[];
  heroStat: string;
  heroStatLabel: string;
  farmerName: string;
  farmerLocation: string;
  farmSize: string;
  planUsed: string;
  verifiedBy: string;
}

export interface CaseStudyWithContent extends CaseStudy {
  content: string;
}

// Case study categories as per CONTENT-MASTER-INDEX
export const CASE_STUDY_CATEGORIES = [
  { id: 'price-intelligence', name: 'Price Intelligence', nameHi: 'भाव बुद्धि' },
  { id: 'disease-alert', name: 'Disease Alert', nameHi: 'रोग चेतावनी' },
  { id: 'integrator', name: 'Integrator', nameHi: 'इंटीग्रेटर' },
  { id: 'global', name: 'Global', nameHi: 'वैश्विक' },
];
