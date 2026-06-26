'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Gift, ArrowRight, Clock } from '@phosphor-icons/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ReferralReminderProps {
  userId: string;
  onDismiss?: () => void;
  showAfterDays?: number; // Days after signup to show reminder
}

export function ReferralReminder({ 
  userId, 
  onDismiss,
  showAfterDays = 7 
}: ReferralReminderProps) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [daysSinceSignup, setDaysSinceSignup] = useState(0);

  useEffect(() => {
    // Check if user has dismissed this reminder
    const dismissedKey = 'referral_reminder_dismissed';
    const wasDismissed = localStorage.getItem(dismissedKey);
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Calculate days since signup
    const signupDate = localStorage.getItem('signup_date');
    if (signupDate) {
      const days = Math.floor((Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24));
      setDaysSinceSignup(days);
    }

    // Fetch referral code
    fetchReferralCode();
  }, [userId]);

  const fetchReferralCode = async () => {
    try {
      const res = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.code);
      }
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
    }
  };

  const handleCopy = async () => {
    if (referralCode) {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('referral_reminder_dismissed', 'true');
    setDismissed(true);
    onDismiss?.();
  };

  const handleWhatsAppShare = () => {
    const message = `नमस्ते! मैं FlockIQ AI इस्तेमाल कर रहा हूँ — रोज़ सुबह 6:30 बजे मुर्गी का भाव और कब बेचना है यह WhatsApp पर आता है। मेरे referral code से join करो, 30 दिन मुफ़्त मिलेगा: FlockIQ.ai/r/${referralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Don't show if dismissed or not enough days have passed
  if (dismissed || daysSinceSignup < showAfterDays) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 relative"
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-neutral400 hover:text-neutral600 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Content */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
          <Gift size={32} className="text-amber-600" weight="fill" />
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="font-space-grotesk font-bold text-lg text-neutral900 mb-2">
            अभी तक कोई रेफरल नहीं? 🤔
          </h3>
          <p className="text-neutral700 mb-4">
            अपने किसान मित्रों को FlockIQ AI से जोड़ें और हर सफल रेफरल पर <span className="font-semibold text-amber-700">1 महीना फ्री</span> कमाएं।
          </p>

          {/* Referral Code */}
          {referralCode && (
            <div className="bg-white rounded-lg p-3 mb-4 inline-block">
              <p className="text-xs text-neutral600 mb-1">आपका रेफरल कोड:</p>
              <div className="flex items-center gap-2">
                <p className="font-space-grotesk font-bold text-xl text-neutral900 tracking-wider">
                  {referralCode}
                </p>
                <button
                  onClick={handleCopy}
                  className="text-sm text-brandGreen700 hover:text-brandGreen600 font-semibold"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleWhatsAppShare}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              WhatsApp पर भेजें
            </Button>
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
            >
              कोड कॉपी करें
            </Button>
            <Link href="/refer">
              <Button
                variant="ghost"
                size="sm"
              >
                और जानें
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Time Indicator */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-amber-200">
        <Clock size={16} className="text-amber-600" />
        <p className="text-xs text-neutral600">
          {daysSinceSignup} दिन से FlockIQ AI का इस्तेमाल कर रहे हैं
        </p>
      </div>
    </motion.div>
  );
}
