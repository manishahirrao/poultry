'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Warning, Sun, TrendDown, FileText, X, Check, NotePencil, UserPlus } from '@phosphor-icons/react';
import { AlertEmptyState } from '@/app/dashboard/alerts/components/AlertEmptyState';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveAlertsTabProps {
  alerts: any[];
  loading: boolean;
  district: string;
  setDistrict: (district: string) => void;
}

export function ActiveAlertsTab({ alerts, loading, district, setDistrict }: ActiveAlertsTabProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [acknowledgingIds, setAcknowledgingIds] = useState<Set<string>>(new Set());
  const [actionModalOpen, setActionModalOpen] = useState<string | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const visibleAlerts = alerts.filter(alert => !dismissedIds.has(alert.id));

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledgingIds(prev => new Set([...prev, alertId]));
    
    // Optimistic UI update
    setDismissedIds(prev => new Set([...prev, alertId]));

    try {
      // API call to acknowledge alert
      await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId }),
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      // Rollback on error
      setDismissedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    } finally {
      setAcknowledgingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const handleSaveActionNote = async (alertId: string) => {
    if (!actionInput.trim() && !noteInput.trim()) {
      setActionModalOpen(null);
      return;
    }

    setIsSaving(true);
    try {
      await fetch('/api/alerts/action-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alertId,
          action: actionInput.trim(),
          internal_note: noteInput.trim(),
        }),
      });
      setActionModalOpen(null);
      setActionInput('');
      setNoteInput('');
    } catch (error) {
      console.error('Error saving action/note:', error);
    } finally {
      setIsSaving(false);
    }
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
        return { border: '#DC2626', bg: '#FEF2F2', text: '#DC2626', badge: 'bg-red-600' };
      case 'warning':
        return { border: '#D97706', bg: '#FFFBEB', text: '#D97706', badge: 'bg-amber-600' };
      case 'info':
        return { border: '#2563EB', bg: '#EFF6FF', text: '#2563EB', badge: 'bg-blue-600' };
      default:
        return { border: '#5A7A68', bg: '#F7FAF8', text: '#5A7A68', badge: 'bg-neutral-600' };
    }
  };

  const districtOptions = [
    { value: 'gorakhpur', label: 'Gorakhpur' },
    { value: 'deoria', label: 'Deoria' },
    { value: 'kushinagar', label: 'Kushinagar' },
    { value: 'basti', label: 'Basti' },
    { value: 'maharajganj', label: 'Maharajganj' },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-neutral-100 animate-pulse">
            <div className="h-4 w-48 bg-neutral-200 rounded mb-2" />
            <div className="h-3 w-full bg-neutral-200 rounded mb-1" />
            <div className="h-3 w-3/4 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-neutral-700">District:</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          >
            {districtOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <AlertEmptyState district={district} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* District Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-neutral-700">District:</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
        >
          {districtOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type);
            const colors = getAlertColor(alert.severity);
            const isAcknowledging = acknowledgingIds.has(alert.id);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative rounded-xl p-4 border border-neutral-100"
                style={{
                  backgroundColor: colors.bg,
                  boxShadow: `inset 0 0 0 1px ${colors.border}20`,
                }}
              >
                {/* Severity Badge */}
                <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold text-white ${colors.badge}`}>
                  {alert.severity.toUpperCase()}
                </div>

                <div className="flex items-start gap-3 pr-20">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.border }}
                  >
                    <Icon size={20} className="text-white" weight="bold" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-neutral-900 mb-1">
                      {alert.title_hi}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      {alert.body_hi}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs text-neutral-500">
                        {new Date(alert.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-neutral-400">•</span>
                      <span className="text-xs text-neutral-500 capitalize">{alert.district}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {alert.external_url && (
                        <a
                          href={alert.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Advisory पढ़ें →
                        </a>
                      )}
                      
                      {alert.type === 'PRICE_WARNING' && (
                        <Link
                          href="/dashboard/price-intelligence"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brandGreen700 text-white rounded-lg text-xs font-semibold hover:bg-brandGreen800 transition-colors"
                        >
                          Sell Signal देखें →
                        </Link>
                      )}

                      {alert.type === 'WEATHER' && (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                          Shed Management Tips →
                        </button>
                      )}

                      {/* Assign Action / Internal Note Button */}
                      <button
                        onClick={() => setActionModalOpen(alert.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <NotePencil size={14} />
                        Assign Action / Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Acknowledge Button */}
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={isAcknowledging}
                  className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAcknowledging ? (
                    <>
                      <div className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                      Acknowledging...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Acknowledge
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action/Note Modal */}
      <AnimatePresence>
        {actionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setActionModalOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Assign Action / Add Internal Note
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Assign Action
                  </label>
                  <input
                    type="text"
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    placeholder="e.g., Call field supervisor, Schedule visit"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Internal Note
                  </label>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add internal notes for team reference..."
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setActionModalOpen(null);
                    setActionInput('');
                    setNoteInput('');
                  }}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveActionNote(actionModalOpen)}
                  disabled={isSaving || (!actionInput.trim() && !noteInput.trim())}
                  className="px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
