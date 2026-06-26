'use client';

import { useState, useEffect } from 'react';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageProvider';

interface PredictionRow {
  id: string;
  mandi: string;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  actual_price: number | null;
  confidence: number;
  drivers: string[];
  sparklineData?: number[];
}

interface MandiPriceTableProps {
  predictions: PredictionRow[];
}

export function MandiPriceTable({ predictions }: MandiPriceTableProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();
  useEffect(() => setMounted(true), []);

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'SELL_NOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            {language === 'hi' ? 'आज बेचें ✓' : 'Sell Today ✓'}
          </span>
        );
      case 'HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            {language === 'hi' ? 'रुकें' : 'Hold'}
          </span>
        );
      case 'CAUTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            {language === 'hi' ? 'सावधान' : 'Caution'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            —
          </span>
        );
    }
  };

  const getChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = current - previous;
    if (Math.abs(change) < 1) return <Minus size={14} className="text-neutral-400" />;
    if (change > 0) return <TrendUp size={14} className="text-green-600" />;
    return <TrendDown size={14} className="text-red-600" />;
  };

  const formatMandiName = (mandi: string) => {
    return mandi.charAt(0).toUpperCase() + mandi.slice(1);
  };

  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return language === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours} hours ago`;
    return language === 'hi' ? `${Math.floor(diffHours / 24)} दिन पहले` : `${Math.floor(diffHours / 24)} days ago`;
  };

  const handleRowClick = (mandi: string) => {
    router.push(`/dashboard/price?mandi=${mandi}`);
  };

  const handleCSVDownload = () => {
    // Create CSV content
    const headers = ['Mandi', 'P50 (₹/kg)', 'P10 (₹/kg)', 'P90 (₹/kg)', 'Signal', 'Last Updated'];
    const rows = predictions.map(p => [
      formatMandiName(p.mandi),
      p.p50,
      p.p10,
      p.p90,
      p.sell_signal,
      formatLastUpdated(p.predicted_at),
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlockIQ-mandi-prices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return <div className="bg-white rounded-2xl border border-neutral-100 h-[400px] animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">{language === 'hi' ? 'मंडी के अनुसार भाव' : 'Mandi-wise Prices'}</h2>
        <button
          onClick={handleCSVDownload}
          className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold flex items-center gap-1"
        >
          {language === 'hi' ? 'CSV डाउनलोड करें' : 'Download CSV'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-neutral-50">
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[100px]">
                Mandi
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[80px]">
                P50 (₹/kg)
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[120px]">
                Range
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[80px]">
                Signal
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[60px]">
                Change
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[100px]">
                Trend
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[100px]">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {predictions.map((prediction, index) => (
              <tr
                key={prediction.id}
                onClick={() => handleRowClick(prediction.mandi)}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-neutral-100 transition-colors cursor-pointer`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-neutral-900">
                    {formatMandiName(prediction.mandi)}
                  </div>

                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                    ₹{prediction.p50}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="text-xs text-neutral-500 whitespace-nowrap">
                    ₹{prediction.p10} - ₹{prediction.p90}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {getSignalBadge(prediction.sell_signal)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {getChangeIndicator(prediction.p50, predictions[index + 1]?.p50)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {prediction.sparklineData && prediction.sparklineData.length > 0 ? (
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prediction.sparklineData.map((val, i) => ({ value: val }))}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#1A5C34"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="text-xs text-neutral-500">
                    {formatLastUpdated(prediction.predicted_at)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
