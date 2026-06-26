interface FeedSummarySectionProps {
  dailyLogs: any[];
  feedPurchases: any[];
  totalFeedConsumed: number;
  totalFeedCost: number;
  totalBirdsHarvested: number;
  isDataLocked: boolean;
}

export function FeedSummarySection({
  dailyLogs,
  feedPurchases,
  totalFeedConsumed,
  totalFeedCost,
  totalBirdsHarvested,
  isDataLocked,
}: FeedSummarySectionProps) {
  // Calculate feed per bird
  const feedPerBird = totalBirdsHarvested > 0 ? (totalFeedConsumed * 1000) / totalBirdsHarvested : 0;

  // Calculate cost per kg produced
  const avgWeight = dailyLogs.length > 0 ? 
    dailyLogs.filter((log: any) => log.sample_weight_kg && log.sample_birds)
      .reduce((sum: number, log: any) => sum + (log.sample_weight_kg / log.sample_birds * 1000), 0) / 
    dailyLogs.filter((log: any) => log.sample_weight_kg && log.sample_birds).length : 0;

  const totalWeightProduced = totalBirdsHarvested * (avgWeight / 1000);
  const costPerKgProduced = totalWeightProduced > 0 ? totalFeedCost / totalWeightProduced : 0;

  // Group feed purchases by type
  const feedByType: Record<string, { quantity: number; cost: number }> = {};
  feedPurchases.forEach((purchase: any) => {
    const type = purchase.feed_type || 'unknown';
    if (!feedByType[type]) {
      feedByType[type] = { quantity: 0, cost: 0 };
    }
    feedByType[type].quantity += purchase.quantity_kg || 0;
    feedByType[type].cost += purchase.total_cost || 0;
  });

  // Calculate average feed rate
  const avgFeedRate = feedPurchases.length > 0 ?
    feedPurchases.reduce((sum: number, p: any) => sum + (p.rate_per_kg || 0), 0) / feedPurchases.length : 0;

  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">4. Feed Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feed Consumption Overview */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Feed Consumption</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Feed Consumed:</span>
              <span className="font-semibold">{(totalFeedConsumed / 1000).toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Feed Per Bird:</span>
              <span className="font-semibold">{feedPerBird.toFixed(0)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Daily Feed/Bird:</span>
              <span className="font-semibold">
                {dailyLogs.length > 0 ? (feedPerBird / dailyLogs.length).toFixed(1) : 0}g
              </span>
            </div>
          </div>
        </div>

        {/* Feed Cost Overview */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Feed Cost</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Feed Cost:</span>
              <span className="font-semibold">₹{totalFeedCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost Per Kg Produced:</span>
              <span className="font-semibold">₹{costPerKgProduced.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Feed Rate:</span>
              <span className="font-semibold">₹{avgFeedRate.toFixed(2)}/kg</span>
            </div>
          </div>
        </div>

        {/* Feed Type Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Feed Type Breakdown</h3>
          {Object.keys(feedByType).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feed Type</th>
                    <th className="text-right py-2">Quantity (kg)</th>
                    <th className="text-right py-2">Cost (₹)</th>
                    <th className="text-right py-2">Avg Rate (₹/kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(feedByType).map(([type, data]) => (
                    <tr key={type} className="border-b">
                      <td className="py-2 capitalize">{type}</td>
                      <td className="text-right py-2">{data.quantity.toLocaleString('en-IN')}</td>
                      <td className="text-right py-2">₹{data.cost.toLocaleString('en-IN')}</td>
                      <td className="text-right py-2">₹{(data.cost / data.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              No feed purchase data available.
            </div>
          )}
        </div>

        {/* Feed Efficiency Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Feed Efficiency Analysis</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Feed Conversion:</strong>{' '}
              {feedPerBird < 1800 ? '🟢 Excellent feed efficiency - birds are converting feed efficiently.' :
               feedPerBird < 2000 ? '🟡 Good feed efficiency within normal range.' :
               '🟠 Feed efficiency below target - review feed formulation and bird health.'}
            </p>
            <p>
              <strong>Cost Efficiency:</strong>{' '}
              {costPerKgProduced < 30 ? '🟢 Excellent cost efficiency.' :
               costPerKgProduced < 35 ? '🟡 Good cost efficiency.' :
               '🟠 Cost efficiency needs improvement - consider alternative feed sources or suppliers.'}
            </p>
            <p>
              <strong>Feed Management:</strong>{' '}
              {feedPurchases.length > 0 ? 
                `${feedPurchases.length} feed purchases recorded. Good tracking practice.` :
                '⚠️ No feed purchases recorded. Start tracking feed purchases for better cost analysis.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
