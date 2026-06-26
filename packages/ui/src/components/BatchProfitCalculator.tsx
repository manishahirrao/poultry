// PoultryPulse AI — Batch Profit Calculator Component
// File: packages/ui/src/components/BatchProfitCalculator.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.3 (Sell Signal Screen)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { colors, spacing, radius } from '../tokens';

interface BatchProfitCalculatorProps {
  initialFlockSize?: number;
  initialAvgWeight?: number;
  currentPrice?: number;
  onProfitChange?: (profit: number) => void;
}

const BatchProfitCalculator: React.FC<BatchProfitCalculatorProps> = ({
  initialFlockSize = 10000,
  initialAvgWeight = 2.5,
  currentPrice = 0,
  onProfitChange,
}) => {
  const [flockSize, setFlockSize] = useState(initialFlockSize.toString());
  const [avgWeight, setAvgWeight] = useState(initialAvgWeight.toString());
  const [pricePerKg, setPricePerKg] = useState(currentPrice.toString());

  // Calculate profit
  const calculateProfit = (): number => {
    const flock = parseFloat(flockSize) || 0;
    const weight = parseFloat(avgWeight) || 0;
    const price = parseFloat(pricePerKg) || 0;
    return flock * weight * price;
  };

  const profit = calculateProfit();

  // Notify parent of profit changes
  useEffect(() => {
    if (onProfitChange) {
      onProfitChange(profit);
    }
  }, [profit, onProfitChange]);

  const formatIndianCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>लाभ कैलकुलेटर</Text>

      {/* Flock Size Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>पक्षियों की संख्या</Text>
        <TextInput
          style={styles.input}
          value={flockSize}
          onChangeText={setFlockSize}
          keyboardType="numeric"
          placeholder="10000"
          placeholderTextColor={colors.neutral400}
        />
        <Text style={styles.unit}>पक्षी</Text>
      </View>

      {/* Average Weight Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>औसत वजन (kg)</Text>
        <TextInput
          style={styles.input}
          value={avgWeight}
          onChangeText={setAvgWeight}
          keyboardType="decimal-pad"
          placeholder="2.5"
          placeholderTextColor={colors.neutral400}
        />
        <Text style={styles.unit}>kg</Text>
      </View>

      {/* Price Per Kg Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>भाव (₹/kg)</Text>
        <TextInput
          style={styles.input}
          value={pricePerKg}
          onChangeText={setPricePerKg}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.neutral400}
        />
        <Text style={styles.unit}>₹/kg</Text>
      </View>

      {/* Profit Display */}
      <View style={styles.profitContainer}>
        <Text style={styles.profitLabel}>अनुमानित कुल लाभ:</Text>
        <Text style={styles.profitValue}>{formatIndianCurrency(profit)}</Text>
      </View>

      {/* Calculation Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>गणना विवरण:</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>कुल वजन:</Text>
          <Text style={styles.breakdownValue}>
            {((parseFloat(flockSize) || 0) * (parseFloat(avgWeight) || 0)).toFixed(2)} kg
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>भाव:</Text>
          <Text style={styles.breakdownValue}>₹{pricePerKg}/kg</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardSurface,
    borderRadius: radius.lg,
    padding: spacing.mobileCardPadding,
  },
  title: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: spacing.mobileGap,
  },
  inputGroup: {
    marginBottom: spacing.mobileGap,
    position: 'relative',
  },
  label: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral700,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 16,
    color: colors.neutral900,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    padding: 12,
    paddingRight: 60,
  },
  unit: {
    position: 'absolute',
    right: 12,
    top: 44,
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral500,
  },
  profitContainer: {
    backgroundColor: colors.brandGreen50,
    borderRadius: radius.md,
    padding: spacing.mobilePadding,
    marginTop: spacing.mobileGap,
    alignItems: 'center',
  },
  profitLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral700,
    marginBottom: 4,
  },
  profitValue: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 28,
    fontWeight: '800',
    color: colors.brandGreen700,
  },
  breakdownContainer: {
    marginTop: spacing.mobileGap,
    paddingTop: spacing.mobileGap,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  breakdownTitle: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral900,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 13,
    color: colors.neutral500,
  },
  breakdownValue: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral900,
  },
});

export default BatchProfitCalculator;
