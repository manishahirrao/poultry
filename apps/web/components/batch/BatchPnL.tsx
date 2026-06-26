'use client';

/**
 * FlockIQ - Batch P&L (Profit & Loss)
 * TASK-048: Full Batch P&L & Costing Engine
 * Requirement Refs: REQ-018 §18.1–18.3, Design Addendum §16.1
 * 
 * This component implements the comprehensive batch P&L calculator with auto-populated
 * cost categories, immutable entries, and "Wait N days" suggestion for ROI optimization.
 * 
 * Features:
 * - Auto-populated cost categories from inventory_movements table
 * - Immutable entries: once a batch is harvested, P&L becomes read-only
 * - "Wait N days" suggestion: if current profit is negative, suggests waiting for better price
 * - Real-time calculation of net profit, profit per bird, and profit per kg
 * - Integration with ROI Optimizer for price forecasting
 * - Support for both projected (active batches) and actual (harvested batches) P&L
 * - Cost breakdown: DOC, feed, medicine, vaccine, labor, electricity, overhead
 */

import React, { useState, useEffect } from 'react';
import { TrendUp, TrendDown, Warning, Lightbulb, ArrowRight } from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { WebTypography, colors } from '@poultrypulse/ui';

/**
 * Props for Batch P&L
 * - batchId: Unique identifier for the batch
 * - batchName: Human-readable batch ID for display
 * - docCount: Number of DOCs placed
 * - docPlacementDate: Date when DOCs were placed
 * - currentBirdCount: Current number of birds in the flock
 * - avgWeightKg: Current average weight per bird
 * - breed: Poultry breed for breed-specific calculations
 * - ageDays: Current age of the flock in days
 * - status: Batch status (active, harvested, etc.)
 * - actualHarvestWeightKg: Actual harvest weight (for harvested batches)
 * - birdsSold: Number of birds sold (for harvested batches)
 * - salePricePerKg: Sale price per kg (for harvested batches)
 */
interface BatchPnLProps {
  batchId: string;
  batchName: string;
  docCount: number;
  docPlacementDate: string;
  currentBirdCount: number;
  avgWeightKg?: number | null;
  breed: string;
  ageDays: number;
  status: string;
  actualHarvestWeightKg?: number | null;
  birdsSold?: number | null;
  salePricePerKg?: number | null;
  farmId?: string; // Added for fetching farm-specific cost config
}

/**
 * Cost category structure for P&L breakdown
 * Each cost category has a name, amount, and type
 */
interface CostCategory {
  name: string;
  amount: number;
  category: 'doc' | 'feed' | 'medicine' | 'vaccine' | 'labor' | 'electricity' | 'overhead';
}

/**
 * P&L data structure
 * Contains all financial data for the batch including revenue, costs, and profit metrics
 */
interface PnLData {
  revenue: number;
  costs: CostCategory[];
  totalCost: number;
  netProfit: number;
  netProfitPerBird: number;
  netProfitPerKg: number;
  isProjected: boolean; // true for active batches, false for harvested batches
}

