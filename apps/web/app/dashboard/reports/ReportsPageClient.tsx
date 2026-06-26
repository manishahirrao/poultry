'use client'

import Link from 'next/link'
import { FileText, TrendingUp, IndianRupee, Activity } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react'
import { FeatureGate } from '@/components/plans/FeatureGate'
import { FEATURES } from '@/lib/plans/featureGates'

interface ReportsPageClientProps {
  farms: any[]
  batches: any[]
  closedBatches: any[]
  activeBatches: any[]
}

export function ReportsPageClient({
  farms,
  batches,
  closedBatches,
  activeBatches,
}: ReportsPageClientProps) {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600 mt-1">
          Batch reports, performance analysis, and financial summaries
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Closed Batches</p>
              <p className="text-2xl font-bold text-gray-900">{closedBatches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-gray-900">{activeBatches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Farms</p>
              <p className="text-2xl font-bold text-gray-900">{farms.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GC Calculation Report */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GC Calculation Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Calculate and print Grower Compensation (GC) for farmers based on boiler code and performance metrics.
                </p>
                <Link
                  href="/dashboard/reports/gc-calculation"
                  className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 hover:underline"
                >
                  Calculate GC →
                </Link>
              </div>
            </div>
          </div>

          {/* Batch Report */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive batch performance report including growth, mortality, feed, health, and financial summary.
                </p>
                {closedBatches.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Recent Closed Batches:</p>
                    {closedBatches.slice(0, 3).map((batch: any) => (
                      <Link
                        key={batch.id}
                        href={`/dashboard/reports/integrator?batchId=${batch.id}`}
                        className="block text-sm text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        {batch.farm?.name} — Batch #{batch.batch_number}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No closed batches available for reporting</p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Farm Comparison</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compare performance metrics across multiple farms to identify best practices and areas for improvement.
                </p>
                <Link
                  href="/dashboard/farms/compare"
                  className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-800 hover:underline"
                >
                  Go to Farm Comparison →
                </Link>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-6 h-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Summary</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed financial analysis including feed costs, DOC costs, revenue projections, and profit margins.
                </p>
                <p className="text-sm text-gray-500 italic">Available in batch reports</p>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-indigo-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Metrics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Real-time portfolio-wide metrics including FCR trends, mortality tracking, and performance rankings.
                </p>
                <Link
                  href="/dashboard/metrics"
                  className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-800 hover:underline"
                >
                  Go to Metrics Dashboard →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Batches Table */}
      {batches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Batches</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Farm</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Batch #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Placement Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch: any) => (
                  <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{batch.farm?.name || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">#{batch.batch_number}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        batch.status === 'closed' 
                          ? 'bg-gray-100 text-gray-800' 
                          : batch.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {batch.status === 'closed' ? 'Closed' : batch.status === 'active' ? 'Active' : batch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {batch.placement_date ? new Date(batch.placement_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {batch.status === 'closed' ? (
                        <Link
                          href={`/dashboard/reports/integrator?batchId=${batch.id}`}
                          className="text-sm text-green-700 hover:text-green-800 hover:underline font-semibold"
                        >
                          View Report
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Report available after harvest</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {batches.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No batches yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Start by adding farms and batches to generate reports.
          </p>
          <Link
            href="/dashboard/farms/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            Add Your First Farm
          </Link>
        </div>
      )}
    </div>
  )
}
