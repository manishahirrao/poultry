'use client';

import { TrendUp, Flame, MapPin } from '@phosphor-icons/react';

interface DemandSignalPanelProps {
  isLoading?: boolean;
}

export function DemandSignalPanel({ isLoading }: DemandSignalPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="h-32 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Mock demand signal data
  const demandSignals = [
    {
      district: 'Gorakhpur',
      demandLevel: 'high',
      reason: 'Broiler prices up 8% - farmers holding birds longer',
      heatIndex: 85,
    },
    {
      district: 'Deoria',
      demandLevel: 'medium',
      reason: 'Stable prices - normal consumption',
      heatIndex: 62,
    },
    {
      district: 'Kushinagar',
      demandLevel: 'high',
      reason: 'New integrator onboarding - increased capacity',
      heatIndex: 78,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={20} className="text-orange-500" />
        <h3 className="text-lg font-semibold text-neutral-900">
          Feed Demand Signal Index
        </h3>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
          S3 Feed Manufacturers
        </span>
      </div>

      <div className="space-y-4">
        {demandSignals.map((signal) => (
          <div
            key={signal.district}
            className={`p-4 rounded-xl border ${
              signal.demandLevel === 'high'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-neutral-600" />
                <span className="font-semibold text-neutral-900">{signal.district}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendUp size={16} className={signal.demandLevel === 'high' ? 'text-orange-600' : 'text-neutral-600'} />
                <span className="text-sm font-medium text-neutral-700">{signal.heatIndex}%</span>
              </div>
            </div>
            <p className="text-sm text-neutral-600 mb-2">{signal.reason}</p>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  signal.demandLevel === 'high' ? 'bg-orange-500' : 'bg-neutral-400'
                }`}
                style={{ width: `${signal.heatIndex}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Demand signals are based on broiler price trends as a proxy for feed
          consumption. High broiler prices typically indicate farmers holding birds longer, resulting in
          increased feed demand.
        </p>
      </div>
    </div>
  );
}
