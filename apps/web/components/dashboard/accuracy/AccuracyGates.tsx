'use client';

import { getAccuracyColour } from '@/lib/charts/config';

interface AccuracyMetrics {
  directional_accuracy_30d: number;
  mape_30d: number;
  conformal_coverage_30d: number;
  prediction_count_30d: number;
  last_updated: string;
}

interface AccuracyGatesProps {
  accuracy: AccuracyMetrics;
}

export function AccuracyGates({ accuracy }: AccuracyGatesProps) {
  const gates = [
    {
      label: 'Directional Accuracy',
      value: accuracy.directional_accuracy_30d,
      target: '≥ 95%',
      status: accuracy.directional_accuracy_30d >= 95 ? 'pass' : 'fail',
      description: 'Percentage of correct up/down predictions',
    },
    {
      label: 'MAPE',
      value: accuracy.mape_30d,
      target: '< 6%',
      status: accuracy.mape_30d < 6 ? 'pass' : 'fail',
      description: 'Mean Absolute Percentage Error',
    },
    {
      label: 'Conformal Coverage',
      value: accuracy.conformal_coverage_30d,
      target: '78-82%',
      status: accuracy.conformal_coverage_30d >= 78 && accuracy.conformal_coverage_30d <= 82 ? 'pass' : 'fail',
      description: 'Percentage of actuals within P10-P90 range',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="text-base font-semibold text-neutral-900 mb-6">Accuracy Gates</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gates.map((gate) => (
          <div
            key={gate.label}
            className={`p-6 rounded-xl border-2 ${
              gate.status === 'pass'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                {gate.label}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  gate.status === 'pass'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {gate.status.toUpperCase()}
              </span>
            </div>

            <div className="text-4xl font-bold mb-1" style={{ fontFamily: "'Sora', system-ui" }}>
              {gate.value.toFixed(1)}%
            </div>

            <div className="text-sm text-neutral-600 mb-3">
              Target: {gate.target}
            </div>

            <div className="text-xs text-neutral-500">
              {gate.description}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
            Prediction Count (30d)
          </div>
          <div className="text-lg font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
            {accuracy.prediction_count_30d}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
            Last Updated
          </div>
          <div className="text-sm font-semibold text-neutral-900">
            {new Date(accuracy.last_updated).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
            Data Source
          </div>
          <div className="text-sm font-semibold text-neutral-900">
            Production
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
            Gates Passed
          </div>
          <div className="text-lg font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
            {gates.filter(g => g.status === 'pass').length}/{gates.length}
          </div>
        </div>
      </div>
    </div>
  );
}
