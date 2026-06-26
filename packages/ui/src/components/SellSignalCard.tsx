// PoultryPulse AI — Sell Signal Card Component
// File: packages/ui/src/components/SellSignalCard.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.3 (Sell Signal Screen)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { colors, spacing, radius, motion } from '../tokens';
import type { SellSignal } from '../types';

interface SellSignalCardProps {
  signal: SellSignal;
  optimalWindowStart: string;
  optimalWindowEnd: string;
  profitEstimate: number;
  onPress?: () => void;
}

const SellSignalCard: React.FC<SellSignalCardProps> = ({
  signal,
  optimalWindowStart,
  optimalWindowEnd,
  profitEstimate,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation for SELL_NOW state
  useEffect(() => {
    if (signal.signal === 'SELL_NOW') {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: motion.quick,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: motion.quick,
          useNativeDriver: true,
        }),
      ]);
      Animated.loop(pulse).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [signal.signal, pulseAnim]);

  // Signal strength bar animation on mount (Niklas Bubori principle)
  useEffect(() => {
    Animated.timing(strengthAnim, {
      toValue: signal.strength,
      duration: motion.enter,
      useNativeDriver: false,
    }).start();
  }, [signal.strength, strengthAnim]);

  // Get card styling based on signal type
  const getCardStyle = () => {
    switch (signal.signal) {
      case 'SELL_NOW':
        return {
          backgroundColor: colors.brandGreen50,
          borderColor: colors.brandGreen700,
        };
      case 'HOLD':
        return {
          backgroundColor: colors.amberLight,
          borderColor: colors.amber500,
        };
      case 'SELL_SOON':
        return {
          backgroundColor: colors.neutral50,
          borderColor: colors.neutral400,
        };
      default:
        return {
          backgroundColor: colors.neutral50,
          borderColor: colors.neutral400,
        };
    }
  };

  // Get signal text and icon
  const getSignalDisplay = () => {
    switch (signal.signal) {
      case 'SELL_NOW':
        return {
          icon: '✓',
          text: 'आज बेचें',
          subtext: 'अगले 3 दिन में बेहतरीन भाव',
        };
      case 'HOLD':
        return {
          icon: '⏸',
          text: 'रुकें',
          subtext: 'भाव ऊपर जा सकता है',
        };
      case 'SELL_SOON':
        return {
          icon: '⚠',
          text: 'सावधान',
          subtext: 'जल्दी बेचने पर विचार करें',
        };
      default:
        return {
          icon: '•',
          text: 'जांचें',
          subtext: 'भाव जांच रही है',
        };
    }
  };

  const signalDisplay = getSignalDisplay();

  // Announce signal change for accessibility
  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(
        `${signalDisplay.text}. ${signalDisplay.subtext}. Signal strength: ${signal.strength} percent.`
      );
    }
  }, [signal.signal, signal.strength, signalDisplay]);

  return (
    <TouchableOpacity
      style={[styles.container, getCardStyle()]}
      onPress={onPress}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${signalDisplay.text}. ${signalDisplay.subtext}. Signal strength ${signal.strength} percent. Estimated profit ₹${profitEstimate.toFixed(2)}`}
    >
      {/* Pulsing dot for SELL_NOW */}
      {signal.signal === 'SELL_NOW' && (
        <Animated.View
          style={[
            styles.pulsingDot,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Signal Icon and Text */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{signalDisplay.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.signalText}>{signalDisplay.text}</Text>
          <Text style={styles.subtext}>{signalDisplay.subtext}</Text>
        </View>
      </View>

      {/* Signal Strength Bar */}
      <View style={styles.strengthContainer}>
        <Text style={styles.strengthLabel}>सिग्नल ताकत</Text>
        <View style={styles.strengthBar}>
          <Animated.View
            style={[
              styles.strengthFill,
              {
                width: strengthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.strengthValue}>{signal.strength}%</Text>
      </View>

      {/* Optimal Window */}
      <View style={styles.windowContainer}>
        <Text style={styles.windowLabel}>बेचने का सर्वोत्तम समय:</Text>
        <Text style={styles.windowText}>
          {optimalWindowStart} – {optimalWindowEnd}
        </Text>
      </View>

      {/* Profit Estimate */}
      <View style={styles.profitContainer}>
        <Text style={styles.profitLabel}>अनुमानित लाभ:</Text>
        <Text style={styles.profitValue}>₹{profitEstimate.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.mobileCardPadding,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pulsingDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brandGreen700,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.mobileGap,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.mobileGap,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  signalText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 4,
  },
  subtext: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral500,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.mobileGap,
  },
  strengthLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral500,
    marginRight: 8,
    width: 80,
  },
  strengthBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    backgroundColor: colors.brandGreen700,
    borderRadius: 4,
  },
  strengthValue: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 12,
    color: colors.neutral900,
    marginLeft: 8,
    width: 40,
    textAlign: 'right',
  },
  windowContainer: {
    marginBottom: spacing.mobileGap,
  },
  windowLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral500,
    marginBottom: 4,
  },
  windowText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral900,
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.mobileGap,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  profitLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral500,
  },
  profitValue: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: colors.brandGreen700,
  },
});

export default SellSignalCard;
