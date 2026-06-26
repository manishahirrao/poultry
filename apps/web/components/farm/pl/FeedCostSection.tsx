'use client';

interface FeedCosts {
  total: number;
  avg_rate: number;
  total_mt: number;
  last_updated?: string;
}

interface FeedCostSectionProps {
  feedCosts: FeedCosts;
  farmId: string;
  batchId: string;
}

export function FeedCostSection({ feedCosts, farmId, batchId }: FeedCostSectionProps) {
  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  const getRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const hasFeedData = feedCosts.total_mt > 0;

  if (!hasFeedData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center py-6">
          <p className="text-gray-600 mb-2">No feed purchases recorded.</p>
          <a
            href={`/dashboard/farms/${farmId}?tab=feed`}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Add purchases in the Feed tab →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800 mb-3">
          <strong>Synced from Feed tab</strong> · Last updated: {getRelativeTime(feedCosts.last_updated)}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-blue-600 mb-1">Total feed purchased</p>
            <p className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              {feedCosts.total_mt.toFixed(2)} MT
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 mb-1">Total feed cost</p>
            <p className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              ₹{formatNumber(feedCosts.total)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 mb-1">Average rate</p>
            <p className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              ₹{feedCosts.avg_rate.toFixed(2)}/kg
            </p>
          </div>
        </div>
      </div>
      
      <a
        href={`/dashboard/farms/${farmId}?tab=feed`}
        className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center gap-1"
      >
        View Feed Detail →
      </a>
    </div>
  );
}
