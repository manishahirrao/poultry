// PoultryPulse AI — Biometric Lock Hook
// File: apps/mobile/hooks/useBiometricLock.ts
// Version: v1.0 | May 2026
// Design Reference: Dashboard Design v1.0 §4.3, Requirements v1.0 §11.4
// Task: TASK-023 - Biometric Quick Lock

import { useState, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricLockConfig {
  enabled: boolean;
  lockAfterMs: number;
  unlockWithFaceId: boolean;
  unlockWithFingerprint: boolean;
  unlockWithPin: boolean;
}

interface UseBiometricLockResult {
  isLocked: boolean;
  isLockEnabled: boolean;
  lockScreen: () => void;
  unlockScreen: () => Promise<boolean>;
  toggleLock: (enabled: boolean) => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
}

const DEFAULT_CONFIG: BiometricLockConfig = {
  enabled: false,
  lockAfterMs: 120000, // 2 minutes
  unlockWithFaceId: true,
  unlockWithFingerprint: true,
  unlockWithPin: true,
};

const LOCK_ENABLED_KEY = 'biometric_lock_enabled';
const BACKGROUND_TIME_KEY = 'app_background_time';

/**
 * Biometric Lock Hook
 * - Manages app state changes to trigger lock after backgrounding
 * - Handles biometric authentication
 * - Persists lock preference to AsyncStorage
 */
export function useBiometricLock(): UseBiometricLockResult {
  const [isLocked, setIsLocked] = useState(false);
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const backgroundTimeRef = useRef<number | null>(null);

  // Load lock preference on mount
  useEffect(() => {
    async function loadLockPreference() {
      try {
        const enabled = await AsyncStorage.getItem(LOCK_ENABLED_KEY);
        setIsLockEnabled(enabled === 'true');
      } catch (error) {
        console.error('Error loading lock preference:', error);
      }
    }
    loadLockPreference();
  }, []);

  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isLockEnabled]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (!isLockEnabled) return;

    if (nextAppState === 'background') {
      // Record when app went to background
      try {
        await AsyncStorage.setItem(BACKGROUND_TIME_KEY, Date.now().toString());
        backgroundTimeRef.current = Date.now();
      } catch (error) {
        console.error('Error saving background time:', error);
      }
    } else if (nextAppState === 'active') {
      // Check if app was backgrounded long enough to trigger lock
      try {
        const backgroundTimeStr = await AsyncStorage.getItem(BACKGROUND_TIME_KEY);
        if (backgroundTimeStr) {
          const backgroundTime = parseInt(backgroundTimeStr, 10);
          const timeInBackground = Date.now() - backgroundTime;
          
          if (timeInBackground >= DEFAULT_CONFIG.lockAfterMs) {
            setIsLocked(true);
          }
          
          // Clear the background time
          await AsyncStorage.removeItem(BACKGROUND_TIME_KEY);
          backgroundTimeRef.current = null;
        }
      } catch (error) {
        console.error('Error checking background time:', error);
      }
    }
  };

  const lockScreen = () => {
    setIsLocked(true);
  };

  const unlockScreen = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'PoultryPulse को अनलॉक करें',
        fallbackLabel: 'PIN का उपयोग करें',
        cancelLabel: 'रद्द करें',
      });

      if (result.success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      // If biometric fails, show PIN entry (to be implemented)
      return false;
    }
  };

  const toggleLock = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(LOCK_ENABLED_KEY, enabled.toString());
      setIsLockEnabled(enabled);
    } catch (error) {
      console.error('Error saving lock preference:', error);
    }
  };

  const checkBiometricAvailability = async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  };

  return {
    isLocked,
    isLockEnabled,
    lockScreen,
    unlockScreen,
    toggleLock,
    checkBiometricAvailability,
  };
}
