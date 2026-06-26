// FlockIQ ERP — DataTable Component Pattern
// File: packages/ui/src/components/DataTable.tsx
// Platform: Web (React)
// Design Reference: specs/account.md SECTION 13 - Table Component Pattern
// Design Skills Applied: layout, typeset, polish, impeccable

import React from 'react';
import { erpColors } from '../tokens';

export interface Column<T = any> {
  key: string;
  label: string;
  labelHi?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyMessageHi?: string;
}

const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'No data found',
  emptyMessageHi = 'कोई डेटा नहीं मिला',
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3DAE72] border-t-transparent" aria-hidden="true"></div>
        <span className="sr-only">Loading data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
        <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-4" aria-hidden="true">
          <svg className="w-8 h-8 text-[#1A5C34]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#111827] mb-2 font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]">
          {emptyMessageHi} / {emptyMessage}
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" role="table" aria-label="Data table">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-[#EDF7F1] text-[#1A5C34] font-semibold">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif] ${
                  col.sortable 
                    ? 'cursor-pointer hover:bg-[#3DAE72] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-inset' 
                    : ''
                }`}
                style={{ width: col.width }}
                onClick={() => col.sortable && handleSort(col.key)}
                onKeyDown={(e) => {
                  if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(col.key);
                  }
                }}
                tabIndex={col.sortable ? 0 : undefined}
                scope="col"
              >
                <div className="flex items-center gap-2">
                  <span>{col.labelHi ? `${col.labelHi} / ${col.label}` : col.label}</span>
                  {col.sortable && sortConfig?.key === col.key && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr
              key={row.id}
              className={`${
                i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'
              } hover:bg-[#EDF7F1] cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-inset`}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick?.(row);
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role="row"
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className="px-4 py-3 font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]"
                  role="cell"
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
