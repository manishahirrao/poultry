// PoultryPulse AI — Sell Signal Tab Screen (Enhanced)
// File: apps/mobile/app/(tabs)/sell-signal.tsx
// Version: v2.0 | May 2026
// Design Reference: Dashboard Design v1.0 §4.2, Requirements v1.0 §11.3
// Task: TASK-022 - Mobile Sell Signal Screen with Horizontally Scrollable Decision Cards

import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Modal, FlatList, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SellSignalCard, BatchProfitCalculator, SkeletonCard } from '@poultrypulse/ui';
import { useForecast } from '../../hooks/useForecast';
import { useDistrictSelector } from '../../hooks/useDistrictSelector';
import type { MandiSlug, SellSignalWithStrength } from '@poultrypulse/types';
import { spacing } from '@poultrypulse/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Decision Card Component for Horizontally Scrollable Cards
 */
interface DecisionCardProps {
  scenario: 'today' | '+3d' | '+7d' | '+14d';
  price: number;
  revenue: number;
  signal: 'sell' | 'hold' | 'wait';
  isOptimal: boolean;
  onPress: () => void;
}

function DecisionCard({ scenario, price, revenue, signal, isOptimal, onPress }: DecisionCardProps) {
  const { t } = useTranslation();
  
  const getScenarioLabel = () => {
    switch (scenario) {
      case 'today': return 'Today';
      case '+3d': return '+3 Days';
      case '+7d': return '+7 Days';
      case '+14d': return '+14 Days';
    }
  };

  const getSignalConfig = () => {
    switch (signal) {
      case 'sell': return { icon: 'checkmark-circle', color: '#1A6B3C', text: 'Sell' };
      case 'hold': return { icon: 'time', color: '#F5A623', text: 'Hold' };
      case 'wait': return { icon: 'pause-circle', color: '#7A9C8A', text: 'Wait' };
    }
  };

  const config = getSignalConfig();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 2 cards visible at a time with padding

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.decisionCard,
        { width: cardWidth - 8 },
        isOptimal && styles.decisionCardOptimal,
      ]}
    >
      {isOptimal && (
        <View style={styles.optimalBadge}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.optimalBadgeText}>BEST</Text>
        </View>
      )}
      
      <Text style={styles.decisionScenario}>{getScenarioLabel()}</Text>
      <Text style={styles.decisionPrice}>₹{price.toFixed(0)}</Text>
      
      <View style={[styles.decisionSignalChip, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={14} color="#FFFFFF" />
        <Text style={styles.decisionSignalText}>{config.text}</Text>
      </View>
      
      <Text style={styles.decisionRevenue}>₹{(revenue / 1000).toFixed(0)}L</Text>
      <Text style={styles.decisionRevenueLabel}>25K birds</Text>
    </TouchableOpacity>
  );
}

/**
 * Sell Signal Tab Screen (Enhanced)
 * Tab 2: When to Sell
 * - Horizontally scrollable decision cards (Today, +3D, +7D, +14D)
 * - Optimal card highlighted with scale and green shadow
 * - Smooth native FlatList scrolling
 * - BatchProfitCalculator for profit estimation
 */
