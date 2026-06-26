'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Minus, MapPin, Clock } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

interface KpiCardProps {
  icon: React.ElementType;  // Phosphor icon component
  iconColor?: string;       // icon container accent color
  title: string;
  value: string;
  subtitle: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'flat';
  source?: string;
  freshness?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function KpiCard({
  icon: Icon,
  iconColor = '#1A5C34',
  title,
  value,
  subtitle,
  delta,
  deltaDirection = 'flat',
  source,
  freshness,
  onClick,
  isLoading = false
}: KpiCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const getDeltaIcon = () => {
    switch (deltaDirection) {
      case 'up':
        return <TrendUp size={14} weight="bold" className="text-green-600" />;
      case 'down':
        return <TrendDown size={14} weight="bold" className="text-red-600" />;
      case 'flat':
        return <Minus size={14} weight="bold" className="text-neutral-400" />;
    }
  };

  const getDeltaColor = () => {
    switch (deltaDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'flat':
        return 'text-neutral-400';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 relative overflow-hidden min-h-[140px]">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 animate-pulse" />
        <div className="relative space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/3" />
          <div className="h-8 bg-neutral-200 rounded w-1/2" />
          <div className="h-3 bg-neutral-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      className="bg-white rounded-2xl p-5 border border-neutral-200 relative overflow-hidden text-left hover:shadow-lg hover:border-neutral-300 transition-all duration-200 min-h-[140px] flex flex-col justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2 group"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '140px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: `${iconColor}12` }}
          >
            <Icon size={18} weight="duotone" style={{ color: iconColor }} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 truncate leading-tight">{title}</h3>
        </div>
      </div>

      {/* Value and subtitle */}
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-bold text-neutral-900 font-mono tabular-nums truncate leading-tight">
          {value}
        </p>
        <p className="text-sm text-neutral-500 truncate leading-snug">{subtitle}</p>
      </div>

      {/* Delta and footer info */}
      <div className="flex items-center justify-between gap-3">
        {delta && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {getDeltaIcon()}
            <span className={`text-xs font-semibold ${getDeltaColor()} whitespace-nowrap leading-tight`}>
              {delta}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-neutral-400 truncate">
          {source && (
            <span className="flex items-center gap-1 truncate leading-tight">
              <MapPin size={11} weight="fill" className="flex-shrink-0" />
              {source}
            </span>
          )}
          {freshness && (
            <span className="flex items-center gap-1 whitespace-nowrap leading-tight">
              <Clock size={11} weight="fill" className="flex-shrink-0" />
              {freshness}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
