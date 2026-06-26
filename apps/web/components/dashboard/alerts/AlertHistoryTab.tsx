'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Download } from '@phosphor-icons/react';
import { TableSkeleton } from '@/components/dashboard/skeletons';

interface AlertHistoryTabProps {
  district: string;
}

export function AlertHistoryTab({ district }: AlertHistoryTabProps) {
  const [sortField, setSortField] = useState<keyof any>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setSlidersHorizontalType] = useState<string>('all');
  const rowsPerPage = 30;

  // Mock data for history
  const mockHistory = [
    {
      id: '1',
      type: 'HPAI',
      severity: 'critical',
      title: 'HPAI Alert - Gorakhpur',
      title_hi: 'HPAI Alert - Gorakhpur',
      district: 'gorakhpur',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      resolution: 'Acknowledged',
      action_taken: 'Advisory read, prices monitored',
    },
    {
      id: '2',
      type: 'WEATHER',
      severity: 'warning',
      title: 'Heat Wave Warning',
      title_hi: 'Heat Wave Warning',
      district: 'gorakhpur',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      resolution: 'Acknowledged',
      action_taken: 'Shed management implemented',
    },
    {
      id: '3',
      type: 'PRICE_WARNING',
      severity: 'critical',
      title: 'Price Crash Risk',
      title_hi: 'Price Crash Risk',
      district: 'deoria',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      resolution: 'Acknowledged',
      action_taken: 'Sold early, avoided loss',
    },
  ];

  // SlidersHorizontal and sort data
  const filteredData = filterType === 'all' 
    ? mockHistory 
    : mockHistory.filter(a => a.type === filterType);

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal: any = a[sortField as keyof typeof a];
    let bVal: any = b[sortField as keyof typeof b];
    
    if (sortField === 'created_at') {
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Critical</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Warning</span>;
      case 'info':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Info</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">—</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCSVExport = () => {
    const headers = ['Date', 'Type', 'District', 'Severity', 'Resolution', 'Action Taken'];
    const rows = sortedData.map(a => [
      formatDate(a.created_at),
      a.type,
      a.district,
      a.severity,
      a.resolution,
      a.action_taken,
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlockIQ-alert-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* SlidersHorizontals */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-neutral-700">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setSlidersHorizontalType(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          >
            <option value="all">All Types</option>
            <option value="HPAI">Disease (HPAI)</option>
            <option value="WEATHER">Weather</option>
            <option value="PRICE_WARNING">Price Warning</option>
            <option value="POLICY">Policy</option>
          </select>
        </div>

        <button
          onClick={handleCSVExport}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
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
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortField === 'type' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('district')}
                >
                  <div className="flex items-center gap-1">
                    District
                    {sortField === 'district' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                >
                  Resolution
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                >
                  Action Taken
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedData.map((alert, index) => (
                <tr
                  key={alert.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-neutral-100 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {formatDate(alert.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 capitalize">
                    {alert.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 capitalize">
                    {alert.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getSeverityBadge(alert.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {alert.resolution}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">
                    {alert.action_taken}
                  </td>
                </tr>
              ))}
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
      </div>
    </div>
  );
}
