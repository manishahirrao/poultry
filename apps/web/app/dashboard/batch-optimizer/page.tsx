import { Metadata } from 'next';
import { BatchRoiOptimizer } from '@/components/dashboard/calculator/BatchRoiOptimizer';

export const metadata: Metadata = {
  title: 'Batch Optimizer — FlockIQ',
  description: 'ROI calculator for batch sell decisions',
};

export default function BatchOptimizerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Batch ROI Optimizer
        </h1>
        <p className="text-neutral-600">
          Calculate the optimal time to sell your batch based on price forecasts, feed costs, and mortality risk
        </p>
      </div>
      <BatchRoiOptimizer />
    </div>
  );
}
