'use client';

import { useState, useEffect } from 'react';
import { TrendDown, TrendUp, Users, Gift, Warning, CurrencyDollar } from '@phosphor-icons/react';

interface RetentionMetrics {
  period: string;
  metrics: {
    totalCustomers: number;
    churnCount: number;
    churnRate: number;
    mrrLost: number;
    saveOffersPresented: number;
    saveOffersAccepted: number;
    saveRate: number;
  };
  breakdowns: {
    reasons: Record<string, number>;
    byTier: Record<string, number>;
    byCohort: Record<string, number>;
  };
}

export function RetentionDashboard() {
  const [metrics, setMetrics] = useState<RetentionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/retention?period=${period}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching retention metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <p className="text-neutral-600">Unable to load retention metrics</p>
      </div>
    );
  }

  const reasonLabels: Record<string, string> = {
    'TOO_EXPENSIVE': 'Too Expensive',
    'NOT_USING_ENOUGH': 'Not Using Enough',
    'TECHNICAL_ISSUES': 'Technical Issues',
    'MISSING_FEATURES': 'Missing Features',
    'COMPETITOR': 'Competitor',
    'SEASONAL_PAUSE': 'Seasonal Pause',
    'FARM_SOLD': 'Farm Sold',
    'OTHER': 'Other',
  };

  const topReasons = Object.entries(metrics.breakdowns.reasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Retention Analytics</h3>
          <p className="text-sm text-neutral-600">Track churn prevention performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendDown size={20} className="text-red-600" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Churn Rate</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{metrics.metrics.churnRate}%</div>
          <div className="text-xs text-neutral-600 mt-1">{metrics.metrics.churnCount} customers</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CurrencyDollar size={20} className="text-amber-600" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-wide">MRR Lost</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">₹{metrics.metrics.mrrLost.toLocaleString()}</div>
          <div className="text-xs text-neutral-600 mt-1">Revenue at risk</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift size={20} className="text-green-600" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Save Rate</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{metrics.metrics.saveRate}%</div>
          <div className="text-xs text-neutral-600 mt-1">{metrics.metrics.saveOffersAccepted}/{metrics.metrics.saveOffersPresented} offers</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Total Customers</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{metrics.metrics.totalCustomers}</div>
          <div className="text-xs text-neutral-600 mt-1">Active in period</div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancellation Reasons */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h4 className="text-base font-semibold text-neutral-900 mb-4">Top Cancellation Reasons</h4>
          {topReasons.length > 0 ? (
            <div className="space-y-3">
              {topReasons.map(([reason, count]) => (
                <div key={reason} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-neutral-800">
                        {reasonLabels[reason] || reason}
                      </span>
                      <span className="text-sm text-neutral-600">{count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(count / metrics.metrics.churnCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No cancellation data available</p>
          )}
        </div>

        {/* Churn by Subscription Tier */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h4 className="text-base font-semibold text-neutral-900 mb-4">Churn by Plan Tier</h4>
          {Object.keys(metrics.breakdowns.byTier).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(metrics.breakdowns.byTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-neutral-800">{tier}</span>
                      <span className="text-sm text-neutral-600">{count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(count / metrics.metrics.churnCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No tier data available</p>
          )}
        </div>
      </div>

      {/* Churn by Cohort */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h4 className="text-base font-semibold text-neutral-900 mb-4">Churn by Customer Cohort (Subscription Age)</h4>
        {Object.keys(metrics.breakdowns.byCohort).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.breakdowns.byCohort).map(([cohort, count]) => (
              <div key={cohort} className="p-4 bg-neutral-50 rounded-xl">
                <div className="text-2xl font-bold text-neutral-900">{count}</div>
                <div className="text-xs text-neutral-600 mt-1">{cohort}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">No cohort data available</p>
        )}
      </div>

      {/* Risk Alert */}
      {metrics.metrics.churnRate > 10 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">High Churn Rate Alert</p>
              <p className="text-xs text-red-700">
                Current churn rate ({metrics.metrics.churnRate}%) exceeds 10% threshold. 
                Consider reviewing cancellation reasons and optimizing save offers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
