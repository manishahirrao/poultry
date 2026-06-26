'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check, WhatsappLogo } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';

interface ReferralPromptProps {
  triggerMoment: 'first_prediction' | 'milestone' | 'after_support' | 'reminder';
  onClose: () => void;
  userId?: string;
  milestoneDescription?: string;
}

export function ReferralPrompt({ 
  triggerMoment, 
  onClose, 
  userId,
  milestoneDescription 
}: ReferralPromptProps) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fetch referral code if userId provided
    if (userId) {
      fetchReferralCode();
    }
    
    // Check if user has dismissed this prompt type
    const dismissedKey = `referral_prompt_dismissed_${triggerMoment}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    if (wasDismissed) {
      setDismissed(true);
    }
  }, [userId, triggerMoment]);

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
    const dismissedKey = `referral_prompt_dismissed_${triggerMoment}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
    onClose();
  };

  const handleWhatsAppShare = () => {
    const message = `नमस्ते! मैं FlockIQ AI इस्तेमाल कर रहा हूँ — रोज़ सुबह 6:30 बजे मुर्गी का भाव और कब बेचना है यह WhatsApp पर आता है। मेरे referral code से join करो, 30 दिन मुफ़्त मिलेगा: FlockIQ.ai/r/${referralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getPromptContent = () => {
    switch (triggerMoment) {
      case 'first_prediction':
        return {
          title: 'आपका पहला प्रेडिक्शन मिला! 🎉',
          description: 'अपने किसान मित्रों को भी FlockIQ AI से जोड़ें और 1 महीना फ्री कमाएं',
          icon: '🎯'
        };
      case 'milestone':
        return {
          title: milestoneDescription || 'बधाई हो! 🏆',
          description: 'अपनी सफलता शेयर करें और रेफरल क्रेडिट कमाएं',
          icon: '🌟'
        };
      case 'after_support':
        return {
          title: 'हमें आपकी मदद करके खुशी हुई! 💚',
          description: 'अपने किसान मित्रों को FlockIQ AI के बारे में बताएं',
          icon: '🤝'
        };
      case 'reminder':
        return {
          title: 'अभी तक कोई रेफरल नहीं? 🤔',
          description: 'अपना रेफरल कोड शेयर करें और कमाई शुरू करें',
          icon: '💡'
        };
      default:
        return {
          title: 'रेफरल क्रेडिट कमाएं',
          description: 'अपने किसान मित्रों को शेयर करें',
          icon: '🎁'
        };
    }
  };

  if (dismissed) return null;

  const content = getPromptContent();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="bg-brandGreen-700 p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{content.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{content.title}</h3>
                  <p className="text-brandGreen-100 text-sm">{content.description}</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-brandGreen-100 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Referral Code Display */}
            {referralCode && (
              <div className="bg-brandGreen-50 rounded-xl p-3">
                <p className="text-xs text-neutral-600 mb-1">आपका रेफरल कोड:</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-space-grotesk font-bold text-xl text-neutral-900 tracking-wider">
                    {referralCode}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleWhatsAppShare}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <WhatsappLogo size={18} className="mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleCopy}
                variant="secondary"
                className="flex-1"
                size="sm"
              >
                <Copy size={18} className="mr-2" />
                Copy Link
              </Button>
            </div>

            {/* Incentive Info */}
            <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
              <Gift size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-700">
                हर सफल रेफरल पर <span className="font-semibold">1 महीना फ्री</span> क्रेडिट मिलेगा
              </p>
            </div>

            {/* Dismiss Link */}
            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-700"
            >
              बाद में दिखाएं
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
