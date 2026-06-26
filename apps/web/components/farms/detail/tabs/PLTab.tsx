'use client';

/**
 * FlockIQ - P&L Tab
 * TASK-GAP1-UI-001: P&L Tab: Tab registration and page shell
 * TASK-GAP1-UI-002: P&L Summary Banner component
 * TASK-GAP1-UI-003: P&L Cost Sections (accordion)
 * TASK-GAP1-UI-004: P&L Waterfall Chart and Pie Chart
 * TASK-INT-002: Treatment cost → P&L auto-sync
 * Requirements: REQ-GAP1-PL-001 through REQ-GAP1-PL-006
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §1
 * 
 * This component implements the complete P&L management with:
 * - P&L Summary Banner with 6 KPI tiles (bilingual labels)
 * - Live Cost/Bird with color-coded target comparison
 * - Target Margin inline editing
 * - 6 Cost Sections (Chick, Feed, Medicine, Labour, Overhead, Other)
 * - Accordion-style sections with summary card view
 * - Waterfall chart with stacked bar trick
 * - Donut pie chart with innerRadius={60}
 * - "View as table" accessibility toggle
 * - SWR-based data fetching for real-time updates
 * - Integration with treatment cost auto-sync
 * 
 * Integration: Integrated into FarmDetailTabs.tsx as "P&L" tab
 */

import useSWR from 'swr';
import { PLSummaryBanner } from '@/components/farm/pl/PLSummaryBanner';
import { PLCostSections } from '@/components/farm/pl/PLCostSections';
import { PLWaterfallChart } from '@/components/farm/pl/PLWaterfallChart';

interface PLTabProps {
  farmId: string;
  batchId: string;
}

interface PLSummary {
  chick_total: number;
  feed_total: number;
  medicine_total: number;
  labour_total: number;
  overhead_total: number;
  other_total: number;
  grand_total: number;
  live_cost_per_bird: number;
  estimated_revenue: number;
  target_margin: number;
  target_cost_per_bird: number;
  days_to_harvest: number;
  current_price_p50?: number;
}

interface BatchCostRecord {
  cost_id: string;
  category: string;
  amount: number;
  description: string;
  entry_date: string;
}

interface PLData {
  costs: BatchCostRecord[];
  pl_summary: PLSummary;
  feed_costs: {
    total: number;
    avg_rate: number;
    total_mt: number;
  };
  medicine_costs: BatchCostRecord[];
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
};

export function PLTab({ farmId, batchId }: PLTabProps) {
  // Use SWR to fetch P&L data from the API
  const { data, error, isLoading, mutate } = useSWR<PLData>(
    `/api/v1/farms/${farmId}/costs?batchId=${batchId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Deduplicate requests within 30 seconds
    }
  );

  if (isLoading) {
    return <TabSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600">{error.message || 'Failed to load P&L data'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No P&L data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PLSummaryBanner 
        plSummary={data.pl_summary}
        currency="₹"
        batchDay={21}
        batchName="Batch #24"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PLCostSections 
            costs={data.costs}
            medicineCosts={data.medicine_costs}
            feedCosts={data.feed_costs}
            farmId={farmId}
            batchId={batchId}
          />
        </div>
        <div>
          <PLWaterfallChart 
            plSummary={data.pl_summary}
            isBatchClosed={false}
          />
        </div>
      </div>
    </div>
  );
}
