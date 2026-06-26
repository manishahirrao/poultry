'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

interface AppDownloadStepProps {
  onNext: (data: { appDownloaded: boolean }) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: { appDownloaded?: boolean };
}

export function AppDownloadStep({ onNext, onBack, onSkip, initialData }: AppDownloadStepProps) {
  const [appDownloaded, setAppDownloaded] = useState(initialData?.appDownloaded || false);

  const handleDownload = (platform: 'android' | 'ios') => {
    setAppDownloaded(true);
    // @ts-ignore - Analytics event
    trackEvent('app_download_initiated', { platform });
  };

  const handleSkip = () => {
    // @ts-ignore - Analytics event
    trackEvent('app_download_skipped');
    onSkip();
  };

  const handleNext = () => {
    onNext({ appDownloaded });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-neutral-600 text-sm hover:text-neutral-900 transition-colors"
      >
        ← पिछला
      </button>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center font-space-grotesk">
        App download करें — और features पाएं
      </h1>
      <p className="text-neutral-600 text-center">
        WhatsApp signal तो मिलेगा ही — app से और ज़्यादा मिलेगा
      </p>

      {/* App vs WhatsApp Comparison Table */}
      <div className="bg-white rounded-xl border-2 border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50">
              <th className="text-left p-3 font-semibold text-neutral-900">Feature</th>
              <th className="text-center p-3 font-semibold text-neutral-900">WhatsApp</th>
              <th className="text-center p-3 font-semibold text-brandGreen-700">App</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: 'Daily sell signal', whatsapp: true, app: true },
              { feature: '7-day forecast chart', whatsapp: false, app: true },
              { feature: 'Batch profit calculator', whatsapp: false, app: true },
              { feature: 'Middleman price check', whatsapp: false, app: true },
              { feature: 'Offline access', whatsapp: false, app: true },
              { feature: 'Historical prices', whatsapp: false, app: true },
            ].map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                <td className="p-3 text-neutral-700">{row.feature}</td>
                <td className="p-3 text-center">
                  {row.whatsapp ? (
                    <svg className="w-5 h-5 text-brandGreen-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-neutral-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </td>
                <td className="p-3 text-center">
                  {row.app ? (
                    <svg className="w-5 h-5 text-brandGreen-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-neutral-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleDownload('android')}
          className="w-full min-h-[52px] py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
          </svg>
          Google Play Store
        </button>
        <button
          onClick={() => handleDownload('ios')}
          className="w-full min-h-[52px] py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
          </svg>
          Apple App Store
        </button>
      </div>

      {/* QR Code Placeholder */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl border-2 border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 text-center mb-2">QR Code</p>
          <div className="w-32 h-32 bg-neutral-100 rounded-lg flex items-center justify-center">
            <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Skip Link */}
      <button
        onClick={handleSkip}
        className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
      >
        WhatsApp ही काफ़ी है → बाद में app लूँगा
      </button>

      {/* CTA */}
      <button
        onClick={handleNext}
        className="w-full h-[52px] bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 transition-all duration-200"
      >
        आगे →
      </button>
    </motion.div>
  );
}
