'use client';

// WHY: This is the farm card component that displays individual farm information in a card format.
// It shows farm details, batch information, FCR and mortality metrics with color coding, WhatsApp connection status,
// daily log submission status, and a progress bar showing batch completion. The component uses design tokens
// for consistent color coding of FCR and mortality values, and Framer Motion for hover animations.

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Warning, FileText } from '@phosphor-icons/react';
import { fcrColour, mortalityColour, FlockIQTokens } from '@/lib/design-tokens';
import { useEffect, useState } from 'react';
import { GCSummaryCard } from '@/components/gc/GCSummaryCard';

interface FarmCardProps {
  farm: {
    id: string;
    name: string;
    location: string;
    type: 'Broiler' | 'Layer' | 'Breeder';
    maxBirds: number;
    status: 'active' | 'between_batches' | 'paused' | 'onboarding';
    currentBatch?: {
      batchNumber: number;
      dayNumber: number;
      targetDays: number;
      birdsAlive: number;
      birdsPlaced: number;
      mortalityPct: number;
      currentWeight: number;
      targetWeight: number;
      fcr: number;
      lastLogDate: string | null;
      lastLogTime: string | null;
    };
    whatsappConnected: boolean;
  };
}

export function FarmCard({ farm }: FarmCardProps) {
  // Document count state
  const [docCount, setDocCount] = useState<number>(0);

  // Fetch document count on mount
  useEffect(() => {
    const fetchDocCount = async () => {
      try {
        const response = await fetch(`/api/v1/farms/${farm.id}/documents?count=true`);
        if (response.ok) {
          const data = await response.json();
          setDocCount(data.total_count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch document count:', error);
      }
    };

    fetchDocCount();
  }, [farm.id]);

  // LEFT BORDER COLOUR LOGIC
  const getLeftBorderColor = () => {
    if (farm.status === 'paused') return FlockIQTokens.signalCaution; // red
    if (farm.status === 'between_batches') return '#9CA3AF'; // grey
    if (farm.status === 'active' && farm.currentBatch) {
      const today = new Date().toISOString().split('T')[0];
      const loggedToday = farm.currentBatch.lastLogDate === today;
      return loggedToday ? FlockIQTokens.brand400 : '#D97706'; // green if logged, amber if not
    }
    return '#9CA3AF'; // default grey
  };

  // LOG STATUS BADGE
  const logStatusBadge = () => {
    if (!farm.currentBatch) return null;
    const today = new Date().toISOString().split('T')[0];
    const loggedToday = farm.currentBatch.lastLogDate === today;

    if (loggedToday) {
      return (
        <span className="text-green-600 text-xs flex items-center gap-1">
          <CheckCircle size={12} /> Log submitted at {farm.currentBatch.lastLogTime}
        </span>
      );
    }
    return (
      <Link
        href={`/dashboard/farms/${farm.id}?tab=daily-log`}
        className="text-amber-600 text-xs flex items-center gap-1 hover:underline"
      >
        <Warning size={12} /> Today's log pending — Submit now →
      </Link>
    );
  };

  // WHATSAPP STATUS
  const whatsappStatus = farm.whatsappConnected
    ? <span className="text-green-600 text-[11px]">● Connected — Reminder at 6 PM</span>
    : <span className="text-gray-400 text-[11px]">○ WhatsApp not set up</span>;

  // PROGRESS BAR (batch day/target)
  const progress = farm.currentBatch
    ? (farm.currentBatch.dayNumber / farm.currentBatch.targetDays) * 100
    : 0;

  // FCR COLOUR
  const fcrColor = farm.currentBatch ? fcrColour(farm.currentBatch.fcr) : FlockIQTokens.neutralGray;

  // MORTALITY COLOUR
  const mortalityColor = farm.currentBatch ? mortalityColour(farm.currentBatch.mortalityPct) : FlockIQTokens.neutralGray;

  // WEIGHT STATUS
  const weightStatus = farm.currentBatch ? (() => {
    const pctOfTarget = (farm.currentBatch.currentWeight / farm.currentBatch.targetWeight) * 100;
    if (pctOfTarget >= 95) return { color: FlockIQTokens.fcrExcellent, label: 'On Track' };
    if (pctOfTarget >= 85) return { color: FlockIQTokens.signalHold, label: `${pctOfTarget.toFixed(0)}%` };
    return { color: FlockIQTokens.signalCaution, label: `${pctOfTarget.toFixed(0)}%` };
  })() : null;

  return (
    <motion.div
      whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border shadow-sm bg-white cursor-pointer overflow-hidden"
      style={{ borderLeft: `4px solid ${getLeftBorderColor()}` }}
    >
      <Link href={`/dashboard/farms/${farm.id}`} className="block p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{farm.name}</h3>
            <p className="text-xs text-gray-500">{farm.location}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {farm.type} · Max {farm.maxBirds.toLocaleString()} birds
            </p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            farm.status === 'active' ? 'bg-green-100 text-green-700' :
            farm.status === 'between_batches' ? 'bg-gray-100 text-gray-600' :
            farm.status === 'paused' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {farm.status === 'active' ? '● Active' :
             farm.status === 'between_batches' ? 'Between Batches' :
             farm.status === 'paused' ? 'Paused' : 'Onboarding'}
          </span>
        </div>

        {farm.currentBatch ? (
          <>
            {/* Batch Info */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-700">
                Batch #{farm.currentBatch.batchNumber} · Day {farm.currentBatch.dayNumber} of ~{farm.currentBatch.targetDays}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-50 rounded p-2 text-center">
                <p className="text-[10px] text-gray-500 mb-0.5">Birds</p>
                <p className="text-xs font-semibold text-gray-900 tabular-nums">
                  {farm.currentBatch.birdsAlive.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400">/ {(farm.currentBatch.birdsPlaced / 1000).toFixed(1)}K</p>
              </div>
              <div className="bg-gray-50 rounded p-2 text-center">
                <p className="text-[10px] text-gray-500 mb-0.5">FCR</p>
                <p className="text-xs font-semibold tabular-nums" style={{ color: fcrColor }}>
                  {farm.currentBatch.fcr.toFixed(3)}
                </p>
                <p className="text-[10px]" style={{ color: fcrColor }}>●</p>
              </div>
              <div className="bg-gray-50 rounded p-2 text-center">
                <p className="text-[10px] text-gray-500 mb-0.5">Mort%</p>
                <p className="text-xs font-semibold tabular-nums" style={{ color: mortalityColor }}>
                  {farm.currentBatch.mortalityPct.toFixed(1)}%
                </p>
                <p className="text-[10px]" style={{ color: mortalityColor }}>●</p>
              </div>
              <div className="bg-gray-50 rounded p-2 text-center">
                <p className="text-[10px] text-gray-500 mb-0.5">Weight</p>
                <p className="text-xs font-semibold text-gray-900 tabular-nums">
                  {farm.currentBatch.currentWeight.toFixed(2)} kg
                </p>
                {weightStatus && (
                  <p className="text-[10px]" style={{ color: weightStatus.color }}>
                    {weightStatus.label}
                  </p>
                )}
              </div>
            </div>

            {/* GC Summary Card - below FCR and Mortality metrics row */}
            <div className="mb-3">
              <GCSummaryCard farmId={farm.id} size="mini" />
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Batch Progress</span>
                <span>{progress.toFixed(0)}% (Day {farm.currentBatch.dayNumber}/{farm.currentBatch.targetDays})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: FlockIQTokens.brand400
                  }}
                />
              </div>
            </div>

            {/* Log Status */}
            <div className="mb-2">
              {logStatusBadge()}
            </div>

            {/* WhatsApp Status */}
            <div className="text-[11px]">
              {whatsappStatus}
            </div>

            {/* Document Count Badge */}
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <FileText size={12} />
              {docCount} docs
            </div>
          </>
        ) : (
          <>
            {/* No Active Batch State */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">
                {farm.status === 'between_batches' ? 'Between batches · Cleanout in progress' : 
                 farm.status === 'paused' ? 'Farm paused' : 
                 'No active batch'}
              </p>
            </div>
          </>
        )}
      </Link>
    </motion.div>
  );
}
