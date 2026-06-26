'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlass, Funnel, ArrowsDownUp } from '@phosphor-icons/react';

interface FarmMagnifyingGlassSlidersHorizontalProps {
  onSlidersHorizontalChange: (filters: FarmSlidersHorizontals) => void;
}

export interface FarmSlidersHorizontals {
  search: string;
  status: 'all' | 'active' | 'between_batches' | 'paused';
  sortBy: 'name' | 'fcr' | 'mortality' | 'birdCount' | 'lastLog';
}

export function FarmMagnifyingGlassSlidersHorizontal({ onSlidersHorizontalChange }: FarmMagnifyingGlassSlidersHorizontalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setMagnifyingGlass] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<FarmSlidersHorizontals['status']>((searchParams.get('status') as FarmSlidersHorizontals['status']) || 'all');
  const [sortBy, setSortBy] = useState<FarmSlidersHorizontals['sortBy']>((searchParams.get('sortBy') as FarmSlidersHorizontals['sortBy']) || 'name');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateURL();
      onSlidersHorizontalChange({ search, status, sortBy });
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, status, sortBy]);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (sortBy !== 'name') params.set('sortBy', sortBy);
    router.replace(`/dashboard/farms?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
        {/* MagnifyingGlass */}
        <div className="relative w-full md:w-64">
          <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="MagnifyingGlass farms..."
            value={search}
            onChange={(e) => setMagnifyingGlass(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-label="MagnifyingGlass farms"
          />
        </div>

        {/* Status SlidersHorizontal */}
        <div className="flex items-center gap-2">
          <Funnel size={20} className="text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FarmSlidersHorizontals['status'])}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-label="SlidersHorizontal by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="between_batches">Between Batches</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowsDownUp size={20} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FarmSlidersHorizontals['sortBy'])}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-label="Sort farms"
          >
            <option value="name">By Name</option>
            <option value="fcr">By FCR</option>
            <option value="mortality">By Mortality</option>
            <option value="birdCount">By Bird Count</option>
            <option value="lastLog">By Last Log</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full md:w-auto">
        <a
          href="/dashboard/farms/new"
          className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold"
        >
          + Add Farm
        </a>
        <a
          href="/dashboard/farms/compare"
          className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Compare Farms
        </a>
      </div>
    </div>
  );
}
