// FlockIQ — Press/Media Page
// File: apps/web/app/(marketing)/press/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-007

import { Metadata } from 'next';
import PressPageClient from './PressPageClient';

export const metadata: Metadata = {
  title: 'Press & Media — Media Kit & Resources | FlockIQ',
  description: 'Press kit, media resources, and company information for journalists and media professionals covering FlockIQ. Download logos, brand guidelines, and press releases.',
  keywords: ['press kit', 'media kit', 'journalist resources', 'FlockIQ news', 'poultry AI press'],
  openGraph: {
    title: 'Press & Media — Media Kit & Resources | FlockIQ',
    description: 'Press kit and media resources for journalists.',
    url: 'https://flockiq.com/press',
  },
  alternates: {
    canonical: 'https://flockiq.com/press',
    languages: {
      'hi-IN': 'https://flockiq.com/press',
      'en-IN': 'https://flockiq.com/press?lang=en',
      'x-default': 'https://flockiq.com/press',
    },
  },
};

export default function PressPage() {
  return <PressPageClient />;
}
