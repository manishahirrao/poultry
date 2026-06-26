// PoultryPulse AI — Alert Card Component (React Native)
// File: packages/ui/src/components/AlertCard.native.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.4 (Alert Feed Screen)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, spacing, radius, elevation } from '../tokens';
import type { Alert } from '../types';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  // Get visual treatment based on alert type
  const getAlertStyle = () => {
    switch (alert.type) {
      case 'HPAI':
      case 'PRICE_CRASH':
        return {
          backgroundColor: colors.redLight,
          borderColor: colors.red600,
          icon: '🚨',
        };
      case 'HEAT_WAVE':
      case 'FEED_COST':
        return {
          backgroundColor: colors.amberLight,
          borderColor: colors.amber500,
          icon: '🌡️',
        };
      case 'POLICY':
        return {
          backgroundColor: '#E8F4FD',
          borderColor: '#2563EB',
          icon: '⚖️',
        };
      default:
        return {
          backgroundColor: colors.neutral50,
          borderColor: colors.neutral400,
          icon: 'ℹ️',
        };
    }
  };

  const alertStyle = getAlertStyle();

  // Get severity indicator
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'high':
        return colors.red600;
      case 'medium':
        return colors.amber500;
      case 'low':
        return colors.brandGreen700;
      default:
        return colors.neutral500;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: alertStyle.borderColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`${alert.title}. ${alert.message}`}
    >
      {/* Left border for severity */}
      <View style={[styles.leftBorder, { backgroundColor: alertStyle.borderColor }]} />

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{alertStyle.icon}</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
        {alert.source && (
          <Text style={styles.source}>स्रोत: {alert.source}</Text>
        )}
      </View>

      {/* Timestamp */}
      <View style={styles.timestampContainer}>
        <Text style={styles.timestamp}>
          {new Date(alert.timestamp).toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.mobileCardPadding,
    marginBottom: spacing.mobileGap,
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
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.mobileGap,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral700,
    marginBottom: 4,
  },
  source: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral400,
  },
  timestampContainer: {
    marginLeft: spacing.mobileGap,
  },
  timestamp: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 11,
    color: colors.neutral400,
  },
});

export default AlertCard;
