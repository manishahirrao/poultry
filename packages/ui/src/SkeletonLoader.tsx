// PoultryPulse AI — Skeleton Loader Component
// File: packages/ui/src/SkeletonLoader.tsx
// Version: v1.0 | May 2026
// Design Reference: UI/UX v1.0 §3.5
// Task: UX/UI Improvement - Loading States

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

/**
 * Skeleton component for loading states
 * Provides a shimmering placeholder while content loads
 */
export function Skeleton({ width = '100%', height = 40, style }: SkeletonProps) {
  return (
    <View style={[styles.skeleton, { width, height }, style]} />
  );
}

interface SkeletonCardProps {
  style?: any;
}

/**
 * Skeleton card component mimicking the PriceHero card structure
 */
export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={24} style={styles.marginBottom} />
      <Skeleton width="40%" height={48} style={styles.marginBottom} />
      <Skeleton width="100%" height={8} style={styles.marginBottom} />
      <View style={styles.row}>
        <Skeleton width="30%" height={16} />
        <Skeleton width="30%" height={16} />
      </View>
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  style?: any;
}

/**
 * Skeleton list component for loading list items
 */
export function SkeletonList({ count = 3, style }: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItem, index < count - 1 && styles.marginBottom]}>
          <Skeleton width="80%" height={20} style={styles.marginBottom} />
          <Skeleton width="100%" height={14} style={styles.marginBottom} />
          <Skeleton width="60%" height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E5E3',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  marginBottom: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
});
