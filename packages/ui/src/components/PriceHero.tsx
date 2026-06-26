// PoultryPulse AI — Price Hero Component
// File: packages/ui/src/components/PriceHero.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.2 (Price Forecast Hero Screen)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { colors, spacing, radius, motion, elevation } from '../tokens';
import type { PredictionResult } from '../types';

interface PriceHeroProps {
  prediction: PredictionResult;
  isStale: boolean;
  mandiName: string;
}

const PriceHero: React.FC<PriceHeroProps> = ({
  prediction,
  isStale,
  mandiName,
}) => {
  const { p50, p10, p90, direction, changePercent, lastUpdated, confidence } =
    prediction;

  // Calculate staleness hours
  const hoursSinceUpdate = React.useMemo(() => {
    const updateDate = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - updateDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }, [lastUpdated]);

  // Format price with Indian number system
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  // Get direction icon and color
  const getDirectionIcon = (): string => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getDirectionColor = (): string => {
    switch (direction) {
      case 'up':
        return colors.brandGreen700;
      case 'down':
        return colors.red600;
      default:
        return colors.neutral500;
    }
  };

  // Announce price change for accessibility using accessibilityLiveRegion
  React.useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(
        `Price ${direction === 'up' ? 'increased' : direction === 'down' ? 'decreased' : 'remained stable'} by ${Math.abs(changePercent).toFixed(1)} percent`
      );
    }
  }, [direction, changePercent]);

  return (
    <View 
      style={styles.container} 
      accessible 
      accessibilityLabel={`Current price for ${mandiName} is ₹${formatPrice(p50)} per kilogram`}
      accessibilityLiveRegion="polite"
    >
      {/* Stale Data Banner */}
      {isStale && (
        <View style={styles.staleBanner}>
          <Text style={styles.staleText}>
            यह डेटा {hoursSinceUpdate} घंटे पुराना है
          </Text>
        </View>
      )}

      {/* Price Display */}
      <View style={styles.priceContainer}>
        <Text
          style={styles.priceText}
          maxFontSizeMultiplier={1.2}
          accessibilityLabel={`Price ${formatPrice(p50)} rupees per kilogram`}
        >
          ₹{formatPrice(p50)}
        </Text>
        <Text style={styles.unitLabel}>₹/kg</Text>
      </View>

      {/* Price Change Indicator */}
      <View style={styles.changeContainer}>
        <Text style={[styles.changeText, { color: getDirectionColor() }]}>
          {getDirectionIcon()} {Math.abs(changePercent).toFixed(1)}%
        </Text>
        <Text style={styles.changeLabel}>vs yesterday</Text>
      </View>

      {/* Confidence Range Bar */}
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>
          ₹{formatPrice(p10)} – ₹{formatPrice(p90)} के बीच ({confidence}% संभावना)
        </Text>
        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              {
                left: `${((p10 - p10) / (p90 - p10)) * 100}%`,
                width: '100%',
              },
            ]}
          />
          <View
            style={[
              styles.p50Marker,
              {
                left: `${((p50 - p10) / (p90 - p10)) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Last Updated */}
      <View style={styles.updatedContainer}>
        <Text style={styles.updatedText}>
          अंतिम अपडेट: {new Date(lastUpdated).toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardSurface,
    borderRadius: radius.lg,
    padding: spacing.mobileCardPadding,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: elevation.md,
      },
    }),
  },
  staleBanner: {
    backgroundColor: colors.amberLight,
    paddingHorizontal: spacing.mobilePadding,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginBottom: spacing.mobileGap,
  },
  staleText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 12,
    color: colors.amber500,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: spacing.mobileGap,
  },
  priceText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 56,
    fontWeight: '800',
    color: colors.neutral900,
    lineHeight: 64,
    letterSpacing: -1,
  },
  unitLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral500,
    marginTop: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.mobileGap,
  },
  changeText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 16,
    fontWeight: '600',
  },
  changeLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral500,
  },
  confidenceContainer: {
    marginTop: spacing.mobileGap,
  },
  confidenceLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 13,
    color: colors.neutral400,
    marginBottom: 8,
    textAlign: 'center',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.neutral100,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  confidenceFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.brandGreen500,
    borderRadius: 4,
  },
  p50Marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.neutral900,
    transform: [{ translateX: -1 }],
  },
  updatedContainer: {
    marginTop: spacing.mobileGap,
  },
  updatedText: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 11,
    color: colors.neutral400,
    textAlign: 'center',
  },
});

export default PriceHero;
