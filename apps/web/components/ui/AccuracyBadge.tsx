// FlockIQ — Accuracy Badge Component
// File: apps/web/components/ui/AccuracyBadge.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-005
// Requirements: Design Spec §3.4, GWEB-005
// Color-coded accuracy status badge

'use client';

import { CheckCircle, WarningCircle, XCircle, Info } from '@phosphor-icons/react';

interface AccuracyBadgeProps {
  accuracy: number; // Directional accuracy percentage (0-100)
  mape?: number; // Mean Absolute Percentage Error
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AccuracyBadge({
  accuracy,
  mape,
  showLabel = true,
  size = 'md',
  className = '',
}: AccuracyBadgeProps) {
  // Determine status based on accuracy and MAPE
  const getStatus = () => {
    if (accuracy >= 95 && (!mape || mape < 6)) {
      return {
        level: 'excellent',
        label: 'Excellent',
        bgColor: 'bg-brandOrange50',
        textColor: 'text-brandOrange700',
        borderColor: 'border-brandOrange300',
        icon: CheckCircle,
      };
    }
    if (accuracy >= 90 && (!mape || mape < 8)) {
      return {
        level: 'good',
        label: 'Good',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-300',
        icon: CheckCircle,
      };
    }
    if (accuracy >= 80 && (!mape || mape < 10)) {
      return {
        level: 'warning',
        label: 'Warning',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
        icon: WarningCircle,
      };
    }
    return {
      level: 'critical',
      label: 'Critical',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      icon: XCircle,
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${status.bgColor} ${status.textColor} ${status.borderColor} ${sizeClasses[size]} ${className}`}
    >
      <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} weight="fill" />
      {showLabel && (
        <span className="font-medium">
          {status.label}
        </span>
      )}
      <span className="font-semibold">
        {accuracy.toFixed(1)}%
      </span>
    </div>
  );
}
