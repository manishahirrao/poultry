// PoultryPulse AI — Supervisor Account Screen
// File: apps/mobile/app/(tabs)/supervisor/account.tsx
// Version: v1.0 | June 2026
// Design Reference: Design Addendum §15.1
// Task: TASK-045

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, signOut } from '../../../src/lib/supabase';

interface SupervisorInfo {
  id: string;
  name: string;
  phone: string;
  assignedSheds: string[];
  createdAt: string;
}

/**
 * Supervisor Account Screen
 * Shows assigned sheds, supervisor info, and logout
 * Price forecasts, batch P&L, and subscription details are hidden
 * Design Addendum §15.1
 */
export default function SupervisorAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [supervisorInfo, setSupervisorInfo] = useState<SupervisorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupervisorInfo();
  }, []);

  const loadSupervisorInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: supervisor } = await supabase
        .from('supervisors')
        .select('*')
        .eq('supervisor_user_id', user.id)
        .eq('is_active', true)
        .single();

      if (supervisor) {
        setSupervisorInfo({
          id: supervisor.id,
          name: supervisor.name,
          phone: supervisor.phone,
          assignedSheds: supervisor.assigned_sheds,
          createdAt: supervisor.created_at
        });
      }
    } catch (error) {
      console.error('Error loading supervisor info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/onboarding');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {supervisorInfo?.name.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{supervisorInfo?.name || 'Supervisor'}</Text>
            <Text style={styles.profilePhone}>{supervisorInfo?.phone || ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Supervisor</Text>
            </View>
          </View>
        </View>

        {/* Assigned Sheds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Sheds</Text>
          <View style={styles.shedList}>
            {supervisorInfo?.assignedSheds.map((shed, index) => (
              <View key={index} style={styles.shedItem}>
                <Ionicons name="home" size={20} color="#1A6B3C" />
                <Text style={styles.shedText}>{shed}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person" size={24} color="#6B7280" />
              <Text style={styles.menuItemText}>Name</Text>
            </View>
            <Text style={styles.menuItemValue}>{supervisorInfo?.name || '-'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="call" size={24} color="#6B7280" />
              <Text style={styles.menuItemText}>Phone Number</Text>
            </View>
            <Text style={styles.menuItemValue}>{supervisorInfo?.phone || '-'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="calendar" size={24} color="#6B7280" />
              <Text style={styles.menuItemText}>Joined</Text>
            </View>
            <Text style={styles.menuItemValue}>
              {supervisorInfo?.createdAt 
                ? new Date(supervisorInfo.createdAt).toLocaleDateString('en-IN')
                : '-'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="headset" size={24} color="#6B7280" />
              <Text style={styles.menuItemText}>Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle" size={24} color="#6B7280" />
              <Text style={styles.menuItemText}>About App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>PoultryPulse AI v2.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A6B3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  profilePhone: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Regular',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A3412',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Bold',
    marginBottom: 12,
  },
  shedList: {
    gap: 8,
  },
  shedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  shedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C2B22',
    fontFamily: 'NotoSansDevanagari-Medium',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
    marginBottom: 16,
  },
});
