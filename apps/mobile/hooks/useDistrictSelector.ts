// PoultryPulse AI — District Selector Hook
// File: apps/mobile/hooks/useDistrictSelector.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §4.3
// Task: UX/UI Improvement - District Selector Consistency

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MandiSlug } from '@poultrypulse/types';

const STORAGE_KEY = 'selected_mandi';

const DISTRICTS: { value: MandiSlug; label: string }[] = [
  { value: 'gorakhpur', label: 'गोरखपुर' },
  { value: 'deoria', label: 'देवरिया' },
  { value: 'basti', label: 'बस्ती' },
  { value: 'kushinagar', label: 'कुशीनगर' },
  { value: 'maharajganj', label: 'महाराजगंज' },
];

interface UseDistrictSelectorResult {
  selectedMandi: MandiSlug;
  districts: typeof DISTRICTS;
  setSelectedMandi: (mandi: MandiSlug) => Promise<void>;
  showDistrictPicker: boolean;
  setShowDistrictPicker: (show: boolean) => void;
}

/**
 * Shared hook for district selection across all tabs
 * - Persists selected district to AsyncStorage
 * - Provides consistent district list
 * - Manages picker visibility state
 */
export function useDistrictSelector(defaultMandi: MandiSlug = 'gorakhpur'): UseDistrictSelectorResult {
  const { t } = useTranslation();
  const [selectedMandi, setSelectedMandiState] = useState<MandiSlug>(defaultMandi);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  /**
   * Load saved district from AsyncStorage on mount
   */
  useState(() => {
    const loadSavedDistrict = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSelectedMandiState(saved as MandiSlug);
        }
      } catch (error) {
        console.error('Error loading saved district:', error);
      }
    };
    loadSavedDistrict();
  });

  /**
   * Set district and persist to AsyncStorage
   */
  const setSelectedMandi = async (mandi: MandiSlug) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mandi);
      setSelectedMandiState(mandi);
    } catch (error) {
      console.error('Error saving district:', error);
      setSelectedMandiState(mandi); // Still update state even if save fails
    }
  };

  return {
    selectedMandi,
    districts: DISTRICTS,
    setSelectedMandi,
    showDistrictPicker,
    setShowDistrictPicker,
  };
}
