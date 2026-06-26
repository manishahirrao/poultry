interface GrowthPerformanceSectionProps {
  batch: any;
  dailyLogs: any[];
  avgWeight: number;
  durationDays: number;
  isDataLocked: boolean;
}

export function GrowthPerformanceSection({
  batch,
  dailyLogs,
  avgWeight,
  durationDays,
  isDataLocked,
}: GrowthPerformanceSectionProps) {
  // Calculate FCR
  const totalFeedConsumed = dailyLogs.reduce((sum: number, log: any) => sum + (log.feed_consumed_kg || 0), 0);
  const birdsAlive = batch.birds_alive || batch.birds_placed || 0;
  const fcr = birdsAlive > 0 && avgWeight > 0 
    ? totalFeedConsumed / (birdsAlive * (avgWeight / 1000))
    : 0;

  // Calculate ADG (Average Daily Gain)
  const adg = durationDays > 0 && avgWeight > 0 ? avgWeight / durationDays : 0;

  // Target values (based on breed standards)
  const targetFCR = 1.8;
  const targetADG = 55; // grams per day
  const targetHarvestWeight = 2100; // grams

  // Calculate variances
  const fcrVariance = fcr > 0 ? ((fcr - targetFCR) / targetFCR) * 100 : 0;
  const adgVariance = adg > 0 ? ((adg - targetADG) / targetADG) * 100 : 0;
  const weightVariance = avgWeight > 0 ? ((avgWeight - targetHarvestWeight) / targetHarvestWeight) * 100 : 0;

  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">2. Growth Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FCR Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Feed Conversion Ratio (FCR)</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {fcr > 0 ? fcr.toFixed(3) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 mb-2">Target: {targetFCR}</div>
          <div className={`text-sm font-semibold ${fcrVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {fcrVariance > 0 ? '+' : ''}{fcrVariance.toFixed(1)}% vs target
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {fcr < 1.7 ? '🟢 Excellent' : fcr < 1.9 ? '🟡 Good' : fcr < 2.1 ? '🟠 Needs Attention' : '🔴 Critical'}
          </div>
        </div>

        {/* ADG Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Average Daily Gain (ADG)</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {adg > 0 ? `${adg.toFixed(1)}g` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 mb-2">Target: {targetADG}g/day</div>
          <div className={`text-sm font-semibold ${adgVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {adgVariance > 0 ? '+' : ''}{adgVariance.toFixed(1)}% vs target
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {adg >= targetADG ? '🟢 On Target' : '🟡 Behind Target'}
          </div>
        </div>

        {/* Harvest Weight Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Harvest Weight</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {avgWeight > 0 ? `${avgWeight.toFixed(0)}g` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 mb-2">Target: {targetHarvestWeight}g</div>
          <div className={`text-sm font-semibold ${weightVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {weightVariance > 0 ? '+' : ''}{weightVariance.toFixed(1)}% vs target
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {avgWeight >= targetHarvestWeight ? '🟢 On Target' : '🟡 Below Target'}
          </div>
        </div>

        {/* Industry Comparison */}
        <div className="bg-blue-50 rounded-lg p-4 ring-1 ring-blue-200 md:col-span-2 lg:col-span-3">
          <h3 className="font-semibold text-gray-900 mb-3">Industry Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Industry Avg FCR</div>
              <div className="font-semibold">1.85</div>
              <div className={`text-xs ${fcr <= 1.85 ? 'text-green-600' : 'text-red-600'}`}>
                {fcr <= 1.85 ? '✓ Better than industry' : '✗ Below industry'}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Industry Avg ADG</div>
              <div className="font-semibold">54g/day</div>
              <div className={`text-xs ${adg >= 54 ? 'text-green-600' : 'text-red-600'}`}>
                {adg >= 54 ? '✓ Better than industry' : '✗ Below industry'}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Industry Avg Weight</div>
              <div className="font-semibold">2050g</div>
              <div className={`text-xs ${avgWeight >= 2050 ? 'text-green-600' : 'text-red-600'}`}>
                {avgWeight >= 2050 ? '✓ Better than industry' : '✗ Below industry'}
              </div>
            </div>
          </div>
        </div>

        {/* Growth Trend Summary */}
        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2 lg:col-span-3">
          <h3 className="font-semibold text-gray-900 mb-3">Growth Trend Summary</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>FCR Performance:</strong>{' '}
              {fcr < 1.7 ? 'Excellent feed efficiency. Birds are converting feed to weight very effectively.' :
               fcr < 1.9 ? 'Good feed efficiency within acceptable range.' :
               fcr < 2.1 ? 'Feed conversion needs attention. Consider reviewing feed formulation and management.' :
               'Critical feed efficiency issue. Immediate intervention recommended.'}
            </p>
            <p>
              <strong>Weight Gain:</strong>{' '}
              {adg >= targetADG ? 'Birds are gaining weight at or above target rate.' :
               'Birds are gaining weight below target rate. Review nutrition and health status.'}
            </p>
            <p>
              <strong>Overall Assessment:</strong>{' '}
              {fcr <= 1.85 && adg >= 54 ? 'This batch is performing above industry standards.' :
               fcr <= 1.9 && adg >= 52 ? 'This batch is performing within industry standards.' :
               'This batch is performing below industry standards and requires attention.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
