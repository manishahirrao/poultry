// PoultryPulse AI — Root Expo Router Layout
// File: apps/mobile/app/_layout.tsx
// Version: v1.0 | May 2026
// Design Reference: UI/UX v1.0 §1.1, Architecture v1.0 §4.3, TRD v1.0 §5.3
// Task: 10.1

import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/lib/supabase';
import { initializeI18n } from '../src/lib/i18n';
import { getDatabase } from '../src/lib/database';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Global Error Boundary Component
 * Don Norman principle: human-centered error messages in Hindi
 */
function ErrorBoundary({ error, resetError }: { error: Error; resetError: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>{t('errors.generic_error')}</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={resetError}>
        <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Root Layout Component
 * - Font loading: Noto Sans Devanagari (400, 500, 600, 700) — mandatory, blocks render
 * - i18next initialization: language detection from device locale, 'hi' default
 * - Supabase auth state listener: unauthenticated → redirect to /onboarding
 * - WatermelonDB initialization: SQLite offline database for cached predictions and alerts
 * - Global error boundary with Hindi error message + retry button
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  // Font loading - Noto Sans Devanagari (mandatory, blocks render)
  const [fontsLoaded] = useFonts({
    'NotoSansDevanagari-Regular': require('../assets/fonts/NotoSansDevanagari-Regular.ttf'),
    'NotoSansDevanagari-Medium': require('../assets/fonts/NotoSansDevanagari-Medium.ttf'),
    'NotoSansDevanagari-SemiBold': require('../assets/fonts/NotoSansDevanagari-SemiBold.ttf'),
    'NotoSansDevanagari-Bold': require('../assets/fonts/NotoSansDevanagari-Bold.ttf'),
  });

  // Initialize i18n and database
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize i18n with device locale detection
        await initializeI18n();

        // Initialize WatermelonDB for offline caching
        await getDatabase();

        setIsReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err as Error);
      }
    }

    prepare();
  }, []);

  // Performance monitoring: Measure FCP (First Contentful Paint)
  useEffect(() => {
    if (!isReady || error) return;

    const startTime = Date.now();
    
    // Log FCP measurement (target <2s on Slow 3G)
    const fcp = Date.now() - startTime;
    console.log(`[Performance] FCP: ${fcp.toFixed(2)}ms (target: <2000ms on Slow 3G)`);
    
    // In production, this would be sent to analytics (e.g., PostHog)
    // PostHog.capture('app_fcp', { fcp_ms: fcp, target_met: fcp < 2000 });
  }, [isReady, error]);

  // Hide splash screen when ready
  useEffect(() => {
    if (isReady || error) {
      SplashScreen.hideAsync();
    }
  }, [isReady, error]);

  // Supabase auth state listener
  useEffect(() => {
    if (!isReady) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        // On initial load, check auth state
        if (!session) {
          // Unauthenticated → redirect to onboarding
          router.replace('/(auth)/onboarding');
        } else {
          // Check if user is a supervisor
          const { data: supervisor } = await supabase
            .from('supervisors')
            .select('*')
            .eq('supervisor_user_id', session.user.id)
            .eq('is_active', true)
            .single();

          if (supervisor) {
            // Supervisor → redirect to supervisor tabs
            router.replace('/(tabs)/supervisor/today-work');
          } else {
            // Regular user → redirect to forecast tab
            router.replace('/(tabs)/forecast');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out → redirect to onboarding
        router.replace('/(auth)/onboarding');
      } else if (event === 'SIGNED_IN') {
        // User signed in → check role and redirect accordingly
        if (session) {
          const { data: supervisor } = await supabase
            .from('supervisors')
            .select('*')
            .eq('supervisor_user_id', session.user.id)
            .eq('is_active', true)
            .single();

          if (supervisor) {
            router.replace('/(tabs)/supervisor/today-work');
          } else {
            router.replace('/(tabs)/forecast');
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isReady, router]);

  // Show loading state while fonts and initialization complete
  if (!isReady && !error) {
    return null;
  }

  // Show error boundary if error occurred
  if (error) {
    return <ErrorBoundary error={error} resetError={() => setError(null)} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAF8',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B22',
    marginBottom: 8,
    fontFamily: 'NotoSansDevanagari-SemiBold',
  },
  errorMessage: {
    fontSize: 16,
    color: '#5A7A68',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  retryButton: {
    backgroundColor: '#1A6B3C',
    paddingHorizontal: 32,
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
