'use client';

/**
 * FlockIQ - Efficiency Metrics Card
 * ISSUE-021: Missing Metrics Implementation
 * 
 * This component displays key efficiency metrics for poultry production:
 * - European Production Efficiency Factor (EPEF)
 * - Production Efficiency Factor (PEF)
 * - Weight Uniformity %
 * 
 * These metrics help farmers assess flock performance and identify areas for improvement.
 */

import React from 'react';
import { TrendUp, TrendDown, Minus, Info } from '@phosphor-icons/react';
import {
  calculateEPEFFromBatch,
  calculatePEFFromBatch,
  calculateWeightUniformity,
  type EpefCalculationResult,
  type PefCalculationResult,
  type WeightUniformityResult,
} from '@/lib/fcrCalculator';

interface EfficiencyMetricsCardProps {
  birdsPlaced: number;
  currentBirdCount: number;
  avgWeightKg: number;
  fcr: number;
  ageDays: number;
  stdDeviationKg?: number;
  weightSampleSize?: number;
}

export function EfficiencyMetricsCard({
  birdsPlaced,
  currentBirdCount,
  avgWeightKg,
  fcr,
  ageDays,
  stdDeviationKg,
  weightSampleSize,
}: EfficiencyMetricsCardProps) {
  // Calculate EPEF
  const epefResult: EpefCalculationResult | null = calculateEPEFFromBatch(
    birdsPlaced,
    currentBirdCount,
    avgWeightKg,
    fcr,
    ageDays
  );

  // Calculate PEF
  const pefResult: PefCalculationResult | null = calculatePEFFromBatch(
    birdsPlaced,
    currentBirdCount,
    avgWeightKg,
    fcr
  );

  // Calculate Weight Uniformity (if standard deviation is available)
  const uniformityResult: WeightUniformityResult | null =
    stdDeviationKg && weightSampleSize
      ? calculateWeightUniformity(avgWeightKg, stdDeviationKg, weightSampleSize)
      : null;

  const getStatusColor = (status: 'green' | 'amber' | 'red') => {
    switch (status) {
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'amber':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: 'green' | 'amber' | 'red') => {
    switch (status) {
      case 'green':
        return <TrendUp className="w-4 h-4" />;
      case 'amber':
        return <Minus className="w-4 h-4" />;
      case 'red':
        return <TrendDown className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Efficiency Metrics</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <Info className="w-4 h-4 mr-1" />
          <span>Industry-standard performance indices</span>
        </div>
      </div>

      {/* EPEF Section */}
      {epefResult && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-700">
                European Production Efficiency Factor (EPEF)
              </p>
              <p className="text-xs text-gray-500">
                (Survivability% × Weight / (FCR × Age)) × 100
              </p>
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(
                epefResult.colorStatus
              )}`}
            >
              {getStatusIcon(epefResult.colorStatus)}
              <span className="text-sm font-medium capitalize">
                {epefResult.performanceRating}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{epefResult.epef}</span>
            <span className="text-sm text-gray-500">points</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="text-gray-500">Survivability:</span>{' '}
              {epefResult.survivabilityPct}%
            </div>
            <div>
              <span className="text-gray-500">Weight:</span> {epefResult.liveWeightKg} kg
            </div>
            <div>
              <span className="text-gray-500">FCR:</span> {epefResult.fcr}
            </div>
            <div>
              <span className="text-gray-500">Age:</span> {epefResult.ageDays} days
            </div>
          </div>
        </div>
      )}

      {/* PEF Section */}
      {pefResult && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Production Efficiency Factor (PEF)
              </p>
              <p className="text-xs text-gray-500">(Survivability% × Weight) / FCR</p>
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(
                pefResult.colorStatus
              )}`}
            >
              {getStatusIcon(pefResult.colorStatus)}
              <span className="text-sm font-medium capitalize">
                {pefResult.performanceRating}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{pefResult.pef}</span>
            <span className="text-sm text-gray-500">points</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="text-gray-500">Survivability:</span>{' '}
              {pefResult.survivabilityPct}%
            </div>
            <div>
              <span className="text-gray-500">Weight:</span> {pefResult.liveWeightKg} kg
            </div>
            <div>
              <span className="text-gray-500">FCR:</span> {pefResult.fcr}
            </div>
          </div>
        </div>
      )}

      {/* Weight Uniformity Section */}
      {uniformityResult && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Weight Uniformity %</p>
              <p className="text-xs text-gray-500">
                Birds within ±10% of mean weight
              </p>
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(
                uniformityResult.colorStatus
              )}`}
            >
              {getStatusIcon(uniformityResult.colorStatus)}
              <span className="text-sm font-medium capitalize">
                {uniformityResult.classification}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {uniformityResult.uniformityPct}%
            </span>
            <span className="text-sm text-gray-500">uniformity</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <span className="text-gray-500">Avg Weight:</span>{' '}
              {uniformityResult.avgWeightKg} kg
            </div>
            <div>
              <span className="text-gray-500">Std Dev:</span>{' '}
              {uniformityResult.stdDeviationKg} kg
            </div>
            <div>
              <span className="text-gray-500">Sample:</span>{' '}
              {uniformityResult.sampleSize} birds
            </div>
          </div>
        </div>
      )}

      {!uniformityResult && (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            Weight uniformity requires standard deviation data from weight samples
          </p>
        </div>
      )}
    </div>
  );
}
