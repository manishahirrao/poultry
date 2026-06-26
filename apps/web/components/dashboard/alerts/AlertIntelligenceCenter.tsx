'use client';

import React, { useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';

interface Alert {
  id: string;
  type: 'disease' | 'weather' | 'price_crash' | 'feed_cost' | 'policy' | 'hpai' | 'low_stock' | 'abnormal_mortality' | 'feed_water_deviation' | 'iot_environment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title_hindi: string;
  title_english: string;
  body_hindi: string;
  body_english: string;
  district: string;
  estimated_impact_low?: number;
  estimated_impact_high?: number;
  source: string;
  source_url?: string;
  created_at: string;
  expires_at?: string;
  confidence?: number;
}

interface AlertIntelligenceCenterProps {
  alerts: Alert[];
  loading: boolean;
  district: string;
  setDistrict: (district: string) => void;
  userFlockSize?: number;
  isAdmin?: boolean;
}

export function AlertIntelligenceCenter({ 
  alerts, 
  loading, 
  district, 
  setDistrict,
  userFlockSize = 20000,
  isAdmin = false
}: AlertIntelligenceCenterProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [acknowledgingIds, setAcknowledgingIds] = useState<Set<string>>(new Set());
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Enable realtime alerts
  useRealtimeAlerts(district);

  // Sort alerts by severity (critical > high > medium > low) and then by date
  const sortedAlerts = useMemo(() => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...alerts]
      .filter(alert => !dismissedIds.has(alert.id))
      .sort((a, b) => {
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [alerts, dismissedIds]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: sortedAlerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  const handleAcknowledge = async (alertId: string, action: 'acknowledged' | 'acted' | 'dismissed') => {
    setAcknowledgingIds(prev => new Set([...prev, alertId]));
    
    if (action === 'dismissed') {
      setDismissedIds(prev => new Set([...prev, alertId]));
    }

    try {
      await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, action }),
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      if (action === 'dismissed') {
        setDismissedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(alertId);
          return newSet;
        });
      }
    } finally {
      setAcknowledgingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'hpai':
      case 'disease':
        return '🦠';
      case 'weather':
      case 'iot_environment':
        return '🌡️';
      case 'price_crash':
        return '📉';
      case 'policy':
        return '📋';
      case 'feed_cost':
      case 'feed_water_deviation':
        return '🌾';
      case 'low_stock':
        return '📦';
      case 'abnormal_mortality':
        return '💀';
      default:
        return '🔔';
    }
  };

  const getAlertEmoji = (type: string) => {
    switch (type) {
      case 'hpai':
      case 'disease':
        return '🦠';
      case 'weather':
      case 'iot_environment':
        return '🌡️';
      case 'price_crash':
        return '📉';
      case 'policy':
        return '📋';
      case 'feed_cost':
      case 'feed_water_deviation':
        return '🌾';
      case 'low_stock':
        return '📦';
      case 'abnormal_mortality':
        return '💀';
      default:
        return '🔔';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { border: '#DC2626', bg: '#FEF2F2', text: '#DC2626', badge: 'bg-red-600' };
      case 'high':
        return { border: '#EA580C', bg: '#FFF7ED', text: '#EA580C', badge: 'bg-orange-600' };
      case 'medium':
        return { border: '#D97706', bg: '#FFFBEB', text: '#D97706', badge: 'bg-amber-600' };
      case 'low':
        return { border: '#2563EB', bg: '#EFF6FF', text: '#2563EB', badge: 'bg-blue-600' };
      default:
        return { border: '#5A7A68', bg: '#F7FAF8', text: '#5A7A68', badge: 'bg-neutral-600' };
    }
  };

  const calculateFlockImpact = (alert: Alert) => {
    if (!alert.estimated_impact_low || !alert.estimated_impact_high) return null;
    const scaleFactor = userFlockSize / 20000;
    const lowImpact = Math.round(alert.estimated_impact_low * scaleFactor);
    const highImpact = Math.round(alert.estimated_impact_high * scaleFactor);
    return { low: lowImpact, high: highImpact };
  };

  const getActNowLink = (alert: Alert) => {
    switch (alert.type) {
      case 'hpai':
      case 'disease':
        return '/dashboard/sell-signal';
      case 'price_crash':
        return '/dashboard/batch-optimizer';
      case 'feed_cost':
      case 'feed_water_deviation':
        return '/dashboard/feed-intelligence';
      case 'low_stock':
        return '/dashboard/inventory';
      case 'abnormal_mortality':
        return '/dashboard/batches';
      case 'iot_environment':
        return '/dashboard/batches';
      default:
        return '/dashboard';
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        
        <button
          onClick={() => setShowPreferences(true)}
          className="px-4 py-2 text-sm font-semibold text-brandGreen700 hover:bg-brandGreen50 rounded-lg transition-colors"
        >
          Alert Settings
        </button>
      </div>

      {/* Virtualized Alert Feed */}
      <div 
        ref={parentRef}
        className="h-[600px] overflow-auto"
      >
        {sortedAlerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500">
            <p>No active alerts for your district</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const alert = sortedAlerts[virtualRow.index];
              const emoji = getAlertEmoji(alert.type);
              const colors = getAlertColor(alert.severity);
              const flockImpact = calculateFlockImpact(alert);
              const isAcknowledging = acknowledgingIds.has(alert.id);
              
              return (
                <motion.div
                  key={alert.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    backgroundColor: colors.bg,
                    boxShadow: `inset 0 0 0 1px ${colors.border}20`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl p-4 border border-neutral-100 mb-3"
                >
                  {/* Severity Badge */}
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold text-white ${colors.badge}`}>
                    {alert.severity.toUpperCase()}
                  </div>

                  <div className="flex items-start gap-3 pr-20">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: colors.border }}
                    >
                      <span className="text-white">{emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 mb-1">
                        {alert.title_hindi}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {alert.body_hindi}
                      </p>
                      
                      {/* Flock Impact */}
                      {flockImpact && (
                        <div className="mb-2 px-3 py-1.5 bg-white/50 rounded-lg inline-block">
                          <span className="text-xs font-semibold text-neutral-700">
                            आपके झुंड पर असर: ~₹{flockImpact.low.toLocaleString()} – ₹{flockImpact.high.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3 text-xs text-neutral-500">
                        <span>{alert.source}</span>
                        <span>•</span>
                        <span>{new Date(alert.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}</span>
                        {alert.confidence && (
                          <>
                            <span>•</span>
                            <span>{Math.round(alert.confidence * 100)}% confidence</span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={getActNowLink(alert)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brandGreen700 text-white rounded-lg text-xs font-semibold hover:bg-brandGreen800 transition-colors"
                        >
                          Act Now →
                        </a>
                        
                        <button
                          onClick={() => handleAcknowledge(alert.id, 'acknowledged')}
                          disabled={isAcknowledging}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                          ✓ Acknowledge
                        </button>

                        <button
                          onClick={() => handleAcknowledge(alert.id, 'dismissed')}
                          disabled={isAcknowledging}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                          ✕ Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Preferences Modal */}
      {showPreferences && (
        <AlertPreferencesModal 
          onClose={() => setShowPreferences(false)}
          district={district}
        />
      )}

      {/* Admin Pipeline Monitor */}
      {isAdmin && (
        <AlertPipelineMonitor />
      )}
    </div>
  );
}

// Alert Preferences Modal Component
function AlertPreferencesModal({ onClose, district }: { onClose: () => void; district: string }) {
  const [preferences, setPreferences] = useState({
    hpai_distance_km: 100,
    temp_threshold_c: 35,
    price_drop_pct: 5,
    feed_cost_rise_pct: 5,
    push_enabled: true,
    whatsapp_enabled: true,
    email_enabled: false,
  });
  const [saving, setSaving] = useState(false);

  const debouncedSave = useMemo(
    () => debounce(async (prefs: typeof preferences) => {
      setSaving(true);
      try {
        await fetch('/api/alerts/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        });
      } catch (error) {
        console.error('Error saving preferences:', error);
      } finally {
        setSaving(false);
      }
    }, 500),
    []
  );

  const handleChange = (key: keyof typeof preferences, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    debouncedSave(newPrefs);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Alert Preferences</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-2xl">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* HPAI Distance Threshold */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              HPAI Alert Distance: {preferences.hpai_distance_km}km
            </label>
            <input
              type="range"
              min="50"
              max="200"
              step="50"
              value={preferences.hpai_distance_km}
              onChange={(e) => handleChange('hpai_distance_km', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>50km</span>
              <span>200km</span>
            </div>
          </div>

          {/* Temperature Threshold */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Temperature Alert Threshold: {preferences.temp_threshold_c}°C
            </label>
            <input
              type="range"
              min="32"
              max="42"
              step="1"
              value={preferences.temp_threshold_c}
              onChange={(e) => handleChange('temp_threshold_c', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>32°C</span>
              <span>42°C</span>
            </div>
          </div>

          {/* Price Drop Threshold */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Price Drop Alert: {preferences.price_drop_pct}%
            </label>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={preferences.price_drop_pct}
              onChange={(e) => handleChange('price_drop_pct', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>3%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Feed Cost Rise Threshold */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Feed Cost Rise Alert: {preferences.feed_cost_rise_pct}%
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={preferences.feed_cost_rise_pct}
              onChange={(e) => handleChange('feed_cost_rise_pct', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>3%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Channel Toggles */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Push Notifications</span>
              <button
                onClick={() => handleChange('push_enabled', !preferences.push_enabled)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  preferences.push_enabled ? 'bg-brandGreen700' : 'bg-neutral-200'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.push_enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">WhatsApp</span>
              <button
                onClick={() => handleChange('whatsapp_enabled', !preferences.whatsapp_enabled)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  preferences.whatsapp_enabled ? 'bg-brandGreen700' : 'bg-neutral-200'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.whatsapp_enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Email</span>
              <button
                onClick={() => handleChange('email_enabled', !preferences.email_enabled)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  preferences.email_enabled ? 'bg-brandGreen700' : 'bg-neutral-200'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.email_enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {saving && (
          <div className="px-6 py-3 bg-neutral-50 text-center text-sm text-neutral-600">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}

// Alert Pipeline Monitor (Admin Only)
function AlertPipelineMonitor() {
  const [pipelineStatus, setPipelineStatus] = useState({
    dag_dahdf_weekly: { last_run: '2026-05-22 06:00', status: 'success' },
    dag_imd_daily: { last_run: '2026-05-23 06:00', status: 'success' },
  });

  return (
    <div className="mt-6 bg-white rounded-xl border border-neutral-100 p-4">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">Alert Pipeline Monitor</h3>
      <div className="space-y-2">
        {Object.entries(pipelineStatus).map(([dag, status]) => (
          <div key={dag} className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">{dag}</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">{status.last_run}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                status.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
