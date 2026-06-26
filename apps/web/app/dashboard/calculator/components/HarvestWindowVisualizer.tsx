'use client';

interface HarvestWindowVisualizerProps {
  scenarios: Array<{
    label: string;          // "TODAY" | "+3D" | "+7D" | "+14D"
    daysFromNow: number;
    price: number;          // P50 price
    netProfit: number;
    roiPct: number;
    recommendation: 'sell_now' | 'acceptable' | 'caution' | 'avoid';
  }>;
  optimalLabel: string;     // e.g., "TODAY"
}

// COLOUR BY RECOMMENDATION:
const recColours = {
  sell_now:   { bg: '#DCFCE7', border: '#16A34A', text: '#15803D', label: 'SELL NOW ⭐' },
  acceptable: { bg: '#FEF9C3', border: '#CA8A04', text: '#92400E', label: 'Acceptable' },
  caution:    { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', label: 'Risky' },
  avoid:      { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280', label: 'Avoid' },
};

export function HarvestWindowVisualizer({ scenarios, optimalLabel }: HarvestWindowVisualizerProps) {
  // Calculate feed cost accumulation per day (simplified estimate)
  const feedCostPerDay = scenarios.length > 1 
    ? (scenarios[scenarios.length - 1].netProfit - scenarios[0].netProfit) / scenarios.length
    : 0;

  // Determine price trend
  const priceTrend = scenarios.length > 1
    ? scenarios[0].price === scenarios[scenarios.length - 1].price
      ? 'Stable this week'
      : scenarios[scenarios.length - 1].price > scenarios[0].price
      ? 'Rising trend'
      : 'Declining trend — sell sooner is better'
    : 'Stable';

  return (
    <div className="border border-[#E3EDE7] rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-1">🌟 Optimal Harvest Window</h3>
      <p className="text-xs text-gray-500 mb-4">
        Based on price forecast + mortality risk + feed cost accumulation
      </p>

      {/* Visual bar chart representation */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
        {scenarios.map(s => {
          const colours = recColours[s.recommendation];
          const isOptimal = s.label === optimalLabel;
          return (
            <div key={s.label}
                 className="rounded-xl border-2 p-3 text-center transition-transform hover:scale-105"
                 style={{ backgroundColor: colours.bg, borderColor: colours.border }}
            >
              <p className="text-xs font-bold" style={{ color: colours.text }}>
                {s.label}
                {isOptimal && <span className="ml-1">⭐</span>}
              </p>
              <p className="text-xs mt-1" style={{ color: colours.text }}>{colours.label}</p>
              <div className="mt-2 pt-2 border-t" style={{ borderColor: colours.border + '40' }}>
                <p className="text-xs text-gray-600">₹{s.price}/kg</p>
                <p className="text-xs font-semibold" style={{ color: colours.text }}>
                  ₹{(s.netProfit / 100000).toFixed(1)}L profit
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Context lines below */}
      <div className="mt-4 space-y-1.5">
        <p className="text-xs text-gray-500">
          📈 Price forecast: {priceTrend}
        </p>
        <p className="text-xs text-gray-500">
          💸 Feed cost accumulates: ₹{Math.abs(feedCostPerDay).toFixed(0)}/day you hold
        </p>
      </div>
    </div>
  );
}
