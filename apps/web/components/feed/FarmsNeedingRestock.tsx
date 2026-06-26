'use client';

import { useState } from 'react';
import { Warning, Calendar, Package } from '@phosphor-icons/react';
import useSWR from 'swr';

interface FarmNeedingRestock {
  id: string;
  name: string;
  current_batch_id: string;
  batch_name: string;
  days_until_restock: number;
  estimated_feed_needed_mt: number;
  current_feed_mt: number;
}

interface FarmsNeedingRestockProps {
  isLoading?: boolean;
}

export function FarmsNeedingRestock({ isLoading = false }: FarmsNeedingRestockProps) {
  const [showAll, setShowAll] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: farms, isLoading: farmsLoading } = useSWR<FarmNeedingRestock[]>(
    '/api/v1/feed/farms-needing-restock',
    fetcher
  );

  // Mock data for development
  const mockFarms: FarmNeedingRestock[] = [
    {
      id: '1',
      name: 'Farm 3 - Green Valley',
      current_batch_id: 'batch-1',
      batch_name: 'Batch #001',
      days_until_restock: 3,
      estimated_feed_needed_mt: 15.5,
      current_feed_mt: 2.3,
    },
    {
      id: '2',
      name: 'Farm 7 - Sunrise Poultry',
      current_batch_id: 'batch-2',
      batch_name: 'Batch #003',
      days_until_restock: 7,
      estimated_feed_needed_mt: 22.0,
      current_feed_mt: 8.5,
    },
    {
      id: '3',
      name: 'Farm 12 - Golden Harvest',
      current_batch_id: 'batch-3',
      batch_name: 'Batch #002',
      days_until_restock: 12,
      estimated_feed_needed_mt: 18.7,
      current_feed_mt: 5.2,
    },
  ];

  const displayFarms = farms || mockFarms;
  const farmsToShow = showAll ? displayFarms : displayFarms.slice(0, 3);

  if (displayFarms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Warning size={20} className="text-amber-500" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Farms Needing Restock in Next 14 Days
          </h3>
        </div>
        <span className="text-sm text-neutral-500">
          {displayFarms.length} farm{displayFarms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading || farmsLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-300"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {farmsToShow.map((farm) => (
            <div
              key={farm.id}
              className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={16} className="text-neutral-500" />
                  <p className="font-medium text-neutral-900">{farm.name}</p>
                </div>
                <p className="text-sm text-neutral-600">{farm.batch_name}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Days until restock</p>
                  <p className={`font-semibold ${farm.days_until_restock <= 5 ? 'text-red-600' : farm.days_until_restock <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                    {farm.days_until_restock} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Feed needed</p>
                  <p className="font-semibold text-neutral-900">{farm.estimated_feed_needed_mt} MT</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Current stock</p>
                  <p className="font-semibold text-neutral-900">{farm.current_feed_mt} MT</p>
                </div>
              </div>
            </div>
          ))}

          {displayFarms.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center text-sm text-brand-green-600 hover:text-brand-green-700 font-medium py-2"
            >
              {showAll ? 'Show less' : `View all ${displayFarms.length} farms`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
