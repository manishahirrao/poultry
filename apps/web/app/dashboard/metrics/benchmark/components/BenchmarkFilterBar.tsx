'use client';

import React from 'react';
import { colors, spacing } from '@/lib/tokens';

interface Farm {
  id: string;
  name: string;
  district: string;
  status: string;
  breed: string | null;
  flockSize: number;
}

interface BenchmarkSlidersHorizontals {
  farm: string;
  breed: string;
  region: string;
  flockSize: string;
  period: string;
}

interface BenchmarkFilterBarProps {
  filters: BenchmarkSlidersHorizontals;
  farms: Farm[];
  onApply: (filters: BenchmarkSlidersHorizontals) => void;
  onReset: () => void;
}

const BREED_OPTIONS = [
  { value: 'all', label: 'All Breeds' },
  { value: 'Ross 308', label: 'Ross 308' },
  { value: 'Cobb 430', label: 'Cobb 430' },
  { value: 'Cobb 500', label: 'Cobb 500' },
  { value: 'Hubbard JV', label: 'Hubbard JV' },
  { value: 'Vencobb 400', label: 'Vencobb 400' },
  { value: 'other', label: 'Other' },
];

const REGION_OPTIONS = [
  { value: 'all', label: 'All India' },
  { value: 'UP/Bihar Belt', label: 'UP/Bihar Belt' },
  { value: 'Maharashtra/Gujarat', label: 'Maharashtra/Gujarat' },
  { value: 'AP/Telangana', label: 'AP/Telangana' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Punjab/Haryana', label: 'Punjab/Haryana' },
  { value: 'other', label: 'Other State' },
];

const FLOCK_SIZE_OPTIONS = [
  { value: 'all', label: 'All Sizes' },
  { value: 'small', label: 'Small (5K–20K)' },
  { value: 'medium', label: 'Medium (20K–50K)' },
  { value: 'large', label: 'Large (50K–200K)' },
  { value: 'commercial', label: 'Commercial (200K+)' },
];

const PERIOD_OPTIONS = [
  { value: 'last_batch', label: 'Last Batch' },
  { value: 'last_3_batches', label: 'Last 3 Batches' },
  { value: 'last_6_batches', label: 'Last 6 Batches' },
  { value: 'last_12_months', label: 'Last 12 Months' },
];

export function BenchmarkFilterBar({ filters, farms, onApply, onReset }: BenchmarkFilterBarProps) {
  const [localSlidersHorizontals, setLocalSlidersHorizontals] = React.useState<BenchmarkSlidersHorizontals>(filters);

  // Update local filters when props change
  React.useEffect(() => {
    setLocalSlidersHorizontals(filters);
  }, [filters]);

  const handleSlidersHorizontalChange = (key: keyof BenchmarkSlidersHorizontals, value: string) => {
    setLocalSlidersHorizontals(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localSlidersHorizontals);
  };

  return (
    <div className="space-y-4">
      {/* SlidersHorizontal Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* My Farm/Portfolio SlidersHorizontal */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            My Farm/Portfolio
          </label>
          <select
            value={localSlidersHorizontals.farm}
            onChange={(e) => handleSlidersHorizontalChange('farm', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green500 focus:border-transparent"
            style={{ height: spacing.inputHeight }}
          >
            <option value="all">All Farms</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </div>

        {/* Breed SlidersHorizontal */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Breed
          </label>
          <select
            value={localSlidersHorizontals.breed}
            onChange={(e) => handleSlidersHorizontalChange('breed', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green500 focus:border-transparent"
            style={{ height: spacing.inputHeight }}
          >
            {BREED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region SlidersHorizontal */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Region
          </label>
          <select
            value={localSlidersHorizontals.region}
            onChange={(e) => handleSlidersHorizontalChange('region', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green500 focus:border-transparent"
            style={{ height: spacing.inputHeight }}
          >
            {REGION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Flock Size SlidersHorizontal */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Flock Size
          </label>
          <select
            value={localSlidersHorizontals.flockSize}
            onChange={(e) => handleSlidersHorizontalChange('flockSize', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green500 focus:border-transparent"
            style={{ height: spacing.inputHeight }}
          >
            {FLOCK_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Period SlidersHorizontal */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Period
          </label>
          <select
            value={localSlidersHorizontals.period}
            onChange={(e) => handleSlidersHorizontalChange('period', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green500 focus:border-transparent"
            style={{ height: spacing.inputHeight }}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          Reset SlidersHorizontals
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:bg-brandGreen700 transition-colors focus:outline-none focus:ring-2 focus:ring-brandGreen500"
          style={{ backgroundColor: colors.brandGreen500 }}
        >
          Apply ✓
        </button>
      </div>
    </div>
  );
}

export default BenchmarkFilterBar;
