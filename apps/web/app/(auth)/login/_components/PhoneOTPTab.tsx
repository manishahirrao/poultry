'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

interface PhoneOTPTabProps {
  onSuccess: () => void;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
}

const COUNTRIES = [
  { code: '+91', name: 'India', flag: '🇮🇳', digits: 10 },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', digits: 10 },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', digits: 10 },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', digits: 10 },
  { code: '+1', name: 'Other', flag: '🌍', digits: 10 },
];

export function PhoneOTPTab({ onSuccess, language, onLanguageChange }: PhoneOTPTabProps) {
  const [step, setStep] = useState<'enter_phone' | 'enter_otp' | 'verifying'>('enter_phone');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [resendCount, setResendCount] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);

  useEffect(() => {
    if (step === 'enter_otp' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length < selectedCountry.digits) return '';
    if (digits.length !== selectedCountry.digits) {
      return `Please enter a valid ${selectedCountry.digits}-digit phone number`;
    }
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.digits);
    setPhone(value);
    setPhoneError(validatePhone(value));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPhoneError('');

    const validationError = validatePhone(phone);
    if (validationError) {
      setPhoneError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }


      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `${selectedCountry.code}${phone}`,
        options: {
          channel: 'sms',
        },
      });

      if (error) throw error;
      setStep('enter_otp');
      setCountdown(120);
    } catch (error: any) {
      console.error('OTP send error:', error);
      setPhoneError(error.message || 'Couldn\'t send the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);
      if (newOtp.length === 6) {
        handleOtpSubmit(newOtp.join(''));
      }
    }
  };

  const handleOtpSubmit = async (otpValue: string) => {
    setIsLoading(true);
    setOtpError('');

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase.auth.verifyOtp({
        phone: `${selectedCountry.code}${phone}`,
        token: otpValue,
        type: 'sms',
      });
      if (error) throw error;
      console.log('OTP verification successful, checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session after OTP:', session);
      console.log('Current cookies:', document.cookie);

      // Fire analytics event
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('login_success', {
          method: 'otp',
          country: selectedCountry.name,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setOtpError(error.message || 'That code is incorrect — please try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCount >= 3) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `${selectedCountry.code}${phone}`,
        options: {
          channel: 'sms',
        },
      });

      if (error) throw error;
      setResendCount((prev) => prev + 1);
      setCountdown(120);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setOtpAttempts(0);
    } catch (error: any) {
      console.error('OTP resend error:', error);
      setOtpError(error.message || 'Failed to resend — please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('enter_phone');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setOtpAttempts(0);
  };

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onLanguageChange(language === 'hi' ? 'en' : 'hi')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          <span className={language === 'en' ? 'text-brand-700' : 'text-neutral-500'}>English</span>
          <span className="text-neutral-300">|</span>
          <span className={language === 'hi' ? 'text-brand-700' : 'text-neutral-500'}>हिंदी</span>
        </button>
      </div>

      {step === 'enter_phone' ? (
        <>
          <div>
            <h2 className="font-sora text-2xl font-bold text-neutral-900 mb-2">
              'Enter your WhatsApp number'
            </h2>
            <p className="font-jakarta text-neutral-600">
              'Enter your WhatsApp number — we\'ll send you an OTP'
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                'WhatsApp Number'
              </label>
              <div className="flex gap-2">
                {/* Country Selector */}
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = COUNTRIES.find((c) => c.code === e.target.value);
                    if (country) {
                      setSelectedCountry(country);
                      setPhone('');
                      setPhoneError('');
                    }
                  }}
                  className="px-3 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent text-neutral-900 font-medium"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>

                {/* Phone Input */}
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className="flex-1 px-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent text-neutral-900 placeholder-neutral-400 text-lg"
                  placeholder={selectedCountry.code === '+91' ? 'XXXXX XXXXX' : 'Enter phone number'}
                  disabled={isLoading}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-sm mt-2" role="alert">
                  {phoneError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!phone || isLoading || !!phoneError}
              className="w-full h-[52px] bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  'Sending...'
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handleBackToPhone}
            className="text-sm text-brand-700 hover:text-brand-800 mb-4 flex items-center gap-2 font-medium"
          >
            ← {selectedCountry.flag} {selectedCountry.code}-{phone.slice(0, 5)} {phone.slice(5)}
          </button>

          <div>
            <h2 className="font-sora text-2xl font-bold text-neutral-900 mb-2">
              'Check your WhatsApp'
            </h2>
            <p className="text-neutral-600">
              `We sent a 6-digit code to ${selectedCountry.flag} ${selectedCountry.code}-${phone.slice(0, 5)} ${phone.slice(5)}`
            </p>
          </div>

          <div className="flex justify-center gap-3" role="group" aria-label="6-digit OTP code">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className="w-[56px] h-[64px] text-center text-3xl font-bold bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent text-neutral-900 placeholder-neutral-300 transition-all"
                aria-label={`OTP digit ${index + 1}`}
                disabled={isLoading}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-red-500 text-sm text-center" role="alert">
              {otpError}
            </p>
          )}

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-neutral-600 text-sm">
                  `Code expires in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
              </p>
            ) : resendCount >= 3 ? (
              <div className="text-sm">
                <p className="text-neutral-500 mb-2">
                  Too many attempts — try again tomorrow
                </p>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 font-semibold hover:text-brand-800 transition-colors"
                >
                  'Contact support →'
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-brand-700 font-semibold hover:text-brand-800 transition-colors"
              >
                'Send a new code →'
              </button>
            )}
          </div>

          {isLoading && (
            <div className="flex justify-center">
              <svg className="animate-spin h-6 w-6 text-brand-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
}
