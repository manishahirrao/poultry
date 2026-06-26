import React from 'react';
export interface ERPEmptyStateProps {
    entityName: string;
    entityNameHi?: string;
    emptyHindiMessage?: string;
    emptyEnglishMessage?: string;
    onAdd: () => void;
    icon?: React.ReactNode;
}
declare const ERPEmptyState: React.FC<ERPEmptyStateProps>;
export default ERPEmptyState;
//# sourceMappingURL=ERPEmptyState.d.ts.map