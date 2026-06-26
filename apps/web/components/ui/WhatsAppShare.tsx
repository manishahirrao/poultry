// FlockIQ — WhatsApp Share Button Component
// File: apps/web/components/ui/WhatsAppShare.tsx
// Version: v1.0 | May 2026
// Task Reference: UI-07
// Design Reference: 13_full_platform_tasks_master.md §UI-07

'use client';

import { WhatsappLogo } from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// WhatsApp brand color (external brand, not part of design tokens)
const WHATSAPP_GREEN = '#25D366';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Placeholder for analytics tracking - to be connected to actual analytics system
const trackEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName);
  }
  console.log(`[Analytics] Event: ${eventName}`);
};

export interface WhatsAppShareProps {
  message: string;
  label?: string;
  className?: string;
  trackingEvent?: string;
}

export default function WhatsAppShare({
  message,
  label = 'WhatsApp पर Share करें',
  className = '',
  trackingEvent,
}: WhatsAppShareProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Fire tracking event if provided
    if (trackingEvent) {
      trackEvent(trackingEvent);
    }
    
    // Opens in new tab on desktop, WhatsApp app on mobile
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-full',
        'bg-[#25D366] hover:bg-[#20bd5a] text-white',
        'font-semibold text-sm transition-all duration-200 hover:scale-105',
        'focus:outline-none focus:ring-3 focus:ring-[#25D366]/30',
        className
      )}
      aria-label="Share on WhatsApp"
    >
      <WhatsappLogo size={20} weight="fill" />
      <span>{label}</span>
    </button>
  );
}
