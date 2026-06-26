'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import useSWR from 'swr'

interface GCCostTrendChartProps {
  farmId: string
  language?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function GCCostTrendChart({ farmId, language = 'hi' }: GCCostTrendChartProps) {
  const isHindi = language === 'hi'
  const { data, isLoading } = useSWR(`/api/farms/${farmId}/gc/history`, fetcher)

  const history = data?.history || []

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 h-64 animate-pulse" />
    )
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 h-64 flex items-center justify-center">
        <p className="text-sm text-gray-400">
          {isHindi ? 'अभी तक कोई बैच डेटा उपलब्ध नहीं' : 'No batch data available yet'}
        </p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = history
    .map((h: any) => ({
      batch: `#${h.batchNumber}`,
      date: h.placementDate,
      gc: h.gcPerKg || 0,
      totalCost: h.totalCost || 0,
    }))
    .reverse() // Show oldest to newest

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {isHindi ? 'GC प्रवृत्ति (पिछले 5 बैच)' : 'GC Trend (Last 5 Batches)'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3EDE7" />
          <XAxis 
            dataKey="batch" 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E3EDE7' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E3EDE7' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E3EDE7',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`₹${value.toFixed(2)}`, isHindi ? 'GC प्रति किग्रा' : 'GC per kg']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
          />
          <ReferenceLine 
            y={95} 
            stroke="#9CA3AF" 
            strokeDasharray="5 5"
            label={{ value: isHindi ? 'बेंचमार्क ₹95' : 'Benchmark ₹95', position: 'right', fontSize: 10, fill: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="gc" 
            stroke="#1A5C34" 
            strokeWidth={2}
            dot={{ fill: '#1A5C34', r: 4 }}
            activeDot={{ r: 6 }}
            name={isHindi ? 'GC प्रति किग्रा' : 'GC per kg'}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
        <span>{isHindi ? 'X-अक्ष: बैच नंबर' : 'X-axis: Batch number'}</span>
        <span>{isHindi ? 'Y-अक्ष: GC (₹/kg)' : 'Y-axis: GC (₹/kg)'}</span>
      </div>
    </div>
  )
}
