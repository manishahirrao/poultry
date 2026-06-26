// PoultryPulse AI — Supervisor Tab Navigator Layout
// File: apps/mobile/app/(tabs)/supervisor/_layout.tsx
// Version: v1.0 | June 2026
// Design Reference: Design Addendum §15.1
// Task: TASK-045

import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../src/lib/supabase';

/**
 * Supervisor Tab Navigator Layout
 * - 3 tabs matching Design Addendum §15.1: आज का काम · मेरी रिपोर्ट · मेरा खाता
 * - Tab bar: brandGreen700 background, white active icon, neutral400 inactive
 * - Haptic feedback on tab switch (expo-haptics)
 * - Price forecast tab hidden for supervisors
 */
export default function SupervisorTabLayout() {
  const { t } = useTranslation();

  // Handle tab press with haptic feedback
  const handleTabPress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#7A9C8A',
        tabBarStyle: {
          backgroundColor: '#1A6B3C',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSansDevanagari-Medium',
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="today-work"
        options={{
          title: 'आज का काम',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: 'मेरी रिपोर्ट',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'मेरा खाता',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}
