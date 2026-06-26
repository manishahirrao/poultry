// FlockIQ — Root Layout (Pre-Login)
// File: apps/web/app/layout.tsx
// Version: v3.0 | June 2026
// Task Reference: SETUP-003
// Requirements: FR-GLOBAL-001, FR-GLOBAL-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

import type { Metadata, Viewport } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { HindiFontProvider } from '@/providers/HindiFontProvider';
import { SkipToMain } from '@/components/ui/SkipToMain';

// Font configurations with proper subsets and display
// IMPORTANT: Noto Sans Devanagari is heavy (~2MB).
// Load ONLY when Hindi mode is active.
// Implemented in: src/components/HindiProvider.tsx (dynamic import)

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',  // 'swap' shows fallback immediately, then swaps when loaded - better performance
  weight: ['400', '600', '700', '800'],
  preload: true,  // Preload critical font
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,  // Preload critical font
});

// Base metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL('https://flockiq.com'),
  title: {
    default: 'FlockIQ — Poultry Management Platform | Global',
    template: '%s | FlockIQ',
  },
  description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence. 500+ farms across 15 countries.',
  keywords: ['poultry management', 'farm management', 'WhatsApp automation', 'batch tracking', 'FCR tracking', 'price intelligence', 'integrator software', 'poultry ERP'],
  authors: [{ name: 'FlockIQ' }],
  creator: 'FlockIQ',
  publisher: 'FlockIQ Technologies Pvt. Ltd.',
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN', 'en_ID', 'en_VN', 'en_TH'],
    url: 'https://flockiq.com',
    siteName: 'FlockIQ',
    title: 'FlockIQ — Poultry Management Platform',
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlockIQ — Poultry Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlockIQ — Poultry Management Platform',
    description: 'The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1A5C34' },
    { media: '(prefers-color-scheme: dark)', color: '#0D3B21' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Preload critical assets for LCP performance */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        <SkipToMain />
        <LanguageProvider>
          <HindiFontProvider>
            <GoogleAnalytics />
            {children}
          </HindiFontProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
