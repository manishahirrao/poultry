'use client';

import { useState } from 'react';
import { MagnifyingGlass, SlidersHorizontal } from '@phosphor-icons/react';

export interface FarmSlidersHorizontals {
  search: string;
  status: string;
  sortBy: string;
}

export function FarmMagnifyingGlassSlidersHorizontal({ onSlidersHorizontalChange }: { onSlidersHorizontalChange: (filters: FarmSlidersHorizontals) => void }) {
  const [search, setSearch] = useState('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSlidersHorizontalChange({ search: value, status: 'all', sortBy: 'name' });
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200">
      <div className="flex items-center gap-2 flex-1 bg-neutral-50 rounded-lg px-3 py-2">
        <MagnifyingGlass size={18} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search farms..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none w-full"
        />
      </div>
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors border border-neutral-200">
        <SlidersHorizontal size={16} />
        <span>Filter</span>
      </button>
    </div>
  );
}
