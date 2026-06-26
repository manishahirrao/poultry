'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import useSWR from 'swr'

interface GCBreakdownPieChartProps {
  farmId: string
  language?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const COLORS = ['#1A5C34', '#16A34A', '#3DAE72', '#65A30D', '#D97706', '#DC2626', '#9CA3AF', '#6B7280', '#4B5563']

export function GCBreakdownPieChart({ farmId, language = 'hi' }: GCBreakdownPieChartProps) {
  const isHindi = language === 'hi'
  const { data, isLoading } = useSWR(`/api/farms/${farmId}/gc`, fetcher)

  const gc = data?.gc

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 h-64 animate-pulse" />
    )
  }

  if (!gc || !gc.gcPerKg) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 h-64 flex items-center justify-center">
        <p className="text-sm text-gray-400">
          {isHindi ? 'GC डेटा उपलब्ध नहीं' : 'GC data not available'}
        </p>
      </div>
    )
  }

  // Prepare pie chart data
  const pieData = [
    { name: isHindi ? 'DOC' : 'DOC', value: gc.docCost },
    { name: isHindi ? 'चारा' : 'Feed', value: gc.feedCost },
    { name: isHindi ? 'दवाई' : 'Medicine', value: gc.medicineCost },
    { name: isHindi ? 'टीका' : 'Vaccine', value: gc.vaccineCost },
    { name: isHindi ? 'लिटर' : 'Litter', value: gc.litterCost },
    { name: isHindi ? 'बिजली' : 'Electricity', value: gc.electricityCost },
    { name: isHindi ? 'पानी' : 'Water', value: gc.waterCost },
    { name: isHindi ? 'मजदूरी' : 'Labour', value: gc.labourCost },
    { name: isHindi ? 'अन्य' : 'Other', value: gc.miscCost + gc.fixedOverhead },
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / gc.totalCost) * 100).toFixed(1)
      return (
        <div className="bg-white border border-[#E3EDE7] rounded-lg p-3 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-xs text-gray-600">₹{(data.value / 1000).toFixed(1)}K ({percentage}%)</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {isHindi ? 'लागत विभाजन' : 'Cost Breakdown'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 text-[11px] text-gray-400 text-center">
        {isHindi ? 'कुल लागत: ₹' : 'Total cost: ₹'}{(gc.totalCost / 1000).toFixed(1)}K
      </div>
    </div>
  )
}
