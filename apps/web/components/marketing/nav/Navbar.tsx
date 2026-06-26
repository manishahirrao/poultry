// FlockIQ — Primary Navigation Component (v3.0)
// File: apps/web/components/marketing/nav/Navbar.tsx
// Version: v3.0 | June 2026
// Task Reference: NAV-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §2.2
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-NAV-001

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FlockIQLogo } from '@/components/brand/FlockIQLogo';
import { ProductsMegaMenu } from './ProductsMegaMenu';
import { SolutionsDropdown } from './SolutionsDropdown';
import { ResourcesDropdown } from './ResourcesDropdown';
import { MobileMenu } from './MobileMenu';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/providers/LanguageProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Products', href: '#', hasDropdown: true, component: 'ProductsMegaMenu' },
  { label: 'Solutions', href: '#', hasDropdown: true, component: 'SolutionsDropdown' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#', hasDropdown: true, component: 'ResourcesDropdown' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNavClick = (label: string, href: string) => {
    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('nav_click', {
        label,
        destination: href,
      });
    }
  };

  const handleTrialClick = () => {
    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('nav_trial_click', {
        source: 'navbar',
      });
    }
  };

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-40 h-[72px] flex items-center transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-brand-700/8 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Logo */}
          <FlockIQLogo className="h-9" />

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-1" role="menubar">
            {NAV_LINKS.map((link) => (
              <li
                key={link.label}
                role="none"
                className="relative"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                <button
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-lg text-[0.9375rem] font-medium font-jakarta transition-colors duration-150',
                    pathname === link.href
                      ? 'text-brand-700'
                      : 'text-neutral-700 hover:text-brand-700 hover:bg-brand-50/60'
                  )}
                  onClick={() => !link.hasDropdown && handleNavClick(link.label, link.href)}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  aria-haspopup={link.hasDropdown ? 'true' : undefined}
                  aria-expanded={link.hasDropdown ? activeDropdown === link.label : undefined}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown size={14} className={cn('transition-transform duration-200', activeDropdown === link.label ? 'rotate-180' : '')} />
                  )}
                </button>

                {/* Dropdowns */}
                {link.hasDropdown && activeDropdown === link.label && link.label === 'Products' && (
                  <ProductsMegaMenu isOpen={true} onClose={() => setActiveDropdown(null)} />
                )}
                {link.hasDropdown && activeDropdown === link.label && link.label === 'Solutions' && (
                  <SolutionsDropdown isOpen={true} onClose={() => setActiveDropdown(null)} />
                )}
                {link.hasDropdown && activeDropdown === link.label && link.label === 'Resources' && (
                  <ResourcesDropdown isOpen={true} onClose={() => setActiveDropdown(null)} />
                )}
              </li>
            ))}
          </ul>

          {/* Right section */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />
            <Link 
              href="/login" 
              className="font-jakarta text-[0.9375rem] font-medium text-neutral-700 hover:text-brand-700 px-3 py-2"
              onClick={() => handleNavClick('Sign in', '/login')}
            >
              {t('marketing.nav.signIn')}
            </Link>
            <Button 
              variant="primary" 
              size="md" 
              pill 
              asChild
            >
              <Link href="/activate" onClick={handleTrialClick}>{t('marketing.nav.activateBeta')}</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-brand-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Removed detached dropdown wrappers */}
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export default Navbar;

