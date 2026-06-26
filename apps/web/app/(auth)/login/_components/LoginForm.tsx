'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { PhoneOTPTab } from './PhoneOTPTab';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const handleSuccess = async () => {
    // Wait longer for cookies to be fully set
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if there's a redirect parameter from URL
    const redirectParam = searchParams.get('redirect') || searchParams.get('next');
    if (redirectParam) {
      window.location.href = redirectParam;
    } else {
      // Default to overview if no redirect specified
      window.location.href = '/dashboard/overview';
    }
  };

  return (
    <div className="w-full">
      {/* Tab Content */}
      <PhoneOTPTab onSuccess={handleSuccess} language={language} onLanguageChange={setLanguage} />

      {/* Sign Up Removed - Only Admin creates keys */}

      {/* Legal Notice */}
      <p className="font-jakarta text-[0.75rem] text-neutral-500 text-center mt-6 leading-relaxed">
        {language === 'hi'
          ? 'जारी रखने पर, आप हमारी सेवा की शर्तें और गोपनीयता नीति स्वीकार करते हैं।'
          : 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
      </p>
    </div>
  );
}
