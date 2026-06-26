'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
import { getScoreColor, getScoreLabel } from '@/lib/biosecurityAuditItems';

interface BiosecurityScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
}

export function BiosecurityScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  showIcon = true
}: BiosecurityScoreGaugeProps) {
  const sizeConfig = {
    sm: { width: 120, height: 60, strokeWidth: 8 },
    md: { width: 160, height: 80, strokeWidth: 12 },
    lg: { width: 200, height: 100, strokeWidth: 16 }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius; // Semi-circle
  const offset = circumference - (score / 100) * circumference;

  // Color zones for the background arc
  const zones = [
    { start: 0, end: 40, color: '#ef4444' }, // red - Critical Risk
    { start: 40, end: 60, color: '#f97316' }, // orange - Needs Improvement
    { start: 60, end: 80, color: '#f59e0b' }, // amber - Acceptable
    { start: 80, end: 100, color: '#22c55e' } // green - Excellent
  ];

  const getIcon = () => {
    if (score >= 80) return <CheckCircle size={24} weight="fill" className="text-green-600" />;
    if (score >= 60) return <CheckCircle size={24} weight="regular" className="text-amber-600" />;
    if (score >= 40) return <Warning size={24} weight="fill" className="text-orange-600" />;
    return <XCircle size={24} weight="fill" className="text-red-600" />;
  };

  return (
    <div className="flex flex-col items-center">
      {/* SVG Arc Gauge */}
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="overflow-visible"
        >
          {/* Background Arc with Color Zones */}
          <defs>
            <linearGradient id="biosecurityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#f97316" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.height} 
                A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
            fill="none"
            stroke="url(#biosecurityGradient)"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />

          {/* Score Arc (animated) */}
          <motion.path
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            d={`M ${config.strokeWidth / 2} ${config.height} 
                A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
            fill="none"
            stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ transformOrigin: 'center' }}
          />
        </svg>

        {/* Score Display */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center"
          style={{ bottom: '-10px' }}
        >
          {showIcon && (
            <div className="flex justify-center mb-1">
              {getIcon()}
            </div>
          )}
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          {showLabel && (
            <div className={`text-xs font-medium ${getScoreColor(score)} mt-1`}>
              {getScoreLabel(score)}
            </div>
          )}
        </div>
      </div>

      {/* Zone Labels */}
      {showLabel && (
        <div className="flex justify-between w-full mt-4 text-xs text-neutral-500 px-2">
          <span className="text-red-600">Critical</span>
          <span className="text-orange-600">Needs</span>
          <span className="text-amber-600">Acceptable</span>
          <span className="text-green-600">Excellent</span>
        </div>
      )}

      {/* Scale Labels */}
      <div className="flex justify-between w-full mt-1 text-xs text-neutral-400 px-2">
        <span>0%</span>
        <span>40%</span>
        <span>60%</span>
        <span>80%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default BiosecurityScoreGauge;
