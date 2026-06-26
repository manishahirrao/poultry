'use client';

import { FarmCard } from './FarmCard';

interface FarmCardsGridProps {
  farms: Array<{
    id: string;
    name: string;
    location: string;
    type: 'Broiler' | 'Layer' | 'Breeder';
    maxBirds: number;
    status: 'active' | 'between_batches' | 'paused' | 'onboarding';
    currentBatch?: {
      batchNumber: number;
      dayNumber: number;
      targetDays: number;
      birdsAlive: number;
      birdsPlaced: number;
      mortalityPct: number;
      currentWeight: number;
      targetWeight: number;
      fcr: number;
      lastLogDate: string | null;
      lastLogTime: string | null;
    };
    whatsappConnected: boolean;
  }>;
}

export function FarmCardsGrid({ farms }: FarmCardsGridProps) {
  if (farms.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {farms.map((farm) => (
        <FarmCard key={farm.id} farm={farm} />
      ))}
    </div>
  );
}
