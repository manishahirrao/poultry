'use client';

import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dynamic import for chart to avoid SSR issues
const Chart = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), {
  ssr: false,
  loading: () => <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />,
});

interface PriceTrendData {
  date: string;
  [key: string]: string | number;
}

interface FeedCompanyPriceTrendChartProps {
  isLoading?: boolean;
}

export function FeedCompanyPriceTrendChart({ isLoading }: FeedCompanyPriceTrendChartProps) {
  // Mock data - replace with actual API call
  // This shows price trends for Starter feed over the last 30 days
  const mockData: PriceTrendData[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulate price trends with some randomness
    const basePrice = 28000;
    const godrejPrice = basePrice + Math.sin(i * 0.3) * 500 + Math.random() * 200;
    const venkysPrice = basePrice + 500 + Math.sin(i * 0.3 + 0.5) * 400 + Math.random() * 200;
    const sugunaPrice = basePrice - 200 + Math.sin(i * 0.3 + 1) * 300 + Math.random() * 200;
    const ibGroupPrice = basePrice + 200 + Math.sin(i * 0.3 + 1.5) * 350 + Math.random() * 200;
    
    return {
      date: dateStr,
      'Godrej Agrovet': Math.round(godrejPrice),
      'Venkys': Math.round(venkysPrice),
      'Suguna Foods': Math.round(sugunaPrice),
      'IB Group': Math.round(ibGroupPrice),
    };
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="h-80 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-neutral-200 p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2 text-neutral-900">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}/ton
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tick component for rotated labels
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#7A9C8A"
          fontSize={12}
          transform="rotate(-45)"
        >
          {formatDate(payload.value)}
        </text>
      </g>
    );
  };

  // Company colors
  const companyColors = {
    'Godrej Agrovet': '#1A6B3C',
    'Venkys': '#2ECC71',
    'Suguna Foods': '#3498DB',
    'IB Group': '#9B59B6',
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Feed Price Trends (30 Days)
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Starter feed price comparison across major companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-500"
            defaultValue="starter"
          >
            <option value="starter">Starter Feed</option>
            <option value="grower">Grower Feed</option>
            <option value="finisher">Finisher Feed</option>
            <option value="layer">Layer Feed</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
            <XAxis
              dataKey="date"
              tick={<CustomXAxisTick />}
              stroke="#7A9C8A"
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#7A9C8A" 
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Godrej Agrovet */}
            <Line
              type="monotone"
              dataKey="Godrej Agrovet"
              stroke={companyColors['Godrej Agrovet']}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            
            {/* Venkys */}
            <Line
              type="monotone"
              dataKey="Venkys"
              stroke={companyColors['Venkys']}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            
            {/* Suguna Foods */}
            <Line
              type="monotone"
              dataKey="Suguna Foods"
              stroke={companyColors['Suguna Foods']}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            
            {/* IB Group */}
            <Line
              type="monotone"
              dataKey="IB Group"
              stroke={companyColors['IB Group']}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: companyColors['Godrej Agrovet'] }} />
              <span>Godrej Agrovet</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: companyColors['Venkys'] }} />
              <span>Venkys</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: companyColors['Suguna Foods'] }} />
              <span>Suguna Foods</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: companyColors['IB Group'] }} />
              <span>IB Group</span>
            </div>
          </div>
          <div>Showing last 30 days data</div>
        </div>
      </div>
    </div>
  );
}
