// PoultryPulse AI — Confidence Interval Bar Component (Web)
// File: packages/ui/src/components/ConfidenceIntervalBar.tsx
// Platform: Web (React)
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.2 (Price Forecast Hero Screen)

import React, { useState } from 'react';
import { colors, spacing, radius } from '../tokens';

interface ConfidenceIntervalBarProps {
  p10: number;
  p50: number;
  p90: number;
  confidence?: number;
  showTooltip?: boolean;
}

const ConfidenceIntervalBar: React.FC<ConfidenceIntervalBarProps> = ({
  p10,
  p50,
  p90,
  confidence = 80,
  showTooltip = true,
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Calculate positions for the bar
  const range = p90 - p10;
  const p10Position = 0;
  const p50Position = ((p50 - p10) / range) * 100;
  const p90Position = 100;

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <div className="confidence-interval-bar" style={styles.container}>
      {/* Label */}
      <div style={styles.label}>
        ₹{formatPrice(p10)} – ₹{formatPrice(p90)} के बीच ({confidence}% संभावना)
      </div>

      {/* Bar Container */}
      <div
        style={styles.barContainer}
        onClick={() => setShowTooltipState(!showTooltipState)}
        role="button"
        tabIndex={0}
        aria-label={`Price range from ₹${formatPrice(p10)} to ₹${formatPrice(p90)} with ${confidence}% confidence. Median price ₹${formatPrice(p50)}`}
      >
        {/* Background Bar */}
        <div style={styles.backgroundBar} />

        {/* P10-P90 Range */}
        <div style={styles.rangeBar} />

        {/* P50 Marker */}
        <div
          style={{
            ...styles.p50Marker,
            left: `${p50Position}%`,
          }}
        />

        {/* Tooltip */}
        {showTooltip && showTooltipState && (
          <div style={styles.tooltip}>
            <div style={styles.tooltipText}>
              P50 (माध्य): ₹{formatPrice(p50)}
            </div>
            <div style={styles.tooltipSubtext}>
              {confidence}% संभावना इस सीमा में
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: colors.brandGreen500 }} />
          <div style={styles.legendText}>P10-P90 सीमा</div>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: colors.neutral900 }} />
          <div style={styles.legendText}>P50 (माध्य)</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: `${spacing.mobilePadding}px`,
  },
  label: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: '13px',
    color: colors.neutral400,
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  barContainer: {
    height: '24px',
    position: 'relative' as const,
    marginBottom: `${spacing.mobileGap}px`,
    cursor: 'pointer',
  },
  backgroundBar: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.neutral100,
    borderRadius: `${radius.sm}px`,
  },
  rangeBar: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.brandGreen500,
    borderRadius: `${radius.sm}px`,
    opacity: 0.6,
  },
  p50Marker: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: '3px',
    backgroundColor: colors.neutral900,
    transform: 'translateX(-1.5px)',
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-75px)',
    backgroundColor: colors.neutral900,
    borderRadius: `${radius.md}px`,
    padding: '8px',
    minWidth: '150px',
    zIndex: 10,
  },
  tooltipText: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.white,
    textAlign: 'center' as const,
    marginBottom: '2px',
  },
  tooltipSubtext: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: '10px',
    color: colors.neutral400,
    textAlign: 'center' as const,
  },
  legend: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    gap: `${spacing.mobileGap}px`,
  },
  legendItem: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    marginRight: '6px',
  },
  legendText: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: '11px',
    color: colors.neutral500,
  },
};

export default ConfidenceIntervalBar;
