'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { BatchProfitCalculator } from '@/components/dashboard/calculator/BatchProfitCalculator';
import { FeedCostTiming } from '@/components/dashboard/calculator/FeedCostTiming';
import { MultiFarmView } from '@/components/dashboard/calculator/MultiFarmView';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

type Tab = 'batch-profit' | 'feed-cost' | 'multi-farm';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('batch-profit');
  
  // FORCE DEMO MODE - use mock customer for testing
  const customer = {
    id: 'demo-customer',
    name: 'Demo Farmer',
    segment: 'S2',
    role: 'user',
    plan: 'PULSE_PRO',
    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    district: 'gorakhpur',
  };

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Tools
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Batch Profit Calculator</h1>
        <p className="text-base text-neutral-600 mt-2">
          Calculate batch profitability and optimal selling timing for poultry farms
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
        <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-1">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('batch-profit')}
              className={`px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative whitespace-nowrap rounded-xl ${
                activeTab === 'batch-profit'
                  ? 'text-neutral-900 bg-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
            >
              Batch Profit
            </button>
            <button 
              onClick={() => setActiveTab('feed-cost')}
              className={`px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative whitespace-nowrap rounded-xl ${
                activeTab === 'feed-cost'
                  ? 'text-neutral-900 bg-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
            >
              Feed Cost Timing
            </button>
            {customer.segment === 'S2' && (
              <button 
                onClick={() => setActiveTab('multi-farm')}
                className={`px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative whitespace-nowrap rounded-xl ${
                  activeTab === 'multi-farm'
                    ? 'text-neutral-900 bg-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                }`}
              >
                Multi-Farm View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'batch-profit' && <BatchProfitCalculator customer={customer} />}
      {activeTab === 'feed-cost' && <FeedCostTiming />}
      {activeTab === 'multi-farm' && customer.segment === 'S2' && <MultiFarmView />}
    </div>
  );
}
