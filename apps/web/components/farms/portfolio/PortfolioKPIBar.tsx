'use client';

import { FarmMetricCard } from '../FarmMetricCard';
import { Warning } from '@phosphor-icons/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { WebTypography, WebSpacing, erpColors } from '@poultrypulse/ui';
import { useLanguage } from '@/providers/LanguageProvider';

interface PortfolioKPIBarProps {
  totalBirds: number;
  portfolioFCR: number;
  portfolioMortality: number;
  totalFeed: number;
  totalBirdsTrend?: number;
  portfolioFCRTrend?: number;
  portfolioMortalityTrend?: number;
  totalFeedTrend?: number;
  pendingLogsCount?: number;
  totalRevenue?: number;
  totalRevenueTrend?: number;
  lastUpdated?: Date;
  onPendingLogsClick?: () => void;
}

export function PortfolioKPIBar({
  totalBirds,
  portfolioFCR,
  portfolioMortality,
  totalFeed,
  totalBirdsTrend,
  portfolioFCRTrend,
  portfolioMortalityTrend,
  totalFeedTrend,
  pendingLogsCount = 0,
  totalRevenue = 0,
  totalRevenueTrend,
  lastUpdated,
  onPendingLogsClick,
}: PortfolioKPIBarProps) {
  const { language } = useLanguage();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between" style={{ marginBottom: WebSpacing.mobile.md }}>
        <h2 className="text-sm font-semibold" style={{ color: erpColors.textPrimary, fontSize: WebTypography.bodySmall.fontSize, fontWeight: WebTypography.bodySmall.fontWeight }}>{language === 'hi' ? 'पोर्टफोलियो अवलोकन' : 'Portfolio Overview'}</h2>
        {lastUpdated && (
          <div className="text-xs" style={{ color: erpColors.textSecondary, fontSize: '0.75rem', lineHeight: 1.4 }}>
            {language === 'hi' ? 'अपडेट किया गया' : 'Updated'} {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <FarmMetricCard
        label="Total Birds"
        labelHi="कुल पक्षी"
        value={totalBirds.toLocaleString('en-IN')}
        trend={totalBirdsTrend}
        trendDirection={totalBirdsTrend && totalBirdsTrend > 0 ? 'up' : totalBirdsTrend && totalBirdsTrend < 0 ? 'down' : 'neutral'}
      />
      <FarmMetricCard
        label="Avg FCR"
        labelHi="औसत FCR"
        value={portfolioFCR.toFixed(3)}
        trend={portfolioFCRTrend}
        trendDirection={portfolioFCRTrend && portfolioFCRTrend > 0 ? 'down' : portfolioFCRTrend && portfolioFCRTrend < 0 ? 'up' : 'neutral'}
        statusColour={portfolioFCR < 1.7 ? 'green' : portfolioFCR < 1.9 ? 'green' : portfolioFCR < 2.1 ? 'amber' : 'red'}
      />
      <FarmMetricCard
        label="Mortality Rate"
        labelHi="मृत्यु दर"
        value={`${portfolioMortality.toFixed(1)}%`}
        trend={portfolioMortalityTrend}
        trendDirection={portfolioMortalityTrend && portfolioMortalityTrend > 0 ? 'up' : portfolioMortalityTrend && portfolioMortalityTrend < 0 ? 'down' : 'neutral'}
        statusColour={portfolioMortality < 3 ? 'green' : portfolioMortality < 5 ? 'amber' : 'red'}
      />
      <FarmMetricCard
        label="Feed Consumed"
        labelHi="फीड खपत"
        value={totalFeed.toFixed(1)}
        unit="MT"
        trend={totalFeedTrend}
        trendDirection={totalFeedTrend && totalFeedTrend > 0 ? 'up' : totalFeedTrend && totalFeedTrend < 0 ? 'down' : 'neutral'}
      />
      <FarmMetricCard
        label="Total Revenue"
        labelHi="कुल राजस्व"
        value={`₹${totalRevenue >= 10000000 ? (totalRevenue / 10000000).toFixed(1) + 'Cr' : totalRevenue >= 100000 ? (totalRevenue / 100000).toFixed(1) + 'L' : totalRevenue.toLocaleString('en-IN')}`}
        trend={totalRevenueTrend}
        trendDirection={totalRevenueTrend && totalRevenueTrend > 0 ? 'up' : totalRevenueTrend && totalRevenueTrend < 0 ? 'down' : 'neutral'}
        statusColour={totalRevenue > 0 ? 'green' : 'neutral'}
      />
      {pendingLogsCount > 0 ? (
        <Link
          href="/dashboard/farms?filter=pending-logs"
          className="bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer hover:shadow-md hover:border-amber-300"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">{language === 'hi' ? 'लंबित लॉग' : 'Pending Logs'}</span>
            <Warning size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-600">
              {pendingLogsCount}
            </span>
            <span className="text-xs text-gray-500">{language === 'hi' ? 'फार्म' : 'farms'}</span>
          </div>
          <p className="text-xs text-amber-600 mt-1">{language === 'hi' ? 'फ़िल्टर करने के लिए क्लिक करें' : 'Click to filter'} →</p>
        </Link>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">{language === 'hi' ? 'लंबित लॉग' : 'Pending Logs'}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {pendingLogsCount}
            </span>
            <span className="text-xs text-gray-500">{language === 'hi' ? 'फार्म' : 'farms'}</span>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
