'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, Key, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export function ActivationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [phone, setPhone] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsSessionLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        if (session.user?.phone) {
          setPhone(session.user.phone.replace('+91', ''));
        }
      }
      setIsSessionLoading(false);
    });
  }, [supabase]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. First validate the license key with the backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/validate-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_code: licenseKey, phone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid License Key');

      // 2. If valid, trigger Supabase OTP to the phone number
      if (!supabase) throw new Error('Auth client not initialized');
      
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `+91${phone.replace(/\D/g, '')}`, // Assuming India for now
      });

      if (otpError) throw otpError;

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to process activation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Verify OTP with Supabase
      if (!supabase) throw new Error('Auth client not initialized');
      
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        phone: `+91${phone.replace(/\D/g, '')}`,
        token: otp,
        type: 'sms',
      });

      if (authError) throw authError;

      // 2. Finalize activation in backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/activate-license`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session?.access_token}`,
          'X-Fingerprint-JS': 'activation-fingerprint'
        },
        body: JSON.stringify({ key_code: licenseKey })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Activation failed on backend');
      }

      const resData = await res.json();
      if (resData.device_token) {
        localStorage.setItem('flockiq_device_token', resData.device_token);
      }

      // Success! Redirect to dashboard
      router.push('/dashboard/overview');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateWithSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/activate-license`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'X-Fingerprint-JS': 'activation-fingerprint'
        },
        body: JSON.stringify({ key_code: licenseKey })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Activation failed on backend');
      }

      const resData = await res.json();
      if (resData.device_token) {
        localStorage.setItem('flockiq_device_token', resData.device_token);
      }

      // Success! Redirect to dashboard
      router.push('/dashboard/overview');
    } catch (err: any) {
      setError(err.message || 'Activation failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-brand-600" size={24} />
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">
            Enter the OTP sent to +91 {phone}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta text-lg tracking-widest text-center"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>
        
        {error && <p className="text-red-500 text-sm font-jakarta">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || otp.length < 6}
          className="w-full h-12 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-jakarta font-semibold transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Activate Software'}
        </button>
        
        <button
          type="button"
          onClick={() => setStep('details')}
          className="w-full text-center text-sm text-neutral-500 hover:text-neutral-900 mt-4"
        >
          Change phone number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={session ? handleActivateWithSession : handleSendOtp} className="space-y-5">
      {session ? (
        <div className="mb-6 p-4 bg-brand-50 border border-brand-100 rounded-xl">
          <p className="text-sm text-brand-800 font-medium font-jakarta mb-1">You are logged in as:</p>
          <p className="text-base font-bold text-brand-900 font-jakarta">+91 {phone}</p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone size={18} className="text-neutral-400" />
              <span className="ml-2 text-neutral-500 font-medium">+91</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full h-12 pl-[5.5rem] pr-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta text-[0.9375rem]"
              placeholder="98765 43210"
              required={!session}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">
          License Key
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Key size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta text-[0.9375rem] uppercase tracking-wider font-mono font-bold text-neutral-900"
            placeholder="FLOCK-XXXX-XXXX"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (!session && phone.length !== 10) || licenseKey.length < 5}
        className="w-full h-12 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-jakarta font-semibold transition-all shadow-[0_4px_14px_0_rgb(22,163,74,0.39)]"
      >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (session ? 'Activate License' : 'Verify Key & Send OTP')}
        {!isLoading && <ArrowRight size={18} />}
      </button>
      
      <p className="text-center text-xs text-neutral-500 pt-4 leading-relaxed font-jakarta">
        Already have a license? <Link href="/login" className="text-brand-600 font-semibold hover:underline">Log in here</Link>
        <br/><br/>
        Don't have a license key? <br/>Contact your sales agent to purchase FlockIQ.
      </p>
    </form>
  );
}
