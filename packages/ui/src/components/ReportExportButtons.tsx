// FlockIQ ERP — Report Export Buttons Component Pattern
// File: packages/ui/src/components/ReportExportButtons.tsx
// Platform: Web (React)
// Design Reference: specs/account.md SECTION 13 - Report Export Button Pattern
// Design Skills Applied: layout, typeset, polish, impeccable

import React from 'react';

export interface ReportExportButtonsProps {
  onExportCSV?: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  csvLabel?: string;
  csvLabelHi?: string;
  printLabel?: string;
  printLabelHi?: string;
  pdfLabel?: string;
  pdfLabelHi?: string;
}

const ReportExportButtons: React.FC<ReportExportButtonsProps> = ({
  onExportCSV,
  onPrint,
  onExportPDF,
  csvLabel = 'CSV',
  csvLabelHi = 'सीएसवी',
  printLabel = 'Print',
  printLabelHi = 'प्रिंट',
  pdfLabel = 'PDF',
  pdfLabelHi = 'पीडीएफ',
}) => {
  return (
    <div className="flex gap-2" role="group" aria-label="Export options">
      {onExportCSV && (
        <button
          onClick={onExportCSV}
          className="border border-[#E3EDE7] px-3 py-1.5 rounded text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-1 text-[#111827] font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]"
          aria-label={`Export as ${csvLabel}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {csvLabelHi ? `${csvLabelHi} / ${csvLabel}` : csvLabel}
        </button>
      )}
      {onPrint && (
        <button
          onClick={onPrint}
          className="border border-[#E3EDE7] px-3 py-1.5 rounded text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-1 text-[#111827] font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]"
          aria-label={`Print ${printLabel}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          {printLabelHi ? `${printLabelHi} / ${printLabel}` : printLabel}
        </button>
      )}
      {onExportPDF && (
        <button
          onClick={onExportPDF}
          className="border border-[#E3EDE7] px-3 py-1.5 rounded text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-1 text-[#111827] font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]"
          aria-label={`Export as ${pdfLabel}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {pdfLabelHi ? `${pdfLabelHi} / ${pdfLabel}` : pdfLabel}
        </button>
      )}
    </div>
  );
};

export default ReportExportButtons;
