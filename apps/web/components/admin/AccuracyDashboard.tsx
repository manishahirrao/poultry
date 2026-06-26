'use client';

import { useState } from 'react';
import { Download, ArrowClockwise, Shield, ChartLine } from '@phosphor-icons/react';
import { useWidgetData } from '@/hooks/useWidgetData';
import { MapeGauge } from './MapeGauge';
import { MapeTrendChart } from './MapeTrendChart';
import { ScatterPlotChart } from './ScatterPlotChart';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { ModelTimeline } from './ModelTimeline';
import { AccuracyDashboardPDF } from './AccuracyDashboardPDF';

// TypeScript Interfaces
interface AccuracyData {
  mape: number;
  directionalAccuracy: number;
  conformalCoverage: number;
  mapeTrend: Array<{ date: string; mape: number }>;
  scatterData: Array<{ actual: number; predicted: number; date: string }>;
  featureImportance: Array<{ feature: string; importance: number }>;
  modelTimeline: Array<{
    version: string;
    mape: number;
    directionalAccuracy: number;
    date: string;
    status: 'promoted' | 'rejected' | 'rollback';
  }>;
  lastUpdated: string;
}

interface AccuracyDashboardProps {
  userRole?: string;
}

export function AccuracyDashboard({ userRole = 'admin' }: AccuracyDashboardProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch accuracy data with 1-hour cache
  const { data, isLoading, isStale, refresh } = useWidgetData<AccuracyData>(
    async () => {
      const response = await fetch('/api/v1/admin/accuracy-data');
      if (!response.ok) {
        throw new Error('Failed to fetch accuracy data');
      }
      return response.json();
    },
    'accuracy-dashboard-data',
    {
      ttlMs: 60 * 60 * 1000, // 1-hour cache
      revalidateOnReconnect: true,
    }
  );

  // Mock data for development
  const mockData: AccuracyData = {
    mape: 4.8,
    directionalAccuracy: 96.2,
    conformalCoverage: 80.5,
    mapeTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mape: 4.5 + Math.random() * 1.5,
    })),
    scatterData: Array.from({ length: 30 }, (_, i) => ({
      actual: 160 + Math.random() * 10,
      predicted: 160 + Math.random() * 10,
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
    featureImportance: [
      { feature: 'feed_cost_lag42', importance: 0.35 },
      { feature: 'hpai_district_flag', importance: 0.22 },
      { feature: 'temperature_avg_7d', importance: 0.18 },
      { feature: 'mandi_price_lag7', importance: 0.15 },
      { feature: 'festival_indicator', importance: 0.10 },
    ],
    modelTimeline: [
      {
        version: 'v2.3.0',
        mape: 4.8,
        directionalAccuracy: 96.2,
        date: '2026-05-20',
        status: 'promoted',
      },
      {
        version: 'v2.2.1',
        mape: 5.1,
        directionalAccuracy: 95.8,
        date: '2026-05-13',
        status: 'rejected',
      },
      {
        version: 'v2.2.0',
        mape: 4.9,
        directionalAccuracy: 96.0,
        date: '2026-05-06',
        status: 'promoted',
      },
      {
        version: 'v2.1.5',
        mape: 5.5,
        directionalAccuracy: 94.5,
        date: '2026-04-29',
        status: 'rollback',
      },
      {
        version: 'v2.1.0',
        mape: 5.2,
        directionalAccuracy: 95.2,
        date: '2026-04-22',
        status: 'promoted',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  const displayData = data || mockData;

  const handlePDFExport = async () => {
    setIsGeneratingPDF(true);
    try {
      // Generate PDF using the PDF component
      // In production, this would use @react-pdf/renderer
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate PDF generation
      setShowPDF(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isEnterprise = userRole === 'enterprise';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Accuracy Dashboard
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Model performance metrics and validation results
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStale && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <Shield size={16} />
              <span>Data from 1h ago</span>
            </div>
          )}
          <button
            onClick={() => refresh()}
            className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1"
          >
            <ArrowClockwise size={16} />
            Refresh
          </button>
          {!isEnterprise && (
            <button
              onClick={handlePDFExport}
              disabled={isGeneratingPDF}
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-green-600 hover:bg-brand-green-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Download size={16} />
              {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Scorecard Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MapeGauge mape={displayData.mape} isLoading={isLoading} />
        <MapeGauge
          mape={100 - displayData.directionalAccuracy}
          label="Directional Accuracy"
          value={displayData.directionalAccuracy}
          unit="%"
          isLoading={isLoading}
        />
        <MapeGauge
          mape={Math.abs(80 - displayData.conformalCoverage)}
          label="Conformal Coverage"
          value={displayData.conformalCoverage}
          unit="%"
          targetRange={[78, 82]}
          isLoading={isLoading}
        />
      </div>

      {/* MAPE 30-Day Trend */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          MAPE 30-Day Trend
        </h3>
        <MapeTrendChart data={displayData.mapeTrend} isLoading={isLoading} />
      </div>

      {/* Scatter Plot and Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            P50 vs Actual Scatter Plot
          </h3>
          <ScatterPlotChart data={displayData.scatterData} isLoading={isLoading} />
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Feature Importance
          </h3>
          <FeatureImportanceChart data={displayData.featureImportance} isLoading={isLoading} />
        </div>
      </div>

      {/* Model Timeline - Admin Only */}
      {!isEnterprise && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Model Timeline
          </h3>
          <ModelTimeline data={displayData.modelTimeline} isLoading={isLoading} />
        </div>
      )}

      {/* PDF Export Modal */}
      {showPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Accuracy Report PDF</h3>
              <button
                onClick={() => setShowPDF(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                Close
              </button>
            </div>
            <AccuracyDashboardPDF data={displayData} />
          </div>
        </div>
      )}
    </div>
  );
}
