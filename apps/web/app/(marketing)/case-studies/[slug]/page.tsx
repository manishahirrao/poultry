// FlockIQ — Case Study Detail Page Template
// File: apps/web/app/(marketing)/case-studies/[slug]/page.tsx
// Version: v2.0 | June 2026
// Task Reference: CS-001
// Requirements: FR-CASESTUDIES-001

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseStudyDetailClient from './CaseStudyDetailClient';
import ArticleSchema from './ArticleSchema';
import BreadcrumbListSchema from './BreadcrumbListSchema';
import { getCaseStudyBySlug, getRelatedCaseStudies } from '../lib/case-study-utils';

interface CaseStudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  
  if (!study) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: `${study.title} | FlockIQ Case Studies`,
    description: study.excerpt,
    keywords: study.keywords,
    openGraph: {
      title: study.title,
      description: study.excerpt,
      type: 'article',
      publishedTime: study.publishedAt,
      modifiedTime: study.updatedAt,
      authors: [study.author],
      url: `https://flockiq.com/case-studies/${slug}`,
      images: [
        {
          url: `https://flockiq.com/api/og?title=${encodeURIComponent(study.heroStat)}&subtitle=${encodeURIComponent(study.heroStatLabel)}`,
          width: 1200,
          height: 630,
          alt: study.title,
        },
      ],
    },
    alternates: {
      canonical: `https://flockiq.com/case-studies/${slug}`,
      languages: {
        'hi-IN': `https://flockiq.com/case-studies/${slug}?lang=hi`,
        'en-IN': `https://flockiq.com/case-studies/${slug}?lang=en`,
        'x-default': `https://flockiq.com/case-studies/${slug}`,
      },
    },
  };
}

// ISR with 1-hour revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const relatedStudies = await getRelatedCaseStudies(slug, study.category, 2);

  return (
    <>
      <BreadcrumbListSchema study={study} slug={slug} />
      <ArticleSchema study={study} slug={slug} />
      <CaseStudyDetailClient study={study} relatedStudies={relatedStudies} />
    </>
  );
}
