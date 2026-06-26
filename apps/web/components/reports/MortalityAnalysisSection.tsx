interface MortalityAnalysisSectionProps {
  dailyLogs: any[];
  totalDeaths: number;
  mortalityPct: number;
  durationDays: number;
  isDataLocked: boolean;
}

export function MortalityAnalysisSection({
  dailyLogs,
  totalDeaths,
  mortalityPct,
  durationDays,
  isDataLocked,
}: MortalityAnalysisSectionProps) {
  // Group deaths by cause
  const deathCauses: Record<string, number> = {};
  dailyLogs.forEach((log: any) => {
    if (log.deaths_today > 0) {
      const cause = log.death_cause || 'unknown';
      deathCauses[cause] = (deathCauses[cause] || 0) + log.deaths_today;
    }
  });

  // Calculate daily mortality rate
  const dailyMortalityData = dailyLogs.map((log: any) => ({
    date: log.log_date,
    deaths: log.deaths_today || 0,
    cause: log.death_cause || 'unknown',
  }));

  // Find mortality spikes (days with >1% daily mortality)
  const mortalitySpikes = dailyMortalityData.filter(
    (day: any) => day.deaths > 0 && (day.deaths / (dailyLogs.length > 0 ? dailyLogs[0].birds_placed || 1000 : 1000)) > 0.01
  );

  // Calculate average daily mortality
  const avgDailyMortality = durationDays > 0 ? totalDeaths / durationDays : 0;

  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">3. Mortality Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mortality Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Mortality Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Deaths:</span>
              <span className="font-semibold">{totalDeaths.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cumulative Mortality %:</span>
              <span className={`font-semibold ${mortalityPct > 5 ? 'text-red-600' : mortalityPct > 3 ? 'text-amber-600' : 'text-green-600'}`}>
                {mortalityPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Daily Deaths:</span>
              <span className="font-semibold">{avgDailyMortality.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">{durationDays} days</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
            <strong>Status:</strong>{' '}
            {mortalityPct < 3 ? '🟢 Normal mortality rate' :
             mortalityPct < 5 ? '🟡 Elevated mortality - monitor closely' :
             '🔴 Critical mortality - investigate immediately'}
          </div>
        </div>

        {/* Cause Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Cause of Death Breakdown</h3>
          {Object.keys(deathCauses).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(deathCauses)
                .sort(([, a], [, b]) => b - a)
                .map(([cause, count]) => {
                  const percentage = totalDeaths > 0 ? (count / totalDeaths) * 100 : 0;
                  return (
                    <div key={cause} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{cause}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{count}</span>
                        <span className="text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              No cause data logged. Log causes daily for better insights.
            </div>
          )}
        </div>

        {/* Mortality Spikes */}
        {mortalitySpikes.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 ring-1 ring-red-200 md:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">⚠️ Mortality Spike Events</h3>
            <div className="space-y-2 text-sm">
              {mortalitySpikes.slice(0, 5).map((spike: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                  <div>
                    <span className="font-semibold">{new Date(spike.date).toLocaleDateString('en-IN')}</span>
                    <span className="text-gray-500 ml-2 capitalize">({spike.cause})</span>
                  </div>
                  <span className="font-semibold text-red-600">{spike.deaths} deaths</span>
                </div>
              ))}
              {mortalitySpikes.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  +{mortalitySpikes.length - 5} more spike events
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4 ring-1 ring-blue-200 md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Mortality Analysis Insights</h3>
          <div className="text-sm text-gray-700 space-y-2">
            {mortalityPct < 3 && (
              <p>✅ Mortality rate is within normal range. Continue current management practices.</p>
            )}
            {mortalityPct >= 3 && mortalityPct < 5 && (
              <p>⚠️ Mortality rate is elevated. Review health management, feed quality, and environmental conditions.</p>
            )}
            {mortalityPct >= 5 && (
              <p>🔴 Mortality rate is critical. Immediate investigation recommended. Check for disease outbreaks, environmental stress, or feed issues.</p>
            )}
            {Object.keys(deathCauses).length > 0 && deathCauses['disease'] > 0 && (
              <p>🏥 Disease-related deaths detected. Review vaccination schedule and biosecurity measures.</p>
            )}
            {Object.keys(deathCauses).length > 0 && deathCauses['heat'] > 0 && (
              <p>🌡️ Heat-related deaths detected. Improve ventilation and cooling systems, especially during hot periods.</p>
            )}
            {mortalitySpikes.length > 0 && (
              <p>📊 {mortalitySpikes.length} mortality spike events detected. Review daily logs for spike dates to identify patterns.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
