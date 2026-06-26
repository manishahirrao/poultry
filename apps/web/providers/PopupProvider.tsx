'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type PopupType = 'exit_intent' | 'demo_modal' | 'blog_scroll' | 'free_trial' | 'waitlist' | 'announcement' | null;

interface PopupContextType {
  activePopup: PopupType;
  openPopup: (type: PopupType) => void;
  closePopup: () => void;
  isPopupOpen: (type: PopupType) => boolean;
  canShowPopup: (type: PopupType) => boolean;
}

const POPUP_COOLDOWN_MINUTES = 15; // 15 minutes cooldown

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [activePopup, setActivePopup] = useState<PopupType>(null);

  // Check if a popup can be shown based on cooldown
  const canShowPopup = useCallback((type: PopupType): boolean => {
    if (typeof window === 'undefined') return true;
    if (!type) return true;

    const cooldownKey = `popup_cooldown_${type}`;
    const lastClosed = localStorage.getItem(cooldownKey);
    
    if (!lastClosed) return true;

    const minutesSinceClosed = (Date.now() - parseInt(lastClosed)) / (1000 * 60);
    return minutesSinceClosed >= POPUP_COOLDOWN_MINUTES;
  }, []);

  const openPopup = useCallback((type: PopupType) => {
    // Prevent multiple popups simultaneously - close any existing popup first
    setActivePopup((current) => {
      if (current !== null && current !== type) {
        // Close existing popup before opening new one
        return type;
      }
      return type;
    });
  }, []);

  const closePopup = useCallback(() => {
    if (activePopup) {
      // Store the close time for cooldown tracking
      const cooldownKey = `popup_cooldown_${activePopup}`;
      localStorage.setItem(cooldownKey, Date.now().toString());
    }
    setActivePopup(null);
  }, [activePopup]);

  const isPopupOpen = useCallback((type: PopupType) => {
    return activePopup === type;
  }, [activePopup]);

  return (
    <PopupContext.Provider value={{ activePopup, openPopup, closePopup, isPopupOpen, canShowPopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
