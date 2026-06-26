// PoultryPulse AI — Supabase Client
// File: apps/mobile/src/lib/supabase.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §4.3, TRD v1.0 §5.3

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Supabase configuration from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

/**
 * SecureStore adapter for Supabase auth (mobile)
 * Uses expo-secure-store for secure token storage
 */
const SecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

/**
 * Create Supabase client with appropriate storage adapter
 * Throws error if Supabase is not configured (production requirement)
 */
export const supabase = (() => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.');
  }
  
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
})();

/**
 * Get device fingerprint for security
 * Uses expo-device and expo-constants
 */
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    const deviceId = Constants.deviceId || Constants.sessionId || 'unknown';
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    return `${deviceId}-${appVersion}`;
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    return 'fallback-fingerprint';
  }
};

/**
 * Send OTP via phone number
 */
export const sendPhoneOTP = async (phone: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms', // or 'whatsapp' for WhatsApp OTP
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Verify OTP and complete authentication
 */
export const verifyOTP = async (phone: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
