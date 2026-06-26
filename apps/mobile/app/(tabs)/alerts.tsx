// PoultryPulse AI — Alerts Tab Screen
// File: apps/mobile/app/(tabs)/alerts.tsx
// Version: v1.0 | May 2026
// Design Reference: UI/UX v1.0 §3.4, Architecture v1.0 §4.3
// Task: 10.6

import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AlertCard, SkeletonList } from '@poultrypulse/ui';
import { useAlerts } from '../../hooks/useAlerts';
import { useDistrictSelector } from '../../hooks/useDistrictSelector';
import type { MandiSlug, AlertType } from '@poultrypulse/types';
import { spacing } from '@poultrypulse/ui';

/**
 * Filter Chip Component
 */
function FilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Alerts Tab Screen
 * Tab 3: Market News
 * - Alert feed with filters
 * - Middleman Check tool (placeholder)
 * - Feed price tracker (placeholder)
 */
export default function AlertsScreen() {
  const { t } = useTranslation();
  const { selectedMandi, districts, setSelectedMandi, showDistrictPicker, setShowDistrictPicker } = useDistrictSelector();
  const [selectedFilter, setSelectedFilter] = useState<AlertType | 'all'>('all');

  const { alerts, isLoading, error, refetch } = useAlerts({
    mandi: selectedMandi,
  });

  // Filter alerts by type
  const filteredAlerts = selectedFilter === 'all'
    ? alerts
    : alerts.filter(alert => alert.type === selectedFilter);

  const filters: { value: AlertType | 'all'; label: string }[] = [
    { value: 'all', label: t('alerts.all_alerts') },
    { value: 'HPAI_OUTBREAK', label: t('alerts.disease_alerts') },
    { value: 'WEATHER_EXTREME', label: t('alerts.weather_alerts') },
    { value: 'PRICE_CRASH', label: t('alerts.price_alerts') },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('alerts.title')}</Text>
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

          {/* Filter Chips Skeleton */}
          <View style={styles.filterContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={[styles.skeleton, { height: 36, width: 80, marginRight: 8 }]} />
            ))}
          </View>

          {/* Alerts List Skeleton */}
          <SkeletonList count={3} />
        </ScrollView>
      </View>
    );
  }

  if (error && !alerts) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('alerts.title')}</Text>
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
        <Text style={styles.headerTitle}>{t('alerts.title')}</Text>
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

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(filter => (
          <FilterChip
            key={filter.value}
            label={filter.label}
            isActive={selectedFilter === filter.value}
            onPress={() => setSelectedFilter(filter.value)}
          />
        ))}
      </ScrollView>

      {/* Alerts Feed */}
      {filteredAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={48} color="#1A6B3C" />
          <Text style={styles.emptyText}>{t('alerts.no_alerts')}</Text>
          <Text style={styles.emptySubtext}>{t('alerts.empty_alerts_guidance')}</Text>
        </View>
      ) : (
        <View style={styles.alertsContainer}>
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={{
                id: alert.id,
                type: alert.type === 'HPAI_OUTBREAK' ? 'HPAI' : alert.type as 'HPAI' | 'HEAT_WAVE' | 'PRICE_CRASH' | 'FEED_COST' | 'POLICY',
                severity: alert.severity.toLowerCase() as 'high' | 'medium' | 'low',
                title: alert.title_hi,
                message: alert.body_hi,
                timestamp: alert.issued_at,
              }}
              onPress={() => console.log('Alert pressed:', alert.id)}
            />
          ))}
        </View>
      )}

      {/* Middleman Check Tool (Placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('alerts.middleman_check')}</Text>
        <View style={styles.toolPlaceholder}>
          <Ionicons name="search" size={48} color="#7A9C8A" />
          <Text style={styles.toolPlaceholderText}>
            {t('alerts.check_middleman_price')}
          </Text>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolButtonText}>{t('common.search')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Price Tracker (Placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('alerts.feed_price_tracker')}</Text>
        <View style={styles.toolPlaceholder}>
          <Ionicons name="trending-up" size={48} color="#7A9C8A" />
          <Text style={styles.toolPlaceholderText}>
            {t('alerts.track_feed_prices')}
          </Text>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolButtonText}>{t('alerts.view_prices')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Last Updated */}
      <View style={styles.lastUpdated}>
        <Text style={styles.lastUpdatedText}>
          {t('alerts.last_checked')}: {new Date().toLocaleString('hi-IN')}
        </Text>
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
  districtSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  districtLabel: {
    fontSize: 14,
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  districtValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  districtText: {
    fontSize: 16,
    color: '#1C2B22',
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  filtersContainer: {
    marginBottom: spacing.mobile.sectionGap,
  },
  filtersContent: {
    paddingRight: spacing.mobile.tightGap,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.mobile.lg,
    paddingVertical: spacing.mobile.tightGap,
    borderRadius: 20,
    marginRight: spacing.mobile.tightGap,
    borderWidth: 1,
    borderColor: '#C8DDD2',
  },
  filterChipActive: {
    backgroundColor: '#1A6B3C',
    borderColor: '#1A6B3C',
  },
  filterChipText: {
    fontSize: 14,
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  alertsContainer: {
    marginBottom: spacing.mobile.sectionGap,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.xxxl,
    alignItems: 'center',
    marginBottom: spacing.mobile.sectionGap,
  },
  emptyText: {
    fontSize: 16,
    color: '#5A7A68',
    marginTop: spacing.mobile.elementGap,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7A9C8A',
    marginTop: spacing.mobile.tightGap,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
    lineHeight: 20,
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
  toolPlaceholder: {
    height: 150,
    backgroundColor: '#EAF1ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolPlaceholderText: {
    fontSize: 14,
    color: '#5A7A68',
    marginTop: spacing.mobile.tightGap,
    marginBottom: spacing.mobile.lg,
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  toolButton: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toolButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  lastUpdated: {
    padding: spacing.mobile.cardPadding,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#7A9C8A',
    fontFamily: 'NotoSansDevanagari-Regular',
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F6',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#1C2B22',
    marginTop: 12,
    marginBottom: 16,
    fontFamily: 'NotoSansDevanagari-Regular',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
});
