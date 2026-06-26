// FlockIQ — Products Mega-Dropdown Component (v3.0)
// File: apps/web/components/marketing/nav/ProductsMegaMenu.tsx
// Version: v3.0 | June 2026
// Task Reference: NAV-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §2.3

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, BarChart3, MessageSquare, Bell, Database } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductsMegaMenu({ isOpen, onClose }: ProductsMegaMenuProps) {
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
            className="absolute top-full left-0 z-50 w-[720px] bg-white rounded-b-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] border border-neutral-150"
            onMouseLeave={onClose}
          >
            <div className="p-8 grid grid-cols-3 gap-8">
              {/* Column 1 — Platform */}
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                  Platform
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/features/farm-management"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <BarChart3 className="w-5 h-5 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                          Farm Management
                        </div>
                        <div className="text-sm text-neutral-600">
                          Complete batch lifecycle tracking
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <TrendingUp className="w-5 h-5 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                          Analytics & Reporting
                        </div>
                        <div className="text-sm text-neutral-600">
                          FCR, mortality, benchmark reports
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/whatsapp-log"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <MessageSquare className="w-5 h-5 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                          WhatsApp Log Automation
                        </div>
                        <div className="text-sm text-neutral-600 flex items-center gap-1">
                          <span className="text-brand-600 font-semibold">★ NEW</span>
                          <span>— Auto-collect daily data</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/price-intel"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <Database className="w-5 h-5 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors flex items-center gap-2">
                          Price Intelligence
                          <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold leading-none">Soon</span>
                        </div>
                        <div className="text-sm text-neutral-600">
                          7-day AI price forecasts
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <Bell className="w-5 h-5 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                          Alerts & Notifications
                        </div>
                        <div className="text-sm text-neutral-600">
                          Disease, weather, market alerts
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2 — By Role */}
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                  By Role
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/solutions/integrators"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <span className="text-lg">🏭</span>
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
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <span className="text-lg">🏠</span>
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
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-all duration-200">
                        <span className="text-lg">🌐</span>
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                          Enterprise API
                        </div>
                        <div className="text-sm text-neutral-600">
                          Data API & white-label
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3 — Featured */}
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                  Featured
                </h3>
                <div className="group bg-brand-50 rounded-xl p-5 border border-brand-100 transition-all duration-300 hover:bg-brand-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-6 h-6 text-brand-700" />
                    <span className="text-sm font-bold text-brand-700">
                      🆕 WhatsApp Log Automation
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
                    Zero manual data entry. Farmer types on WhatsApp. You see the data instantly.
                  </p>
                  <Link
                    href="/features/whatsapp-log"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600 transition-colors"
                    onClick={onClose}
                  >
                    See how it works
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="border-t border-neutral-150 px-8 py-4 bg-neutral-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  500+ farms across 15+ countries trust FlockIQ
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                  <span>AGMARKNET</span>
                  <span>NECC</span>
                  <span>IMD</span>
                  <span>DAHDF</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProductsMegaMenu;

