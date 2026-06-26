import { Metadata } from 'next';
import { WatermarkAuditConsole } from '@/components/dashboard/WatermarkAuditConsole';

export const metadata: Metadata = {
  title: 'Watermark Audit — FlockIQ',
  description: 'Watermark leak detection and audit console',
};

export default function WatermarkAuditPage() {
  return (
    <div className="p-6">
      <WatermarkAuditConsole />
    </div>
  );
}
