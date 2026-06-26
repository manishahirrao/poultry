'use client';

// WHY: This is the hero price section component that displays the current mandi price prominently on the dashboard.
// It shows the current price with animated transitions, price change indicators, confidence bands (P10-P90),
// sell signals (SELL_NOW, HOLD, CAUTION), and model accuracy metrics. It also includes an expandable
// section showing price drivers (factors affecting today's price). The component uses Framer Motion for
// smooth animations and design tokens for consistent styling.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendUp, TrendDown, Minus, CheckCircle, Clock, Warning, CaretDown, CaretUp, Info } from '@phosphor-icons/react';
import { FlockIQTokens } from '@/lib/design-tokens';

interface Driver {
  emoji: string;
  text: string;
  impact: string;
}

interface HeroPriceSectionProps {
  mandi: string;
  price: number;
  priceP10: number;
  priceP90: number;
  priceChangeAbs: number;
  priceChangePct: number;
  sellSignal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  signalStrength: number;
  lastUpdated: Date;
  drivers: Driver[];
  modelMape: number;
  modelDirectional: number;
  isLoading?: boolean;
}

export function HeroPriceSection({
  mandi,
  price,
  priceP10,
  priceP90,
  priceChangeAbs,
  priceChangePct,
  sellSignal,
  signalStrength,
  lastUpdated,
  drivers,
  modelMape,
  modelDirectional,
  isLoading = false,
}: HeroPriceSectionProps) {
  const [displayPrice, setDisplayPrice] = useState(price);
  const [previousPrice, setPreviousPrice] = useState(price);
  const [driversExpanded, setDriversExpanded] = useState(false);

  useEffect(() => {
    if (price !== previousPrice) {
      const duration = 200;
      const startTime = performance.now();
      const startValue = previousPrice;
      const endValue = price;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
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
  }, [price, previousPrice]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSignalDisplay = (signal: string) => {
    switch (signal) {
      case 'SELL_NOW':
        return {
          label: 'आज बेचें',
          subLabel: 'SELL NOW',
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'HOLD':
        return {
          label: 'रुकें',
          subLabel: 'HOLD',
          icon: Clock,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200'
        };
      case 'CAUTION':
        return {
          label: 'सावधान',
          subLabel: 'CAUTION',
          icon: Warning,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: '—',
          subLabel: '—',
          icon: Minus,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Loading skeleton component
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: FlockIQTokens.cardBorder }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-16 bg-gray-200 rounded w-1/2 animate-pulse mt-4" />
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded-full animate-pulse mt-4" />
            <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse mt-4" />
          </div>
          <div className="lg:col-span-4 border-l pl-6 space-y-4" style={{ borderColor: FlockIQTokens.divider }}>
            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const getDirectionIcon = () => {
    if (priceChangeAbs > 0) return <TrendUp size={20} className="text-green-600" />;
    if (priceChangeAbs < 0) return <TrendDown size={20} className="text-red-600" />;
    return <Minus size={20} className="text-gray-400" />;
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'SELL_NOW':
        return FlockIQTokens.signalSell;
      case 'HOLD':
        return FlockIQTokens.signalHold;
      case 'CAUTION':
        return FlockIQTokens.signalCaution;
      default:
        return '#9CA3AF';
    }
  };

  const isStale = () => {
    const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 6;
  };

  const getMapeColor = (mape: number) => {
    if (mape < 6) return FlockIQTokens.signalSell;
    if (mape < 9) return FlockIQTokens.signalHold;
    return FlockIQTokens.signalCaution;
  };

  const signalDisplay = getSignalDisplay(sellSignal);
  const SignalIcon = signalDisplay.icon;

  return (
    <div className="bg-white rounded-xl border p-6" style={{ borderColor: FlockIQTokens.cardBorder }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Price hero */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mandi.charAt(0).toUpperCase() + mandi.slice(1)} · आज का भाव
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(lastUpdated)}
              </p>
            </div>
            {isStale() && (
              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Warning size={14} />
                ⚠ Data last updated {Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60))} hours ago
              </div>
            )}
          </div>

          <motion.div
            className="flex items-baseline gap-2 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-5xl font-bold text-gray-900 font-mono tabular-nums">
              ₹{displayPrice.toFixed(2)}/kg
            </span>
          </motion.div>

          {/* Price change badge */}
          <div className="flex items-center gap-2 mb-4">
            {getDirectionIcon()}
            <span className={`text-sm font-semibold ${
              priceChangeAbs > 0 ? 'text-green-600' : priceChangeAbs < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {priceChangeAbs > 0 ? '↑' : priceChangeAbs < 0 ? '↓' : '→'} ₹{Math.abs(priceChangeAbs).toFixed(2)} ({Math.abs(priceChangePct).toFixed(1)}% vs कल)
            </span>
          </div>

          {/* Confidence bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>₹{priceP10.toFixed(0)}</span>
              <span className="text-gray-500">80% confidence</span>
              <span>₹{priceP90.toFixed(0)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#1A5C34] to-[#3DAE72]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  background: `linear-gradient(to right, ${FlockIQTokens.brand700}, ${FlockIQTokens.brand400})`
                }}
              />
            </div>
          </div>

          {/* Sell signal badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${signalDisplay.bgColor} ${signalDisplay.textColor} ${signalDisplay.borderColor}`}
          >
            <SignalIcon size={18} weight="bold" />
            <span className="font-semibold">{signalDisplay.label}</span>
            <span className="text-sm opacity-90">· {signalDisplay.subLabel}</span>
          </motion.div>

          {/* Drivers expandable section */}
          <div className="mt-4">
            <button
              onClick={() => setDriversExpanded(!driversExpanded)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Info size={16} />
              <span>Why today's price?</span>
              {driversExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
            </button>

            <AnimatePresence>
              {driversExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pl-6 border-l-2"
                  style={{ borderColor: FlockIQTokens.divider }}
                >
                  <ul className="space-y-2">
                    {drivers.map((driver, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="mr-2">{driver.emoji}</span>
                        {driver.text} <span className="text-gray-500">({driver.impact})</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Model accuracy */}
        <div className="lg:col-span-4 border-l pl-6" style={{ borderColor: FlockIQTokens.divider }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">मॉडल सटीकता</h3>
          
          <div className="space-y-4">
            {/* MAPE */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">MAPE</span>
                <span className={`text-lg font-bold ${getMapeColor(modelMape)}`}>
                  {modelMape.toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i <= Math.ceil(5 - (modelMape / 2))
                        ? modelMape < 6
                          ? 'bg-green-500'
                          : modelMape < 9
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: i <= Math.ceil(5 - (modelMape / 2))
                        ? getMapeColor(modelMape)
                        : '#E5E7EB'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Directional accuracy */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Directional Accuracy</span>
                <span className="text-lg font-bold text-gray-900">
                  {modelDirectional.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{ 
                    width: `${modelDirectional}%`,
                    backgroundColor: FlockIQTokens.brand400
                  }}
                />
              </div>
            </div>

            {/* Additional info */}
            <div className="pt-4 border-t" style={{ borderColor: FlockIQTokens.divider }}>
              <p className="text-xs text-gray-500">
                Last 30 days accuracy
              </p>
              <p className="text-xs text-gray-400 mt-1">
                150 predictions verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
