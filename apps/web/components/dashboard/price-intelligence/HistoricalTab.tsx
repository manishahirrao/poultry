'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react';
import { TableSkeleton } from '@/components/dashboard/skeletons';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';

type Range = '7D' | '14D' | '30D' | '60D';

interface HistoricalTabProps {
  mandi: string;
  setMandi: (mandi: string) => void;
  range: Range;
  setRange: (range: Range) => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function HistoricalTab({ mandi, setMandi, range, setRange }: HistoricalTabProps) {
  const { entitlements } = useEntitlements();
  const [sortField, setSortField] = useState<keyof any>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  // ── Feature access check for price history ─────────────────────────────────────
  const priceHistoryAccess = canAccess(entitlements, FEATURES.PRICE_HISTORY_30D);

  const mandiOptions = [
    { value: 'gorakhpur', label: 'Gorakhpur' },
    { value: 'deoria', label: 'Deoria' },
    { value: 'kushinagar', label: 'Kushinagar' },
    { value: 'basti', label: 'Basti' },
    { value: 'maharajganj', label: 'Maharajganj' },
  ];

  // ── Limit range options based on plan ───────────────────────────────────────────
  // FARM users: max 7-day history; PRO users: full range (7D, 14D, 30D, 60D)
  const allRangeOptions = [
    { value: '7D' as Range, label: '7 Days' },
    { value: '14D' as Range, label: '14 Days' },
    { value: '30D' as Range, label: '30 Days' },
    { value: '60D' as Range, label: '60 Days' },
  ];

  const rangeOptions = priceHistoryAccess.limitValue === 7 
    ? allRangeOptions.filter(opt => opt.value === '7D')
    : allRangeOptions;

  // ── Enforce 7-day limit for FARM plan ───────────────────────────────────────────
  useEffect(() => {
    if (priceHistoryAccess.limitValue === 7 && range !== '7D') {
      setRange('7D');
    }
  }, [priceHistoryAccess.limitValue, range, setRange]);

  // Fetch historical data using SWR
  const { data: historicalData, error, isLoading } = useSWR(
    `/api/price-intelligence/forecast?range=${range}&mandi=${mandi}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateInterval: 300000,
    }
  );

  // Sort and paginate data
  const sortedData = [...(Array.isArray(historicalData) ? historicalData : [])].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'date' || sortField === 'predicted_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (field: keyof any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getErrorColour = (error: number) => {
    if (error < 5) return 'bg-green-100 text-green-700';
    if (error < 10) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getErrorBadge = (error: number | null) => {
    if (error === null) return <span className="text-neutral-400">—</span>;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getErrorColour(error)}`}>
        {error.toFixed(1)}%
      </span>
    );
  };

  const getRangeBadge = (p50: number, actual: number | null) => {
    if (actual === null) return <span className="text-neutral-400">—</span>;
    const withinRange = actual >= p50 - 8 && actual <= p50 + 8;
    return withinRange ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        ✓ Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        ✗ No
      </span>
    );
  };

  const calculateError = (predicted: number, actual: number | null) => {
    if (actual === null) return null;
    return Math.abs((actual - predicted) / predicted * 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <TableSkeleton rows={30} />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-100">
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold mb-2">Error loading historical data</p>
          <p className="text-sm text-neutral-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-100">
        <div className="text-center py-12">
          <p className="text-neutral-600 font-semibold mb-2">No historical data available</p>
          <p className="text-sm text-neutral-500">Historical data loads daily at 6:00 AM. Check back tomorrow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-neutral-700">Mandi:</label>
          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          >
            {mandiOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-neutral-700">Range:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          >
            {rangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('predicted_at')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === 'predicted_at' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('mandi')}
                >
                  <div className="flex items-center gap-1">
                    Mandi
                    {sortField === 'mandi' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('p50')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Predicted P50
                    {sortField === 'p50' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                >
                  Actual
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('p50')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Error %
                    {sortField === 'p50' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                >
                  Within Range?
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedData.map((prediction, index) => {
                const error = calculateError(prediction.p50, prediction.actual);
                return (
                  <tr
                    key={prediction.date}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-neutral-100 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatDate(prediction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 capitalize">
                      {mandi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                        ₹{prediction.p50}
                      </div>
                      <div className="text-xs text-neutral-500">
                        ₹{prediction.p10} - ₹{prediction.p90}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                        {prediction.actual ? `₹${prediction.actual}` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getErrorBadge(error)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getRangeBadge(prediction.p50, prediction.actual)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Average MAPE</div>
              <div className="text-lg font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                {historicalData.length > 0
                  ? (historicalData.reduce((sum: number, p: any) => sum + (calculateError(p.p50, p.actual) || 0), 0) / historicalData.filter((p: any) => p.actual).length).toFixed(1)
                  : '—'}%
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide">P10-P90 Hit Rate</div>
              <div className="text-lg font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                {historicalData.length > 0
                  ? ((historicalData.filter((p: any) => p.actual && p.actual >= p.p50 - 8 && p.actual <= p.p50 + 8).length / historicalData.filter((p: any) => p.actual).length) * 100).toFixed(0)
                  : '—'}%
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Total Predictions</div>
              <div className="text-lg font-semibold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                {historicalData.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
