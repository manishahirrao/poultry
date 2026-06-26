'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Warning, Sun, TrendDown, FileText, X } from '@phosphor-icons/react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useLanguage } from '@/providers/LanguageProvider';

interface AlertRow {
  id: string;
  type: 'HPAI' | 'WEATHER' | 'PRICE_WARNING' | 'POLICY';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  title_hi: string;
  body: string;
  body_hi: string;
  district: string;
  expires_at: string;
  created_at: string;
  external_url: string | null;
}

interface AlertsFeedProps {
  initialAlerts: AlertRow[];
  district: string;
}

export function AlertsFeed({ initialAlerts, district }: AlertsFeedProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [alerts, setAlerts] = useState<AlertRow[]>(initialAlerts);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(alert => !dismissedIds.has(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'HPAI':
        return Warning;
      case 'WEATHER':
        return Sun;
      case 'PRICE_WARNING':
        return TrendDown;
      case 'POLICY':
        return FileText;
      default:
        return Warning;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { border: '#DC2626', bg: '#FEF2F2', text: '#DC2626' };
      case 'warning':
        return { border: '#D97706', bg: '#FFFBEB', text: '#D97706' };
      case 'info':
        return { border: '#2563EB', bg: '#EFF6FF', text: '#2563EB' };
      default:
        return { border: '#5A7A68', bg: '#F7FAF8', text: '#5A7A68' };
    }
  };

  if (!mounted) {
    return <div className="bg-white rounded-2xl p-card-standard border border-neutral-100 h-[250px] sm:h-[300px] animate-pulse" />;
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-card-standard border border-neutral-100">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-base font-semibold text-neutral-900">{language === 'hi' ? 'अलर्ट फ़ीड' : 'Alerts Feed'}</h2>
        </div>
        <EmptyState variant="no-alerts" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-card-standard border border-neutral-100 flex flex-col">
      <div className="flex items-center justify-between mb-md flex-shrink-0">
        <h2 className="text-base font-semibold text-neutral-900">{language === 'hi' ? 'अलर्ट फ़ीड' : 'Alerts Feed'}</h2>
        <Link
          href="/dashboard/alerts"
          className="text-sm text-brandGreen700 hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2 rounded"
        >
          {language === 'hi' ? 'सभी चेतावनियाँ देखें' : 'View all alerts'} →
        </Link>
      </div>

      <div className="space-y-md flex-1 overflow-y-auto max-h-[500px]">
        <AnimatePresence>
          {visibleAlerts.slice(0, 5).map((alert, index) => {
            const Icon = getAlertIcon(alert.type);
            const colors = getAlertColor(alert.severity);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative rounded-xl p-md border border-neutral-100"
                style={{
                  backgroundColor: colors.bg,
                  boxShadow: `inset 0 0 0 1px ${colors.border}20`,
                }}
              >
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2 rounded"
                  aria-label="Dismiss alert"
                >
                  <X size={16} />
                </button>

                <div className="flex items-start gap-md">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.border }}
                  >
                    <Icon size={16} className="text-white" weight="bold" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-sm">
                      {language === 'hi' ? alert.title_hi : alert.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 mb-sm">
                      {language === 'hi' ? alert.body_hi : alert.body}
                    </p>
                    <div className="flex items-center gap-sm text-xs text-neutral-500">
                      <span className="capitalize">{alert.district}</span>
                      <span>•</span>
                      <span>
                        {new Date(alert.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {alert.external_url && (
                      <a
                        href={alert.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-sm text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2 rounded"
                        style={{ color: colors.text }}
                      >
                        {language === 'hi' ? 'और पढ़ें' : 'Read more'} →
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
