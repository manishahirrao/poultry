import React from 'react';
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
declare const DataTable: <T extends {
    id: string | number;
}>({ columns, data, onRowClick, loading, emptyMessage, emptyMessageHi, }: DataTableProps<T>) => React.JSX.Element;
export default DataTable;
//# sourceMappingURL=DataTable.d.ts.map