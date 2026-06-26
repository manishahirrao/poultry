// FlockIQ ERP — Empty State Component Pattern
// File: packages/ui/src/components/ERPEmptyState.tsx
// Platform: Web (React)
// Design Reference: specs/account.md SECTION 13 - Empty State Pattern
// Design Skills Applied: layout, typeset, polish, impeccable

import React from 'react';
import { erpColors } from '../tokens';

export interface ERPEmptyStateProps {
  entityName: string;
  entityNameHi?: string;
  emptyHindiMessage?: string;
  emptyEnglishMessage?: string;
  onAdd: () => void;
  icon?: React.ReactNode;
}

const ERPEmptyState: React.FC<ERPEmptyStateProps> = ({
  entityName,
  entityNameHi = entityName,
  emptyHindiMessage = 'अभी तक कोई डेटा नहीं है',
  emptyEnglishMessage = 'No data yet',
  onAdd,
  icon,
}) => {
  const defaultIcon = (
    <svg
      className="w-7 h-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-4" aria-hidden="true">
        <div className="text-[#1A5C34]">
          {icon || defaultIcon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2 font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]">
        No {entityName} found / कोई {entityNameHi} नहीं मिला
      </h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-xs font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]">
        {emptyHindiMessage} / {emptyEnglishMessage}
      </p>
      <button
        onClick={onAdd}
        className="bg-[#1A5C34] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0D4A28] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-['Space_Grotesk','Noto_Sans_Devanagari',sans-serif]"
      >
        + Add First {entityName}
      </button>
    </div>
  );
};

export default ERPEmptyState;
