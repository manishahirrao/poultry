import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — FlockIQ',
  description: 'Sign in to your FlockIQ account.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Login — FlockIQ',
    description: 'Sign in to your FlockIQ account.',
    url: 'https://flockiq.com/login',
    siteName: 'FlockIQ',
    locale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login — FlockIQ',
    description: 'Sign in to your FlockIQ account.',
  },
  alternates: {
    canonical: 'https://flockiq.com/login',
    languages: {
      'en': 'https://flockiq.com/login',
      'hi': 'https://flockiq.com/login?lang=hi',
      'x-default': 'https://flockiq.com/login',
    },
  },
};
