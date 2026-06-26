'use client';

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FCRTrendChart } from './charts/FCRTrendChart';
import { MortalityChart } from './charts/MortalityChart';
import { WeightProgressionChart } from './charts/WeightProgressionChart';
import { FeedIntakeChart } from './charts/FeedIntakeChart';
import { ADGChart } from './charts/ADGChart';
import { EnvironmentTrends } from './charts/EnvironmentTrends';

interface MetricsTabProps {
  farmId: string;
  batchId: string;
  breed?: string;
  placementDate?: string;
}

export function MetricsTab({ farmId, batchId, breed = 'Ross 308', placementDate }: MetricsTabProps) {
  return (
    <div className="space-y-6">
      {/* Row 1: 3 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">FCR Trend</h3>
          <FCRTrendChart batchId={batchId} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Mortality Cumulative</h3>
          <MortalityChart batchId={batchId} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Weight Progression</h3>
          <WeightProgressionChart 
            batchId={batchId} 
            breed={breed} 
            docPlacementDate={placementDate || new Date().toISOString()} 
          />
        </div>
      </div>

      {/* Row 2: 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Feed Intake per Bird</h3>
          <FeedIntakeChart batchId={batchId} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Weight Gain</h3>
          <ADGChart batchId={batchId} />
        </div>
      </div>

      {/* Environment Trends Section */}
      <EnvironmentTrends farmId={farmId} batchId={batchId} breed={breed} />
    </div>
  );
}
