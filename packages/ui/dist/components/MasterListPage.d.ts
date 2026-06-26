import React from 'react';
import { type Column } from './DataTable';
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
declare const MasterListPage: <T extends {
    id: string | number;
}>({ title, titleHi, subtitle, subtitleHi, columns, data, loading, onAdd, onRowClick, onExportCSV, onPrint, onExportPDF, addLabel, addLabelHi, emptyEntityName, emptyEntityNameHi, emptyHindiMessage, emptyEnglishMessage, filters, searchPlaceholder, searchPlaceholderHi, }: MasterListPageProps<T>) => React.JSX.Element;
export default MasterListPage;
//# sourceMappingURL=MasterListPage.d.ts.map