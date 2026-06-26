'use client';

// WHY: This is the alert feed component that displays active alerts for disease, weather, price, and policy events.
// It shows alert cards with severity-based color coding (critical, warning, info), expandable details, and
// timestamps. The component uses Framer Motion for smooth entry animations and design tokens for consistent
// styling. Alerts are paginated and can be expanded to show more details or action links.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Warning, Thermometer, TrendDown, Info, X, CaretDown } from '@phosphor-icons/react';
import { FlockIQTokens } from '@/lib/design-tokens';

interface Alert {
  id: string;
  type: 'disease' | 'weather' | 'price' | 'policy';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  titleHindi: string;
  message: string;
  messageHindi: string;
  district?: string;
  timestamp: Date;
  actionUrl?: string;
}

interface AlertFeedProps {
  alerts: Alert[];
  maxVisible?: number;
  isLoading?: boolean;
}

export function AlertFeed({ alerts, maxVisible = 5, isLoading = false }: AlertFeedProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const visibleAlerts = alerts.slice(0, maxVisible);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'disease': return Warning;
      case 'weather': return Thermometer;
      case 'price': return TrendDown;
      case 'policy': return Info;
      default: return Info;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-900'
      };
      case 'warning': return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        text: 'text-amber-900'
      };
      case 'info': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-900'
      };
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        text: 'text-gray-900'
      };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: FlockIQTokens.cardBorder }}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: FlockIQTokens.cardBorder }}>
        <div className="text-center py-8">
          <Info size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500">No active alerts</p>
          <p className="text-xs text-gray-400 mt-1">अलर्ट नहीं हैं</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: FlockIQTokens.cardBorder }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: FlockIQTokens.divider }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Active Alerts</h2>
          <span className="text-xs text-gray-500">{alerts.length} total</span>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: FlockIQTokens.divider }}>
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type);
            const colors = getAlertColor(alert.severity);
            const isExpanded = expandedAlert === alert.id;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${colors.bg} border-l-4 ${colors.border}`}
              >
                <div className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <AlertIcon size={20} className={`mt-0.5 ${colors.icon} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${colors.text}`}>
                            {alert.titleHindi}
                          </p>
                          <p className={`text-xs ${colors.text} opacity-80`}>
                            {alert.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {formatTime(alert.timestamp)}
                          </span>
                          {alert.district && (
                            <span className="text-xs text-gray-400">
                              · {alert.district.charAt(0).toUpperCase() + alert.district.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {alert.messageHindi}
                      </p>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 text-sm text-gray-600"
                        >
                          {alert.message}
                        </motion.div>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <X size={12} />
                              Show less
                            </>
                          ) : (
                            <>
                              <CaretDown size={12} />
                              Show more
                            </>
                          )}
                        </button>
                        {alert.actionUrl && (
                          <a
                            href={alert.actionUrl}
                            className="text-xs font-medium text-gray-700 hover:text-gray-900"
                          >
                            View details →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {alerts.length > maxVisible && (
        <div className="px-6 py-3 bg-gray-50 border-t" style={{ borderColor: FlockIQTokens.divider }}>
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            View all {alerts.length} alerts →
          </button>
        </div>
      )}
    </div>
  );
}
