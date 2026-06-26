'use client';

interface AccuracyData {
  mape: number;
  directionalAccuracy: number;
  conformalCoverage: number;
  mapeTrend: Array<{ date: string; mape: number }>;
  scatterData: Array<{ actual: number; predicted: number; date: string }>;
  featureImportance: Array<{ feature: string; importance: number }>;
  modelTimeline: Array<{
    version: string;
    mape: number;
    directionalAccuracy: number;
    date: string;
    status: 'promoted' | 'rejected' | 'rollback';
  }>;
  lastUpdated: string;
}

interface AccuracyDashboardPDFProps {
  data: AccuracyData;
}

export function AccuracyDashboardPDF({ data }: AccuracyDashboardPDFProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">FlockIQ</h1>
        <h2 className="text-xl font-semibold text-neutral-700 mt-1">Accuracy Dashboard Report</h2>
        <p className="text-sm text-neutral-500 mt-2">
          Generated on {formatDate(data.lastUpdated)}
        </p>
      </div>

      {/* Executive Summary */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">Executive Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">MAPE</div>
            <div className="text-2xl font-bold text-neutral-900">{data.mape.toFixed(2)}%</div>
            <div className="text-xs text-neutral-500 mt-1">Target: &lt;6%</div>
          </div>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">Directional Accuracy</div>
            <div className="text-2xl font-bold text-neutral-900">{data.directionalAccuracy.toFixed(1)}%</div>
            <div className="text-xs text-neutral-500 mt-1">Target: &gt;95%</div>
          </div>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">Conformal Coverage</div>
            <div className="text-2xl font-bold text-neutral-900">{data.conformalCoverage.toFixed(1)}%</div>
            <div className="text-xs text-neutral-500 mt-1">Target: 78-82%</div>
          </div>
        </div>
      </div>

      {/* MAPE Trend */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">30-Day MAPE Trend</h3>
        <div className="bg-neutral-50 p-4 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">MAPE</th>
              </tr>
            </thead>
            <tbody>
              {data.mapeTrend.slice(-10).map((item) => (
                <tr key={item.date} className="border-b border-neutral-100">
                  <td className="py-2">{formatDate(item.date)}</td>
                  <td className="text-right">{item.mape.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">Feature Importance</h3>
        <div className="bg-neutral-50 p-4 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2">Feature</th>
                <th className="text-right py-2">Importance</th>
              </tr>
            </thead>
            <tbody>
              {data.featureImportance.map((item) => (
                <tr key={item.feature} className="border-b border-neutral-100">
                  <td className="py-2">{item.feature.replace(/_/g, ' ')}</td>
                  <td className="text-right">{(item.importance * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">Recent Model Updates</h3>
        <div className="bg-neutral-50 p-4 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2">Version</th>
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">MAPE</th>
                <th className="text-right py-2">Dir. Acc</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.modelTimeline.map((item) => (
                <tr key={item.version} className="border-b border-neutral-100">
                  <td className="py-2 font-medium">{item.version}</td>
                  <td className="py-2">{formatDate(item.date)}</td>
                  <td className="text-right">{item.mape.toFixed(2)}%</td>
                  <td className="text-right">{item.directionalAccuracy.toFixed(1)}%</td>
                  <td className="py-2 capitalize">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <p>This report is generated automatically by FlockIQ accuracy monitoring system.</p>
        <p className="mt-1">For questions, contact the engineering team.</p>
      </div>
    </div>
  );
}
