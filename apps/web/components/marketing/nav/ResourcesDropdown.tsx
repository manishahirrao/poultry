// FlockIQ — Resources Dropdown Component (v3.0)
// File: apps/web/components/marketing/nav/ResourcesDropdown.tsx
// Version: v3.0 | June 2026
// Task Reference: NAV-002

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, FileText, Activity, HelpCircle, BookMarked, Wrench, Calendar } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

interface ResourcesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESOURCES_ITEMS = [
  {
    label: 'Blog',
    description: 'Insights for poultry farmers',
    href: '/blog',
    icon: BookOpen,
  },
  {
    label: 'Case Studies',
    description: 'Real results from real farms',
    href: '/case-studies',
    icon: FileText,
  },
  {
    label: 'Accuracy Dashboard',
    description: 'Live model performance stats',
    href: '/accuracy',
    icon: Activity,
  },
  {
    label: 'FAQ',
    description: 'Common questions answered',
    href: '/faq',
    icon: HelpCircle,
  },
  {
    label: 'Glossary',
    description: 'Poultry industry terms',
    href: '/glossary',
    icon: BookMarked,
  },
  {
    label: 'Templates',
    description: 'Free farm record templates',
    href: '/templates',
    icon: Wrench,
  },
  {
    label: 'Mandi Events',
    description: 'Live mandi schedule & rates',
    href: '/mandi-events',
    icon: Calendar,
  },
];

export function ResourcesDropdown({ isOpen, onClose }: ResourcesDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="absolute top-full right-0 z-50 w-[360px] bg-white rounded-b-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] border border-neutral-150"
            onMouseLeave={onClose}
          >
            <div className="p-6">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-1">
                {RESOURCES_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <item.icon className="w-4 h-4 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors text-sm">
                          {item.label}
                        </div>
                        <div className="text-xs text-neutral-500">{item.description}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ResourcesDropdown;
