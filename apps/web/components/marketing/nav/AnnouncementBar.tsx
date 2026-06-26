'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import Link from 'next/link';

// Rotate based on day-of-month mod 4
const VARIANTS = [
  { text: "🚀 New: Farmers log data via WhatsApp in 10 seconds — no calls needed", href: "/features/whatsapp-log", cta: "See how →" },
  { text: "🌍 Live in India, Indonesia, Vietnam, Thailand and 12 more countries", href: "/about", cta: "See all markets →" },
  { text: "✅ 96.2% price direction accuracy — verified in private beta (Forecasting coming soon)", href: "/accuracy", cta: "See the data →" },
  { text: "🆓 Try free for 14 days — no credit card, cancel anytime", href: "/signup", cta: "Start free trial →" },
];

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // On client only — avoids SSR mismatch
    if (sessionStorage.getItem('flockiq_bar_dismissed')) setDismissed(true);
  }, []);

  if (dismissed) return null;

  const variantIndex = new Date().getDate() % 4;
  const variant = VARIANTS[variantIndex];

  const handleDismiss = () => {
    sessionStorage.setItem('flockiq_bar_dismissed', '1');
    setDismissed(true);
  };

  const handleCTAClick = () => {
    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('announcement_bar_click', {
        variant: variantIndex,
        href: variant.href,
      });
    }
  };

  return (
    <div className="bg-brand-700 text-white text-sm h-11 flex items-center justify-center px-4 relative z-50">
      <p className="font-jakarta text-[0.8125rem] text-center">
        <span className="hidden sm:inline">{variant.text} </span>
        <span className="sm:hidden">{variant.text.slice(0, 80)}... </span>
        <Link 
          href={variant.href} 
          className="font-semibold underline ml-1 hover:text-brand-200 transition-colors"
          onClick={handleCTAClick}
        >
          {variant.cta}
        </Link>
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/15 rounded transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}

