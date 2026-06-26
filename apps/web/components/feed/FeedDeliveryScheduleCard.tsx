'use client';

/**
 * FlockIQ - Feed Delivery Schedule Card
 * ISSUE-021: Missing Metrics Implementation
 * 
 * This component displays feed delivery schedule vs actual tracking:
 * - Scheduled deliveries
 * - Actual deliveries
 * - Variance tracking
 * - Delay monitoring
 */

import React from 'react';
import { Truck, Clock, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';

interface FeedDeliveryScheduleCardProps {
  scheduleData?: Array<{
    id: string;
    scheduleDate: string;
    feedType: string;
    feedBrand: string;
    scheduledQuantityKg: number;
    actualQuantityKg?: number;
    deliveryStatus: 'scheduled' | 'confirmed' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
    quantityVarianceKg?: number;
    quantityVariancePct?: number;
    deliveryDelayHours?: number;
  }>;
}

export function FeedDeliveryScheduleCard({ scheduleData }: FeedDeliveryScheduleCardProps) {
  if (!scheduleData || scheduleData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feed Delivery Schedule</h3>
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No feed delivery schedules configured
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'confirmed':
      case 'in_transit':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delayed':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'delayed':
        return <Warning className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate overall metrics
  const totalScheduled = scheduleData.reduce((sum, item) => sum + item.scheduledQuantityKg, 0);
  const totalDelivered = scheduleData.reduce(
    (sum, item) => sum + (item.actualQuantityKg || 0),
    0
  );
  const delayedCount = scheduleData.filter((item) => item.deliveryStatus === 'delayed').length;
  const deliveredCount = scheduleData.filter((item) => item.deliveryStatus === 'delivered').length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Feed Delivery Schedule</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <Truck className="w-4 h-4 mr-1" />
          <span>Scheduled vs Actual</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Total Scheduled</p>
          <p className="text-lg font-bold text-gray-900">{totalScheduled.toLocaleString()} kg</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Total Delivered</p>
          <p className="text-lg font-bold text-green-600">{totalDelivered.toLocaleString()} kg</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">On-Time Rate</p>
          <p className="text-lg font-bold text-gray-900">
            {scheduleData.length > 0 ? `${((deliveredCount / scheduleData.length) * 100).toFixed(0)}%` : 'N/A'}
          </p>
        </div>
      </div>

      {delayedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Warning className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-900">
              {delayedCount} delivery(s) delayed
            </p>
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="space-y-3">
        {scheduleData.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(
                    item.deliveryStatus
                  )}`}
                >
                  {getStatusIcon(item.deliveryStatus)}
                  <span className="text-xs font-medium capitalize">{item.deliveryStatus.replace('_', ' ')}</span>
                </div>
                <span className="text-sm text-gray-600">{item.feedBrand}</span>
                <span className="text-xs text-gray-500">• {item.feedType}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(item.scheduleDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Scheduled:</span>{' '}
                <span className="font-medium text-gray-900">{item.scheduledQuantityKg} kg</span>
              </div>
              {item.actualQuantityKg && (
                <div>
                  <span className="text-gray-500">Actual:</span>{' '}
                  <span className="font-medium text-gray-900">{item.actualQuantityKg} kg</span>
                </div>
              )}
              {item.quantityVarianceKg !== undefined && (
                <div>
                  <span className="text-gray-500">Variance:</span>{' '}
                  <span
                    className={`font-medium ${
                      item.quantityVarianceKg >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.quantityVarianceKg >= 0 ? '+' : ''}
                    {item.quantityVarianceKg.toFixed(1)} kg
                  </span>
                </div>
              )}
            </div>

            {item.deliveryDelayHours !== undefined && item.deliveryDelayHours > 0 && (
              <div className="mt-2 text-xs text-amber-600">
                Delayed by {item.deliveryDelayHours.toFixed(1)} hours
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
