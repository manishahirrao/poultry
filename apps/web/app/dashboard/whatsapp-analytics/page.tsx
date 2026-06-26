import { Metadata } from 'next';
import { WhatsAppAnalytics } from '@/components/dashboard/WhatsAppAnalytics';

export const metadata: Metadata = {
  title: 'WhatsApp Analytics — FlockIQ',
  description: 'WhatsApp engagement and analytics dashboard',
};

export default function WhatsAppAnalyticsPage() {
  return (
    <div className="p-6">
      <WhatsAppAnalytics periodDays={30} />
    </div>
  );
}
