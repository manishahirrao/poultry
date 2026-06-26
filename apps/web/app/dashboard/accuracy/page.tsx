import { Metadata } from 'next';
import { AccuracyDashboard } from '@/components/admin/AccuracyDashboard';

export const metadata: Metadata = {
  title: 'Accuracy Dashboard — FlockIQ',
  description: 'Model accuracy metrics and performance tracking',
};

export default function AccuracyPage() {
  return (
    <div className="p-6">
      <AccuracyDashboard userRole="admin" />
    </div>
  );
}
