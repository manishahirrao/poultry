'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Warning, 
  CheckCircle, 
  XCircle,
  ArrowClockwise,
  User,
  Calendar,
  ChartBar
} from '@phosphor-icons/react';

interface WatermarkEvent {
  id: string;
  customer_id: string;
  prediction_date: string;
  district: string;
  detection_platform: string;
  detection_timestamp: string;
  watermark_token: string;
  decoded_customer_id?: string;
  decode_success: boolean;
  screenshot_url?: string;
  current_state: 'detected' | 'warning_sent' | 'account_reviewed' | 'resolved';
  action_taken_by?: string;
  action_taken_at?: string;
  action_notes?: string;
}

interface CoverageMetrics {
  total_predictions: number;
  watermarked_predictions: number;
  coverage_percentage: number;
}

interface DecodeMetrics {
  total_processed: number;
  successful_decodes: number;
  success_rate: number;
}

interface WatermarkAuditConsoleProps {
  customerId?: string;
  customerName?: string;
}

const STATE_BADGES = {
  detected: { color: 'bg-red-100 text-red-700', icon: Warning, label: 'Detected' },
  warning_sent: { color: 'bg-amber-100 text-amber-700', icon: Warning, label: 'Warning Sent' },
  account_reviewed: { color: 'bg-blue-100 text-blue-700', icon: User, label: 'Account Reviewed' },
  resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
};

const PLATFORM_ICONS: Record<string, string> = {
  whatsapp: '📱',
  telegram: '✈️',
  screenshot: '📸',
  other: '🔍',
};

export function WatermarkAuditConsole({ customerId, customerName }: WatermarkAuditConsoleProps) {
  const [events, setEvents] = useState<WatermarkEvent[]>([]);
  const [coverage, setCoverage] = useState<CoverageMetrics | null>(null);
  const [decodeMetrics, setDecodeMetrics] = useState<DecodeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<WatermarkEvent | null>(null);

  const fetchAuditData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch watermark events
      const eventsRes = await fetch('/api/v1/watermark/events');
      if (!eventsRes.ok) throw new Error('Failed to fetch watermark events');
      const eventsData = await eventsRes.json();
      setEvents(eventsData.events || []);

      // Fetch coverage metrics
      const coverageRes = await fetch('/api/v1/watermark/coverage');
      if (!coverageRes.ok) throw new Error('Failed to fetch coverage metrics');
      const coverageData = await coverageRes.json();
      setCoverage(coverageData);

      // Fetch decode metrics
      const decodeRes = await fetch('/api/v1/watermark/decode-metrics');
      if (!decodeRes.ok) throw new Error('Failed to fetch decode metrics');
      const decodeData = await decodeRes.json();
      setDecodeMetrics(decodeData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleAction = async (eventId: string, action: 'warning' | 'suspend' | 'resolve') => {
    try {
      const res = await fetch(`/api/v1/watermark/events/${eventId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Failed to perform action');

      // Refresh data
      await fetchAuditData();
      setSelectedEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action');
    }
  };

  const getCustomerDisplay = (customerId: string): string => {
    // Display as {initials} - ****{last4}
    const idStr = customerId.replace(/-/g, '');
    const initials = idStr.substring(0, 2).toUpperCase();
    const last4 = idStr.substring(idStr.length - 4);
    return `${initials} - ****${last4}`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3 animate-pulse" />
              <div className="h-8 bg-neutral-200 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-3 bg-neutral-200 rounded w-1/4 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 h-96 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-neutral-200 text-center">
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load audit data</h3>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button
          onClick={fetchAuditData}
          className="px-4 py-2 bg-brandGreen500 text-white rounded-lg hover:bg-brandGreen600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Watermark Audit Console</h1>
          <p className="text-neutral-600 text-sm mt-1">IP protection and leak detection monitoring</p>
        </div>
        <button
          onClick={fetchAuditData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <ArrowClockwise size={16} />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coverage Monitor */}
        {coverage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-2xl p-6 border ${
              coverage.coverage_percentage < 100 ? 'border-red-300' : 'border-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield size={20} className={coverage.coverage_percentage < 100 ? 'text-red-500' : 'text-green-500'} />
              <h3 className="text-sm font-semibold text-neutral-900">Watermark Coverage</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 font-mono">
              {coverage.coverage_percentage.toFixed(1)}%
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {coverage.watermarked_predictions} / {coverage.total_predictions} predictions
            </p>
            {coverage.coverage_percentage < 100 && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ Coverage below 100% - investigate missing watermarks
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Decode Success Rate */}
        {decodeMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <ChartBar size={20} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-neutral-900">Decode Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 font-mono">
              {decodeMetrics.success_rate.toFixed(1)}%
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {decodeMetrics.successful_decodes} / {decodeMetrics.total_processed} decoded
            </p>
          </motion.div>
        )}

        {/* Active Leaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Warning size={20} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900">Active Leaks</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900 font-mono">
            {events.filter(e => e.current_state === 'detected').length}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            {events.length} total events
          </p>
        </motion.div>
      </div>

      {/* Leak Event Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-neutral-200"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Leak Event Feed</h3>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-neutral-900 mb-2">No Leak Events</h4>
            <p className="text-neutral-600">No watermark leaks detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const stateBadge = STATE_BADGES[event.current_state];
              const StateIcon = stateBadge.icon;
              
              return (
                <div
                  key={event.id}
                  className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Platform Icon */}
                      <div className="text-2xl">
                        {PLATFORM_ICONS[event.detection_platform] || PLATFORM_ICONS.other}
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stateBadge.color}`}>
                            <StateIcon size={12} className="inline mr-1" />
                            {stateBadge.label}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatDateTime(event.detection_timestamp)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-600">Customer:</span>
                            <span className="ml-2 font-mono text-neutral-900">
                              {getCustomerDisplay(event.customer_id)}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600">District:</span>
                            <span className="ml-2 font-medium text-neutral-900 capitalize">
                              {event.district}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Prediction:</span>
                            <span className="ml-2 text-neutral-900">
                              {formatDate(event.prediction_date)}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Decode:</span>
                            <span className={`ml-2 ${event.decode_success ? 'text-green-600' : 'text-red-600'}`}>
                              {event.decode_success ? '✓ Success' : '✗ Failed'}
                            </span>
                          </div>
                        </div>

                        {event.action_notes && (
                          <div className="mt-2 p-2 bg-neutral-50 rounded-lg">
                            <p className="text-xs text-neutral-600">{event.action_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {event.current_state === 'detected' && (
                        <>
                          <button
                            onClick={() => handleAction(event.id, 'warning')}
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            Send Warning
                          </button>
                          <button
                            onClick={() => handleAction(event.id, 'suspend')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Suspend
                          </button>
                        </>
                      )}
                      {event.current_state === 'warning_sent' && (
                        <>
                          <button
                            onClick={() => handleAction(event.id, 'suspend')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleAction(event.id, 'resolve')}
                            className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {event.current_state === 'account_reviewed' && (
                        <button
                          onClick={() => handleAction(event.id, 'resolve')}
                          className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
