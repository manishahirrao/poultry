'use client';

/**
 * FlockIQ - Batch Card
 * TASK-INT-004: Risk badge on Batch Status Board cards
 * TASK-INT-005: Document count badges on farm cards and batch cards
 * Requirements: Integration tasks for risk scores and document counts
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §6, §7
 * 
 * This component implements the batch card with:
 * - Risk badge integration (TASK-INT-004)
 * - Document count badge (TASK-INT-005)
 * - Sell signal indicator (SELL/HOLD/CAUTION/withdrawal)
 * - Color-coded borders based on sell signal
 * - Key metrics: age, bird count, weight, FCR, mortality
 * - Net profit display for harvested batches
 * 
 * Integration: Used in Batch Status Board and farm detail views
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Warning, ChartLineUp, ChartLineDown, FileText } from '@phosphor-icons/react';
import { BatchRow } from '@/utils/supabase/dashboard';
import { RiskBadge } from '@/components/dashboard/alerts/RiskBadge';

interface BatchCardProps {
  batch: BatchRow;
  onClick: () => void;
  riskScore?: { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' };
}

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

export function BatchCard({ batch, onClick, riskScore }: BatchCardProps) {
  // Document count state
  const [docCount, setDocCount] = useState<number>(0);

  // Fetch document count on mount
  useEffect(() => {
    const fetchDocCount = async () => {
      try {
        // Use batch_id to fetch documents for this specific batch
        const response = await fetch(`/api/v1/farms/${batch.farm_id}/documents?batch_id=${batch.batch_id}&count=true`);
        if (response.ok) {
          const data = await response.json();
          setDocCount(data.total_count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch document count:', error);
      }
    };

    fetchDocCount();
  }, [batch.farm_id, batch.batch_id]);

  // Determine sell signal styling
  const getSellSignalBadge = () => {
    if (batch.sell_signal === 'withdrawal') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-neutral-200 text-neutral-700 text-xs font-medium">
          <span className="text-lg">🚫</span>
          <span>HOLD — Withdrawal</span>
        </div>
      );
    }
    
    switch (batch.sell_signal) {
      case 'sell':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
            <span className="text-green-600">⭐</span>
            <span>SELL</span>
          </div>
        );
      case 'hold':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
            <span>⏳</span>
            <span>HOLD</span>
          </div>
        );
      case 'caution':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
            <Warning size={12} weight="fill" className="text-red-600" />
            <span>CAUTION</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine card border color based on sell signal
  const getBorderColor = () => {
    if (batch.sell_signal === 'withdrawal') return 'border-neutral-300';
    switch (batch.sell_signal) {
      case 'sell': return 'border-green-300';
      case 'hold': return 'border-amber-300';
      case 'caution': return 'border-red-300';
      default: return 'border-neutral-200';
    }
  };

  // Format bird count with emoji
  const formatBirdCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k🐤`;
    }
    return `${count}🐤`;
  };

  // Get mortality color
  const getMortalityColor = (pct: number) => {
    if (pct < 0.3) return 'text-green-600';
    if (pct < 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  // Get FCR color
  const getFcrColor = (fcr: number | null) => {
    if (!fcr) return 'text-neutral-500';
    if (fcr < 1.7) return 'text-green-600';
    if (fcr < 2.0) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: customCubicBezier }}
      onClick={onClick}
      className={`
        bg-white rounded-xl border ${getBorderColor()} p-4 cursor-pointer
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
        ${batch.sell_signal === 'sell' ? 'hover:shadow-green-100' : ''}
      `}
    >
      {/* Header: Batch ID + Shed */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-neutral-900 text-sm">{batch.batch_id}</h3>
          <p className="text-xs text-neutral-500">{batch.shed_id}</p>
        </div>
        <div className="flex items-center gap-2">
          {riskScore && riskScore.score > 0 && (
            <RiskBadge score={riskScore.score} level={riskScore.level} size="sm" />
          )}
          {batch.sell_signal && getSellSignalBadge()}
          {docCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <FileText size={12} />
              {docCount}
            </div>
          )}
        </div>
      </div>

      {/* Age + Bird Count */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-neutral-500">Day</span>
          <span className="font-semibold text-neutral-900">{batch.age_days}</span>
        </div>
        <div className="font-semibold text-neutral-900">
          {formatBirdCount(batch.current_bird_count)}
        </div>
      </div>

      {/* Weight */}
      {batch.avg_weight_kg && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-500">Weight:</span>
            <span className="font-semibold text-neutral-900">{batch.avg_weight_kg.toFixed(2)} kg</span>
          </div>
        </div>
      )}

      {/* FCR + Mortality */}
      <div className="flex items-center gap-4 text-xs">
        {batch.fcr && (
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">FCR:</span>
            <span className={`font-semibold ${getFcrColor(batch.fcr)}`}>{batch.fcr.toFixed(3)}</span>
          </div>
        )}
        {batch.mortality_pct !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Mort:</span>
            <span className={`font-semibold ${getMortalityColor(batch.mortality_pct)}`}>
              {batch.mortality_pct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Net profit for harvested batches */}
      {batch.status === 'harvested' && batch.net_profit && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-500">Profit:</span>
            <span className={`font-semibold ${batch.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(batch.net_profit / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default BatchCard;
