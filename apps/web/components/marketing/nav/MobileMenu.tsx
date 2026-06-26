// FlockIQ — Mobile Menu Component (v3.0)
// File: apps/web/components/marketing/nav/MobileMenu.tsx
// Version: v3.0 | June 2026
// Task Reference: NAV-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §2.2

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, BarChart3, MessageSquare, TrendingUp, Factory, Home, Building2, BookOpen, FileText, Activity } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FlockIQLogo } from '@/components/brand/FlockIQLogo';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Products',
    items: [
      { label: 'Farm Management', href: '/features/farm-management', icon: BarChart3 },
      { label: 'WhatsApp Log Automation', href: '/features/whatsapp-log', icon: MessageSquare },
      { label: 'Price Intelligence', href: '/features/price-intel', icon: TrendingUp },
    ],
  },
  {
    label: 'Solutions',
    items: [
      { label: 'For Integrators', href: '/solutions/integrators', icon: Factory },
      { label: 'For Farms', href: '/solutions/farms', icon: Home },
      { label: 'For Enterprises', href: '/enterprise', icon: Building2 },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Blog', href: '/blog', icon: BookOpen },
      { label: 'Case Studies', href: '/case-studies', icon: FileText },
      { label: 'Accuracy Dashboard', href: '/accuracy', icon: Activity },
    ],
  },
];

export function MobileMenu({ onClose }: MobileMenuProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-brand-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-700">
          <Link href="/" onClick={handleNavClick}>
            <FlockIQLogo className="h-8" />
          </Link>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-white hover:bg-brand-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Links */}
          <div className="space-y-2">
            <Link
              href="/features"
              onClick={handleNavClick}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg text-lg font-medium transition-colors',
                pathname === '/features' ? 'bg-brand-800 text-white' : 'text-white/90 hover:bg-brand-800'
              )}
            >
              <span>Features</span>
              <ChevronRight size={20} />
            </Link>
            <Link
              href="/pricing"
              onClick={handleNavClick}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg text-lg font-medium transition-colors',
                pathname === '/pricing' ? 'bg-brand-800 text-white' : 'text-white/90 hover:bg-brand-800'
              )}
            >
              <span>Pricing</span>
              <ChevronRight size={20} />
            </Link>
          </div>

          {/* Dropdown Sections */}
          {NAV_ITEMS.map((section) => (
            <div key={section.label} className="space-y-2">
              <h3 className="px-4 text-xs font-bold text-brand-400 uppercase tracking-wider">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg text-base font-medium transition-colors',
                      pathname === item.href ? 'bg-brand-800 text-white' : 'text-white/90 hover:bg-brand-800'
                    )}
                  >
                    <item.icon size={20} className="text-brand-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-brand-700 space-y-3">
          <Link href="/login" onClick={handleNavClick} className="block text-center text-white/90 hover:text-white py-3">
            Login
          </Link>
          <Button
            variant="primary"
            size="md"
            pill
            className="w-full"
            onClick={handleNavClick}
            asChild
          >
            <Link href="/signup">Start Free Trial →</Link>
          </Button>
        </div>
      </motion.div>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
    </AnimatePresence>
  );
}

export default MobileMenu;

