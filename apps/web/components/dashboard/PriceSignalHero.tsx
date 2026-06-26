'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendUp, TrendDown, Minus, CheckCircle, Clock, Warning, WifiHigh, ArrowClockwise } from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

interface PriceSignalHeroProps {
  price: number;           // P50 value
  p10: number;
  p90: number;
  deltaPercent: number;    // vs yesterday
  deltaDirection: 'up' | 'down' | 'flat';
  signal: 'sell' | 'hold' | 'caution' | 'withdrawal';
  district: string;        // Hindi district name
  lastUpdated: Date;
  isStale: boolean;        // >24h since update
  isOffline: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  withdrawalEndDate?: string; // ISO 8601 date when withdrawal ends
  type?: 'broiler' | 'egg'; // Type discriminator for broiler vs egg prices
  unit?: string; // '₹/kg' for broiler, '₹/egg' for layer
}

export function PriceSignalHero({
  price,
  p10,
  p90,
  deltaPercent,
  deltaDirection,
  signal,
  district,
  lastUpdated,
  isStale,
  isOffline,
  isLoading = false,
  error = null,
  onRefresh,
  withdrawalEndDate,
  type = 'broiler',
  unit = '₹/kg'
}: PriceSignalHeroProps) {
  const [displayPrice, setDisplayPrice] = useState(price);
  const [previousPrice, setPreviousPrice] = useState(price);
  const priceRef = useRef(price);
  const { language } = useLanguage();

  // Price counting animation
  useEffect(() => {
    if (price !== previousPrice && !isLoading) {
      const duration = 200; // 200ms animation
      const startTime = performance.now();
      const startValue = previousPrice;
      const endValue = price;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Linear easing for precise counting
        const currentValue = startValue + (endValue - startValue) * progress;
        setDisplayPrice(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayPrice(endValue);
          setPreviousPrice(endValue);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [price, previousPrice, isLoading]);

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get signal display
  const getSignalDisplay = (signal: string) => {
    switch (signal) {
      case 'sell':
        return {
          label: language === 'hi' ? 'आज बेचें' : 'Sell Today',
          subLabel: 'SELL NOW',
          icon: CheckCircle,
          bgColor: 'bg-brandGreen700',
          textColor: 'text-white'
        };
      case 'hold':
        return {
          label: language === 'hi' ? 'रुकें' : 'Hold',
          subLabel: 'HOLD',
          icon: Clock,
          bgColor: 'bg-amber500',
          textColor: 'text-white'
        };
      case 'caution':
        return {
          label: language === 'hi' ? 'सावधान' : 'Caution',
          subLabel: 'CAUTION',
          icon: Warning,
          bgColor: 'bg-red600',
          textColor: 'text-white'
        };
      case 'withdrawal':
        return {
          label: language === 'hi' ? 'रुकें' : 'Hold',
          subLabel: 'WITHDRAWAL',
          icon: Warning,
          bgColor: 'bg-neutral-400',
          textColor: 'text-neutral-800'
        };
      default:
        return {
          label: '—',
          subLabel: '—',
          icon: Minus,
          bgColor: 'bg-neutral-500',
          textColor: 'text-white'
        };
    }
  };

  // Calculate days remaining in withdrawal
  const getDaysRemaining = () => {
    if (!withdrawalEndDate) return null;
    const endDate = new Date(withdrawalEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get direction icon
  const getDirectionIcon = () => {
    switch (deltaDirection) {
      case 'up':
        return <TrendUp size={24} className="text-brandGreen600" />;
      case 'down':
        return <TrendDown size={24} className="text-red600" />;
      case 'flat':
        return <Minus size={24} className="text-neutral500" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-card-standard border border-neutral-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 animate-pulse" />
        <div className="relative space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="h-20 bg-neutral-200 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-card-standard border-2 border-red600 relative overflow-hidden">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-full bg-redLight flex items-center justify-center">
            <Warning size={24} className="text-red600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900">{language === 'hi' ? '⚠ डेटा उपलब्ध नहीं' : '⚠ Data Unavailable'}</h3>
            <p className="text-sm text-neutral-600 mt-1">{error}</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2"
              aria-label="Retry"
            >
              <ArrowClockwise size={20} className="text-neutral-700" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const signalDisplay = getSignalDisplay(signal);
  const SignalIcon = signalDisplay.icon;

  // Determine border style based on state
  const borderClass = isStale 
    ? 'border-2 border-amber500' 
    : isOffline 
      ? 'border border-neutral-300 opacity-75' 
      : 'border border-neutral-200';

  return (
    <div 
      className={`bg-white rounded-2xl p-card-standard relative overflow-hidden ${borderClass}`}
      aria-label={`आज का ब्रॉयलर भाव: ₹${price} प्रति किलोग्राम. संकेत: ${signal}`}
    >
      {/* Stale warning badge */}
      {isStale && (
        <div className="absolute top-4 right-4 bg-amberLight text-amber800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Warning size={14} />
          {language === 'hi' ? '⚠ डेटा पुराना है' : '⚠ Data is stale'}
        </div>
      )}

      {/* Offline badge */}
      {isOffline && (
        <div className="absolute top-4 right-4 bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <WifiHigh size={14} />
          {language === 'hi' ? '📴 ऑफलाइन' : '📴 Offline'}
        </div>
      )}

      {/* Header with district and time */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            {district.charAt(0).toUpperCase() + district.slice(1)} · {language === 'hi' ? 'आज का भाव' : 'Today\'s Price'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {formatTime(lastUpdated)}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2"
            aria-label="Refresh"
          >
            <ArrowClockwise size={20} className="text-neutral-700" />
          </button>
        )}
      </div>

      {/* Main price display */}
      <div className="mb-6">
        <motion.div 
          className="flex items-baseline gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-6xl font-bold text-neutral-900 font-mono tabular-nums">
            ₹{displayPrice.toFixed(2)}
          </span>
          <span className="text-2xl text-neutral-500">{unit}</span>
        </motion.div>

        {/* Direction and delta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${deltaDirection}-${deltaPercent}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mt-2"
          >
            {getDirectionIcon()}
            <span className={`text-lg font-semibold ${
              deltaDirection === 'up' ? 'text-brandGreen600' : 
              deltaDirection === 'down' ? 'text-red600' : 'text-neutral500'
            }`}>
              {deltaDirection === 'up' ? '↑' : deltaDirection === 'down' ? '↓' : '→'} {Math.abs(deltaPercent)}% {language === 'hi' ? 'vs कल' : 'vs Yesterday'}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confidence range */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
          <span>₹{p10.toFixed(0)}</span>
          <span className="text-neutral-500">{language === 'hi' ? '80% संभावना की सीमा' : '80% Confidence Interval'}</span>
          <span>₹{p90.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brandGreen700 to-brandGreen500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Sell signal badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl ${signalDisplay.bgColor} ${signalDisplay.textColor}"
      >
        <SignalIcon size={20} weight="bold" />
        <span className="font-semibold">{signalDisplay.label}</span>
        <span className="text-sm opacity-90">· {signalDisplay.subLabel}</span>
        {signal === 'withdrawal' && withdrawalEndDate && (
          <span className="text-sm opacity-90">
            · {getDaysRemaining()} days remaining
          </span>
        )}
      </motion.div>

      {/* Withdrawal legal notice */}
      {signal === 'withdrawal' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Warning size={16} weight="fill" className="text-neutral-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-700">
              <p className="font-medium">{language === 'hi' ? 'कानूनी: इस तारीख से पहले बेचना मना है' : 'Legal: Cannot sell before this date'}</p>
              {withdrawalEndDate && (
                <p className="text-neutral-600 mt-1">
                  Ends: {new Date(withdrawalEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
