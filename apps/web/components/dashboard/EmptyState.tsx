'use client';

import React from 'react';
import Link from 'next/link';
import {
  SunDim, UsersThree, ChartLineUp, Key, Bird,
  CalendarBlank, UsersFour
} from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

type EmptyVariant =
  | 'no-alerts'
  | 'no-customers'
  | 'no-data'
  | 'no-api-key'
  | 'loading-prediction'
  | 'no-history'
  | 'no-referrals'
  | 'first-signal-pending';

interface EmptyStateProps {
  variant: EmptyVariant;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

const EMPTY_CONTENT: Record<EmptyVariant, {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  headingEn: string;
  headingHi: string;
  messageEn: string;
  messageHi: string;
  ctaDefault?: { labelEn: string; labelHi: string; href: string };
}> = {
  'no-alerts': {
    icon: SunDim,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    headingEn: 'All clear!',
    headingHi: 'सब ठीक है! ✓',
    messageEn: 'No active alerts right now. HPAI, weather, or price warnings will appear here.',
    messageHi: 'अभी कोई active alert नहीं है। HPAI, मौसम, या भाव की चेतावनी आने पर यहाँ दिखेगी।',
  },
  'no-customers': {
    icon: UsersThree,
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
    headingEn: 'No customers yet',
    headingHi: 'अभी कोई Customer नहीं है',
    messageEn: 'Customers will appear here once Phase 0 launches.',
    messageHi: 'Phase 0 launch होते ही customers यहाँ दिखाई देंगे।',
    ctaDefault: { labelEn: 'View Accuracy Gate', labelHi: 'Accuracy Gate देखें', href: '/dashboard/admin-accuracy' },
  },
  'no-data': {
    icon: ChartLineUp,
    iconColor: '#0891B2',
    iconBg: '#CFFAFE',
    headingEn: 'Data incoming...',
    headingHi: 'डेटा आ रहा है...',
    messageEn: 'Daily forecast pipeline runs at 06:00 AM. Tomorrow\'s prediction will be available tonight.',
    messageHi: 'Daily forecast pipeline 06:00 AM पर चलती है। कल की prediction आज रात तक available होगी।',
  },
  'no-api-key': {
    icon: Key,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    headingEn: 'No API key yet',
    headingHi: 'अभी तक कोई API Key नहीं',
    messageEn: 'Create your first API key to integrate FlockIQ data into your system.',
    messageHi: 'पहली API key बनाएं — अपने system में FlockIQ data integrate करें।',
    ctaDefault: { labelEn: 'Create API Key', labelHi: 'API Key बनाएं', href: '/dashboard/api' },
  },
  'loading-prediction': {
    icon: Bird,
    iconColor: '#1A5C34',
    iconBg: '#D4EFDE',
    headingEn: 'Price forecast is being prepared',
    headingHi: 'भाव अनुमान तैयार हो रहा है',
    messageEn: 'Today\'s signal will arrive at 6:30 AM. Please wait a moment.',
    messageHi: 'आज का signal 6:30 AM पर मिलेगा। कृपया थोड़ा इंतज़ार करें।',
  },
  'no-history': {
    icon: CalendarBlank,
    iconColor: '#6366F1',
    iconBg: '#E0E7FF',
    headingEn: 'No history yet',
    headingHi: 'अभी कोई history नहीं',
    messageEn: 'Price history will appear here in a few days.',
    messageHi: 'कुछ दिनों में यहाँ price history दिखेगी।',
  },
  'no-referrals': {
    icon: UsersFour,
    iconColor: '#EC4899',
    iconBg: '#FCE7F3',
    headingEn: 'No referrals yet',
    headingHi: 'अभी कोई referral नहीं',
    messageEn: 'Refer your friends and earn ₹500.',
    messageHi: 'दोस्तों को refer करें — ₹500 पाएं।',
    ctaDefault: { labelEn: 'Refer Now', labelHi: 'Refer करें', href: '/refer' },
  },
  'first-signal-pending': {
    icon: Bird,
    iconColor: '#1A5C34',
    iconBg: '#D4EFDE',
    headingEn: 'Your first signal is on its way!',
    headingHi: 'आपका पहला signal आ रहा है!',
    messageEn: 'Registration complete. Your first price signal will arrive on WhatsApp tomorrow at 6:30 AM.',
    messageHi: 'आपने registration पूरा कर लिया है। कल सुबह 6:30 AM पर आपके WhatsApp पर पहला price signal आएगा।',
  },
};

export function EmptyState({ variant, ctaLabel, ctaHref, onCtaClick }: EmptyStateProps) {
  const content = EMPTY_CONTENT[variant];
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const heading = isHindi ? content.headingHi : content.headingEn;
  const message = isHindi ? content.messageHi : content.messageEn;

  const cta = ctaLabel && (ctaHref || onCtaClick)
    ? { label: ctaLabel, href: ctaHref }
    : content.ctaDefault
      ? { label: isHindi ? content.ctaDefault.labelHi : content.ctaDefault.labelEn, href: content.ctaDefault.href }
      : null;

  const Icon = content.icon;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: content.iconBg }}
      >
        <Icon size={32} weight="duotone" style={{ color: content.iconColor }} />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-2">
        {heading}
      </h3>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-5">
        {message}
      </p>
      {cta && (
        cta.href
          ? <Link href={cta.href} className="inline-flex items-center gap-2 text-sm bg-[#1A5C34] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#145228] transition-colors shadow-sm">{cta.label}</Link>
          : <button onClick={onCtaClick} className="inline-flex items-center gap-2 text-sm bg-[#1A5C34] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#145228] transition-colors shadow-sm">{cta.label}</button>
      )}
    </div>
  );
}
