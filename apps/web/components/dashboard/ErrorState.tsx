'use client';

import React from 'react';
import {
  WifiSlash, ClockCountdown, WarningOctagon,
  LockSimple, Key
} from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

type ErrorVariant =
  | 'network-error'
  | 'data-stale'
  | 'accuracy-gate-failed'
  | 'forbidden'
  | 'session-expired';

interface ErrorStateProps {
  variant: ErrorVariant;
  onRetry?: () => void;
  requiredPlan?: string;
}

const ERROR_CONTENT: Record<ErrorVariant, {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  headingEn: string;
  headingHi: string;
  messageEn: string;
  messageHi: string;
  isCritical?: boolean;
}> = {
  'network-error': {
    icon: WifiSlash,
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    headingEn: 'Connection issue',
    headingHi: 'Internet से जुड़ने में समस्या',
    messageEn: 'Check your internet connection and try again.',
    messageHi: 'अपना internet connection check करें और दोबारा कोशिश करें।',
  },
  'data-stale': {
    icon: ClockCountdown,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    headingEn: 'Data is 24+ hours old',
    headingHi: 'डेटा 24+ घंटे पुराना है',
    messageEn: 'Refresh to get the latest data.',
    messageHi: 'ताज़ा data के लिए Refresh करें।',
  },
  'accuracy-gate-failed': {
    icon: WarningOctagon,
    iconColor: '#FFFFFF',
    iconBg: '#DC2626',
    headingEn: 'CRITICAL: Model Accuracy Below 95%',
    headingHi: 'CRITICAL: Model Accuracy 95% से नीचे',
    messageEn: 'Customer notifications paused automatically. Investigate immediately.',
    messageHi: 'Customer notifications अपने आप रुक गई हैं। तत्काल जांच करें।',
    isCritical: true,
  },
  'forbidden': {
    icon: LockSimple,
    iconColor: '#6366F1',
    iconBg: '#E0E7FF',
    headingEn: 'This page is not in your plan',
    headingHi: 'यह Page आपके plan में नहीं है',
    messageEn: 'A higher plan is required to access this section.',
    messageHi: 'इस section को access करने के लिए higher plan की ज़रूरत है।',
  },
  'session-expired': {
    icon: Key,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    headingEn: 'Session expired',
    headingHi: 'Session समाप्त हो गया',
    messageEn: 'Your session was closed for security. Please log in again.',
    messageHi: 'सुरक्षा के लिए session बंद हो गया — दोबारा login करें।',
  },
};

export function ErrorState({ variant, onRetry, requiredPlan }: ErrorStateProps) {
  const content = ERROR_CONTENT[variant];
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const heading = isHindi ? content.headingHi : content.headingEn;
  const message = isHindi ? content.messageHi : content.messageEn;
  const Icon = content.icon;

  if (content.isCritical) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="bg-red-600 text-white px-6 py-4 rounded-xl mb-6 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon size={22} weight="bold" className="text-white" />
        </div>
        <div>
          <p className="font-bold">{heading}</p>
          <p className="text-red-100 text-sm mt-1">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center py-12 px-8 text-center"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: content.iconBg }}
      >
        <Icon size={28} weight="duotone" style={{ color: content.iconColor }} />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-1">{heading}</h3>
      <p className="text-sm text-neutral-500 max-w-xs mb-4">{message}</p>
      {requiredPlan && (
        <p className="text-xs text-neutral-400 mb-3">{isHindi ? `आवश्यक: ${requiredPlan} plan` : `Required: ${requiredPlan} plan`}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-[#1A5C34] underline font-semibold hover:text-[#145228] transition-colors"
        >
          {isHindi ? 'दोबारा कोशिश करें' : 'Try again'}
        </button>
      )}
      {variant === 'forbidden' && (
        <a href="/dashboard/settings?tab=billing"
          className="text-sm bg-[#1A5C34] text-white px-5 py-2.5 rounded-xl mt-2 hover:bg-[#145228] transition-colors font-semibold shadow-sm">
          {isHindi ? 'Upgrade करें →' : 'Upgrade →'}
        </a>
      )}
      {variant === 'session-expired' && (
        <a href="/login?redirect=/dashboard/overview"
          className="text-sm bg-[#1A5C34] text-white px-5 py-2.5 rounded-xl mt-2 hover:bg-[#145228] transition-colors font-semibold shadow-sm">
          {isHindi ? 'Login करें →' : 'Login →'}
        </a>
      )}
    </div>
  );
}
