// FlockIQ — Hreflang Meta Tags Component
// File: apps/web/components/seo/HreflangMeta.tsx
// Task Reference: G-05
// Design Reference: 06_content_seo_master.md

/**
 * HreflangMeta Component
 * 
 * Generates hreflang tags for multilingual SEO to help search engines
 * understand the language and regional targeting of pages.
 * 
 * Supports:
 * - x-default: Default language version (Hindi)
 * - hi-IN: Hindi for India
 * - en-IN: English for India
 * 
 * @example
 * ```tsx
 * import HreflangMeta from '@/components/seo/HreflangMeta';
 * 
 * export default function PricingPage() {
 *   return (
 *     <>
 *       <HreflangMeta path="/pricing" />
 *       <PricingContent />
 *     </>
 *   );
 * }
 * ```
 */

interface HreflangMetaProps {
  path: string;
  baseUrl?: string;
}

const SITE_URL = 'https://flockiq.com';

export default function HreflangMeta({ path, baseUrl = SITE_URL }: HreflangMetaProps) {
  const canonicalUrl = `${baseUrl}${path}`;
  const englishUrl = `${baseUrl}/en${path}`;
  
  const hreflangTags = [
    { hrefLang: 'x-default', url: canonicalUrl },
    { hrefLang: 'hi-IN', url: canonicalUrl },
    { hrefLang: 'en-IN', url: englishUrl },
  ];

  return (
    <>
      {hreflangTags.map((tag) => (
        <link
          key={tag.hrefLang}
          rel="alternate"
          hrefLang={tag.hrefLang}
          href={tag.url}
        />
      ))}
      <link rel="canonical" href={canonicalUrl} />
    </>
  );
}