export default function SellSignalScreen() {
  const { t } = useTranslation();
  const { selectedMandi, districts, setSelectedMandi, showDistrictPicker, setShowDistrictPicker } = useDistrictSelector();
  const [showCalculator, setShowCalculator] = useState(false);
  const [flockSize, setFlockSize] = useState(25000);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const { data: forecast, isLoading, error, refetch } = useForecast({
    mandi: selectedMandi,
  });

  // Load flock size from AsyncStorage
  useEffect(() => {
    async function loadFlockSize() {
      try {
        const stored = await AsyncStorage.getItem('flock_size');
        if (stored) {
          setFlockSize(parseInt(stored, 10));
        }
      } catch (error) {
        console.error('Error loading flock size:', error);
      }
    }
    loadFlockSize();
  }, []);

  // Calculate decision scenarios for horizontal cards
  const calculateDecisionScenarios = () => {
    if (!forecast) return [];

    const scenarios = [
      { scenario: 'today' as const, days: 0 },
      { scenario: '+3d' as const, days: 3 },
      { scenario: '+7d' as const, days: 7 },
      { scenario: '+14d' as const, days: 14 },
    ];

    return scenarios.map(({ scenario, days }) => {
      // Mock price projection (replace with real forecast data)
      const price = forecast.p50 + (days * 0.5);
      
      // Calculate revenue: price * flock_size * avg_weight (assuming 1.8kg)
      const avgWeight = 1.8;
      const revenue = price * flockSize * avgWeight;
      
      // Determine signal based on price trend
      let signal: 'sell' | 'hold' | 'wait';
      if (days === 0) {
        signal = price > forecast.p50 ? 'sell' : 'hold';
      } else if (days === 7) {
        signal = 'sell'; // Optimal window
      } else {
        signal = 'wait';
      }

      return {
        scenario,
        price,
        revenue,
        signal,
        isOptimal: scenario === '+7d', // +7D is optimal per design spec
      };
    });
  };

  const decisionScenarios = calculateDecisionScenarios();
  const optimalIndex = decisionScenarios.findIndex(s => s.isOptimal);

  // Scroll to optimal card on initial render
  useEffect(() => {
    if (optimalIndex >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: optimalIndex,
          animated: true,
          viewPosition: 0.5, // Center the card
        });
      }, 100);
    }
  }, [optimalIndex]);

  // Calculate sell signal from forecast data
  const calculateSellSignal = (): SellSignalWithStrength | null => {
    if (!forecast) return null;

    const priceChange = ((forecast.p50 - forecast.p10) / forecast.p10) * 100;
    
    let signal: 'SELL_NOW' | 'HOLD' | 'SELL_SOON';
    let signalStrength: number;
    
    if (priceChange > 5) {
      signal = 'SELL_NOW';
      signalStrength = 0.8;
    } else if (priceChange > 2) {
      signal = 'SELL_SOON';
      signalStrength = 0.6;
    } else {
      signal = 'HOLD';
      signalStrength = 0.4;
    }

    return {
      signal,
      signal_strength: signalStrength,
      optimal_window_start: new Date().toISOString(),
      optimal_window_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      profit_estimate: priceChange > 0 ? priceChange * 100 : 0,
    };
  };

  const sellSignal = calculateSellSignal();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('sell_signal.title')}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* District Selector Skeleton */}
          <View style={styles.districtSelector}>
            <View style={[styles.skeleton, { height: 16, width: '40%', marginBottom: 4 }]} />
            <View style={styles.districtValue}>
              <View style={[styles.skeleton, { height: 24, width: '50%' }]} />
              <View style={[styles.skeleton, { height: 20, width: 20 }]} />
            </View>
          </View>

          {/* Sell Signal Card Skeleton */}
          <SkeletonCard />

          {/* Accuracy Score Skeleton */}
          <View style={styles.card}>
            <View style={[styles.skeleton, { height: 16, width: '60%', marginBottom: 8 }]} />
            <View style={[styles.skeleton, { height: 32, width: '40%', marginBottom: 8 }]} />
            <View style={[styles.skeleton, { height: 8, width: '100%' }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error && !forecast) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('sell_signal.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#C0392B" />
          <Text style={styles.errorText}>{t('errors.network_error')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('sell_signal.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* District Selector */}
        <TouchableOpacity
          style={styles.districtSelector}
          onPress={() => setShowDistrictPicker(true)}
          accessibilityLabel={`${t('forecast.select_district')}: ${districts.find(d => d.value === selectedMandi)?.label}`}
          accessibilityRole="button"
          accessibilityHint="Tap to change district"
          accessible={true}
        >
        <Text style={styles.districtLabel}>{t('forecast.select_district')}</Text>
        <View style={styles.districtValue}>
          <Text style={styles.districtText}>
            {districts.find(d => d.value === selectedMandi)?.label}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#7A9C8A" />
        </View>
      </TouchableOpacity>

      {/* District Picker Modal */}
      <Modal
        visible={showDistrictPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('forecast.select_district')}</Text>
              <TouchableOpacity 
                onPress={() => setShowDistrictPicker(false)} 
                style={styles.closeButton}
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
                accessibilityHint="Close district selector"
              >
                <Ionicons name="close" size={24} color="#1C2B22" />
              </TouchableOpacity>
            </View>
            {districts.map((district) => (
              <TouchableOpacity
                key={district.value}
                style={[
                  styles.districtOption,
                  selectedMandi === district.value && styles.districtOptionSelected,
                ]}
                onPress={() => {
                  setSelectedMandi(district.value);
                  setShowDistrictPicker(false);
                }}
                accessible={true}
                accessibilityLabel={district.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedMandi === district.value }}
              >
                <Text style={[
                  styles.districtOptionText,
                  selectedMandi === district.value && styles.districtOptionTextSelected,
                ]}>
                  {district.label}
                </Text>
                {selectedMandi === district.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#1A6B3C" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* HORIZONTALLY SCROLLABLE DECISION CARDS */}
      <View style={styles.decisionCardsSection}>
        <Text style={styles.decisionCardsTitle}>Choose When to Sell</Text>
        <Text style={styles.decisionCardsSubtitle}>Revenue estimate for 25K birds</Text>
        
        <FlatList
          ref={flatListRef}
          data={decisionScenarios}
          keyExtractor={(item) => item.scenario}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={(Dimensions.get('window').width - 48) / 2}
          decelerationRate="fast"
          contentContainerStyle={styles.decisionCardsContainer}
          renderItem={({ item }) => (
            <DecisionCard
              scenario={item.scenario}
              price={item.price}
              revenue={item.revenue}
              signal={item.signal}
              isOptimal={item.isOptimal}
              onPress={() => setSelectedScenario(item.scenario)}
            />
          )}
        />
      </View>

      {/* Sell Signal Card */}
      {sellSignal && (
        <SellSignalCard
          signal={{
            signal: sellSignal.signal as 'SELL_NOW' | 'HOLD' | 'SELL_SOON',
            strength: sellSignal.signal_strength,
            reason: 'Based on market analysis',
          }}
          optimalWindowStart={sellSignal.optimal_window_start}
          optimalWindowEnd={sellSignal.optimal_window_end}
          profitEstimate={sellSignal.profit_estimate}
        />
      )}

      {/* Batch Calculator Toggle */}
      <TouchableOpacity
        style={styles.calculatorToggle}
        onPress={() => setShowCalculator(!showCalculator)}
      >
        <View style={styles.calculatorToggleContent}>
          <Ionicons name="calculator" size={24} color="#1A6B3C" />
          <Text style={styles.calculatorToggleText}>{t('calculator.title')}</Text>
          <Ionicons
            name={showCalculator ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#7A9C8A"
          />
        </View>
      </TouchableOpacity>

      {/* Batch Profit Calculator */}
      {showCalculator && (
        <View style={styles.calculatorContainer}>
          <BatchProfitCalculator
            currentPrice={forecast?.p50 || 0}
            onProfitChange={(profit: number) => {
              console.log('Calculated profit:', profit);
            }}
          />
        </View>
      )}

      {/* Batch Management Section (Placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('onboarding.flock_size_selection')}</Text>
        <View style={styles.batchPlaceholder}>
          <Ionicons name="layers" size={48} color="#7A9C8A" />
          <Text style={styles.batchPlaceholderText}>
            {t('calculator.select_flock_size')}
          </Text>
          <TouchableOpacity style={styles.addBatchButton}>
            <Text style={styles.addBatchButtonText}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Historical Accuracy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sell_signal.historical_accuracy')}</Text>
        <View style={styles.accuracyRow}>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyValue}>87%</Text>
            <Text style={styles.accuracyLabel}>{t('sell_signal.directional_accuracy')}</Text>
          </View>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyValue}>3.2%</Text>
            <Text style={styles.accuracyLabel}>{t('sell_signal.mape')}</Text>
          </View>
        </View>
        <Text style={styles.accuracyNote}>
          {t('sell_signal.last_30_days')}
        </Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{t('sell_signal.sell_signal_explanation')}</Text>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5EE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  contentContainer: {
    paddingTop: spacing.mobile.xl,
    paddingHorizontal: spacing.mobile.padding,
    paddingBottom: spacing.mobile.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
  },
  loadingText: {
    fontSize: 16,
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F7FAF8',
  },
  errorText: {
    fontSize: 16,
    color: '#C0392B',
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  retryButton: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  calculatorToggle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
  },
  calculatorToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calculatorToggleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2B22',
    marginLeft: 12,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  calculatorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2B22',
    marginBottom: spacing.mobile.elementGap,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  batchPlaceholder: {
    height: 150,
    backgroundColor: '#EAF1ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchPlaceholderText: {
    fontSize: 14,
    color: '#5A7A68',
    marginTop: spacing.mobile.tightGap,
    marginBottom: spacing.mobile.lg,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  addBatchButton: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBatchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.mobile.tightGap,
  },
  accuracyItem: {
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A6B3C',
    fontFamily: 'Sora',
  },
  accuracyLabel: {
    fontSize: 12,
    color: '#5A7A68',
    marginTop: spacing.mobile.xs,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  accuracyNote: {
    fontSize: 12,
    color: '#7A9C8A',
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  decisionCardsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  decisionCardsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2B22',
    marginBottom: 4,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  decisionCardsSubtitle: {
    fontSize: 13,
    color: '#7A9C8A',
    marginBottom: 16,
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  decisionCardsContainer: {
    paddingHorizontal: 4,
  },
  decisionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E8F5EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  decisionCardOptimal: {
    borderColor: '#1A6B3C',
    backgroundColor: '#E8F5EE',
    shadowColor: '#1A6B3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  optimalBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optimalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  decisionScenario: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A7A68',
    marginBottom: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  decisionPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C2B22',
    marginBottom: 8,
    fontFamily: 'Sora',
  },
  decisionSignalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  decisionSignalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  decisionRevenue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A6B3C',
    fontFamily: 'Sora',
  },
  decisionRevenueLabel: {
    fontSize: 11,
    color: '#7A9C8A',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  disclaimer: {
    padding: spacing.mobile.cardPadding,
    backgroundColor: '#FDF0EF',
    borderRadius: 12,
    marginBottom: spacing.mobile.sectionGap,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  districtSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
  },
  districtLabel: {
    fontSize: 12,
    color: '#7A9C8A',
    marginBottom: spacing.mobile.xs,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  districtValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  districtText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.mobile.cardPaddingLg,
    paddingBottom: spacing.mobile.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.mobile.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  closeButton: {
    padding: 8,
    minHeight: 48,
    minWidth: 48,
  },
  districtOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.mobile.cardPadding,
    borderRadius: 12,
    marginBottom: spacing.mobile.tightGap,
    backgroundColor: '#F7FAF8',
    minHeight: 56,
  },
  districtOptionSelected: {
    backgroundColor: '#E8F5EE',
    borderWidth: 2,
    borderColor: '#1A6B3C',
  },
  districtOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  districtOptionTextSelected: {
    color: '#1A6B3C',
  },
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
});
