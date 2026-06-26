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
declare const ReportExportButtons: React.FC<ReportExportButtonsProps>;
export default ReportExportButtons;
//# sourceMappingURL=ReportExportButtons.d.ts.map