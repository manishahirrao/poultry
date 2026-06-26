// FlockIQ — Announcement Banner Component
// File: apps/web/components/layout/AnnouncementBanner.tsx
// Version: v1.0 | May 2026
// Task Reference: A-07
// Requirements: Design §5.2, FR-TECH-002, FR-POPUP-001

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from '@phosphor-icons/react';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    // Check if banner has been dismissed in this session
    const dismissed = sessionStorage.getItem('announcement-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-banner-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-[60] bg-[var(--brand-green-700)] h-[44px]"
    >
      <div className="max-w-[1280px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Banner Content */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-white text-sm font-semibold">
            {language === 'hi' 
              ? '🎉 Phase 0 Launch: Gorakhpur, Deoria, Kushinagar में अब available — 14 दिन मुफ़्त शुरू करें'
              : '🎉 Phase 0 Launch: Now available in Gorakhpur, Deoria, Kushinagar — Start 14 days free'
            }
          </span>
          <Link
            href="/signup"
            className="text-white font-semibold hover:underline underline-offset-2"
          >
            →
          </Link>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex items-center justify-center text-white hover:text-brandGreen50 transition-colors w-[44px] h-[44px]"
          aria-label="Dismiss announcement"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
