'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, Wifi, WifiOff } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { LatestSensorReading, getEnvironmentBand } from '@/types/iot';

interface EnvironmentScoreCardProps {
  reading: LatestSensorReading | null;
  farmName: string;
  compact?: boolean;
}

const bandConfig = {
  safe:     { bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-800',  label: 'Safe'     },
  caution:  { bg: 'bg-yellow-50', border: 'border-yellow-200',badge: 'bg-yellow-100 text-yellow-800',label: 'Caution'  },
  warning:  { bg: 'bg-orange-50', border: 'border-orange-200',badge: 'bg-orange-100 text-orange-800',label: 'Warning'  },
  critical: { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-800',      label: 'Critical' },
};

function calculateScore(r: LatestSensorReading): number {
  let score = 10;
  if (r.temperature_c !== null) {
    if (r.temperature_c < 18 || r.temperature_c > 32) score -= 2;
    if (r.temperature_c < 14 || r.temperature_c > 36) score -= 1;
  }
  if (r.humidity_pct !== null) {
    if (r.humidity_pct > 70) score -= 2.5;
    if (r.humidity_pct > 80) score -= 1;
  }
  if (r.ammonia_ppm !== null) {
    if (r.ammonia_ppm > 25) score -= 3;
    if (r.ammonia_ppm > 40) score -= 1.5;
  }
  return Math.max(0, Math.min(10, score));
}

export default function EnvironmentScoreCard({
  reading,
  farmName,
  compact = false,
}: EnvironmentScoreCardProps) {
  if (!reading) {
    return (
      <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-6 flex items-center gap-3">
        <WifiOff size={20} className="text-neutral-400" />
        <div>
          <p className="font-jakarta font-semibold text-neutral-700 text-sm">{farmName}</p>
          <p className="font-jakarta text-neutral-500 text-xs">No sensor data — device offline</p>
        </div>
      </div>
    );
  }

  const score = calculateScore(reading);
  const band = getEnvironmentBand(score);
  const config = bandConfig[band];
  const minutesAgo = Math.round(
    (Date.now() - new Date(reading.received_at).getTime()) / 60000
  );
  const isStale = minutesAgo > 20;

  const metrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: reading.temperature_c !== null ? `${reading.temperature_c}°C` : '—',
      alert: reading.temperature_c !== null &&
             (reading.temperature_c > 32 || reading.temperature_c < 18),
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: reading.humidity_pct !== null ? `${reading.humidity_pct}%` : '—',
      alert: reading.humidity_pct !== null && reading.humidity_pct > 70,
    },
    {
      icon: Wind,
      label: 'Ammonia',
      value: reading.ammonia_ppm !== null ? `${reading.ammonia_ppm} ppm` : '—',
      alert: reading.ammonia_ppm !== null && reading.ammonia_ppm > 25,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl border p-6 transition-all
        ${config.bg} ${config.border}
        ${compact ? 'p-4' : 'p-6'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-jakarta font-semibold text-neutral-900 text-sm">{farmName}</p>
          <p className="font-jakarta text-neutral-500 text-xs mt-0.5 flex items-center gap-1">
            {isStale
              ? <><WifiOff size={10} className="text-orange-500" /> Stale — {minutesAgo}m ago</>
              : <><Wifi size={10} className="text-green-500" /> {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}</>
            }
          </p>
        </div>
        <div className={`
          flex items-center gap-1.5 rounded-full px-2.5 py-1
          ${config.badge}
          text-xs font-semibold
        `}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {config.label}
        </div>
      </div>

      {/* Score */}
      {!compact && (
        <div className="mb-4">
          <div className="flex items-end gap-1">
            <span className="font-sora font-extrabold text-3xl text-neutral-900 tracking-tight">
              {score.toFixed(1)}
            </span>
            <span className="font-jakarta text-neutral-500 text-sm mb-1">/10</span>
          </div>
          <p className="font-jakarta text-neutral-600 text-xs">Environment score</p>
        </div>
      )}

      {/* Metric rows */}
      <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-1 gap-3'}`}>
        {metrics.map(({ icon: Icon, label, value, alert }) => (
          <div
            key={label}
            className={`
              flex items-center gap-2.5
              ${compact ? 'flex-col text-center' : 'flex-row'}
            `}
          >
            <Icon
              size={compact ? 16 : 18}
              className={alert ? 'text-red-500' : 'text-neutral-500'}
            />
            <div className={compact ? '' : 'flex items-center gap-2 flex-1'}>
              <span className="font-jakarta text-neutral-500 text-xs">{label}</span>
              <span className={`
                font-jakarta font-semibold text-sm
                ${compact ? '' : 'ml-auto'}
                ${alert ? 'text-red-600' : 'text-neutral-900'}
              `}>
                {value}
              </span>
              {alert && (
                <span className="text-red-500 text-xs font-semibold ml-1">⚠</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