export default function BatchPnL({
  batchId,
  batchName,
  docCount,
  docPlacementDate,
  currentBirdCount,
  avgWeightKg,
  breed,
  ageDays,
  status,
  actualHarvestWeightKg,
  birdsSold,
  salePricePerKg,
  farmId
}: BatchPnLProps) {
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitDaysSuggestion, setWaitDaysSuggestion] = useState<{ days: number; projectedProfit: number; futurePrice: number } | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(164);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  /**
   * Fetch cost configuration for the farm
   * Falls back to integrator default and then to system defaults
   * 
   * @returns Cost configuration object with all rates
   */
  const fetchCostConfig = async (): Promise<{
    docPrice: number;
    feedPricePerKg: number;
    medicineCostPerUnit: number;
    vaccineCostPerUnit: number;
    laborRatePerDay: number;
    electricityRatePerDay: number;
    overheadRatePerDay: number;
  }> => {
    try {
      if (!farmId || !supabase) {
        // Return system defaults if no farmId or Supabase not configured
        return {
          docPrice: 42,
          feedPricePerKg: 25,
          medicineCostPerUnit: 100,
          vaccineCostPerUnit: 50,
          laborRatePerDay: 800,
          electricityRatePerDay: 200,
          overheadRatePerDay: 300
        };
      }

      // Fetch farm details to get integrator_id
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('integrator_id')
        .eq('id', farmId)
        .single();

      if (farmError || !farmData) {
        return {
          docPrice: 42,
          feedPricePerKg: 25,
          medicineCostPerUnit: 100,
          vaccineCostPerUnit: 50,
          laborRatePerDay: 800,
          electricityRatePerDay: 200,
          overheadRatePerDay: 300
        };
      }

      // Call the get_farm_cost_config function
      const { data: costConfig, error: configError } = await supabase
        .rpc('get_farm_cost_config', {
          p_farm_id: farmId,
          p_integrator_id: farmData.integrator_id
        });

      if (configError || !costConfig || costConfig.length === 0) {
        console.warn('[BatchPnL] Failed to fetch cost config, using system defaults');
        return {
          docPrice: 42,
          feedPricePerKg: 25,
          medicineCostPerUnit: 100,
          vaccineCostPerUnit: 50,
          laborRatePerDay: 800,
          electricityRatePerDay: 200,
          overheadRatePerDay: 300
        };
      }

      const config = costConfig[0];
      return {
        docPrice: Number(config.doc_price) || 42,
        feedPricePerKg: Number(config.feed_price_per_kg) || 25,
        medicineCostPerUnit: Number(config.medicine_cost_per_unit) || 100,
        vaccineCostPerUnit: Number(config.vaccine_cost_per_unit) || 50,
        laborRatePerDay: Number(config.labor_rate_per_day) || 800,
        electricityRatePerDay: Number(config.electricity_rate_per_day) || 200,
        overheadRatePerDay: Number(config.overhead_rate_per_day) || 300
      };
    } catch (error) {
      console.warn('[BatchPnL] Error fetching cost config, using system defaults:', error);
      return {
        docPrice: 42,
        feedPricePerKg: 25,
        medicineCostPerUnit: 100,
        vaccineCostPerUnit: 50,
        laborRatePerDay: 800,
        electricityRatePerDay: 200,
        overheadRatePerDay: 300
      };
    }
  };

  /**
   * Fetch current market price from price intelligence predictions table
   * Falls back to default price if no prediction is available
   * 
   * @returns Current price per kg in INR
   */
  const fetchCurrentPrice = async (): Promise<number> => {
    if (!supabase) {
      return 164;
    }

    try {
      // Fetch batch data to get customer_id
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('customer_id')
        .eq('id', batchId)
        .single();

      if (batchError || !batchData?.customer_id) {
        return 164;
      }

      // Fetch customer mandi
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('mandi')
        .eq('id', batchData.customer_id)
        .single();

      if (customerError || !customerData?.mandi) {
        return 164;
      }

      // Fetch current price from predictions table
      const { data: pricePrediction, error: predictionError } = await supabase
        .from('predictions')
        .select('p50')
        .eq('mandi', customerData.mandi)
        .order('predicted_for', { ascending: false })
        .limit(1)
        .single();

      if (predictionError) {
        return 164;
      }

      if (pricePrediction?.p50 && pricePrediction.p50 > 0) {
        return pricePrediction.p50;
      }
    } catch (error) {
      // Silent fallback
    }
    
    // Fallback to default price (₹164/kg - typical UP market price)
    return 164;
  };

  /**
   * Fetch P&L data when component mounts or relevant props change
   * Calculates costs from inventory_movements and revenue from batch status
   */
  useEffect(() => {
    fetchPnLData();
  }, [batchId, status, birdsSold, salePricePerKg, actualHarvestWeightKg]);

  const fetchPnLData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch cost configuration for the farm
      const costConfig = await fetchCostConfig();

      // Fetch batch details for DOC supplier price
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('doc_supplier_price, doc_count')
        .eq('id', batchId)
        .single();

      if (batchError && batchError.code !== 'PGRST116') {
        throw batchError;
      }

      // Fetch inventory movements for this batch
      // Auto-populated cost categories from inventory_movements table
      const { data: movements, error: movementsError } = await supabase
        .from('inventory_movements')
        .select(`
          quantity,
          unit_cost,
          total_cost,
          movement_type,
          inventory_item_id,
          inventory_items!inner (
            category,
            name,
            avg_cost_per_unit
          )
        `)
        .eq('batch_id', batchId)
        .in('movement_type', ['consumption', 'purchase']);

      if (movementsError) throw movementsError;

      // Calculate costs by category
      const costs: CostCategory[] = [];

      // DOC cost (from batch data or configured price)
      const docPrice = batchData?.doc_supplier_price || costConfig.docPrice;
      const docCost = docPrice * docCount;
      costs.push({
        name: `DOC cost (${docCount} × ₹${docPrice})`,
        amount: docCost,
        category: 'doc'
      });

      // Feed cost from inventory movements (consumption records)
      const feedMovements = movements?.filter(m => {
        const inventoryItem = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items;
        return inventoryItem?.category === 'feed' && m.movement_type === 'consumption';
      }) || [];
      const feedCost = feedMovements.reduce((sum, m) => {
        // Use total_cost if available, otherwise calculate from quantity * unit_cost or avg_cost_per_unit
        if (m.total_cost) return sum + m.total_cost;
        const inventoryItem = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items;
        const costPerUnit = m.unit_cost || inventoryItem?.avg_cost_per_unit || costConfig.feedPricePerKg;
        return sum + (Math.abs(m.quantity) * costPerUnit);
      }, 0);
      
      if (feedCost > 0) {
        const totalFeedKg = feedMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
        const avgFeedPrice = totalFeedKg > 0 ? feedCost / totalFeedKg : 0;
        costs.push({
          name: `Feed cost (${totalFeedKg.toFixed(0)} kg × ₹${avgFeedPrice.toFixed(2)}/kg)`,
          amount: feedCost,
          category: 'feed'
        });
      }

      // Medicine cost from inventory movements (consumption records)
      const medicineMovements = movements?.filter(m => {
        const inventoryItem = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items;
        return inventoryItem?.category === 'medicine' && m.movement_type === 'consumption';
      }) || [];
      const medicineCost = medicineMovements.reduce((sum, m) => {
        if (m.total_cost) return sum + m.total_cost;
        const inventoryItem = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items;
        const costPerUnit = m.unit_cost || inventoryItem?.avg_cost_per_unit || costConfig.medicineCostPerUnit;
        return sum + (Math.abs(m.quantity) * costPerUnit);
      }, 0);

      if (medicineCost > 0) {
        costs.push({
          name: 'Medicine',
          amount: medicineCost,
          category: 'medicine'
        });
      }

      // Vaccine cost from inventory movements (consumption records)
      const vaccineMovements = movements?.filter(m => {
        const inventoryItem = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items;
        return inventoryItem?.category === 'vaccine' && m.movement_type === 'consumption';
      }) || [];
      const vaccineCost = vaccineMovements.reduce((sum, m) => {
        if (m.total_cost) return sum + m.total_cost;
        const inventoryItem = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items;
        const costPerUnit = m.unit_cost || inventoryItem?.avg_cost_per_unit || costConfig.vaccineCostPerUnit;
        return sum + (Math.abs(m.quantity) * costPerUnit);
      }, 0);

      if (vaccineCost > 0) {
        costs.push({
          name: 'Vaccine',
          amount: vaccineCost,
          category: 'vaccine'
        });
      }

      // Labor cost (using configured rate)
      const laborCost = costConfig.laborRatePerDay * ageDays;
      costs.push({
        name: `Labor (₹${costConfig.laborRatePerDay}/day × ${ageDays} days)`,
        amount: laborCost,
        category: 'labor'
      });

      // Electricity cost (using configured rate)
      const electricityCost = costConfig.electricityRatePerDay * ageDays;
      costs.push({
        name: `Electricity (₹${costConfig.electricityRatePerDay}/day × ${ageDays} days)`,
        amount: electricityCost,
        category: 'electricity'
      });

      // Overhead cost (using configured rate)
      const overheadCost = costConfig.overheadRatePerDay * ageDays;
      costs.push({
        name: `Overhead (₹${costConfig.overheadRatePerDay}/day × ${ageDays} days)`,
        amount: overheadCost,
        category: 'overhead'
      });

      const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

      // Calculate revenue
      // For harvested batches: use actual sale data
      // For active batches: use projected revenue at current market price
      let revenue = 0;
      let isProjected = true;

      if (status === 'harvested' && birdsSold && salePricePerKg && actualHarvestWeightKg) {
        // Actual revenue from harvest (immutable entry)
        revenue = birdsSold * actualHarvestWeightKg * salePricePerKg;
        isProjected = false;
      } else if (avgWeightKg && currentBirdCount > 0) {
        // Projected revenue at current price from price intelligence predictions table
        const fetchedPrice = await fetchCurrentPrice();
        setCurrentPrice(fetchedPrice);
        revenue = currentBirdCount * avgWeightKg * fetchedPrice;
        isProjected = true;
      }

      const netProfit = revenue - totalCost;
      const netProfitPerBird = currentBirdCount > 0 ? netProfit / currentBirdCount : 0;
      const netProfitPerKg = avgWeightKg && currentBirdCount > 0 ? netProfit / (currentBirdCount * avgWeightKg) : 0;

      setPnlData({
        revenue,
        costs,
        totalCost,
        netProfit,
        netProfitPerBird,
        netProfitPerKg,
        isProjected
      });

      // Update lastUpdated timestamp after successful data fetch
      setLastUpdated(new Date());

      // Calculate "Wait N days" suggestion if current profit is negative
      // This integrates with the ROI Optimizer to suggest optimal harvest timing
      if (isProjected && netProfit < 0) {
        try {
          // Call the actual ROI Optimizer API
          const roiResponse = await fetch('/api/v1/batch/roi-optimizer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              batch_id: batchId,
              current_weight: avgWeightKg || 2.2,
              current_birds: currentBirdCount,
              total_cost: totalCost,
              age_days: ageDays,
              breed: breed,
              feed_cost_per_kg: costConfig.feedPricePerKg,
              overhead_cost_per_bird_per_day: costConfig.overheadRatePerDay / currentBirdCount,
            }),
          });

          if (roiResponse.ok) {
            const roiData = await roiResponse.json();
            
            if (roiData.success && roiData.projected_profit > 0) {
              const optimalScenario = roiData.optimal_scenario || 'today';
              const daysToWait = optimalScenario === 'today' ? 0 : 
                optimalScenario === '+3d' ? 3 :
                optimalScenario === '+7d' ? 7 : 14;

              setWaitDaysSuggestion({
                days: daysToWait,
                projectedProfit: roiData.projected_profit,
                futurePrice: roiData.sell_hold_matrix?.find((row: any) => row.isOptimal)?.projectedPrice.p50 || 168
              });
            }
          }
        } catch (error) {
          console.warn('[BatchPnL] ROI Optimizer API call failed, using fallback:', error);
          
          // Fallback to simple calculation if API fails
          const daysToHarvest = Math.max(0, 42 - ageDays);
          const futurePrice = 168; // Fallback future price
          const projectedRevenue = currentBirdCount * (avgWeightKg || 2.2) * futurePrice;
          const projectedProfit = projectedRevenue - totalCost;

          if (projectedProfit > 0) {
            setWaitDaysSuggestion({
              days: daysToHarvest,
              projectedProfit,
              futurePrice
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch P&L data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyDollar = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getProfitColor = (value: number) => {
    if (value >= 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getProfitIcon = (value: number) => {
    if (value >= 0) return <TrendUp size={20} weight="bold" className="text-green-600" />;
    return <TrendDown size={20} weight="bold" className="text-red-600" />;
  };

  if (loading) {
    return (
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">BATCH P&L — {batchName} · Day {ageDays}</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-neutral-200 rounded" />
          <div className="h-8 bg-neutral-200 rounded" />
          <div className="h-8 bg-neutral-200 rounded" />
          <div className="h-8 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">BATCH P&L — {batchName} · Day {ageDays}</h3>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!pnlData) {
    return null;
  }

  return (
    <div className="bg-neutral-50 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-neutral-900">
          BATCH P&L — {batchName} · Day {ageDays}
        </h3>
        <div className="text-xs" style={{ color: colors.neutral500, fontSize: '0.75rem', lineHeight: 1.4 }}>
          Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
      </div>

      <div className="space-y-4">
        {/* Revenue Section */}
        <div className="space-y-2">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            REVENUE {pnlData.isProjected ? '(projected at today\'s price)' : '(actual)'}
          </div>
          {pnlData.isProjected ? (
            <div className="text-sm text-neutral-700">
              {currentBirdCount.toLocaleString()} birds × {avgWeightKg?.toFixed(2) || 'N/A'} kg × <span className="font-semibold text-neutral-900 tabular-nums">₹{currentPrice}</span>/kg = <span className="font-semibold text-neutral-900 tabular-nums">{formatCurrencyDollar(pnlData.revenue)}</span>
            </div>
          ) : (
            <div className="text-sm text-neutral-700">
              {birdsSold?.toLocaleString()} birds × {actualHarvestWeightKg?.toFixed(2)} kg × <span className="font-semibold text-neutral-900 tabular-nums">₹{salePricePerKg}</span>/kg = <span className="font-semibold text-neutral-900 tabular-nums">{formatCurrencyDollar(pnlData.revenue)}</span>
            </div>
          )}
        </div>

        {/* Costs Section */}
        <div className="space-y-2">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            COSTS (actual to date)
          </div>
          {pnlData.costs.map((cost, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-neutral-700">{cost.name}</span>
              <span className="text-neutral-900 font-medium">{formatCurrencyDollar(cost.amount)}</span>
            </div>
          ))}
          <div className="border-t border-neutral-300 pt-2 flex justify-between items-center">
            <span className="text-neutral-900 font-semibold">TOTAL COST</span>
            <span className="text-neutral-900 font-bold">{formatCurrencyDollar(pnlData.totalCost)}</span>
          </div>
        </div>

        {/* Net Profit Section */}
        <div className="border-t border-neutral-300 pt-4 space-y-3">
          <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3">
            <span className="font-semibold text-neutral-900 flex items-center gap-2">
              NET PROFIT {pnlData.isProjected ? '(projected)' : ''}
              {getProfitIcon(pnlData.netProfit)}
            </span>
            <span className={`font-bold text-lg ${getProfitColor(pnlData.netProfit)}`}>
              {formatCurrencyDollar(pnlData.netProfit)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">NET PROFIT PER BIRD</span>
            <span className={`font-medium ${getProfitColor(pnlData.netProfitPerBird)}`}>
              {formatCurrencyDollar(pnlData.netProfitPerBird)}/bird
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">NET PROFIT PER KG</span>
            <span className={`font-medium ${getProfitColor(pnlData.netProfitPerKg)}`}>
              {formatCurrencyDollar(pnlData.netProfitPerKg)}/kg
            </span>
          </div>
        </div>

        {/* Wait N Days Suggestion */}
        {waitDaysSuggestion && pnlData.netProfit < 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb size={20} weight="fill" className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Wait {waitDaysSuggestion.days} days: price ₹{waitDaysSuggestion.futurePrice}/kg → NET PROFIT = {formatCurrencyDollar(waitDaysSuggestion.projectedProfit)} ✅
                </div>
                <button
                  onClick={() => {
                    // Navigate to ROI Optimizer
                    console.log('Opening ROI Optimizer for batch:', batchId);
                    alert('ROI Optimizer feature coming soon!');
                  }}
                  className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 font-medium mt-2"
                >
                  ROI Optimizer खोलें
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
