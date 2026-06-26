'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TrendUp, Calculator, Warning } from '@phosphor-icons/react';

interface InputCostProjectionProps {
  batchId: string;
  breed: string;
  ageDays: number;
  flockSize: number;
  currentFCR?: number;
  avgWeightKg?: number;
}

interface CostProjection {
  actualCostsToDate: number;
  projectedFeedCost: number;
  projectedTotalCost: number;
  daysToHarvest: number;
  dailyFeedCost: number;
}

export function InputCostProjection({
  batchId,
  breed,
  ageDays,
  flockSize,
  currentFCR,
  avgWeightKg
}: InputCostProjectionProps) {
  const [projection, setProjection] = useState<CostProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [commodityForecast, setCommodityForecast] = useState<number | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchCostProjection();
  }, [batchId, breed, ageDays, flockSize, currentFCR]);

  const fetchCostProjection = async () => {
    if (!supabase) {
      console.warn('[InputCostProjection] Supabase not configured, skipping cost projection');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch actual costs from inventory_movements and batch records
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('*, inventory_movements(*), feed_logs(*)')
        .eq('id', batchId)
        .single();

      if (batchError) throw batchError;

      // Calculate actual costs to date
      const inventoryMovements = batch.inventory_movements || [];
      const actualCostsToDate = inventoryMovements.reduce((sum: number, movement: any) => {
        if (movement.category === 'cost') {
          return sum + (movement.amount || 0);
        }
        return sum;
      }, 0);

      // Add DOC cost if available
      const docCost = batch.doc_cost || 0;
      const totalActualCosts = actualCostsToDate + docCost;

      // Calculate projected feed cost to harvest
      const targetAge = breed === 'Cobb 500' ? 42 : 
                       breed === 'Ross 308' ? 42 :
                       breed === 'Vencobb' ? 40 : 41;
      const daysToHarvest = Math.max(0, targetAge - ageDays);
      
      // Get feed cost per kg from commodity forecast or default
      const feedCostPerKg = commodityForecast || 24.8; // Default feed cost

      // Calculate daily feed consumption based on current FCR and weight gain
      const currentWeight = avgWeightKg || 1.5;
      const weightGainPerDay = 0.05; // Average daily weight gain (kg)
      const dailyFeedConsumption = currentFCR 
        ? (weightGainPerDay * flockSize * currentFCR)
        : (0.05 * flockSize * 1.8); // Default FCR 1.8

      const dailyFeedCost = dailyFeedConsumption * feedCostPerKg;
      const projectedFeedCost = dailyFeedCost * daysToHarvest;

      // Estimate other costs (medicine, labor, electricity, overhead)
      const estimatedOtherCosts = daysToHarvest * (flockSize * 0.5); // ₹0.5 per bird per day

      const projectedTotalCost = totalActualCosts + projectedFeedCost + estimatedOtherCosts;

      setProjection({
        actualCostsToDate: totalActualCosts,
        projectedFeedCost,
        projectedTotalCost,
        daysToHarvest,
        dailyFeedCost
      });
    } catch (err) {
      console.error('Error fetching cost projection:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator size={20} weight="regular" className="text-brand-green-600" />
          <h3 className="font-semibold text-neutral-900">Input Cost Projection</h3>
        </div>
        <div className="text-sm text-neutral-500">Loading cost projection...</div>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator size={20} weight="regular" className="text-brand-green-600" />
          <h3 className="font-semibold text-neutral-900">Input Cost Projection</h3>
        </div>
        <div className="text-sm text-neutral-500">Unable to calculate cost projection</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator size={20} weight="regular" className="text-brand-green-600" />
          <h3 className="font-semibold text-neutral-900">Input Cost Projection</h3>
        </div>
        <div className="text-xs text-neutral-500">
          Based on current FCR trajectory
        </div>
      </div>

      <div className="space-y-4">
        {/* Actual Costs to Date */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="text-xs text-neutral-500 mb-1">Actual Costs to Date</div>
          <div className="text-2xl font-bold text-neutral-900">
            ₹{(projection.actualCostsToDate / 1000).toFixed(1)}k
          </div>
        </div>

        {/* Projected Costs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <TrendUp size={16} weight="regular" className="text-brand-green-600" />
              <span className="text-sm text-neutral-600">Projected Feed Cost</span>
            </div>
            <span className="font-semibold text-neutral-900">
              ₹{(projection.projectedFeedCost / 1000).toFixed(1)}k
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="text-sm text-neutral-600">Daily Feed Cost</span>
            <span className="font-semibold text-neutral-900">
              ₹{projection.dailyFeedCost.toFixed(0)}/day
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="text-sm text-neutral-600">Days to Harvest</span>
            <span className="font-semibold text-neutral-900">
              {projection.daysToHarvest} days
            </span>
          </div>
        </div>

        {/* Total Projected Cost */}
        <div className="bg-gradient-to-r from-brand-green-50 to-blue-50 rounded-lg p-4 border border-brand-green-200">
          <div className="text-xs text-brand-green-700 mb-1">Total Projected Cost at Harvest</div>
          <div className="text-2xl font-bold text-brand-green-900">
            ₹{(projection.projectedTotalCost / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-brand-green-600 mt-1">
            +₹{((projection.projectedTotalCost - projection.actualCostsToDate) / 1000).toFixed(1)}k to harvest
          </div>
        </div>

        {/* Insight */}
        <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
          <Warning size={16} weight="regular" className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            Projections based on current FCR of {currentFCR?.toFixed(3) || 'N/A'}. Actual costs may vary based on feed price changes and health events.
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputCostProjection;
