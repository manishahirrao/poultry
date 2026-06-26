// PoultryPulse AI — Forecast Tab Screen (Enhanced)
// File: apps/mobile/app/(tabs)/forecast.tsx
// Version: v2.0 | May 2026
// Design Reference: Dashboard Design v1.0 §4.1, Requirements v1.0 §11.1
// Task: TASK-021 - Mobile Enhanced Home Screen

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Modal, TextInput, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useForecast } from '../../hooks/useForecast';
import { useDistrictSelector } from '../../hooks/useDistrictSelector';
import { useAlerts } from '../../hooks/useAlerts';
import { PriceHero, ConfidenceIntervalBar, SkeletonCard, SkeletonList } from '@poultrypulse/ui';
import type { MandiSlug } from '@poultrypulse/types';
import { spacing } from '@poultrypulse/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BiometricLock } from '../../src/components/BiometricLock';
import { supabase } from '../../src/lib/supabase';

/**
 * Accuracy Trust Strip Component (48dp)
 */
function AccuracyTrustStrip({ accuracy, directionalAccuracy, predictionCount }: { accuracy: number; directionalAccuracy: number; predictionCount: number }) {
  const { t } = useTranslation();
  
  const getAccuracyColor = () => {
    if (accuracy < 6) return '#1A6B3C'; // green
    if (accuracy <= 8) return '#F5A623'; // amber
    return '#C0392B'; // red
  };

  return (
    <View style={styles.accuracyStrip}>
      <View style={styles.accuracyRow}>
        <Text style={styles.accuracyLabel}>Accuracy Error (MAPE)</Text>
        <View style={styles.accuracyValueContainer}>
          <View style={[styles.accuracyDot, { backgroundColor: getAccuracyColor() }]} />
          <Text style={[styles.accuracyValue, { color: getAccuracyColor() }]}>{accuracy.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={styles.accuracyRow}>
        <Text style={styles.accuracyLabel}>Directional Accuracy</Text>
        <Text style={styles.accuracyValue}>{directionalAccuracy.toFixed(1)}%</Text>
      </View>
      <Text style={styles.accuracyMeta}>{predictionCount} Predictions Verified</Text>
    </View>
  );
}

/**
 * Sell Signal Badge Component (52dp full-width pill)
 */
function SellSignalBadge({ signal, price }: { signal: 'sell' | 'hold' | 'caution'; price: number }) {
  const { t } = useTranslation();
  
  const getSignalConfig = () => {
    switch (signal) {
      case 'sell':
        return { icon: 'checkmark-circle', color: '#1A6B3C', text: 'Sell Today · SELL NOW' };
      case 'hold':
        return { icon: 'time', color: '#F5A623', text: 'Hold · HOLD' };
      case 'caution':
        return { icon: 'warning', color: '#C0392B', text: 'Caution · CAUTION' };
    }
  };

  const config = getSignalConfig();

  return (
    <View style={[styles.signalBadge, { backgroundColor: config.color }]}>
      <Ionicons name={config.icon as any} size={20} color="#FFFFFF" />
      <Text style={styles.signalText}>{config.text}</Text>
    </View>
  );
}

/**
 * Price Driver Card Component
 */
function PriceDriverCard({ driver }: { driver: { impact: string; description_hi: string; description_en?: string } }) {
  const { t } = useTranslation();
  const isPositive = driver.impact === 'positive';

  return (
    <View style={styles.driverCard}>
      <Ionicons
        name={isPositive ? 'trending-up' : 'trending-down'}
        size={20}
        color={isPositive ? '#1A6B3C' : '#C0392B'}
      />
      <Text style={styles.driverText}>{driver.description_en || driver.description_hi}</Text>
    </View>
  );
}

/**
 * Sparkline Chart Component (140dp)
 */
function SparklineChart({ data }: { data: Array<{ date: string; price: number }> }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.sparklineContainer}>
        <View style={styles.sparklinePlaceholder}>
          <Ionicons name="analytics-outline" size={32} color="#7A9C8A" />
          <Text style={styles.sparklinePlaceholderText}>7-Day Chart</Text>
        </View>
      </View>
    );
  }

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 300;
    const y = 120 - ((d.price - minPrice) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.sparklineContainer}>
      <Text style={styles.sparklineTitle}>7-Day Price Trend</Text>
      <View style={styles.sparklineChart}>
        <svg width="320" height="120">
          <polyline
            fill="none"
            stroke="#1A6B3C"
            strokeWidth="2"
            points={points}
          />
        </svg>
      </View>
    </View>
  );
}

/**
 * Feed Cost Mini-Card Component (80dp)
 */
