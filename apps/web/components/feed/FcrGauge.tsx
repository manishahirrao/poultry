'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendDown, TrendUp, Minus } from '@phosphor-icons/react';

interface FcrGaugeProps {
  fcr: number;
  breedStandardFCR: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FcrGauge({ 
  fcr, 
  breedStandardFCR, 
  showLabel = true,
  size = 'md' 
}: FcrGaugeProps) {
  // Determine color status based on breed standard (Cobb 500 day 35 standard: < 1.7 green, 1.7-2.0 amber, > 2.0 red)
  const getColorStatus = (): 'green' | 'amber' | 'red' => {
    if (fcr < breedStandardFCR) return 'green';
    if (fcr <= breedStandardFCR + 0.3) return 'amber';
    return 'red';
  };

  const colorStatus = getColorStatus();
  
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      bar: 'bg-green-500',
      icon: 'text-green-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      icon: 'text-amber-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      bar: 'bg-red-500',
      icon: 'text-red-600',
    },
  };

  const colors = colorClasses[colorStatus];
  
  // Calculate percentage for gauge (0-3 scale, where 3 is max FCR to display)
  const maxFCR = 3.0;
  const percentage = Math.min((fcr / maxFCR) * 100, 100);
  const standardPercentage = Math.min((breedStandardFCR / maxFCR) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const getIcon = () => {
    if (colorStatus === 'green') return <TrendDown size={iconSize[size]} />;
    if (colorStatus === 'amber') return <Minus size={iconSize[size]} />;
    return <TrendUp size={iconSize[size]} />;
  };

  const getStatusText = () => {
    if (colorStatus === 'green') return 'उत्कृष्ट';
    if (colorStatus === 'amber') return 'स्वीकार्य';
    return 'उच्च';
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        {showLabel && (
          <div className="flex items-center gap-2">
            <span className={`${colors.icon} ${colors.text}`}>
              {getIcon()}
            </span>
            <span className={`font-semibold ${colors.text}`}>
              FCR: {fcr.toFixed(3)}
            </span>
          </div>
        )}
        <span className={`text-sm font-medium ${colors.text}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Gauge Bar */}
      <div className="relative">
        <div className={`w-full ${colors.bg} ${sizeClasses[size]} rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${colors.bar} rounded-full`}
          />
        </div>
        
        {/* Breed Standard Marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-neutral-800 transform -translate-x-1/2"
          style={{ left: `${standardPercentage}%` }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-2 text-xs text-neutral-500">
        <span>1.0</span>
        <span>2.0</span>
        <span>3.0</span>
      </div>

      {/* Breed Standard Indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
        <div className="w-2 h-2 bg-neutral-800 rounded-full" />
        <span>
          ब्रीड मानक: {breedStandardFCR.toFixed(3)}
        </span>
      </div>

      {/* Deviation */}
      {showLabel && (
        <div className="mt-2 text-xs text-neutral-500">
          {fcr < breedStandardFCR ? (
            <span className="text-green-600">
              मानक से {(breedStandardFCR - fcr).toFixed(3)} कम ✅
            </span>
          ) : (
            <span className="text-red-600">
              मानक से {(fcr - breedStandardFCR).toFixed(3)} अधिक ⚠️
            </span>
          )}
        </div>
      )}
    </div>
  );
}
