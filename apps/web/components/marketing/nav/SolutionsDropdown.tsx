// FlockIQ — Solutions Dropdown Component (v3.0)
// File: apps/web/components/marketing/nav/SolutionsDropdown.tsx
// Version: v3.0 | June 2026
// Task Reference: NAV-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §2.2

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Factory, Home, Building2 } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SolutionsDropdown({ isOpen, onClose }: SolutionsDropdownProps) {
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
            className="absolute top-full left-0 z-50 w-80 bg-white rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] border border-neutral-150"
            onMouseLeave={onClose}
          >
            <div className="p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/solutions/integrators"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                      <Factory className="w-5 h-5 text-brand-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                        For Integrators
                      </div>
                      <div className="text-sm text-neutral-600">
                        50K–5M birds
                      </div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solutions/farms"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                      <Home className="w-5 h-5 text-brand-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                        For Farms
                      </div>
                      <div className="text-sm text-neutral-600">
                        10K–500K birds
                      </div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enterprise"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                      <Building2 className="w-5 h-5 text-brand-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                        For Enterprises
                      </div>
                      <div className="text-sm text-neutral-600">
                        Custom solutions
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SolutionsDropdown;

