// Shared Recharts config for all dashboard charts
// P10/P50/P90 rule: ALL THREE always visible — never hidden

export const CHART_COLOURS = {
  p50:    '#1A6B3C',  // brandGreen700
  p10:    '#7CC49A',  // light green
  p90:    '#0F4A28',  // dark green
  actual: '#E8621A',  // saffronOrange
  good:   '#16A34A',  // within 5% error
  warn:   '#D97706',  // 5-10% error
  bad:    '#DC2626',  // >10% error
  grid:   '#E2EBE6',
  axis:   '#5A7A68',
} as const;

// Standard chart margins
export const CHART_MARGIN = { top: 8, right: 16, bottom: 8, left: 0 };

// Standard tooltip style (shared across all charts)
export const tooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #E2EBE6',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', system-ui",
    padding: '8px 12px',
  },
  labelStyle: { color: '#334D3E', fontWeight: 600 },
  itemStyle: { color: '#5A7A68' },
};

// Standard axis props
export const xAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_COLOURS.axis, fontSize: 11, fontFamily: "'Plus Jakarta Sans', system-ui" },
  dy: 8,
};

export const yAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_COLOURS.axis, fontSize: 11 },
  width: 52,
  tickFormatter: (v: number) => `₹${v}`,
};

// P10/P50/P90 Area definitions (use in AreaChart)
// RULE: All three MUST be present in every price forecast chart
export const P50_AREA_PROPS = {
  type: 'monotone' as const,
  dataKey: 'p50',
  stroke: CHART_COLOURS.p50,
  strokeWidth: 2,
  fill: 'none',
  dot: false,
  activeDot: { r: 4, fill: CHART_COLOURS.p50 },
};

export const P10_AREA_PROPS = {
  type: 'monotone' as const,
  dataKey: 'p10',
  stroke: CHART_COLOURS.p10,
  strokeWidth: 1,
  strokeDasharray: '4 4',
  fill: 'none',
  dot: false,
};

export const P90_AREA_PROPS = {
  type: 'monotone' as const,
  dataKey: 'p90',
  stroke: CHART_COLOURS.p90,
  strokeWidth: 1,
  strokeDasharray: '4 4',
  fill: 'none',
  dot: false,
};

export const ACTUAL_SCATTER_PROPS = {
  type: 'monotone' as const,
  dataKey: 'actual_price',
  stroke: CHART_COLOURS.actual,
  strokeWidth: 0,
  dot: { r: 3, fill: CHART_COLOURS.actual, strokeWidth: 0 },
  activeDot: { r: 5, fill: CHART_COLOURS.actual },
};

// Accuracy gate colour helper
export function getAccuracyColour(value: number, metric: 'directional' | 'mape' | 'coverage'): string {
  if (metric === 'directional') {
    return value >= 95 ? CHART_COLOURS.good : value >= 90 ? CHART_COLOURS.warn : CHART_COLOURS.bad;
  }
  if (metric === 'mape') {
    return value < 6 ? CHART_COLOURS.good : value < 8 ? CHART_COLOURS.warn : CHART_COLOURS.bad;
  }
  if (metric === 'coverage') {
    return value >= 78 && value <= 82 ? CHART_COLOURS.good : CHART_COLOURS.warn;
  }
  return CHART_COLOURS.good;
}
