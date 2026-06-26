'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChartLine, Calendar, Pill, Leaf, Scroll, WhatsappLogo, Coin, Truck, FileText, TrendUp, NotePencil } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

// Lazy load tab components
const MetricsTab = dynamic(() => import('./tabs/MetricsTab').then(mod => ({ default: mod.MetricsTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const DailyLogTab = dynamic(() => import('./tabs/DailyLogTab').then(mod => ({ default: mod.DailyLogTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const HealthTab = dynamic(() => import('./tabs/HealthTab').then(mod => ({ default: mod.HealthTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const FeedTab = dynamic(() => import('./tabs/FeedTab').then(mod => ({ default: mod.FeedTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const BatchHistoryTab = dynamic(() => import('./tabs/BatchHistoryTab').then(mod => ({ default: mod.BatchHistoryTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const PLTab = dynamic(() => import('./tabs/PLTab').then(mod => ({ default: mod.PLTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const SalesTab = dynamic(() => import('./tabs/SalesTab').then(mod => ({ default: mod.SalesTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const DocsTab = dynamic(() => import('./tabs/DocsTab').then(mod => ({ default: mod.DocsTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const WhatsAppTab = dynamic(() => import('./tabs/WhatsAppTab').then(mod => ({ default: (mod as any).default || mod })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const GCTab = dynamic(() => import('./tabs/GCTab').then(mod => ({ default: mod.GCTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

const NotesTab = dynamic(() => import('./tabs/NotesTab').then(mod => ({ default: mod.NotesTab })), {
  loading: () => <TabSkeleton />,
  ssr: false,
});

interface FarmDetailTabsProps {
  farm: any;
  batch?: any;
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

export function FarmDetailTabs({ farm, batch }: FarmDetailTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('metrics');

  // Sync with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['metrics', 'daily-log', 'health', 'feed', 'pl', 'sales', 'batch-history', 'docs', 'whatsapp', 'gc', 'notes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without page refresh
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`/dashboard/farms/${farm.id}?${params.toString()}`, { scroll: false });
  };

  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: ChartLine },
    { id: 'daily-log', label: 'Daily Log', icon: Calendar },
    { id: 'health', label: 'Health', icon: Pill },
    { id: 'feed', label: 'Feed', icon: Leaf },
    { id: 'gc', label: 'GC / लागत', icon: TrendUp },
    { id: 'pl', label: 'P&L', icon: Coin },
    { id: 'sales', label: 'Sales', icon: Truck },
    { id: 'batch-history', label: 'Batch History', icon: Scroll },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp', icon: WhatsappLogo },
    { id: 'notes', label: 'Notes', icon: NotePencil },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 min-w-max ${
                activeTab === tab.id
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <Icon size={18} weight={activeTab === tab.id ? 'fill' : 'regular'} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' / ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <Suspense fallback={<TabSkeleton />}>
          {activeTab === 'metrics' && batch && (
            <MetricsTab 
              farmId={farm.id} 
              batchId={batch.id} 
              breed={batch.breed} 
              placementDate={batch.placement_date} 
            />
          )}
          {activeTab === 'daily-log' && batch && (
            <DailyLogTab 
              farmId={farm.id} 
              batchId={batch.id}
              birdsPlaced={batch.birds_placed}
              birdsAlive={batch.birds_alive}
              cumulativeFeedKg={batch.cumulative_feed_kg}
              cumulativeDead={batch.cumulative_dead}
              yesterdayWeight={batch.yesterday_weight}
            />
          )}
          {activeTab === 'health' && batch && (
            <HealthTab farmId={farm.id} batchId={batch.id} district={farm.district || ''} />
          )}
          {activeTab === 'feed' && batch && (
            <FeedTab farmId={farm.id} batchId={batch.id} />
          )}
          {activeTab === 'gc' && batch && (
            <GCTab 
              farmId={farm.id} 
              batchId={batch.id} 
              birdsPlaced={batch.birds_placed}
            />
          )}
          {activeTab === 'batch-history' && (
            <BatchHistoryTab farmId={farm.id} />
          )}
          {activeTab === 'pl' && batch && (
            <PLTab farmId={farm.id} batchId={batch.id} />
          )}
          {activeTab === 'sales' && batch && (
            <SalesTab farmId={farm.id} batchId={batch.id} />
          )}
          {activeTab === 'docs' && (
            <DocsTab farmId={farm.id} batchId={batch?.id} />
          )}
          {activeTab === 'whatsapp' && (
            <WhatsAppTab />
          )}
          {activeTab === 'notes' && (
            <NotesTab farmId={farm.id} />
          )}
          {!batch && activeTab !== 'batch-history' && activeTab !== 'docs' && activeTab !== 'whatsapp' && activeTab !== 'notes' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No active batch. Start a new batch to view this tab.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
