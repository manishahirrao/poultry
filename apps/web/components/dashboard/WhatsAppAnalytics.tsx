'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBar, 
  Clock, 
  TrendUp, 
  Users, 
  WarningCircle,
  ArrowClockwise,
  Calendar
} from '@phosphor-icons/react';

interface AnalyticsSummary {
  period_days: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  deep_link_click_count: number;
  delivery_rate: number;
  read_rate: number;
  ctr: number;
  by_message_type: Array<{
    message_type: string;
    count: number;
  }>;
}

interface HeatmapData {
  day_of_week: number;
  hour_of_day: number;
  sent_count: number;
  read_count: number;
  open_rate: number;
}

interface ChurnRiskCustomer {
  customer_id: string;
  customer_id_truncated: string;
  consecutive_unread_count: number;
  last_message_sent_at: string;
  subscription_mrr: number;
}

interface WhatsAppAnalyticsProps {
  periodDays?: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WhatsAppAnalytics({ periodDays = 30 }: WhatsAppAnalyticsProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [churnRisk, setChurnRisk] = useState<ChurnRiskCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch summary
      const summaryRes = await fetch(`/api/v1/whatsapp/analytics/summary?days=${periodDays}`);
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch heatmap
      const heatmapRes = await fetch(`/api/v1/whatsapp/analytics/heatmap?days=7`);
      if (!heatmapRes.ok) throw new Error('Failed to fetch heatmap');
      const heatmapData = await heatmapRes.json();
      setHeatmap(heatmapData.heatmap_data || []);

      // Fetch churn risk
      const churnRes = await fetch('/api/v1/whatsapp/analytics/churn-risk');
      if (!churnRes.ok) throw new Error('Failed to fetch churn risk');
      const churnData = await churnRes.json();
      setChurnRisk(churnData.high_churn_risk_customers || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [periodDays]);

  const getHeatmapColor = (openRate: number): string => {
    if (openRate >= 70) return 'bg-green-500';
    if (openRate >= 50) return 'bg-green-400';
    if (openRate >= 30) return 'bg-yellow-400';
    if (openRate >= 10) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const formatCurrencyDollar = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
        <WarningCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load analytics</h3>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
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
          <h1 className="text-2xl font-semibold text-neutral-900">WhatsApp Analytics</h1>
          <p className="text-neutral-600 text-sm mt-1">Message delivery and engagement metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <ArrowClockwise size={16} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <ChartBar size={20} className="text-brandGreen500" />
              <h3 className="text-sm font-semibold text-neutral-900">Messages Sent</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 font-mono">{summary.sent_count.toLocaleString()}</p>
            <p className="text-sm text-neutral-600 mt-1">Last {periodDays} days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendUp size={20} className="text-green-500" />
              <h3 className="text-sm font-semibold text-neutral-900">Delivery Rate</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 font-mono">{summary.delivery_rate.toFixed(1)}%</p>
            <p className="text-sm text-neutral-600 mt-1">{summary.delivered_count.toLocaleString()} delivered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-neutral-900">Read Rate</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 font-mono">{summary.read_rate.toFixed(1)}%</p>
            <p className="text-sm text-neutral-600 mt-1">{summary.read_count.toLocaleString()} read</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-neutral-900">CTR</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 font-mono">{summary.ctr.toFixed(1)}%</p>
            <p className="text-sm text-neutral-600 mt-1">{summary.deep_link_click_count.toLocaleString()} clicks</p>
          </motion.div>
        </div>
      )}

      {/* Message Type Breakdown */}
      {summary && summary.by_message_type.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Messages by Type</h3>
          <div className="space-y-3">
            {summary.by_message_type.map((type) => (
              <div key={type.message_type} className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 capitalize">
                  {type.message_type.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-brandGreen500 h-2 rounded-full"
                      style={{ width: `${(type.count / summary.sent_count) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 w-16 text-right">
                    {type.count.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Engagement Heatmap */}
      {heatmap.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Engagement Heatmap</h3>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span>Low</span>
              <div className="flex gap-0.5">
                <div className="w-4 h-4 bg-red-400 rounded" />
                <div className="w-4 h-4 bg-orange-400 rounded" />
                <div className="w-4 h-4 bg-yellow-400 rounded" />
                <div className="w-4 h-4 bg-green-400 rounded" />
                <div className="w-4 h-4 bg-green-500 rounded" />
              </div>
              <span>High</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex mb-2">
                <div className="w-12" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-xs text-neutral-500">
                    {i}
                  </div>
                ))}
              </div>
              
              {/* Day rows */}
              {DAY_NAMES.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-xs text-neutral-600 font-medium">{day}</div>
                  {Array.from({ length: 24 }, (_, hourIndex) => {
                    const cellData = heatmap.find(
                      d => d.day_of_week === dayIndex && d.hour_of_day === hourIndex
                    );
                    const openRate = cellData?.open_rate || 0;
                    const sentCount = cellData?.sent_count || 0;
                    
                    return (
                      <div
                        key={hourIndex}
                        className={`flex-1 aspect-square rounded-sm ${sentCount > 0 ? getHeatmapColor(openRate) : 'bg-neutral-100'}`}
                        title={`${day} ${hourIndex}:00 - Open Rate: ${openRate.toFixed(1)}% (${sentCount} sent)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* High Churn Risk Customers */}
      {churnRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <WarningCircle size={20} className="text-amber-500" />
            <h3 className="text-lg font-semibold text-neutral-900">High Churn Risk Customers</h3>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              {churnRisk.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-sm font-semibold text-neutral-900 pb-3">Customer ID</th>
                  <th className="text-left text-sm font-semibold text-neutral-900 pb-3">Consecutive Unread</th>
                  <th className="text-left text-sm font-semibold text-neutral-900 pb-3">Last Message</th>
                  <th className="text-left text-sm font-semibold text-neutral-900 pb-3">MRR</th>
                </tr>
              </thead>
              <tbody>
                {churnRisk.map((customer) => (
                  <tr key={customer.customer_id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-3 text-sm text-neutral-700 font-mono">
                      {customer.customer_id_truncated}...
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {customer.consecutive_unread_count}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-neutral-600">
                      {new Date(customer.last_message_sent_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm font-semibold text-neutral-900">
                      {formatCurrencyDollar(customer.subscription_mrr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {churnRisk.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-2xl p-12 border border-neutral-200 text-center"
        >
          <Users size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No High Churn Risk Customers</h3>
          <p className="text-neutral-600">All customers are engaging well with WhatsApp messages</p>
        </motion.div>
      )}
    </div>
  );
}
