// FlockIQ — Base Metadata Configuration
// File: apps/web/lib/seo/metadata.ts
// Task Reference: G-01
// Version: v1.0 | May 2026
// Design Reference: 06_content_seo_master.md

import { Metadata } from 'next';

/**
 * Site configuration constants
 */
const SITE_CONFIG = {
  name: 'FlockIQ',
  title: 'FlockIQ',
  description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp automation, price intelligence. 500+ farms across 15 countries.',
  url: 'https://flockiq.com',
  ogImage: 'https://flockiq.com/og/homepage.jpg',
  twitterHandle: '@FlockIQ',
  locale: 'en-IN',
  type: 'website',
} as const;

/**
 * Page metadata input interface
 * Matches specification from 13_full_platform_tasks_master.md G-01
 */
export interface PageMetadataInput {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Default metadata configuration
 */
const defaultMetadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.name}`,
    default: SITE_CONFIG.title,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'poultry price prediction',
    'broiler price forecast',
    'Gorakhpur poultry market',
    'chicken price India',
    'poultry farming AI',
    'mandi price prediction',
    'broiler sell signal',
    'poultry price intelligence',
    'UP poultry market',
    'मुर्गी भाव',
    'ब्रॉयलर भविष्यवाणी',
  ],
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: SITE_CONFIG.type,
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1A6B3C' },
    { media: '(prefers-color-scheme: dark)', color: '#1A6B3C' },
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

/**
 * Generate page metadata with overrides
 * Matches specification from 13_full_platform_tasks_master.md G-01
 * 
 * @param input - Page metadata input (title, description, ogImage, canonical, noIndex, keywords)
 * @returns Complete metadata object with all OG, Twitter, robots fields
 * 
 * @example
 * ```ts
 * export const metadata = generatePageMetadata({
 *   title: 'Pricing',
 *   description: 'Simple pricing for commercial poultry farmers',
 *   canonical: 'https://FlockIQ.ai/pricing',
 * });
 * ```
 */
export function generatePageMetadata(input: PageMetadataInput = {}): Metadata {
  const {
    title,
    description,
    ogImage,
    canonical,
    noIndex,
    keywords,
  } = input;

  const metadata: Metadata = {
    ...defaultMetadata,
    ...(title && { title: { template: `%s | ${SITE_CONFIG.name}`, default: title } }),
    ...(description && { description }),
    ...(keywords && { keywords }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...(canonical && {
      alternates: {
        canonical,
      },
    }),
    openGraph: {
      ...defaultMetadata.openGraph,
      ...(title && { title }),
      ...(description && { description }),
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title || SITE_CONFIG.title,
          },
        ],
      }),
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...(title && { title }),
      ...(description && { description }),
      ...(ogImage && { images: [ogImage] }),
    },
  };

  return metadata;
}

/**
 * Generate metadata for a specific page path
 * 
 * @param path - Page path (e.g., '/pricing', '/accuracy')
 * @param overrides - Additional metadata overrides
 * @returns Complete metadata object
 */
export function generatePageMetadataForPath(
  path: string,
  overrides: PageMetadataInput = {}
): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  
  return generatePageMetadata({
    ...overrides,
    canonical: url,
  });
}

/**
 * Generate no-index metadata (for pages that shouldn't be indexed)
 * 
 * @returns Metadata with robots set to noindex
 */
export function generateNoIndexMetadata(): Metadata {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default generatePageMetadata;
