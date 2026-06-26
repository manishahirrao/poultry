import { Metadata } from 'next';
import { FeedCostDashboard } from '@/components/feed/FeedCostDashboard';

export const metadata: Metadata = {
  title: 'Feed Intelligence — FlockIQ',
  description: 'Feed cost intelligence and procurement timing',
};

export default function FeedIntelligencePage() {
  return (
    <div className="p-6">
      <FeedCostDashboard userRole="user" />
    </div>
  );
}
