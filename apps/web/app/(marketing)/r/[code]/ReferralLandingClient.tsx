'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, Clock, ArrowRight, Users, TrendUp } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface ReferralLandingClientProps {
  referralCode: string;
}

export default function ReferralLandingClient({ referralCode }: ReferralLandingClientProps) {
  const router = useRouter();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateReferralCode();
  }, [referralCode]);

  const validateReferralCode = async () => {
    try {
      const res = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsValid(true);
        // You could fetch referrer name here if needed
      } else {
        setIsValid(false);
      }
    } catch (error) {
      console.error('Failed to validate referral code:', error);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    // Store referral code in localStorage for use during signup
    localStorage.setItem('referral_code', referralCode);
    router.push('/signup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen700" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-neutral50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-space-grotesk font-bold text-2xl text-neutral900 mb-2">
              अमान्य रेफरल कोड
            </h1>
            <p className="text-neutral600 mb-6">
              यह रेफरल कोड मौजूद नहीं है या expire हो गया है।
            </p>
            <Button onClick={() => router.push('/signup')} className="w-full">
              साइन अप करें
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandGreen700 via-brandGreen600 to-brandGreen500">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-brandGreen700 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-block mb-4"
              >
                <Gift size={64} className="text-amber400" weight="fill" />
              </motion.div>
              <h1 className="font-space-grotesk font-bold text-3xl sm:text-4xl mb-3">
                आपको 30 दिन मुफ़्त मिलेंगे!
              </h1>
              <p className="text-brandGreen100 text-lg">
                अपने किसान मित्र के referral code से जुड़ें
              </p>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-12 space-y-8">
              {/* Referral Code Display */}
              <div className="bg-brandGreen50 rounded-2xl p-6 text-center">
                <p className="text-sm text-neutral600 mb-2">आपका रेफरल कोड:</p>
                <p className="font-space-grotesk font-bold text-4xl text-neutral900 tracking-wider mb-2">
                  {referralCode}
                </p>
                <div className="flex items-center justify-center gap-2 text-green700">
                  <Check size={20} weight="fill" />
                  <span className="font-semibold">Valid ✓</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Clock,
                    title: '30 Days Free',
                    desc: 'कोई पेमेंट नहीं',
                  },
                  {
                    icon: TrendUp,
                    title: 'Daily Price Alerts',
                    desc: 'WhatsApp पर भाव',
                  },
                  {
                    icon: Users,
                    title: 'Join 1000+ Farmers',
                    desc: 'भारत भर के किसान',
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-neutral50 rounded-xl p-4 text-center"
                  >
                    <div className="bg-brandGreen100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <benefit.icon size={24} className="text-brandGreen700" />
                    </div>
                    <h3 className="font-semibold text-neutral900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-neutral600">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* How It Works */}
              <div className="space-y-4">
                <h2 className="font-space-grotesk font-bold text-xl text-neutral900 text-center">
                  यह कैसे काम करता है
                </h2>
                <div className="space-y-3">
                  {[
                    'साइन अप करें और अपना फोन नंबर verify करें',
                    '14 दिन का फ्री ट्रायल शुरू हो जाएगा',
                    'पहली बार पेमेंट करें और 30 दिन एक्स्ट्रा मुफ़्त पाएं',
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-brandGreen700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-neutral700">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleSignup}
                  size="lg"
                  className="w-full text-lg"
                >
                  अभी साइन अप करें
                  <ArrowRight size={24} className="ml-2" />
                </Button>
                <p className="text-center text-sm text-neutral500 mt-3">
                  कोई क्रेडिट कार्ड नहीं चाहिए • कोई commitment नहीं
                </p>
              </motion.div>
            </div>
          </div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-brandGreen100"
          >
            <p className="text-sm">
              ✓ DPDP Act 2023 compliant • ✓ Data stored in India • ✓ 1000+ farmers trust us
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
