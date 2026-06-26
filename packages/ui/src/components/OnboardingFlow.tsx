// PoultryPulse AI — Onboarding Flow Component
// File: packages/ui/src/components/OnboardingFlow.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.1 (Onboarding Flow)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, motion } from '../tokens';

type OnboardingStep = 'splash' | 'phone' | 'otp' | 'profile' | 'complete';

interface OnboardingFlowProps {
  onComplete?: (profile: FarmProfile) => void;
  onPhoneSubmit?: (phone: string) => Promise<void>;
  onOtpSubmit?: (otp: string) => Promise<void>;
  onProfileSubmit?: (profile: FarmProfile) => Promise<void>;
}

interface FarmProfile {
  district: string;
  flockSize: string;
  poultryType: string;
  name?: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onPhoneSubmit,
  onOtpSubmit,
  onProfileSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone state
  const [phone, setPhone] = useState('');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(120);

  // Profile state
  const [profile, setProfile] = useState<FarmProfile>({
    district: '',
    flockSize: '',
    poultryType: '',
    name: '',
  });

  // Splash screen auto-advance
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep('phone');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // OTP timer
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  const handlePhoneSubmit = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('कृपया सही मोबाइल नंबर दर्ज करें');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (onPhoneSubmit) {
        await onPhoneSubmit(phone);
      }
      setCurrentStep('otp');
    } catch (err) {
      setError('फोन नंबर जमा करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('कृपया 6 अंकों का OTP दर्ज करें');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (onOtpSubmit) {
        await onOtpSubmit(otpValue);
      }
      setCurrentStep('profile');
    } catch (err) {
      setError('गलत OTP. पुनः प्रयास करें');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!profile.district || !profile.flockSize || !profile.poultryType) {
      setError('कृपया सभी आवश्यक जानकारी भरें');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (onProfileSubmit) {
        await onProfileSubmit(profile);
      }
      setCurrentStep('complete');
      if (onComplete) {
        onComplete(profile);
      }
    } catch (err) {
      setError('प्रोफाइल सेव करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      // Focus next input (would need ref implementation)
    }

    // Auto-submit when 6 digits entered
    if (index === 5 && value) {
      handleOtpSubmit();
    }
  };

  const renderSplash = () => (
    <View style={styles.splashContainer}>
      <Text style={styles.logo}>🐔</Text>
      <Text style={styles.tagline}>सटीक भाव, सही फ़ैसला</Text>
    </View>
  );

  const renderPhoneEntry = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.header}>PoultryPulse में आपका स्वागत है</Text>
      <Text style={styles.subheader}>अपना मोबाइल नंबर दर्ज करें</Text>

      <View style={styles.phoneInputContainer}>
        <Text style={styles.phonePrefix}>+91</Text>
        <TextInput
          style={styles.phoneInput}
          value={phone}
          onChangeText={(text: string) => {
            setPhone(text);
            setError(null);
          }}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="XXXXXXXXXX"
          placeholderTextColor={colors.neutral400}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          { opacity: phone.length === 10 && !loading ? 1 : 0.5 },
        ]}
        onPress={handlePhoneSubmit}
        disabled={phone.length !== 10 || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>OTP भेजें</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.legalText}>
        जारी रखने पर आप हमारी गोपनीयता नीति और उपयोग की शर्तें स्वीकार करते हैं।
      </Text>
    </ScrollView>
  );

  const renderOtpVerification = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.header}>OTP सत्यापन</Text>
      <Text style={styles.subheader}>
        {otpTimer > 0
          ? `OTP ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')} में समाप्त होगा`
          : 'OTP समाप्त हो गया'}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={[
              styles.otpInput,
              digit ? styles.otpInputFilled : null,
            ]}
            value={digit}
            onChangeText={(value: string) => handleOtpChange(index, value)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {otpTimer === 0 && (
        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => {
            setOtpTimer(120);
            setOtp(['', '', '', '', '', '']);
            if (onPhoneSubmit) {
              onPhoneSubmit(phone);
            }
          }}
        >
          <Text style={styles.resendButtonText}>OTP फिर भेजें</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderProfileSetup = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.header}>फार्म प्रोफाइल सेटअप</Text>
      <Text style={styles.subheader}>अपनी जानकारी भरें</Text>

      {/* District */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>जिला (District) *</Text>
        <TextInput
          style={styles.input}
          value={profile.district}
          onChangeText={(text: string) => setProfile({ ...profile, district: text })}
          placeholder="गोरखपुर"
          placeholderTextColor={colors.neutral400}
        />
      </View>

      {/* Flock Size */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>पक्षियों की संख्या *</Text>
        <View style={styles.segmentedControl}>
          {['10K–25K', '25K–50K', '50K–1L', '1L+'].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.segment,
                profile.flockSize === size ? styles.segmentActive : null,
              ]}
              onPress={() => setProfile({ ...profile, flockSize: size })}
            >
              <Text
                style={[
                  styles.segmentText,
                  profile.flockSize === size ? styles.segmentTextActive : null,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Poultry Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>मुर्गियों का प्रकार *</Text>
        <View style={styles.segmentedControl}>
          {['ब्रॉयलर', 'लेयर'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.segment,
                profile.poultryType === type ? styles.segmentActive : null,
              ]}
              onPress={() => setProfile({ ...profile, poultryType: type })}
            >
              <Text
                style={[
                  styles.segmentText,
                  profile.poultryType === type ? styles.segmentTextActive : null,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Name (Optional) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>नाम (वैकल्पिक)</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text: string) => setProfile({ ...profile, name: text })}
          placeholder="आपका नाम"
          placeholderTextColor={colors.neutral400}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          { opacity: !loading ? 1 : 0.5 },
        ]}
        onPress={handleProfileSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>शुरू करें</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <Text style={styles.completeIcon}>✓</Text>
      <Text style={styles.completeTitle}>स्वागत है!</Text>
      <Text style={styles.completeMessage}>
        आपका प्रोफाइल सफलतापूर्वक सेट हो गया है। अब आप भाव जांच सकते हैं।
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {currentStep === 'splash' && renderSplash()}
        {currentStep === 'phone' && renderPhoneEntry()}
        {currentStep === 'otp' && renderOtpVerification()}
        {currentStep === 'profile' && renderProfileSetup()}
        {currentStep === 'complete' && renderComplete()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: spacing.mobileCardPadding,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: colors.brandGreen700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 120,
    marginBottom: 16,
  },
  tagline: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  header: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 8,
  },
  subheader: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral400,
    marginBottom: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  phonePrefix: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral900,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: colors.neutral200,
  },
  phoneInput: {
    flex: 1,
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 16,
    color: colors.neutral900,
    padding: 16,
  },
  button: {
    backgroundColor: colors.brandGreen700,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  legalText: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral400,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.red600,
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral900,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: colors.brandGreen700,
  },
  resendButton: {
    marginTop: 16,
  },
  resendButtonText: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGreen700,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    color: colors.neutral700,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    padding: 16,
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 16,
    color: colors.neutral900,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.brandGreen700,
    borderColor: colors.brandGreen700,
  },
  segmentText: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 12,
    color: colors.neutral700,
  },
  segmentTextActive: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontWeight: '600',
    color: colors.white,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.mobileCardPadding,
  },
  completeIcon: {
    fontSize: 80,
    color: colors.brandGreen700,
    marginBottom: 24,
  },
  completeTitle: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 12,
    textAlign: 'center',
  },
  completeMessage: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 16,
    color: colors.neutral500,
    textAlign: 'center',
  },
});

export default OnboardingFlow;
