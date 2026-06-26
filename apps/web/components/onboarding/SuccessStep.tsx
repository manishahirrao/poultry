'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SuccessStepProps {
  plan: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL';
  district: string;
  whatsappNumber: string;
  appDownloaded: boolean;
  segment?: 'S1' | 'S2';
  onDashboard: () => void;
  onAppDownload: () => void;
  onWhatsAppSetup: () => void;
}

export function SuccessStep({
  plan,
  district,
  whatsappNumber,
  appDownloaded,
  segment = 'S2',
  onDashboard,
  onAppDownload,
  onWhatsAppSetup,
}: SuccessStepProps) {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire confetti on mount
    const duration = 1500;
    const end = Date.now() + duration;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Only fire if user hasn't seen it this session
    if (sessionStorage.getItem('confetti_fired')) return;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3DAE72', '#E8611A', '#FFFFFF'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3DAE72', '#E8611A', '#FFFFFF'],
        disableForReducedMotion: true,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
    sessionStorage.setItem('confetti_fired', '1');

    // Generate referral link
    const generateReferralLink = async () => {
      try {
        const response = await fetch('/api/referrals', { method: 'POST' });
        const data = await response.json();
        if (data.referralCode) {
          setReferralLink(`https://flockiq.com/signup?ref=${data.referralCode}`);
        }
      } catch (error) {
        console.error('Failed to generate referral link:', error);
      }
    };

    generateReferralLink();
  }, []);

  const handleCopyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = 'Try FlockIQ - the poultry management platform that saved me ₹1.8L/year! Use my link: ';
    const url = `https://wa.me/?text=${encodeURIComponent(text + referralLink)}`;
    window.open(url, '_blank');
  };

  // Calculate trial end date
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);
  const trialEndStr = trialEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const planName = plan === 'PULSE_FARM' ? 'PulseFarm' : plan === 'PULSE_PRO' ? 'PulsePro' : 'PulseIntel';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-6 relative"
    >
      {/* Celebrating Illustration */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-32 h-32 rounded-full flex items-center justify-center bg-brand-50"
        >
          <span className="text-6xl">🐔</span>
        </motion.div>
      </div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold font-space-grotesk mb-2 text-brand-700">
          🎉 You're all set!
        </h1>
        <p className="text-lg text-neutral-600">Welcome to FlockIQ — your first signal arrives tomorrow</p>
      </motion.div>

      {/* What Happens Next Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-neutral-900 text-center">What happens next:</h2>
        <div className="space-y-2">
          {[
            { time: 'Today', event: 'We set up your farm data' },
            { time: 'Tomorrow 4:30 AM', event: 'Data collection from 47 sources' },
            { time: 'Tomorrow 6:00 AM', event: 'AI prediction ready' },
            { time: 'Tomorrow 6:30 AM', event: 'First signal on WhatsApp 🐔' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 bg-white rounded-lg p-3 border border-neutral-200"
            >
              <div className="w-32 flex-shrink-0">
                <span className="text-sm font-semibold text-brand-700">{item.time}</span>
              </div>
              <span className="text-sm text-neutral-700">{item.event}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl p-5 border-2 bg-brand-50 border-brand-400"
      >
        <h3 className="text-sm font-semibold mb-3 text-brand-700">Your summary:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Plan:</span>
            <span className="font-semibold text-neutral-900">{planName} (14-day free trial)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">District:</span>
            <span className="font-semibold text-neutral-900">{district}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Signal time:</span>
            <span className="font-semibold text-neutral-900">6:30 AM daily</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">WhatsApp:</span>
            <span className="font-semibold text-neutral-900">{whatsappNumber}</span>
          </div>
          <div className="flex justify-between border-t border-brand-300 pt-2 mt-2">
            <span className="text-neutral-600">Trial ends:</span>
            <span className="font-semibold text-brand-700">{trialEndStr}</span>
          </div>
        </div>
      </motion.div>

      {/* Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="rounded-xl p-4 space-y-3 bg-brand-50"
      >
        <h3 className="text-sm font-semibold text-center text-brand-700">
          Refer a friend — you both get ₹500 credit
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopyReferralLink}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm flex items-center justify-center gap-2 ${
              copied
                ? 'bg-brand-400 border-brand-400 text-white'
                : 'bg-transparent border-brand-700 text-brand-700 hover:bg-brand-50'
            }`}
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm flex items-center justify-center gap-2 border-[#25D366] bg-[#25D366] text-white"
          >
            📱 WhatsApp
          </button>
        </div>
      </motion.div>

      {/* 3 CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="space-y-3"
      >
        {/* Primary CTA - Go to Dashboard */}
        <button
          onClick={onDashboard}
          className="w-full min-h-[52px] py-4 bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-brand-600"
        >
          Open my dashboard →
        </button>

        {/* Secondary CTA - Download App */}
        <button
          onClick={onAppDownload}
          className="w-full min-h-[52px] py-4 font-semibold rounded-xl border-2 border-brand-700 text-brand-700 bg-transparent transition-all duration-200 hover:bg-brand-50"
        >
          📱 Download the app
        </button>

        {/* Tertiary CTA - WhatsApp Log Setup (prominent for integrators) */}
        <button
          onClick={onWhatsAppSetup}
          className="w-full min-h-[52px] py-4 text-neutral-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:text-neutral-900"
        >
          <span>📱</span>
          Set up WhatsApp log for my farms →
        </button>
      </motion.div>
    </motion.div>
  );
}
