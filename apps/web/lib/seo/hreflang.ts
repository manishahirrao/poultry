// Hreflang Generator for FlockIQ
// File: apps/web/lib/seo/hreflang.ts
// Task Reference: G-06

export function generateHreflangTags(path: string = '') {
  const baseUrl = 'https://flockiq.com';
  const fullPath = path ? `${baseUrl}/${path.replace(/^\//, '')}` : baseUrl;

  return [
    { rel: 'alternate', hrefLang: 'hi-IN', href: fullPath },
    { rel: 'alternate', hrefLang: 'en-IN', href: `${fullPath}?lang=en` },
    { rel: 'alternate', hrefLang: 'x-default', href: fullPath },
  ];
}
