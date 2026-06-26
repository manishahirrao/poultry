// PoultryPulse AI — Empty State Component (React Native)
// File: packages/ui/src/components/EmptyState.native.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §5 (Component Library)

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius } from '../tokens';

type EmptyStateVariant = 'no-data' | 'offline' | 'error' | 'loading';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  // Get icon/illustration based on variant
  const getIcon = (): string => {
    switch (variant) {
      case 'no-data':
        return '📊';
      case 'offline':
        return '📡';
      case 'error':
        return '⚠️';
      case 'loading':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  // Get background color based on variant
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'offline':
        return colors.amberLight;
      case 'error':
        return colors.redLight;
      default:
        return colors.neutral50;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      {/* Icon/Illustration */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Message */}
      {message && <Text style={styles.message}>{message}</Text>}

      {/* Action Button */}
      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.mobileCardPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.mobileGap,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral900,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    marginBottom: spacing.mobileGap,
  },
  actionContainer: {
    marginTop: spacing.mobileGap,
  },
  actionLabel: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGreen700,
    textAlign: 'center',
  },
});

export default EmptyState;
