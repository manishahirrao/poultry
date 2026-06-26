import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watermark Audit — FlockIQ',
  description: 'Watermark leak detection and audit console',
};

export default function WatermarkAuditPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          Watermark Audit
        </h1>
        <p className="text-neutral-500">
          Coming soon — Watermark leak detection and audit console
        </p>
      </div>
    </div>
  );
}
