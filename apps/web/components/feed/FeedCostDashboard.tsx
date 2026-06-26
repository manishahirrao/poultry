'use client';

import { useState } from 'react';
import { TrendUp, TrendDown, Warning, Info } from '@phosphor-icons/react';
import { useWidgetData } from '@/hooks/useWidgetData';
import { CommodityPricesSection } from '@/app/dashboard/feed/components/CommodityPricesSection';
import { ProcurementRecommendation } from './ProcurementRecommendation';
import { FeedCostImpactCalculator } from './FeedCostImpactCalculator';
import { CommodityPriceChart } from './CommodityPriceChart';
import { DemandSignalPanel } from './DemandSignalPanel';
import { FarmsNeedingRestock } from './FarmsNeedingRestock';
import { FeedCompanyPricesTable } from './FeedCompanyPricesTable';
import { FeedCompanyPriceTrendChart } from './FeedCompanyPriceTrendChart';

// TypeScript Interfaces
interface CommodityData {
  maize: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
  soya: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
  palmOil: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
  composite: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
}

interface ForecastData {
  date: string;
  maizeActual?: number;
  maizeForecast?: number;
  soyaActual?: number;
  soyaForecast?: number;
}

interface FeedCostData {
  commodities: CommodityData;
  forecast: ForecastData[];
  recommendation: 'BUY_NOW' | 'WAIT' | 'NEUTRAL';
  recommendationReason: string;
  estimatedSavings: number;
  lastUpdated: string;
}

export function FeedCostDashboard({ userRole = 'user' }: { userRole?: string }) {
  const [showCalculator, setShowCalculator] = useState(false);

  // Fetch feed cost data with 48-hour cache (per REQ-006 §6.6)
  const { data, isLoading, isStale, refresh } = useWidgetData<FeedCostData>(
    async () => {
      const response = await fetch('/api/v1/feed/commodity-data');
      if (!response.ok) {
        throw new Error('Failed to fetch commodity data');
      }
      return response.json();
    },
    'feed-cost-data',
    {
      ttlMs: 48 * 60 * 60 * 1000, // 48-hour cache
      revalidateOnReconnect: true,
    }
  );

  // Mock data for development (replace with actual API call)
  const mockData: FeedCostData = {
    commodities: {
      maize: { price: 2200, delta: 50, trend: 'up' },
      soya: { price: 3800, delta: -30, trend: 'down' },
      palmOil: { price: 1400, delta: 20, trend: 'up' },
      composite: { price: 2850, delta: 35, trend: 'up' },
    },
    forecast: Array.from({ length: 21 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maizeActual: i < 7 ? 2200 + i * 10 : undefined,
      maizeForecast: i >= 7 ? 2270 + (i - 7) * 8 : undefined,
      soyaActual: i < 7 ? 3800 - i * 5 : undefined,
      soyaForecast: i >= 7 ? 3765 - (i - 7) * 3 : undefined,
    })),
    recommendation: 'BUY_NOW',
    recommendationReason: '14-day forecast shows 5.2% uptrend in maize prices',
    estimatedSavings: 42000,
    lastUpdated: new Date().toISOString(),
  };

  const displayData = data || mockData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Feed Cost Intelligence
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Commodity prices and procurement timing recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStale && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <Warning size={16} />
              <span>Data from 48h ago</span>
            </div>
          )}
          <button
            onClick={() => refresh()}
            className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Commodity Prices with Expandable Rows */}
      <CommodityPricesSection
        commodities={displayData.commodities}
        isLoading={isLoading}
      />

      {/* Feed Company Price Comparison Table */}
      <FeedCompanyPricesTable isLoading={isLoading} />

      {/* Feed Company Price Trend Chart */}
      <FeedCompanyPriceTrendChart isLoading={isLoading} />

      {/* Farms Needing Restock in Next 14 Days */}
      <FarmsNeedingRestock isLoading={isLoading} />

      {/* Procurement Recommendation */}
      <ProcurementRecommendation
        recommendation={displayData.recommendation}
        reason={displayData.recommendationReason}
        estimatedSavings={displayData.estimatedSavings}
        isLoading={isLoading}
      />

      {/* Commodity Price Chart */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            14-Day Commodity Forecast
          </h3>
          <div className="flex items-center gap-1 text-amber-600 text-xs">
            <Info size={14} />
            <span>Feed price forecast: indicative only. MAPE target &lt;12%</span>
          </div>
        </div>
        <CommodityPriceChart
          data={displayData.forecast}
          isLoading={isLoading}
        />
      </div>

      {/* Feed Cost Impact Calculator */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Feed Cost Impact Calculator
          </h3>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-sm text-brand-green-600 hover:text-brand-green-700 font-medium"
          >
            {showCalculator ? 'Hide' : 'Show'} Calculator
          </button>
        </div>
        {showCalculator && (
          <FeedCostImpactCalculator
            commodities={displayData.commodities}
            forecast={displayData.forecast}
          />
        )}
      </div>

      {/* S3 Feed Manufacturer Demand Signal Panel (Admin Only) */}
      {(userRole === 'admin' || userRole === 'enterprise') && (
        <DemandSignalPanel isLoading={isLoading} />
      )}
    </div>
  );
}
