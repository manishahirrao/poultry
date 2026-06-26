'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface FarmDataLoaderProps {
  onLoad: (params: BatchCalculatorParams) => void
}

interface BatchCalculatorParams {
  flockSize: number
  ageInDays: number
  avgWeightKg: number
  feedCostPerKg: number
  overheadCostPerBirdPerDay: number
  breakEvenPrice: number
}

interface Farm {
  id: string
  name: string
  batches?: Array<{
    id: string
    batch_number: number
    placement_date: string
    status: string
  }>
}

interface CalculatorDataResponse {
  success: boolean
  data: {
    birdsAlive: number
    batchDayNumber: number
    avgWeightG: number | null
    estimatedWeightG: number
    avgFeedCostPerKg: number
    breed: string
    targetHarvestAge: number
    targetMarketWeight: number
    gcPerKg: number
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Helper to calculate batch day number from placement date
const calculateBatchDay = (placementDate: string): number => {
  const placement = new Date(placementDate)
  const today = new Date()
  return Math.floor((today.getTime() - placement.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function FarmDataLoader({ onLoad }: FarmDataLoaderProps) {
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')

  const { data: farmsResponse, isLoading: farmsLoading } = useSWR(
    '/api/farms?status=active',
    fetcher
  )

  // Extract farms from the response structure
  const farms = farmsResponse?.farms || []

  const { data: farmData, isLoading: farmDataLoading } = useSWR<CalculatorDataResponse>(
    selectedFarmId ? `/api/farms/${selectedFarmId}/calculator-data` : null,
    fetcher
  )

  // Auto-fill when farmData loads
  useEffect(() => {
    if (farmData?.success && farmData.data) {
      const data = farmData.data
      onLoad({
        flockSize: data.birdsAlive,
        ageInDays: data.batchDayNumber,
        avgWeightKg: (data.avgWeightG || data.estimatedWeightG) / 1000,
        feedCostPerKg: data.avgFeedCostPerKg,
        overheadCostPerBirdPerDay: 0.5, // default
        breakEvenPrice: data.gcPerKg || 0, // Use GC as break-even price
      })
    }
  }, [farmData, onLoad])

  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-[#EDF7F1] rounded-xl border border-[#3DAE72]">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Load from Farm:
      </span>
      <select
        value={selectedFarmId}
        onChange={e => setSelectedFarmId(e.target.value)}
        disabled={farmsLoading}
        className="flex-1 text-sm border border-[#CBD5CE] rounded-lg px-3 py-2
                   bg-white focus:outline-none focus:border-[#1A5C34]
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Manual entry</option>
        {farms?.map((farm: Farm) => {
          const activeBatch = farm.batches?.find(b => b.status === 'active')
          if (!activeBatch) return null
          const batchDay = calculateBatchDay(activeBatch.placement_date)
          return (
            <option key={farm.id} value={farm.id}>
              {farm.name} — Batch #{activeBatch.batch_number} · Day {batchDay}
            </option>
          )
        })}
      </select>
      {selectedFarmId && farmDataLoading && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Loading...
        </span>
      )}
      {selectedFarmId && farmData?.success && !farmDataLoading && (
        <span className="text-xs text-green-600 whitespace-nowrap font-medium">
          ✓ Data loaded
        </span>
      )}
      {selectedFarmId && farmData && !farmData.success && !farmDataLoading && (
        <span className="text-xs text-red-600 whitespace-nowrap">
          Failed to load
        </span>
      )}
    </div>
  )
}
