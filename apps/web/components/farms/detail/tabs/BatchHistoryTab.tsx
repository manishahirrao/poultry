'use client';

import { FileText } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';

interface BatchHistoryTabProps {
  farmId: string;
}

// Mock batch history data
const mockBatchHistory = [
  { 
    batchNumber: 6, 
    breed: 'Cobb 430', 
    placed: '2026-03-01', 
    birdsIn: 25000, 
    birdsOut: 24200, 
    mortality: 3.2, 
    fcr: 1.85, 
    avgWeight: 2100, 
    revenue: 1250000, 
    profit: 180000, 
    duration: 42,
    finalGC: 78.50,
    status: 'closed'
  },
  { 
    batchNumber: 5, 
    breed: 'Cobb 430', 
    placed: '2026-01-15', 
    birdsIn: 25000, 
    birdsOut: 24100, 
    mortality: 3.6, 
    fcr: 1.88, 
    avgWeight: 2080, 
    revenue: 1200000, 
    profit: 150000, 
    duration: 43,
    finalGC: 79.20,
    status: 'closed'
  },
  { 
    batchNumber: 4, 
    breed: 'Ross 308', 
    placed: '2025-11-20', 
    birdsIn: 20000, 
    birdsOut: 19300, 
    mortality: 3.5, 
    fcr: 1.82, 
    avgWeight: 2050, 
    revenue: 950000, 
    profit: 120000, 
    duration: 41,
    finalGC: 76.80,
    status: 'closed'
  },
];

export function BatchHistoryTab({ farmId }: BatchHistoryTabProps) {
  const { entitlements } = useEntitlements();
  const batchHistoryAccess = canAccess(entitlements, FEATURES.BATCH_HISTORY);
  
  // Limit batch history based on plan (FARM: 3 batches, PRO: unlimited)
  const batchLimit = batchHistoryAccess.limitValue || null; // null = unlimited
  const limitedBatchHistory = batchLimit ? mockBatchHistory.slice(0, batchLimit) : mockBatchHistory;
  
  const avgFCR = limitedBatchHistory.reduce((sum, b) => sum + b.fcr, 0) / limitedBatchHistory.length;
  const avgMortality = limitedBatchHistory.reduce((sum, b) => sum + b.mortality, 0) / limitedBatchHistory.length;
  const avgProfit = limitedBatchHistory.reduce((sum, b) => sum + b.profit, 0) / limitedBatchHistory.length;
  const avgFinalGC = limitedBatchHistory.reduce((sum, b) => sum + b.finalGC, 0) / limitedBatchHistory.length;

  // Get colour coding for Final GC
  const getGCColour = (gc: number) => {
    if (gc <= 80) return 'text-green-600'; // Good - low GC
    if (gc <= 90) return 'text-amber-600'; // Moderate
    return 'text-red-600'; // Poor - high GC
  };

  return (
    <div className="space-y-6">
      {/* Batch History Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Batch #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Breed</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Placed</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Birds In</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Birds Out</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Mortality %</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">FCR</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Avg Weight</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Final GC (₹/kg)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Revenue</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Profit</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Report</th>
              </tr>
            </thead>
            <tbody>
              {limitedBatchHistory.map((batch, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-900 font-semibold">#{batch.batchNumber}</td>
                  <td className="px-4 py-3 text-gray-900">{batch.breed}</td>
                  <td className="px-4 py-3 text-gray-900">{batch.placed}</td>
                  <td className="px-4 py-3 text-gray-900">{batch.birdsIn.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900">{batch.birdsOut.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900">{batch.mortality.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-gray-900">{batch.fcr.toFixed(3)}</td>
                  <td className="px-4 py-3 text-gray-900">{batch.avgWeight}g</td>
                  <td className={`px-4 py-3 font-semibold ${getGCColour(batch.finalGC)}`}>₹{batch.finalGC.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-900">₹{(batch.revenue / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-gray-900">₹{(batch.profit / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-gray-900">{batch.duration} days</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/reports/integrator?batchId=${batch.batchNumber}`}
                      className="inline-flex items-center gap-1 text-green-700 hover:text-green-800"
                    >
                      <FileText size={16} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farm Lifetime Averages */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Lifetime Averages</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg FCR</p>
            <p className="text-2xl font-bold text-gray-900">{avgFCR.toFixed(3)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Mortality</p>
            <p className="text-2xl font-bold text-gray-900">{avgMortality.toFixed(2)}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Final GC</p>
            <p className="text-2xl font-bold text-gray-900">₹{avgFinalGC.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Revenue/Batch</p>
            <p className="text-2xl font-bold text-gray-900">₹{(limitedBatchHistory.reduce((sum, b) => sum + b.revenue, 0) / limitedBatchHistory.length / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Profit/Batch</p>
            <p className="text-2xl font-bold text-gray-900">₹{(avgProfit / 1000).toFixed(0)}K</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          {limitedBatchHistory.length} batches completed since onboarding
          {batchLimit && mockBatchHistory.length > batchLimit && ` (showing last ${batchLimit})`}
        </p>
      </div>
    </div>
  );
}
