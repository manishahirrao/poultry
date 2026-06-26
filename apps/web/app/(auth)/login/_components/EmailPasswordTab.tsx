'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface EmailPasswordTabProps {
  onSuccess: () => void;
  language: 'en' | 'hi';
}

export function EmailPasswordTab({ onSuccess, language }: EmailPasswordTabProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return '';
    if (!emailRegex.test(value)) {
      return language === 'hi' ? 'कृपया एक मान्य ईमेल पता दर्ज करें' : 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(validateEmail(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(language === 'hi' ? 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए' : 'Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login successful, data:', data);
      console.log('Login successful, session:', data.session);

      // Wait a moment for session to be stored
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session after getSession:', session);
      console.log('Current cookies:', document.cookie);

      // Fire analytics event
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('login_success', {
          method: 'email',
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      setError(
        error.message || (language === 'hi'
          ? 'ईमेल या पासवर्ड गलत है — कृपया दोबारा try करें।'
          : 'Email or password is incorrect. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora text-2xl font-bold text-neutral-900 mb-2">
          {language === 'hi' ? 'ईमेल से लॉगिन करें' : 'Sign in with email'}
        </h2>
        <p className="font-jakarta text-neutral-600">
          {language === 'hi' ? 'अपना ईमेल और पासवर्ड डालें' : 'Enter your email address and password'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {language === 'hi' ? 'ईमेल' : 'Email'}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            className="w-full px-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent text-neutral-900 placeholder-neutral-400"
            placeholder={language === 'hi' ? 'your@email.com' : 'your@email.com'}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {language === 'hi' ? 'पासवर्ड' : 'Password'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 pr-12 bg-white border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent text-neutral-900 placeholder-neutral-400"
              placeholder={language === 'hi' ? '••••••••' : '••••••••'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <a
            href="/forgot-password"
            className="text-sm text-brand-700 hover:text-brand-800 font-medium"
          >
            {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot your password?'}
          </a>
        </div>

        <button
          type="submit"
          disabled={!email || !password || isLoading}
          className="w-full h-[52px] bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {language === 'hi' ? 'साइन इन हो रहा है...' : 'Signing in...'}
            </>
          ) : (
            <>
              <span>{language === 'hi' ? 'साइन इन करें' : 'Sign in'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
