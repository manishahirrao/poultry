'use client';

import { useState } from 'react';
import { Download, Check } from '@phosphor-icons/react';

type Range = '7D' | '14D' | '30D' | '60D';

interface DownloadTabProps {
  mandi: string;
  setMandi: (mandi: string) => void;
  range: Range;
  setRange: (range: Range) => void;
}

export function DownloadTab({ mandi, setMandi, range, setRange }: DownloadTabProps) {
  const [selectedFields, setSelectedFields] = useState({
    p10: true,
    p50: true,
    p90: true,
    actual: true,
    sellSignal: true,
    drivers: false,
  });
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const mandiOptions = [
    { value: 'gorakhpur', label: 'Gorakhpur' },
    { value: 'deoria', label: 'Deoria' },
    { value: 'kushinagar', label: 'Kushinagar' },
    { value: 'basti', label: 'Basti' },
    { value: 'maharajganj', label: 'Maharajganj' },
  ];

  const rangeOptions = [
    { value: '7D' as Range, label: '7 Days' },
    { value: '14D' as Range, label: '14 Days' },
    { value: '30D' as Range, label: '30 Days' },
    { value: '60D' as Range, label: '60 Days' },
  ];

  const handleFieldToggle = (field: keyof typeof selectedFields) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadComplete(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate CSV content
      const headers = Object.keys(selectedFields).filter(k => selectedFields[k as keyof typeof selectedFields]);
      const csvContent = headers.join(',') + '\n';

      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FlockIQ-predictions-${mandi}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const selectedFieldCount = Object.values(selectedFields).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> S2+ access required. S1 customers: app only.
        </p>
      </div>

      {/* Export Form */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">Export Predictions</h3>

        <div className="space-y-6">
          {/* Mandi Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Mandi
            </label>
            <select
              value={mandi}
              onChange={(e) => setMandi(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            >
              {mandiOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Date Range (Max 60 days)
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Field Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Include Fields ({selectedFieldCount} selected)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedFields).map(([field, checked]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleFieldToggle(field as keyof typeof selectedFields)}
                    className="w-4 h-4 text-brandGreen700 border-neutral-300 rounded focus:ring-brandGreen500"
                  />
                  <span className="text-sm text-neutral-700 capitalize">{field.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  defaultChecked
                  className="w-4 h-4 text-brandGreen700 border-neutral-300 focus:ring-brandGreen500"
                />
                <span className="text-sm text-neutral-700">CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  disabled
                  className="w-4 h-4 text-brandGreen700 border-neutral-300 focus:ring-brandGreen500"
                />
                <span className="text-sm text-neutral-700">JSON (Enterprise only)</span>
              </label>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading || selectedFieldCount === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brandGreen700 text-white rounded-xl text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Downloading...
              </>
            ) : downloadComplete ? (
              <>
                <Check size={18} />
                Download Complete
              </>
            ) : (
              <>
                <Download size={18} />
                CSV Download करें
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sample Data Preview */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Sample Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                {Object.keys(selectedFields).filter(k => selectedFields[k as keyof typeof selectedFields]).map(field => (
                  <th key={field} scope="col" className="px-4 py-2 text-left font-semibold text-neutral-600 capitalize">
                    {field.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-100">
                {selectedFields.p10 && <td className="px-4 py-2 text-neutral-700">160</td>}
                {selectedFields.p50 && <td className="px-4 py-2 text-neutral-700">168</td>}
                {selectedFields.p90 && <td className="px-4 py-2 text-neutral-700">176</td>}
                {selectedFields.actual && <td className="px-4 py-2 text-neutral-700">167</td>}
                {selectedFields.sellSignal && <td className="px-4 py-2 text-neutral-700">SELL_NOW</td>}
                {selectedFields.drivers && <td className="px-4 py-2 text-neutral-700">मांग अधिक, आवक कम</td>}
              </tr>
              <tr>
                {selectedFields.p10 && <td className="px-4 py-2 text-neutral-700">162</td>}
                {selectedFields.p50 && <td className="px-4 py-2 text-neutral-700">170</td>}
                {selectedFields.p90 && <td className="px-4 py-2 text-neutral-700">178</td>}
                {selectedFields.actual && <td className="px-4 py-2 text-neutral-700">—</td>}
                {selectedFields.sellSignal && <td className="px-4 py-2 text-neutral-700">HOLD</td>}
                {selectedFields.drivers && <td className="px-4 py-2 text-neutral-700">मौसम सामान्य</td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
