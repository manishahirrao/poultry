// FlockIQ ERP — Master List Page Component Pattern
// File: packages/ui/src/components/MasterListPage.tsx
// Platform: Web (React)
// Design Reference: specs/account.md SECTION 13 - Master List Page Pattern
// Design Skills Applied: layout, typeset, polish, impeccable

import React from 'react';
import DataTable, { type Column } from './DataTable';
import ERPEmptyState from './ERPEmptyState';
import ReportExportButtons from './ReportExportButtons';

export interface FilterOption {
  value: string;
  label: string;
  labelHi?: string;
}

export interface MasterListPageProps<T = any> {
  title: string;
  titleHi?: string;
  subtitle?: string;
  subtitleHi?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onAdd?: () => void;
  onRowClick?: (row: T) => void;
  onExportCSV?: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  addLabel?: string;
  addLabelHi?: string;
  emptyEntityName?: string;
  emptyEntityNameHi?: string;
  emptyHindiMessage?: string;
  emptyEnglishMessage?: string;
  filters?: React.ReactNode;
  searchPlaceholder?: string;
  searchPlaceholderHi?: string;
}

const MasterListPage = <T extends { id: string | number }>({
  title,
  titleHi = title,
  subtitle,
  subtitleHi = subtitle,
  columns,
  data,
  loading = false,
  onAdd,
  onRowClick,
  onExportCSV,
  onPrint,
  onExportPDF,
  addLabel = 'Add New',
  addLabelHi = 'नया जोड़ें',
  emptyEntityName = 'items',
  emptyEntityNameHi = emptyEntityName,
  emptyHindiMessage = 'अभी तक कोई डेटा नहीं है',
  emptyEnglishMessage = 'No data yet',
  filters,
  searchPlaceholder = 'Search...',
  searchPlaceholderHi = 'खोजें...',
}: MasterListPageProps<T>) => {
  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]">
            {titleHi ? `${titleHi} / ${title}` : title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#6B7280] mt-1 font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]">
              {subtitleHi ? `${subtitleHi} / ${subtitle}` : subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ReportExportButtons
            onExportCSV={onExportCSV}
            onPrint={onPrint}
            onExportPDF={onExportPDF}
          />
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-[#1A5C34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0D4A28] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]"
            >
              + {addLabelHi ? `${addLabelHi} / ${addLabel}` : addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      {(filters || searchPlaceholder) && (
        <div className="p-6 pb-3 flex gap-3 items-center">
          {filters}
        </div>
      )}

      {/* Data table */}
      <div className="px-6">
        {data.length === 0 && !loading ? (
          <ERPEmptyState
            entityName={emptyEntityName}
            entityNameHi={emptyEntityNameHi}
            emptyHindiMessage={emptyHindiMessage}
            emptyEnglishMessage={emptyEnglishMessage}
            onAdd={onAdd || (() => {})}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            onRowClick={onRowClick}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default MasterListPage;
