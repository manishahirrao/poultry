'use client';

import { TrendUp, Money, Bird, Package } from '@phosphor-icons/react';

interface SalesSummaryBarProps {
  totalBirdsSold: number;
  totalRevenue: number;
  avgRate: number;
  remainingBirds: number;
  birdsPlaced: number;
}

export function SalesSummaryBar({
  totalBirdsSold,
  totalRevenue,
  avgRate,
  remainingBirds,
  birdsPlaced,
}: SalesSummaryBarProps) {
  const percentageSold = (totalBirdsSold / birdsPlaced) * 100;
  const revenueInLakhs = totalRevenue / 100000;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bird size={20} className="text-blue-600" weight="fill" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Birds Sold</p>
            <p className="text-xl font-bold text-gray-900">{totalBirdsSold.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Money size={20} className="text-green-600" weight="fill" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">₹{revenueInLakhs.toFixed(1)}L</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendUp size={20} className="text-purple-600" weight="fill" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Rate</p>
            <p className="text-xl font-bold text-gray-900">₹{avgRate.toFixed(0)}/kg</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-orange-600" weight="fill" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining Birds</p>
            <p className="text-xl font-bold text-gray-900">{remainingBirds.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Sales Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {percentageSold.toFixed(1)}% of batch sold
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentageSold, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {percentageSold < 100
            ? `${remainingBirds.toLocaleString()} birds remaining for sale`
            : 'All birds sold'
          }
        </p>
      </div>
    </div>
  );
}
