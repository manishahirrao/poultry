'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle } from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

interface AccuracyTrustCardProps {
  mape30d: number;
  directionalAccuracy: number;
  predictionCount: number;
  lastRetrain: Date;
  modelVersion?: string;
}

export function AccuracyTrustCard({
  mape30d,
  directionalAccuracy,
  predictionCount,
  lastRetrain,
  modelVersion = 'v1.0'
}: AccuracyTrustCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { language } = useLanguage();

  // Native JavaScript relative time formatter
  const formatDistanceToNow = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // MAPE color coding
  const getMapeColor = (mape: number) => {
    if (mape < 6) return {
      color: '#1A6B3C', // green
      label: 'excellent',
      dotClass: 'bg-brandGreen600'
    };
    if (mape < 8) return {
      color: '#F5A623', // amber
      label: 'warning',
      dotClass: 'bg-amber500'
    };
    return {
      color: '#C0392B', // red
      label: 'critical',
      dotClass: 'bg-red600 animate-pulse'
    };
  };

  const mapeStatus = getMapeColor(mape30d);

  // Directional accuracy progress bar color
  const getDirectionalColor = (accuracy: number) => {
    if (accuracy >= 95) return '#1A6B3C'; // green
    if (accuracy >= 92) return '#F5A623'; // amber
    return '#C0392B'; // red
  };

  const directionalColor = getDirectionalColor(directionalAccuracy);

  return (
    <div
      className="bg-white rounded-2xl p-card-standard border border-neutral-200 relative flex flex-col gap-lg"
      role="status"
      aria-live="polite"
    >
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-neutral-900">{language === 'hi' ? 'मॉडल सटीकता' : 'Model Accuracy'}</h3>
        <p className="text-xs text-neutral-500">{language === 'hi' ? 'Model Accuracy' : 'Last 30 Days'}</p>
      </div>

      {/* MAPE Display */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-lg">
          <span className="text-xs text-neutral-600">{language === 'hi' ? 'सटीकता गलती' : 'Accuracy Error'}</span>
          <span className="text-xs text-neutral-400">MAPE</span>

          {/* MAPE Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2 rounded"
              aria-label="What is MAPE?"
            >
              <Info size={14} />
            </button>

            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl z-10"
                >
                  <p className="mb-1">{language === 'hi' ? 'माध्य निरपेक्ष प्रतिशत त्रुटि' : 'Mean Absolute Percentage Error'}</p>
                  <p className="text-neutral-300">
                    {language === 'hi' ? 'औसत भविष्यवाणी त्रुटि - जितना कम, उतना बेहतर। 6% से कम उत्कृष्ट माना जाता है।' : 'Average prediction error - lower is better. Under 6% is considered excellent.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-lg">
          {/* Color dot indicator */}
          <div className={`w-3 h-3 rounded-full ${mapeStatus.dotClass}`} />

          {/* MAPE value */}
          <span
            className="text-3xl font-bold font-mono tabular-nums"
            style={{ color: mapeStatus.color }}
          >
            {mape30d.toFixed(1)}%
          </span>

          {/* Visual indicator dots */}
          <div className="flex gap-sm">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < Math.round(mape30d / 2) ? mapeStatus.dotClass : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Directional Accuracy Progress Bar */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">{language === 'hi' ? 'दिशा सटीकता' : 'Direction Accuracy'}</span>
          <span className="text-xs text-neutral-400">Directional</span>
        </div>

        <div className="flex items-center gap-lg">
          <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${directionalAccuracy}%`,
                backgroundColor: directionalColor
              }}
              initial={{ width: 0 }}
              animate={{ width: `${directionalAccuracy}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span
            className="text-lg font-bold font-mono tabular-nums"
            style={{ color: directionalColor }}
          >
            {directionalAccuracy.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="pt-lg border-t border-neutral-200 flex flex-col gap-md">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-lg text-neutral-600">
            <CheckCircle size={16} className="text-brandGreen600" />
            <span>{predictionCount.toLocaleString()} {language === 'hi' ? 'भविष्यवाणियां जांची गईं' : 'predictions verified'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{language === 'hi' ? 'अंतिम रीट्रेन' : 'Last retrain'}: {formatDistanceToNow(lastRetrain)}</span>
          <span>{modelVersion}</span>
        </div>
      </div>
    </div>
  );
}