function FeedCostMiniCard({ feedCostIndex, delta7d }: { feedCostIndex: number; delta7d: number }) {
  const { t } = useTranslation();
  const isPositive = delta7d > 0;

  return (
    <View style={styles.feedCostCard}>
      <View style={styles.feedCostHeader}>
        <Ionicons name="leaf" size={20} color="#1A6B3C" />
        <Text style={styles.feedCostTitle}>Feed Cost</Text>
      </View>
      <View style={styles.feedCostRow}>
        <Text style={styles.feedCostValue}>{feedCostIndex.toFixed(1)}</Text>
        <View style={styles.feedCostDelta}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={isPositive ? '#C0392B' : '#1A6B3C'}
          />
          <Text style={[styles.feedCostDeltaText, { color: isPositive ? '#C0392B' : '#1A6B3C' }]}>
            {Math.abs(delta7d).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Middleman Quick-Entry Component (72dp)
 */
function MiddlemanQuickEntry({ onSubmit }: { onSubmit: (price: number) => void }) {
  const [price, setPrice] = useState('');
  const { t } = useTranslation();

  const handleSubmit = () => {
    const priceNum = parseFloat(price);
    if (!isNaN(priceNum) && priceNum > 0) {
      onSubmit(priceNum);
      setPrice('');
    }
  };

  return (
    <View style={styles.middlemanEntry}>
      <Text style={styles.middlemanLabel}>Middleman Offer (₹/kg)</Text>
      <View style={styles.middlemanInputRow}>
        <TextInput
          style={styles.middlemanInput}
          value={price}
          onChangeText={setPrice}
          placeholder="162"
          keyboardType="decimal-pad"
          placeholderTextColor="#7A9C8A"
        />
        <TouchableOpacity
          style={styles.middlemanButton}
          onPress={handleSubmit}
          disabled={!price}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Alert Card with Financial Impact Tag
 */
function AlertCard({ alert, flockSize }: { alert: any; flockSize: number }) {
  const { t } = useTranslation();
  
  // Calculate financial impact based on flock size
  const calculateImpact = () => {
    const baseImpact = alert.estimated_impact_low || 1000;
    const scaledImpact = (baseImpact * flockSize) / 20000;
    return `~₹${Math.round(scaledImpact).toLocaleString('en-IN')}–₹${Math.round(scaledImpact * 2).toLocaleString('en-IN')} potential impact on your flock`;
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'HIGH': return '#C0392B';
      case 'MEDIUM': return '#F5A623';
      case 'LOW': return '#1A6B3C';
      default: return '#7A9C8A';
    }
  };

  const getSeverityIcon = () => {
    switch (alert.type) {
      case 'DISEASE': return 'alert-circle';
      case 'WEATHER_EXTREME': return 'thermometer';
      case 'PRICE_SPIKE': return 'trending-up';
      case 'PRICE_DROP': return 'trending-down';
      default: return 'information-circle';
    }
  };

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <Ionicons name={getSeverityIcon() as any} size={24} color={getSeverityColor()} />
        <View style={styles.alertHeaderRight}>
          <View style={[styles.alertSeverityBadge, { backgroundColor: getSeverityColor() }]}>
            <Text style={styles.alertSeverityText}>{alert.severity}</Text>
          </View>
          <Text style={styles.alertTime}>
            {new Date(alert.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
      <Text style={styles.alertTitle}>{alert.title_en || alert.title_hi}</Text>
      <Text style={styles.alertBody}>{alert.body_en || alert.body_hi}</Text>
      <View style={styles.alertImpact}>
        <Ionicons name="cash" size={16} color="#1A6B3C" />
        <Text style={styles.alertImpactText}>{calculateImpact()}</Text>
      </View>
    </View>
  );
}

/**
 * Forecast Tab Screen (Enhanced)
 * Tab 1: Today's Price
 * - Enhanced scroll architecture per Design Spec §4.1
 * - Price hero card with embedded district selector
 * - Accuracy trust strip
 * - Sell signal badge
 * - AI drivers
 * - Sparkline chart
 * - Feed cost mini-card
 * - Middleman quick-entry
 * - Alert feed with financial impact tags
 */
export default function ForecastScreen() {
  const { t } = useTranslation();
  const { selectedMandi, districts, setSelectedMandi, showDistrictPicker, setShowDistrictPicker } = useDistrictSelector();

  const { data: forecast, isLoading, error, isOffline, isStale, refetch } = useForecast({
    mandi: selectedMandi,
  });

  const { alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useAlerts({
    mandi: selectedMandi,
  });

  const [flockSize, setFlockSize] = useState(25000);
  const [refreshing, setRefreshing] = useState(false);

  // Load flock size from AsyncStorage on mount
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

  // Determine sell signal based on price trend
  const getSellSignal = (): 'sell' | 'hold' | 'caution' => {
    if (!forecast) return 'hold';
    const priceChange = forecast.p50 - forecast.p10;
    if (priceChange > 5) return 'sell';
    if (priceChange < -5) return 'caution';
    return 'hold';
  };

  // Fetch historical price data from Supabase
  const [sparklineData, setSparklineData] = useState<Array<{ date: string; price: number }>>([]);

  useEffect(() => {
    async function loadSparklineData() {
      if (!forecast) return;
      try {
        const { data: historicalData } = await supabase
          .from('historical_prices')
          .select('date, price')
          .eq('mandi', selectedMandi)
          .order('date', { ascending: true })
          .limit(7);

        setSparklineData(historicalData || []);
      } catch (error) {
        console.error('Error fetching sparkline data:', error);
        setSparklineData([]);
      }
    }

    loadSparklineData();
  }, [selectedMandi, forecast]);

  // Fetch feed cost data from Supabase
  const [feedCostData, setFeedCostData] = useState({ feedCostIndex: 0, delta7d: 0 });

  useEffect(() => {
    async function loadFeedCostData() {
      try {
        const { data } = await supabase
          .from('feed_cost_index')
          .select('index, delta_7d')
          .eq('mandi', selectedMandi)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setFeedCostData({
            feedCostIndex: data.index,
            delta7d: data.delta_7d
          });
        }
      } catch (error) {
        console.error('Error loading feed cost data:', error);
      }
    }

    loadFeedCostData();
  }, [selectedMandi]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await refetchAlerts();
    setRefreshing(false);
  };

  const handleMiddlemanSubmit = (price: number) => {
    // Navigate to middleman check screen with the price
    console.log('Middleman price submitted:', price);
    // TODO: Navigate to middleman check screen
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('forecast.title')}</Text>
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

          {/* Price Hero Skeleton */}
          <SkeletonCard />

          {/* Confidence Interval Skeleton */}
          <View style={styles.card}>
            <View style={[styles.skeleton, { height: 8, width: '100%', marginBottom: 8 }]} />
            <View style={[styles.skeleton, { height: 8, width: '60%' }]} />
          </View>

          {/* Price Drivers Skeleton */}
          <SkeletonList count={3} />
        </ScrollView>
      </View>
    );
  }

  if (error && !forecast) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('forecast.title')}</Text>
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

  if (!forecast) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('forecast.title')}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up" size={48} color="#7A9C8A" />
          <Text style={styles.emptyText}>{t('forecast.no_forecast_available')}</Text>
          <Text style={styles.emptySubtext}>{t('forecast.empty_forecast_guidance')}</Text>
          <TouchableOpacity 
            style={styles.emptyActionButton} 
            onPress={() => setShowDistrictPicker(true)}
          >
            <Text style={styles.emptyActionText}>{t('forecast.select_district')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <BiometricLock>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A6B3C']} />
          }
        >
        {/* PRICE HERO CARD (180dp) - Always first element */}
        <View style={styles.priceHeroContainer}>
          {/* Embedded District Selector within Price Hero */}
          <TouchableOpacity
            style={styles.embeddedDistrictSelector}
            onPress={() => setShowDistrictPicker(true)}
            accessibilityLabel={`${t('forecast.select_district')}: ${districts.find(d => d.value === selectedMandi)?.label}`}
            accessibilityRole="button"
            accessible={true}
          >
            <Text style={styles.embeddedDistrictLabel}>
              {districts.find(d => d.value === selectedMandi)?.label}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7A9C8A" />
          </TouchableOpacity>

          <PriceHero
            prediction={{
              p10: forecast.p10,
              p50: forecast.p50,
              p90: forecast.p90,
              direction: forecast.p50 > forecast.p10 ? 'up' : forecast.p50 < forecast.p10 ? 'down' : 'stable',
              changePercent: forecast.p10 !== 0 ? ((forecast.p50 - forecast.p10) / forecast.p10) * 100 : 0,
              lastUpdated: forecast.predicted_at,
              confidence: forecast.confidence,
            }}
            isStale={isStale}
            mandiName={districts.find(d => d.value === selectedMandi)?.label || ''}
          />
        </View>

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

        {/* Offline/Stale Indicator */}
        {isOffline && (
          <View style={styles.indicatorBadge}>
            <Ionicons name="wifi-outline" size={16} color="#F5A623" />
            <Text style={styles.indicatorText}>{t('common.offline')}</Text>
          </View>
        )}
        {isStale && !isOffline && (
          <View style={styles.indicatorBadge}>
            <Ionicons name="time-outline" size={16} color="#F5A623" />
            <Text style={styles.indicatorText}>{t('forecast.stale_data')}</Text>
          </View>
        )}

        {/* ACCURACY TRUST STRIP (48dp) */}
        <AccuracyTrustStrip
          accuracy={forecast.confidence ? (1 - forecast.confidence) * 10 : 5}
          directionalAccuracy={forecast.confidence ? forecast.confidence * 100 : 85}
          predictionCount={0}
        />

        {/* SELL SIGNAL BADGE (52dp) */}
        <SellSignalBadge signal={getSellSignal()} price={forecast.p50} />

        {/* AI DRIVERS (3 bullets) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Reasons</Text>
          {forecast.drivers.slice(0, 3).map((driver: { impact: string; description_hi: string }, index: number) => (
            <PriceDriverCard key={index} driver={driver} />
          ))}
        </View>

        {/* SPARKLINE CHART (140dp) */}
        <SparklineChart data={sparklineData} />

        {/* FEED COST MINI-CARD (80dp) */}
        <FeedCostMiniCard
          feedCostIndex={feedCostData.feedCostIndex}
          delta7d={feedCostData.delta7d}
        />

        {/* MIDDLEMAN ENTRY (72dp) */}
        <MiddlemanQuickEntry onSubmit={handleMiddlemanSubmit} />

        {/* ALERT FEED (scrollable card list) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {alertsLoading ? (
            <SkeletonList count={3} />
          ) : alerts.length > 0 ? (
            alerts.slice(0, 5).map((alert) => (
              <AlertCard key={alert.id} alert={alert} flockSize={flockSize} />
            ))
          ) : (
            <View style={styles.emptyAlerts}>
              <Ionicons name="checkmark-circle" size={32} color="#1A6B3C" />
              <Text style={styles.emptyAlertsText}>No Active Alerts</Text>
            </View>
          )}
        </View>
    </ScrollView>
    </View>
    </BiometricLock>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
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
    minHeight: 44, // WCAG 2.1 AA minimum touch target
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F7FAF8',
  },
  emptyText: {
    fontSize: 16,
    color: '#5A7A68',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7A9C8A',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
    lineHeight: 20,
  },
  emptyActionButton: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    minHeight: 48,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  priceHeroContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 180, // 180dp per Design Spec §4.1
  },
  embeddedDistrictSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5EE',
  },
  embeddedDistrictLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2B22',
    marginRight: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  accuracyStrip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    minHeight: 48, // 48dp per Design Spec §4.1
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accuracyLabel: {
    fontSize: 13,
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  accuracyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  accuracyValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  accuracyMeta: {
    fontSize: 11,
    color: '#7A9C8A',
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 26,
    marginBottom: 16,
    minHeight: 52, // 52dp per Design Spec §4.1
  },
  signalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  indicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF8EC',
    paddingHorizontal: spacing.mobile.elementGap,
    paddingVertical: spacing.mobile.tightGap,
    borderRadius: 8,
    marginBottom: spacing.mobile.sectionGap,
    alignSelf: 'flex-start',
  },
  indicatorText: {
    fontSize: 14,
    color: '#F5A623',
    marginLeft: spacing.mobile.tightGap,
    fontFamily: 'NotoSansDevanagari-Medium',
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
  rangeText: {
    fontSize: 13,
    color: '#7A9C8A',
    marginTop: spacing.mobile.elementGap,
    fontFamily: 'NotoSansDevanagari-Regular',
    lineHeight: 18,
  },
  sparklineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 140, // 140dp per Design Spec §4.1
  },
  sparklineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2B22',
    marginBottom: 12,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  sparklineChart: {
    alignItems: 'center',
  },
  sparklinePlaceholder: {
    height: 100,
    backgroundColor: '#EAF1ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparklinePlaceholderText: {
    fontSize: 13,
    color: '#5A7A68',
    marginTop: 8,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  feedCostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 80, // 80dp per Design Spec §4.1
  },
  feedCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedCostTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C2B22',
    marginLeft: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  feedCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedCostValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  feedCostDelta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedCostDeltaText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  middlemanEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 72, // 72dp per Design Spec §4.1
  },
  middlemanLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A7A68',
    marginBottom: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  middlemanInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  middlemanInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F7FAF8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-SemiBold',
    marginRight: 8,
  },
  middlemanButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1A6B3C',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F5EE',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertHeaderRight: {
    alignItems: 'flex-end',
  },
  alertSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  alertSeverityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  alertTime: {
    fontSize: 11,
    color: '#7A9C8A',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2B22',
    marginBottom: 4,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  alertBody: {
    fontSize: 13,
    color: '#5A7A68',
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  alertImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    padding: 8,
    borderRadius: 6,
  },
  alertImpactText: {
    fontSize: 12,
    color: '#1A6B3C',
    marginLeft: 6,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  emptyAlerts: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyAlertsText: {
    fontSize: 14,
    color: '#7A9C8A',
    marginTop: 8,
    fontFamily: 'NotoSansDevanagari-Medium',
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
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverText: {
    fontSize: 14,
    color: '#1C2B22',
    marginLeft: 12,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  header: {
    paddingHorizontal: spacing.mobile.padding,
    paddingVertical: spacing.mobile.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5EE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  districtSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  districtValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
