// FlockIQ — FAQ JSON-LD Schema Generator
// File: apps/web/components/seo/FAQSchema.tsx
// Version: v1.0 | May 2026
// Design Reference: 01_prelogin_design_master.md §H-09
// Requirements: FR-SEO-003

/**
 * FAQ JSON-LD Schema Component
 * 
 * Generates structured data for FAQ pages to help search engines understand
 * the questions and answers. Used on homepage and FAQ page.
 * 
 * @example
 * ```tsx
 * import FAQSchema from '@/components/seo/FAQSchema';
 * 
 * const faqItems = [
 *   {
 *     question: 'FlockIQ कितना सटीक है?',
 *     answer: 'हमारा AI model 95%+ directional accuracy के साथ काम करता है...'
 *   },
 *   // ...
 * ];
 * 
 * export default function FAQPage() {
 *   return (
 *     <>
 *       <FAQSchema items={faqItems} />
 *       <FAQSection items={faqItems} />
 *     </>
 *   );
 * }
 * ```
 */

import Script from 'next/script';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export default function FAQSchema({ items }: FAQSchemaProps) {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData),
      }}
    />
  );
}
