'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, WhatsappLogo, ArrowRight, House } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';

export default function ThankYouPage() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const whatsappNumber = '919876543210'; // Replace with actual number
  const whatsappMessage = encodeURIComponent(
    language === 'hi'
      ? 'नमस्ते, मैंने डेमो अनुरोध भेजा है। अग्रिम धन्यवाद।'
      : 'Hello, I have submitted a demo request. Thank you in advance.'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandGreen-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 20, stiffness: 300 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="text-green-600" size={48} weight="fill" />
          </motion.div>

          {/* Thank You Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 font-space-grotesk">
            {language === 'hi' ? 'धन्यवाद!' : 'Thank You!'}
          </h1>

          <p className="text-xl text-gray-700 mb-2">
            {language === 'hi'
              ? 'हम आपसे 2 घंटे में WhatsApp पर संपर्क करेंगे।'
              : 'We will contact you on WhatsApp within 2 hours.'}
          </p>

          <p className="text-gray-600 mb-8">
            {language === 'hi'
              ? 'हमारी टीम आपके फार्म के लिए व्यक्तिगत डेमो तैयार करेगी'
              : 'Our team will prepare a personalized demo for your farm'}
          </p>

          {/* WhatsApp CTA */}
          <div className="bg-green-50 rounded-2xl p-6 mb-8">
            <p className="text-gray-700 mb-4">
              {language === 'hi'
                ? 'तुरंत बात करने के लिए:'
                : 'To talk immediately:'}
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all text-lg"
            >
              <WhatsappLogo size={24} weight="fill" />
              {language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}
              <ArrowRight size={24} />
            </a>
          </div>

          {/* What Happens Next */}
          <div className="text-left bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-neutral-900 mb-4 font-space-grotesk">
              {language === 'hi' ? 'आगे क्या होगा:' : 'What happens next:'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandGreen-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <span className="text-gray-700">
                  {language === 'hi'
                    ? 'हमारी टीम आपका अनुरोध समीक्षा करेगी'
                    : 'Our team reviews your request'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandGreen-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <span className="text-gray-700">
                  {language === 'hi'
                    ? '2 घंटे के अंदर WhatsApp पर संपर्क किया जाएगा'
                    : 'We contact you on WhatsApp within 2 hours'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandGreen-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <span className="text-gray-700">
                  {language === 'hi'
                    ? 'आपके फार्म के लिए व्यक्तिगत डेमो शेड्यूल किया जाएगा'
                    : 'We schedule a personalized demo for your farm'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brandGreen-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <span className="text-gray-700">
                  {language === 'hi'
                    ? 'आप 14 दिन मुफ़्त ट्रायल शुरू कर सकते हैं'
                    : 'You can start a 14-day free trial'}
                </span>
              </li>
            </ul>
          </div>

          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brandGreen-700 text-brandGreen-700 rounded-full font-semibold hover:bg-brandGreen-50 transition-all"
          >
            <House size={20} />
            {language === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
