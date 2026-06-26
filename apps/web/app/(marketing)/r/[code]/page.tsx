// FlockIQ — Referral Landing Page
// File: apps/web/app/(marketing)/r/[code]/page.tsx
// Version: v1.0 | May 2026
// Requirements: FR-REFERRAL-002

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReferralLandingClient from './ReferralLandingClient';

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Join FlockIQ - Free Trial',
    description: 'Get 30 days free with this referral code. AI-powered poultry price intelligence for Indian farmers.',
  };
}

export default async function ReferralLandingPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  // Validate code format server-side
  const code = rawCode.toUpperCase();

  // Basic validation: 8 characters, alphanumeric (no confusable chars)
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code)) {
    notFound();
  }

  return <ReferralLandingClient referralCode={code} />;
}
