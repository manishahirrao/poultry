// PoultryPulse AI — Biometric Lock Component
// File: apps/mobile/src/components/BiometricLock.tsx
// Version: v1.0 | May 2026
// Design Reference: Dashboard Design v1.0 §4.3, Requirements v1.0 §11.4
// Task: TASK-023 - Biometric Quick Lock

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useBiometricLock } from '../../hooks/useBiometricLock';

interface BiometricLockProps {
  children: React.ReactNode;
}

/**
 * Biometric Lock Component
 * - Renders blur overlay when locked
 * - Shows PoultryPulse logo and unlock instruction
 * - Handles biometric authentication
 * - Falls back to PIN entry
 */
export function BiometricLock({ children }: BiometricLockProps) {
  const { isLocked, unlockScreen } = useBiometricLock();
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleUnlockPress = async () => {
    const success = await unlockScreen();
    if (!success) {
      // Biometric failed, show PIN entry
      setShowPinEntry(true);
    }
  };

  const handlePinSubmit = () => {
    // Validate PIN (6 digits)
    if (pin.length === 6) {
      // In production, validate against stored PIN
      // For now, accept any 6-digit PIN
      setShowPinEntry(false);
      setPin('');
    }
  };

  // Animate blur overlay in/out
  React.useEffect(() => {
    if (isLocked) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isLocked]);

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      
      {/* Blur Overlay */}
      <Animated.View style={[styles.blurOverlay, { opacity: fadeAnim }]}>
        <BlurView intensity={80} style={styles.absoluteFill} tint="light">
          <TouchableOpacity 
            style={styles.unlockContainer}
            onPress={handleUnlockPress}
            activeOpacity={0.7}
          >
            {/* PoultryPulse Logo */}
            <View style={styles.logoContainer}>
              <Ionicons name="trending-up" size={64} color="#1A6B3C" />
              <Text style={styles.logoText}>PoultryPulse</Text>
            </View>
            
            {/* Unlock Instruction */}
            <Text style={styles.unlockInstruction}>अनलॉक करने के लिए टैप करें</Text>
            <Text style={styles.unlockSubtext}>Touch to Unlock</Text>
            
            {/* Biometric Icon */}
            <View style={styles.biometricIcon}>
              <Ionicons name="finger-print" size={32} color="#1A6B3C" />
            </View>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      {/* PIN Entry Modal (Fallback) */}
      <Modal
        visible={showPinEntry}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPinEntry(false)}
      >
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>PIN दर्ज करें</Text>
            <Text style={styles.pinModalSubtitle}>6-digit PIN enter करें</Text>
            
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              placeholder="••••••"
              placeholderTextColor="#7A9C8A"
              autoFocus
            />
            
            <View style={styles.pinModalButtons}>
              <TouchableOpacity
                style={[styles.pinModalButton, styles.pinModalCancelButton]}
                onPress={() => {
                  setShowPinEntry(false);
                  setPin('');
                }}
              >
                <Text style={styles.pinModalCancelText}>रद्द करें</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pinModalButton, styles.pinModalSubmitButton, pin.length !== 6 && styles.pinModalButtonDisabled]}
                onPress={handlePinSubmit}
                disabled={pin.length !== 6}
              >
                <Text style={styles.pinModalSubmitText}>अनलॉक करें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  unlockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A6B3C',
    marginTop: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  unlockInstruction: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C2B22',
    marginBottom: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  unlockSubtext: {
    fontSize: 14,
    color: '#5A7A68',
    marginBottom: 32,
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  biometricIcon: {
    backgroundColor: '#E8F5EE',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  pinModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B22',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  pinModalSubtitle: {
    fontSize: 14,
    color: '#5A7A68',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  pinInput: {
    height: 56,
    backgroundColor: '#F7FAF8',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#1C2B22',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
    fontFamily: 'Sora',
  },
  pinModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pinModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinModalCancelButton: {
    backgroundColor: '#F7FAF8',
  },
  pinModalSubmitButton: {
    backgroundColor: '#1A6B3C',
  },
  pinModalButtonDisabled: {
    backgroundColor: '#E0E5E3',
  },
  pinModalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A7A68',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  pinModalSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
});
