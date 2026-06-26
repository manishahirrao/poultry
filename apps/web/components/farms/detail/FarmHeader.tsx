'use client';

import { useState, useEffect } from 'react';
import { FarmStatusBadge } from '../FarmStatusBadge';
import { BatchProgressBar } from '../BatchProgressBar';
import { DotsThree, PencilSimple, FileText, Archive, TrendUp, X, Plus } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { HarvestWindowBanner } from '@/app/dashboard/farms/[farmId]/components/HarvestWindowBanner';
import { AddSensorNodeModal } from '@/components/dashboard/iot/AddSensorNodeModal';

interface FarmHeaderProps {
  farm: {
    id: string;
    name: string;
    district: string;
    village: string;
    state: string;
    farm_type: 'broiler' | 'layer' | 'breeder';
    capacity: number;
    status: 'active' | 'between_batches' | 'paused' | 'onboarding';
    latitude?: number;
    longitude?: number;
  };
  batch?: {
    id: string;
    batch_number: number;
    placement_date: string;
    breed: string;
    birds_placed: number;
    birds_alive: number;
    mortality: number;
    target_harvest_weight: number;
    current_avg_weight: number;
  } | null;
}

export function FarmHeader({ farm, batch }: FarmHeaderProps) {
  const [showActions, setShowActions] = useState(false);
  const [harvestAlert, setHarvestAlert] = useState<{ show: boolean; p50: number; current: number } | null>(null);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  const [sheds, setSheds] = useState<{ id: string; name: string }[]>([]);

  // Fetch price predictions for harvest alert
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!batch || !farm.district) return;

      try {
        const supabase = createClient();
        if (!supabase) return;

        const { data: predictions } = await supabase
          .from('predictions')
          .select('p50, p10, p90')
          .eq('district', farm.district.toLowerCase())
          .gte('prediction_date', new Date().toISOString().split('T')[0])
          .order('prediction_date', { ascending: false })
          .limit(1);

        if (predictions && predictions.length > 0) {
          const p50 = predictions[0].p50;
          // Mock current price - in production, fetch from market data API
          const currentPrice = p50 * (0.95 + Math.random() * 0.1); // Within ±5% of P50

          // Show alert if current price is above P50 (good time to sell)
          if (currentPrice > p50) {
            setHarvestAlert({ show: true, p50, current: currentPrice });
          }
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };

    fetchPredictions();
  }, [batch, farm.district]);

  // Fetch sheds for the farm
  useEffect(() => {
    const fetchSheds = async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;

        const { data: shedsData } = await supabase
          .from('sheds')
          .select('id, name')
          .eq('farm_id', farm.id)
          .order('name', { ascending: true });

        if (shedsData) {
          setSheds(shedsData);
        }
      } catch (error) {
        console.error('Error fetching sheds:', error);
      }
    };

    fetchSheds();
  }, [farm.id]);

  const daysIntoBatch = batch 
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(batch.placement_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-2">
        <a href="/dashboard/farms" className="hover:text-gray-900">My Farms</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{farm.name}</span>
      </nav>

      {/* Harvest Alert Banner */}
      {harvestAlert && harvestAlert.show && (
        <div role="alert" aria-live="polite" className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <TrendUp size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-green-900">🎉 Harvest Opportunity!</h4>
                <p className="text-sm text-green-700 mt-1">
                  Current price (₹{harvestAlert.current.toFixed(0)}/kg) is above P50 prediction (₹{harvestAlert.p50.toFixed(0)}/kg). 
                  Good time to consider harvesting.
                </p>
              </div>
            </div>
            <button
              onClick={() => setHarvestAlert(null)}
              className="text-green-400 hover:text-green-600"
              aria-label="Dismiss alert"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Farm Header Band */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{farm.name}</h1>
            <p className="text-sm text-gray-600">
              📍 {farm.district}, {farm.village}
              {farm.latitude && farm.longitude && (
                <span className="ml-2 text-xs text-gray-500">
                  ({farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)})
                </span>
              )}
            </p>
            <div className="flex gap-2 mt-2">
              {farm.farm_type && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {farm.farm_type.charAt(0).toUpperCase() + farm.farm_type.slice(1)}
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                Max {farm.capacity.toLocaleString()} birds
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {batch && (
              <div className="text-right">
                <FarmStatusBadge status={farm.status} />
                <p className="text-xs text-gray-500 mt-1">Batch #{batch.batch_number}</p>
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More actions"
              >
                <DotsThree size={24} weight="bold" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setShowAddSensorModal(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Plus size={18} />
                    Add Sensor Node
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      window.location.href = `/dashboard/farms/${farm.id}/edit`;
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <PencilSimple size={18} />
                    Edit Farm
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      window.location.href = `/dashboard/reports/integrator?farmId=${farm.id}`;
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <FileText size={18} />
                    Download Report
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      if (confirm('Are you sure you want to archive this farm? This will hide it from your active farms list.')) {
                        // Archive logic would go here - for now, show alert
                        alert('Archive functionality coming soon. This will hide the farm from your active list.');
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                  >
                    <Archive size={18} />
                    Archive Farm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Batch Summary Strip */}
      {batch ? (
        <>
          <div className="bg-green-50 rounded-lg p-4 ring-1 ring-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600">Batch #{batch.batch_number}</p>
                <p className="text-sm font-semibold text-gray-900">
                  Day {daysIntoBatch} of ~42
                </p>
                <p className="text-xs text-gray-500">Placed: {new Date(batch.placement_date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Birds</p>
                <p className="text-sm font-semibold text-gray-900">
                  {batch.birds_alive.toLocaleString()} / {batch.birds_placed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Mortality: {batch.mortality.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Weight</p>
                <p className="text-sm font-semibold text-gray-900">
                  {batch.current_avg_weight.toFixed(0)}g (target: {batch.target_harvest_weight}g)
                </p>
                <p className="text-xs text-gray-500">Breed: {batch.breed}</p>
              </div>
            </div>
            <BatchProgressBar
              placementDate={batch.placement_date}
              targetHarvestAge={42}
            />
          </div>

          {/* Harvest Window Banner - shows when weight >= 85% of target */}
          <HarvestWindowBanner
            currentWeightG={batch.current_avg_weight}
            targetWeightG={batch.target_harvest_weight}
            batchDayNumber={daysIntoBatch}
            placementDate={new Date(batch.placement_date)}
            farmMandiId={farm.district}
            farmId={farm.id}
          />
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            {farm.status === 'between_batches'
              ? 'Farm is between batches. Cleanout in progress.'
              : 'No active batch. Start a new batch to begin tracking.'}
          </p>
        </div>
      )}

      {/* Add Sensor Node Modal */}
      <AddSensorNodeModal
        isOpen={showAddSensorModal}
        farmId={farm.id}
        farmName={farm.name}
        sheds={sheds}
        onClose={() => setShowAddSensorModal(false)}
        onSuccess={(deviceUuid) => {
          console.log('Device registered:', deviceUuid);
          setShowAddSensorModal(false);
          // Optionally refresh device list or show success notification
        }}
      />
    </div>
  );
}
