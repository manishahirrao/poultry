// FlockIQ — Accuracy Strip Component
// File: apps/web/components/ui/AccuracyStrip.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-005
// Requirements: Design Spec §3.4, GWEB-005
// Horizontal strip showing accuracy metrics

'use client';

import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Minus, CheckCircle } from '@phosphor-icons/react';
import AnimatedStat from './AnimatedStat';

interface AccuracyStripProps {
  directionalAccuracy: number;
  mape: number;
  totalPredictions: number;
  lastUpdated?: string;
  showTrend?: 'up' | 'down' | 'flat' | null;
  className?: string;
  compact?: boolean;
}

export default function AccuracyStrip({
  directionalAccuracy,
  mape,
  totalPredictions,
  lastUpdated,
  showTrend = null,
  className = '',
  compact = false,
}: AccuracyStripProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-brandOrange600';
    if (accuracy >= 90) return 'text-emerald-600';
    if (accuracy >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 95) return 'bg-brandOrange100';
    if (accuracy >= 90) return 'bg-emerald-100';
    if (accuracy >= 80) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const getTrendIcon = () => {
    switch (showTrend) {
      case 'up':
        return <TrendUp size={16} weight="bold" className="text-brandGreen600" />;
      case 'down':
        return <TrendDown size={16} weight="bold" className="text-red-600" />;
      case 'flat':
        return <Minus size={16} weight="bold" className="text-neutral500" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-4 px-4 py-2 rounded-full ${getAccuracyBg(directionalAccuracy)} ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} weight="fill" className={getAccuracyColor(directionalAccuracy)} />
          <span className={`text-sm font-semibold ${getAccuracyColor(directionalAccuracy)}`}>
            <AnimatedStat value={directionalAccuracy} decimals={1} />% Accuracy
          </span>
        </div>
        {showTrend && getTrendIcon()}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-neutral900 rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-8">
        {/* Directional Accuracy */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={20} weight="fill" className="text-brandOrange300" />
            <span className="text-sm text-white/70">Directional Accuracy</span>
          </div>
          <div className={`text-3xl font-bold ${getAccuracyColor(directionalAccuracy)}`}>
            <AnimatedStat value={directionalAccuracy} decimals={1} suffix="%" />
          </div>
        </div>

        {/* MAPE */}
        <div className="flex-1">
          <div className="text-sm text-white/70 mb-1">MAPE</div>
          <div className="text-3xl font-bold text-white">
            <AnimatedStat value={mape} decimals={1} suffix="%" />
          </div>
        </div>

        {/* Total Predictions */}
        <div className="flex-1">
          <div className="text-sm text-white/70 mb-1">Predictions Verified</div>
          <div className="text-3xl font-bold text-white">
            <AnimatedStat value={totalPredictions} decimals={0} />
          </div>
        </div>

        {/* Trend */}
        {showTrend && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
            {getTrendIcon()}
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-white/50">
            {new Date(lastUpdated).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
