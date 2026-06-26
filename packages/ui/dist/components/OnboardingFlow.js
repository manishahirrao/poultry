import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// PoultryPulse AI — Onboarding Flow Component
// File: packages/ui/src/components/OnboardingFlow.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.1 (Onboarding Flow)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, } from 'react-native';
import { colors, spacing, radius } from '../tokens';
const OnboardingFlow = ({ onComplete, onPhoneSubmit, onOtpSubmit, onProfileSubmit, }) => {
    const [currentStep, setCurrentStep] = useState('splash');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Phone state
    const [phone, setPhone] = useState('');
    // OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(120);
    // Profile state
    const [profile, setProfile] = useState({
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
        let interval;
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
        }
        catch (err) {
            setError('फोन नंबर जमा करने में त्रुटि');
        }
        finally {
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
        }
        catch (err) {
            setError('गलत OTP. पुनः प्रयास करें');
        }
        finally {
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
        }
        catch (err) {
            setError('प्रोफाइल सेव करने में त्रुटि');
        }
        finally {
            setLoading(false);
        }
    };
    const handleOtpChange = (index, value) => {
        if (value.length > 1)
            return;
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
    const renderSplash = () => (_jsxs(View, { style: styles.splashContainer, children: [_jsx(Text, { style: styles.logo, children: "\uD83D\uDC14" }), _jsx(Text, { style: styles.tagline, children: "\u0938\u091F\u0940\u0915 \u092D\u093E\u0935, \u0938\u0939\u0940 \u092B\u093C\u0948\u0938\u0932\u093E" })] }));
    const renderPhoneEntry = () => (_jsxs(ScrollView, { style: styles.scrollContainer, children: [_jsx(Text, { style: styles.header, children: "PoultryPulse \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948" }), _jsx(Text, { style: styles.subheader, children: "\u0905\u092A\u0928\u093E \u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902" }), _jsxs(View, { style: styles.phoneInputContainer, children: [_jsx(Text, { style: styles.phonePrefix, children: "+91" }), _jsx(TextInput, { style: styles.phoneInput, value: phone, onChangeText: (text) => {
                            setPhone(text);
                            setError(null);
                        }, keyboardType: "phone-pad", maxLength: 10, placeholder: "XXXXXXXXXX", placeholderTextColor: colors.neutral400 })] }), error && _jsx(Text, { style: styles.errorText, children: error }), _jsx(TouchableOpacity, { style: [
                    styles.button,
                    { opacity: phone.length === 10 && !loading ? 1 : 0.5 },
                ], onPress: handlePhoneSubmit, disabled: phone.length !== 10 || loading, children: loading ? (_jsx(ActivityIndicator, { color: colors.white })) : (_jsx(Text, { style: styles.buttonText, children: "OTP \u092D\u0947\u091C\u0947\u0902" })) }), _jsx(Text, { style: styles.legalText, children: "\u091C\u093E\u0930\u0940 \u0930\u0916\u0928\u0947 \u092A\u0930 \u0906\u092A \u0939\u092E\u093E\u0930\u0940 \u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0928\u0940\u0924\u093F \u0914\u0930 \u0909\u092A\u092F\u094B\u0917 \u0915\u0940 \u0936\u0930\u094D\u0924\u0947\u0902 \u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964" })] }));
    const renderOtpVerification = () => (_jsxs(ScrollView, { style: styles.scrollContainer, children: [_jsx(Text, { style: styles.header, children: "OTP \u0938\u0924\u094D\u092F\u093E\u092A\u0928" }), _jsx(Text, { style: styles.subheader, children: otpTimer > 0
                    ? `OTP ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')} में समाप्त होगा`
                    : 'OTP समाप्त हो गया' }), _jsx(View, { style: styles.otpContainer, children: otp.map((digit, index) => (_jsx(TextInput, { style: [
                        styles.otpInput,
                        digit ? styles.otpInputFilled : null,
                    ], value: digit, onChangeText: (value) => handleOtpChange(index, value), keyboardType: "number-pad", maxLength: 1, textAlign: "center", autoFocus: index === 0 }, index))) }), error && _jsx(Text, { style: styles.errorText, children: error }), otpTimer === 0 && (_jsx(TouchableOpacity, { style: styles.resendButton, onPress: () => {
                    setOtpTimer(120);
                    setOtp(['', '', '', '', '', '']);
                    if (onPhoneSubmit) {
                        onPhoneSubmit(phone);
                    }
                }, children: _jsx(Text, { style: styles.resendButtonText, children: "OTP \u092B\u093F\u0930 \u092D\u0947\u091C\u0947\u0902" }) }))] }));
    const renderProfileSetup = () => (_jsxs(ScrollView, { style: styles.scrollContainer, children: [_jsx(Text, { style: styles.header, children: "\u092B\u093E\u0930\u094D\u092E \u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932 \u0938\u0947\u091F\u0905\u092A" }), _jsx(Text, { style: styles.subheader, children: "\u0905\u092A\u0928\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u092D\u0930\u0947\u0902" }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u091C\u093F\u0932\u093E (District) *" }), _jsx(TextInput, { style: styles.input, value: profile.district, onChangeText: (text) => setProfile(Object.assign(Object.assign({}, profile), { district: text })), placeholder: "\u0917\u094B\u0930\u0916\u092A\u0941\u0930", placeholderTextColor: colors.neutral400 })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u092A\u0915\u094D\u0937\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E *" }), _jsx(View, { style: styles.segmentedControl, children: ['10K–25K', '25K–50K', '50K–1L', '1L+'].map((size) => (_jsx(TouchableOpacity, { style: [
                                styles.segment,
                                profile.flockSize === size ? styles.segmentActive : null,
                            ], onPress: () => setProfile(Object.assign(Object.assign({}, profile), { flockSize: size })), children: _jsx(Text, { style: [
                                    styles.segmentText,
                                    profile.flockSize === size ? styles.segmentTextActive : null,
                                ], children: size }) }, size))) })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u092E\u0941\u0930\u094D\u0917\u093F\u092F\u094B\u0902 \u0915\u093E \u092A\u094D\u0930\u0915\u093E\u0930 *" }), _jsx(View, { style: styles.segmentedControl, children: ['ब्रॉयलर', 'लेयर'].map((type) => (_jsx(TouchableOpacity, { style: [
                                styles.segment,
                                profile.poultryType === type ? styles.segmentActive : null,
                            ], onPress: () => setProfile(Object.assign(Object.assign({}, profile), { poultryType: type })), children: _jsx(Text, { style: [
                                    styles.segmentText,
                                    profile.poultryType === type ? styles.segmentTextActive : null,
                                ], children: type }) }, type))) })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u0928\u093E\u092E (\u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915)" }), _jsx(TextInput, { style: styles.input, value: profile.name, onChangeText: (text) => setProfile(Object.assign(Object.assign({}, profile), { name: text })), placeholder: "\u0906\u092A\u0915\u093E \u0928\u093E\u092E", placeholderTextColor: colors.neutral400 })] }), error && _jsx(Text, { style: styles.errorText, children: error }), _jsx(TouchableOpacity, { style: [
                    styles.button,
                    { opacity: !loading ? 1 : 0.5 },
                ], onPress: handleProfileSubmit, disabled: loading, children: loading ? (_jsx(ActivityIndicator, { color: colors.white })) : (_jsx(Text, { style: styles.buttonText, children: "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902" })) })] }));
    const renderComplete = () => (_jsxs(View, { style: styles.completeContainer, children: [_jsx(Text, { style: styles.completeIcon, children: "\u2713" }), _jsx(Text, { style: styles.completeTitle, children: "\u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948!" }), _jsx(Text, { style: styles.completeMessage, children: "\u0906\u092A\u0915\u093E \u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0947\u091F \u0939\u094B \u0917\u092F\u093E \u0939\u0948\u0964 \u0905\u092C \u0906\u092A \u092D\u093E\u0935 \u091C\u093E\u0902\u091A \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964" })] }));
    return (_jsx(SafeAreaView, { style: styles.container, children: _jsxs(KeyboardAvoidingView, { behavior: Platform.OS === 'ios' ? 'padding' : 'height', style: styles.keyboardContainer, children: [currentStep === 'splash' && renderSplash(), currentStep === 'phone' && renderPhoneEntry(), currentStep === 'otp' && renderOtpVerification(), currentStep === 'profile' && renderProfileSetup(), currentStep === 'complete' && renderComplete()] }) }));
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
