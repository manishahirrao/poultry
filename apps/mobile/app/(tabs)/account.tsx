// PoultryPulse AI — Account Tab Screen
// File: apps/mobile/app/(tabs)/account.tsx
// Version: v1.0 | May 2026
// Design Reference: UI/UX v1.0 §3.5, Architecture v1.0 §4.3
// Task: 10.7

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, signOut } from '../../src/lib/supabase';
import type { SubscriptionStatus, SubscriptionTier } from '@poultrypulse/types';
import { spacing } from '@poultrypulse/ui';
import { useBiometricLock } from '../../hooks/useBiometricLock';

/**
 * Account Tab Screen
 * Tab 4: My Account
 * - Subscription status
 * - Notification preferences
 * - Accuracy scorecard
 * - Support
 * - Logout
 */
export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLockEnabled, toggleLock } = useBiometricLock();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('active');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('PULSE_FARM');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  // Load user profile and subscription
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: customer } = await supabase
          .from('customers')
          .select('subscription_status, subscription_tier, subscription_expires_at')
          .eq('id', user.id)
          .single();

        if (customer) {
          setSubscriptionStatus(customer.subscription_status);
          setSubscriptionTier(customer.subscription_tier);
          setExpiresAt(customer.subscription_expires_at);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/onboarding');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSupport = () => {
    // Open WhatsApp support or email
    console.log('Open support');
  };

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Subscription Card - Primary content, generous spacing */}
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Ionicons name="card" size={32} color="#1A6B3C" />
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTier}>{subscriptionTier}</Text>
            <Text style={styles.subscriptionStatus}>
              {subscriptionStatus === 'active' && t('subscription.active')}
              {subscriptionStatus === 'trial' && t('subscription.trial')}
              {subscriptionStatus === 'expired' && t('subscription.expired')}
            </Text>
          </View>
        </View>
        {subscriptionStatus !== 'expired' && (
          <View style={styles.subscriptionFooter}>
            <Text style={styles.expiresText}>
              {t('subscription.days_remaining')}: {daysRemaining}
            </Text>
            <TouchableOpacity style={styles.renewButton}>
              <Text style={styles.renewButtonText}>{t('subscription.renew')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notification Preferences - Secondary section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('alerts.title')}</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('alerts.title')}</Text>
            <Text style={styles.settingDescription}>
              {t('alerts.hpai_alerts')}, {t('alerts.weather_alerts')}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#C8DDD2', true: '#1A6B3C' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>WhatsApp</Text>
            <Text style={styles.settingDescription}>
              {t('alerts.title')} via WhatsApp
            </Text>
          </View>
          <Switch
            value={whatsappEnabled}
            onValueChange={setWhatsappEnabled}
            trackColor={{ false: '#C8DDD2', true: '#1A6B3C' }}
            thumbColor={whatsappEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Biometric Lock</Text>
            <Text style={styles.settingDescription}>
              Lock forecast screen with fingerprint or face
            </Text>
          </View>
          <Switch
            value={isLockEnabled}
            onValueChange={toggleLock}
            trackColor={{ false: '#C8DDD2', true: '#1A6B3C' }}
            thumbColor={isLockEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Accuracy Scorecard - Tertiary section, tighter spacing */}
      <View style={styles.sectionCompact}>
        <Text style={styles.sectionTitle}>{t('sell_signal.historical_accuracy')}</Text>
        <View style={styles.accuracyGrid}>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyValue}>87%</Text>
            <Text style={styles.accuracyLabel}>{t('sell_signal.directional_accuracy')}</Text>
          </View>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyValue}>3.2%</Text>
            <Text style={styles.accuracyLabel}>{t('sell_signal.mape')}</Text>
          </View>
          <View style={styles.accuracyItem}>
            <Text style={styles.accuracyValue}>82%</Text>
            <Text style={styles.accuracyLabel}>Conformal Coverage</Text>
          </View>
        </View>
        <Text style={styles.accuracyNote}>
          {t('sell_signal.last_30_days')}
        </Text>
      </View>

      {/* Support */}
      <TouchableOpacity style={styles.section} onPress={handleSupport}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="headset" size={24} color="#1A6B3C" />
            <Text style={styles.settingLabel}>{t('common.support')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#7A9C8A" />
        </View>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark" size={24} color="#1A6B3C" />
            <Text style={styles.settingLabel}>{t('onboarding.privacy_policy')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#7A9C8A" />
        </View>
      </TouchableOpacity>

      {/* Terms of Service */}
      <TouchableOpacity style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text" size={24} color="#1A6B3C" />
            <Text style={styles.settingLabel}>{t('onboarding.terms_of_service')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#7A9C8A" />
        </View>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#C0392B" />
        <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>PoultryPulse AI v1.0.0</Text>
    </ScrollView>
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
  subscriptionCard: {
    backgroundColor: '#1A6B3C',
    borderRadius: 12,
    padding: spacing.mobile.cardPaddingLg,
    marginBottom: spacing.mobile.sectionGap,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.mobile.lg,
  },
  subscriptionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  subscriptionTier: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  subscriptionStatus: {
    fontSize: 14,
    color: '#E8F5EE',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.mobile.md,
  },
  expiresText: {
    fontSize: 14,
    color: '#E8F5EE',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  renewButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A6B3C',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
  },
  sectionCompact: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2B22',
    marginBottom: spacing.mobile.elementGap,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.mobile.tightGap,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2B22',
    marginBottom: spacing.mobile.xs,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  settingDescription: {
    fontSize: 14,
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  accuracyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.mobile.tightGap,
  },
  accuracyItem: {
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A6B3C',
    fontFamily: 'Sora',
  },
  accuracyLabel: {
    fontSize: 12,
    color: '#5A7A68',
    marginTop: spacing.mobile.xs,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  accuracyNote: {
    fontSize: 12,
    color: '#7A9C8A',
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.mobile.cardPadding,
    marginBottom: spacing.mobile.sectionGap,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0392B',
    marginLeft: spacing.mobile.elementGap,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  versionText: {
    fontSize: 12,
    color: '#7A9C8A',
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
});
