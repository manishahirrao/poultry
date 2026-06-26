// FlockIQ — Referral Page
// File: apps/web/app/(marketing)/refer/page.tsx
// Version: v1.0 | May 2026
// Task Reference: H-01
// Requirements: FR-REFERRAL-001

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ReferralPageClient from './ReferralPageClient';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'Refer & Earn — Share FlockIQ | FlockIQ',
  description: 'Share your referral code with fellow farmers and earn credits. For every successful referral, you get 1 month free.',
  keywords: ['referral program', 'earn credits', 'share FlockIQ', 'refer farmers'],
  openGraph: {
    title: 'Refer & Earn — Share FlockIQ',
    description: 'Share your referral code with fellow farmers and earn credits.',
    url: 'https://FlockIQ.ai/refer',
  },
  alternates: {
    canonical: 'https://FlockIQ.ai/refer',
    languages: {
      'hi-IN': 'https://FlockIQ.ai/refer',
      'en-IN': 'https://FlockIQ.ai/refer?lang=en',
      'x-default': 'https://FlockIQ.ai/refer',
    },
  },
};

export default async function ReferralPage() {
  return <ReferralPageClient />;
}
