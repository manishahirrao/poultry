'use client';

import { Download, Share, Printer } from '@phosphor-icons/react';

interface ReportActionsProps {
  batchId: string;
  farmName: string;
  batchNumber: number;
}

export function ReportActions({ batchId, farmName, batchNumber }: ReportActionsProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const shareUrl = `${window.location.origin}/dashboard/reports/integrator?batchId=${batchId}`;
    const message = `Batch Report for ${farmName} Batch #${batchNumber}: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Print report"
      >
        <Printer size={20} />
        Print
      </button>
      <a
        href={`/api/reports/${batchId}/pdf`}
        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        aria-label="Download PDF"
      >
        <Download size={20} />
        Download PDF
      </a>
      <button
        onClick={handleWhatsAppShare}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        aria-label="Share via WhatsApp"
      >
        <Share size={20} />
        Share via WhatsApp
      </button>
    </div>
  );
}
