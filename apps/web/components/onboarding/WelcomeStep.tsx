'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { DataFlowTicker } from '@/components/motion/DataFlowTicker';

interface WelcomeStepProps {
  onNext: (data: { phone?: string; countryCode?: string; email?: string; emailOptIn?: boolean }) => void;
}

const COUNTRIES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'OTHER', name: 'Other', dialCode: '+', flag: '🌍' },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(false);

  const handleNext = () => {
    const phoneWithCode = phone ? `${selectedCountry.dialCode}${phone}` : undefined;
    onNext({
      phone: phoneWithCode,
      countryCode: selectedCountry.code,
      email: email || undefined,
      emailOptIn,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-6"
    >
      {/* Visual - DataFlowTicker Mockup */}
      <div className="flex justify-center mb-6">
        <div className="w-full h-32 bg-neutral-900 rounded-xl p-4 flex items-center justify-center">
          <DataFlowTicker />
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center font-space-grotesk">
        Welcome to FlockIQ 🙏
      </h1>

      {/* Sub-copy */}
      <p className="text-neutral-600 text-center leading-relaxed">
        Setup takes 2 minutes.
        <br />
        Your first price signal arrives tomorrow at 6:30 AM.
      </p>

      {/* What to Expect */}
      <div className="rounded-xl p-4 space-y-3 bg-brand-50">
        <h3 className="text-sm font-semibold mb-2 text-brand-700">What happens next:</h3>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-400" aria-hidden="true">✓</span>
            <span>Today: Setup complete</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-400" aria-hidden="true">✓</span>
            <span>Tomorrow 4:30 AM: Data collection from 47 sources</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-400" aria-hidden="true">✓</span>
            <span>Tomorrow 6:00 AM: AI prediction ready</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-400" aria-hidden="true">✓</span>
            <span>Tomorrow 6:30 AM: First signal on WhatsApp 🐔</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-400" aria-hidden="true">✓</span>
            <span>Day 3+: Start tracking your farm's GC & P&L 📊</span>
          </li>
        </ul>
      </div>

      {/* Country Selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-neutral-700">
          Country
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => setSelectedCountry(country)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedCountry.code === country.code
                  ? 'border-brand-700 bg-brand-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="text-2xl mb-1">{country.flag}</div>
              <div className="text-xs text-neutral-600">{country.dialCode}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Input */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-neutral-700">
          WhatsApp number
        </label>
        <div className="flex">
          <div className="flex items-center px-4 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-lg">
            <span className="text-neutral-700 font-medium">{selectedCountry.dialCode}</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="98765 43210"
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-neutral-700">
          Email <span className="font-normal text-neutral-500">(optional — for reports)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={(e) => setEmailOptIn(e.target.checked)}
            className="w-4 h-4 rounded focus:ring-brand-700 accent-brand-700"
          />
          <span>Send me weekly tips and market updates</span>
        </label>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleNext}
        className="w-full min-h-[52px] py-4 bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] hover:bg-brand-600"
      >
        Set up my account →
      </button>
    </motion.div>
  );
}
