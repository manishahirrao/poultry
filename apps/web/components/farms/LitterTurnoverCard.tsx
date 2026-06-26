'use client';

/**
 * FlockIQ - Litter/House Turnover Card
 * ISSUE-021: Missing Metrics Implementation
 * 
 * This component displays litter and house turnover metrics:
 * - Litter cycle count
 * - Litter quality metrics
 * - House turnover metrics
 * - Downtime tracking
 */

import React from 'react';
import { House, Recycle, Clock, CheckCircle, Warning } from '@phosphor-icons/react';

interface LitterTurnoverCardProps {
  litterData?: {
    currentCycleNumber: number;
    litterType: string;
    initialLitterDepthCm: number;
    finalLitterDepthCm: number;
    initialMoisturePct: number;
    finalMoisturePct: number;
    litterConditionRating: 'excellent' | 'good' | 'fair' | 'poor';
    totalLitterCost: number;
  };
  turnoverData?: {
    lastTurnoverDate: string;
    downtimeDays: number;
    cleaningHours: number;
    disinfectionHours: number;
    cleaningQualityRating: 'excellent' | 'good' | 'fair' | 'poor';
    disinfectionQualityRating: 'excellent' | 'good' | 'fair' | 'poor';
    totalTurnoverCost: number;
  };
}

export function LitterTurnoverCard({ litterData, turnoverData }: LitterTurnoverCardProps) {
  if (!litterData && !turnoverData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Litter & House Turnover</h3>
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <House className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No litter or turnover data available
          </p>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'fair':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'poor':
        return <Warning className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Litter & House Turnover</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <House className="w-4 h-4 mr-1" />
          <span>Shed management metrics</span>
        </div>
      </div>

      {/* Litter Management */}
      {litterData && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Recycle className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-medium text-gray-900">Litter Management</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current Cycle</p>
              <p className="text-lg font-bold text-gray-900">#{litterData.currentCycleNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Litter Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{litterData.litterType.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="text-gray-500">Initial Depth:</span>{' '}
              <span className="font-medium text-gray-900">{litterData.initialLitterDepthCm} cm</span>
            </div>
            <div>
              <span className="text-gray-500">Final Depth:</span>{' '}
              <span className="font-medium text-gray-900">{litterData.finalLitterDepthCm} cm</span>
            </div>
            <div>
              <span className="text-gray-500">Initial Moisture:</span>{' '}
              <span className="font-medium text-gray-900">{litterData.initialMoisturePct}%</span>
            </div>
            <div>
              <span className="text-gray-500">Final Moisture:</span>{' '}
              <span className="font-medium text-gray-900">{litterData.finalMoisturePct}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getRatingColor(
                  litterData.litterConditionRating
                )}`}
              >
                {getRatingIcon(litterData.litterConditionRating)}
                <span className="text-xs font-medium capitalize">{litterData.litterConditionRating}</span>
              </div>
              <span className="text-xs text-gray-500">Condition</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Cost</p>
              <p className="text-sm font-medium text-gray-900">₹{litterData.totalLitterCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* House Turnover */}
      {turnoverData && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <House className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-900">House Turnover</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Turnover</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(turnoverData.lastTurnoverDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Downtime</p>
              <p className="text-lg font-bold text-gray-900">{turnoverData.downtimeDays} days</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="text-gray-500">Cleaning:</span>{' '}
              <span className="font-medium text-gray-900">{turnoverData.cleaningHours} hrs</span>
            </div>
            <div>
              <span className="text-gray-500">Disinfection:</span>{' '}
              <span className="font-medium text-gray-900">{turnoverData.disinfectionHours} hrs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getRatingColor(
                  turnoverData.cleaningQualityRating
                )}`}
              >
                {getRatingIcon(turnoverData.cleaningQualityRating)}
                <span className="text-xs font-medium capitalize">{turnoverData.cleaningQualityRating}</span>
              </div>
              <span className="text-xs text-gray-500">Cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getRatingColor(
                  turnoverData.disinfectionQualityRating
                )}`}
              >
                {getRatingIcon(turnoverData.disinfectionQualityRating)}
                <span className="text-xs font-medium capitalize">{turnoverData.disinfectionQualityRating}</span>
              </div>
              <span className="text-xs text-gray-500">Disinfection</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Total Turnover Time</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {(turnoverData.cleaningHours + turnoverData.disinfectionHours).toFixed(1)} hrs
            </p>
          </div>
        </div>
      )}

      {/* Combined Cost Summary */}
      {litterData && turnoverData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Total Management Cost</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{(litterData.totalLitterCost + turnoverData.totalTurnoverCost).toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Litter: ₹{litterData.totalLitterCost.toLocaleString()} + Turnover: ₹{turnoverData.totalTurnoverCost.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
