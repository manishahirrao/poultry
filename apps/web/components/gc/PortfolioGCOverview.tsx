'use client'
import useSWR from 'swr'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { gcStatusColour, GC_WATCH_THRESHOLD, GC_GOOD_THRESHOLD, INDUSTRY_BENCHMARK_GC_PER_KG } from '@/lib/types/gc'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface PortfolioGCData {
  averageGC: number
  bestGC: number
  worstGC: number
  farms: Array<{
    farmId: string
    farmName: string
    district: string
    gcPerKg: number
    birdsAlive: number
    liveKgs: number
    totalCost: number
  }>
  industryBenchmark: number
}

interface PortfolioGCOverviewProps {
  language?: string
}

export function PortfolioGCOverview({ language = 'hi' }: PortfolioGCOverviewProps) {
  const isHindi = language === 'hi'
  const { data, isLoading, error } = useSWR<PortfolioGCData>('/api/gc/portfolio', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    )
  }

  if (error || !data || !data.farms || data.farms.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 text-center py-12">
        <p className="text-sm text-gray-400">
          {isHindi 
            ? 'GC डेटा उपलब्ध नहीं — सक्रिय बैच के लिए DOC और चारा लागत दर्ज करें' 
            : 'GC data not available — enter DOC and feed costs for active batches'}
        </p>
      </div>
    )
  }

  const { averageGC, bestGC, worstGC, farms, industryBenchmark } = data

  // Prepare chart data
  const chartData = farms.map(farm => ({
    name: farm.farmName,
    gc: farm.gcPerKg,
    color: gcStatusColour(farm.gcPerKg),
  }))

  // Format Indian currency
  const formatINR = (value: number) => `₹${value.toFixed(2)}`

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {isHindi ? 'Portfolio GC Overview' : 'Portfolio GC Overview'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isHindi 
            ? 'सभी सक्रिय बैच के लिए औसत और फ़ार्म-वार GC विश्लेषण' 
            : 'Average and farm-wise GC analysis for all active batches'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Average GC */}
        <div className="bg-[#F4F7F5] rounded-lg p-4">
          <p className="text-[10px] text-gray-500 mb-1">
            {isHindi ? 'औसत GC (पोर्टफोलियो)' : 'Average GC (Portfolio)'}
          </p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: gcStatusColour(averageGC) }}>
            {formatINR(averageGC)}/kg
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {isHindi ? 'सभी सक्रिय बैच का औसत' : 'Across all active batches'}
          </p>
        </div>

        {/* Best GC */}
        <div className="bg-[#F4F7F5] rounded-lg p-4">
          <p className="text-[10px] text-gray-500 mb-1">
            {isHindi ? 'सर्वश्रेष्ठ GC (सबसे कम)' : 'Best GC (Lowest)'}
          </p>
          <p className="text-2xl font-bold tabular-nums text-green-600">
            {formatINR(bestGC)}/kg
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {isHindi ? 'सबसे अच्छा प्रदर्शन' : 'Best performing farm'}
          </p>
        </div>

        {/* Worst GC */}
        <div className="bg-[#F4F7F5] rounded-lg p-4">
          <p className="text-[10px] text-gray-500 mb-1">
            {isHindi ? 'सबसे खराब GC (सबसे अधिक)' : 'Worst GC (Highest)'}
          </p>
          <p className="text-2xl font-bold tabular-nums text-red-600">
            {formatINR(worstGC)}/kg
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {isHindi ? 'सुधार की आवश्यकता' : 'Needs improvement'}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E3EDE7" />
            <XAxis 
              type="number" 
              domain={[0, 150]}
              tickFormatter={(value) => `₹${value}`}
              stroke="#6B7280"
              fontSize={11}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={75}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3EDE7',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`₹${value.toFixed(2)}/kg`, 'GC']}
            />
            <ReferenceLine
              x={industryBenchmark}
              stroke="#6B7280"
              strokeDasharray="3 3"
              label={{
                value: `Benchmark: ₹${industryBenchmark}`,
                position: 'right',
                fontSize: 10,
                fill: '#6B7280'
              }}
            />
            <Bar dataKey="gc" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <rect 
                  key={`bar-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#E3EDE7]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
          <span className="text-[11px] text-gray-600">
            {isHindi ? 'उत्कृष्ट (< ₹88)' : 'Excellent (< ₹88)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#65A30D]" />
          <span className="text-[11px] text-gray-600">
            {isHindi ? 'अच्छा (₹88-100)' : 'Good (₹88-100)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#D97706]" />
          <span className="text-[11px] text-gray-600">
            {isHindi ? 'ध्यान दें (₹100-112)' : 'Watch (₹100-112)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
          <span className="text-[11px] text-gray-600">
            {isHindi ? 'अलर्ट (> ₹112)' : 'Alert (> ₹112)'}
          </span>
        </div>
      </div>
    </div>
  )
}
