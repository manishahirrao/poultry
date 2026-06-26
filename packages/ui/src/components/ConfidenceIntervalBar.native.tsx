// PoultryPulse AI — Confidence Interval Bar Component (React Native)
// File: packages/ui/src/components/ConfidenceIntervalBar.native.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.2 (Price Forecast Hero Screen)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
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
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        ₹{formatPrice(p10)} – ₹{formatPrice(p90)} के बीच ({confidence}% संभावना)
      </Text>

      {/* Bar Container */}
      <TouchableOpacity
        style={styles.barContainer}
        onPress={() => setShowTooltipState(!showTooltipState)}
        activeOpacity={0.8}
        accessible
        accessibilityLabel={`Price range from ₹${formatPrice(p10)} to ₹${formatPrice(p90)} with ${confidence}% confidence. Median price ₹${formatPrice(p50)}`}
      >
        {/* Background Bar */}
        <View style={styles.backgroundBar} />

        {/* P10-P90 Range */}
        <View style={styles.rangeBar} />

        {/* P50 Marker */}
        <View
          style={[
            styles.p50Marker,
            {
              left: `${p50Position}%`,
            },
          ]}
        />

        {/* Tooltip */}
        {showTooltip && showTooltipState && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              P50 (माध्य): ₹{formatPrice(p50)}
            </Text>
            <Text style={styles.tooltipSubtext}>
              {confidence}% संभावना इस सीमा में
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brandGreen500 }]} />
          <Text style={styles.legendText}>P10-P90 सीमा</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.neutral900 }]} />
          <Text style={styles.legendText}>P50 (माध्य)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.mobilePadding,
  },
  label: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 13,
    color: colors.neutral400,
    marginBottom: 8,
    textAlign: 'center',
  },
  barContainer: {
    height: 24,
    position: 'relative',
    marginBottom: spacing.mobileGap,
  },
  backgroundBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.neutral100,
    borderRadius: radius.sm,
  },
  rangeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.brandGreen500,
    borderRadius: radius.sm,
    opacity: 0.6,
  },
  p50Marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.neutral900,
    transform: [{ translateX: -1.5 }],
  },
  tooltip: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: colors.neutral900,
    borderRadius: radius.md,
    padding: 8,
    minWidth: 150,
    zIndex: 10,
  },
  tooltipText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  tooltipSubtext: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 10,
    color: colors.neutral400,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.mobileGap,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 11,
    color: colors.neutral500,
  },
});

export default ConfidenceIntervalBar;
