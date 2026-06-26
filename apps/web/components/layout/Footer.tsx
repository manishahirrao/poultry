// FlockIQ — Footer Component
// File: apps/web/components/layout/Footer.tsx
// Version: v3.1 | June 2026
// Task Reference: HOME-011
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  WhatsappLogo,
  Envelope,
  MapPin,
} from '@phosphor-icons/react';

interface FooterLink {
  label: string;
  href: string;
  isTagline?: boolean;
  isAddress?: boolean;
  isWhatsApp?: boolean;
  isEmail?: boolean;
  isExternal?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Accuracy', href: '/accuracy' },
      { label: 'Farm Intelligence', href: '/farm-intelligence' },
      { label: 'Free Disease Alerts', href: '/free-disease-alerts' },
      { label: 'WhatsApp Demo', href: '/try-whatsapp' },
      { label: 'Loss Calculator', href: '/loss-calculator' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Farms', href: '/solutions/farms' },
      { label: 'For Integrators', href: '/solutions/integrators' },
      { label: 'For Commercial Farms', href: '/solutions/commercial-farms' },
      { label: 'For Feed Companies', href: '/solutions/feed-companies' },
      { label: 'For Traders', href: '/solutions/traders' },
      { label: 'Enterprise', href: '/enterprise' },
      // { label: 'Developers / API', href: '/developers' }, // Hidden from pre-login
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Press', href: '/press' },
      { label: 'Partner With Us', href: '/partner-with-us' },
      { label: 'Refer & Earn', href: '/refer' },
      { label: 'Contact', href: '/contact' },
      { label: 'Book Demo', href: '/demo' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'Templates', href: '/templates' },
      { label: 'Tools', href: '/tools/price-trends' },
      { label: 'Mandi Events', href: '/mandi-events' },
      { label: 'Research', href: '/research/up-poultry-timing-loss-report-2025' },
      { label: 'Directory', href: '/directory' },
      { label: 'All Locations', href: '/locations' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Compliance', href: '/compliance' },
      { label: 'Refund Policy', href: '/refund' },
    ],
  },
];

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      {/* Accuracy Marquee Strip */}
      <div className="bg-neutral-900 overflow-hidden">
        <div
          className="flex items-center gap-16 py-3 whitespace-nowrap"
          style={{ animation: 'marquee-scroll 30s linear infinite' }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
        >
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-4 text-white">
              <span className="font-jakarta text-sm font-medium">Model Accuracy:</span>
              <span className="font-sora font-bold text-[1.125rem] tabular-nums tracking-[-0.02em] text-green-400">96.2%</span>
              <span className="font-jakarta text-sm text-white/70">Directional</span>
              <span className="text-white/30">|</span>
              <span className="font-jakarta text-sm font-medium">MAPE:</span>
              <span className="font-sora font-bold text-[1.125rem] tabular-nums tracking-[-0.02em] text-green-400">4.8%</span>
              <span className="text-white/30">|</span>
              <span className="font-jakarta text-sm font-medium">847 Predictions Verified</span>
              <span className="text-white/30">|</span>
              <span className="font-jakarta text-sm text-white/70">Today 06:15 IST</span>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Brand column + nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-6">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="FlockIQ"
                  width={160}
                  height={44}
                  className="h-11 w-auto object-contain"
                />
                <Image
                  src="/brand-name.png"
                  alt="PoultrySense"
                  width={120}
                  height={44}
                  className="h-11 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="font-jakarta text-neutral-500 text-[0.875rem] mb-5 leading-relaxed">
              The poultry management platform for integrators and farms worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2 font-jakarta text-neutral-500 text-[0.875rem]">
                <MapPin className="mt-0.5 flex-shrink-0" size={16} />
                <span>Gorakhpur, Uttar Pradesh, India</span>
              </div>
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-jakarta text-neutral-500 hover:text-green-600 transition-colors text-[0.875rem]"
              >
                <WhatsappLogo size={16} />
                <span>+91-XXXXXXXXXX</span>
              </a>
              <a
                href="mailto:hello@flockiq.com"
                className="flex items-center gap-2 font-jakarta text-neutral-500 hover:text-green-600 transition-colors text-[0.875rem]"
              >
                <Envelope size={16} />
                <span>hello@flockiq.com</span>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-jakarta font-bold text-[11px] text-neutral-900 mb-4 uppercase tracking-[0.14em]">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-jakarta text-neutral-500 hover:text-green-600 transition-colors text-[0.875rem]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-jakarta text-neutral-500 hover:text-green-600 transition-colors text-[0.875rem]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-jakarta text-neutral-400 text-[0.8125rem] text-center md:text-left">
              © 2026 FlockIQ Technologies Pvt. Ltd. | CIN: U01404UP2026PTC123456
            </p>
            <div className="flex items-center gap-4 font-jakarta text-neutral-400 text-[0.8125rem]">
              <Link href="/privacy" className="hover:text-neutral-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms</Link>
              <Link href="/compliance" className="hover:text-neutral-600 transition-colors">Compliance</Link>
              <span>DPDP Act 2023 | IT Act 2000</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
