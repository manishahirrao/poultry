'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Kanban, X, Table, Plus, Funnel, Bell } from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import { getBatches, type BatchRow } from '@/utils/supabase/dashboard';
import { BatchCard } from './BatchCard';
import BatchDetailDrawer from './BatchDetailDrawer';
import BatchRegistrationForm from './BatchRegistrationForm';
import { Card } from '@/components/ui/Card';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

type ViewMode = 'kanban' | 'grid';
type SlidersHorizontalStatus = 'all' | 'active' | 'archived';

interface Column {
  id: 'placement' | 'growing' | 'pre_harvest' | 'harvest_ready' | 'harvested';
  title: string;
  subtitle: string;
  status: BatchRow['status'];
}

const COLUMNS: Column[] = [
  { id: 'placement', title: 'Placement', subtitle: 'Day 1–7', status: 'placement' },
  { id: 'growing', title: 'Growing', subtitle: 'Day 8–28', status: 'growing' },
  { id: 'pre_harvest', title: 'Pre-Harvest', subtitle: 'Day 29–42', status: 'pre_harvest' },
  { id: 'harvest_ready', title: 'Harvest Ready', subtitle: 'Day 43+', status: 'harvest_ready' },
  { id: 'harvested', title: 'Harvested', subtitle: 'Complete', status: 'harvested' },
];

interface BatchStatusBoardProps {
  customer: {
    id: string;
    name?: string;
    segment: string;
    role: string;
  };
}

export function BatchStatusBoard({ customer }: BatchStatusBoardProps) {
  const { entitlements } = useEntitlements();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<BatchRow | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStatus, setSlidersHorizontalStatus] = useState<SlidersHorizontalStatus>('active');
  const [showArchived, setShowArchived] = useState(false);
  const [farmRisks, setFarmRisks] = useState<Record<string, { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' }>>({});

  // ── Feature access check for batch history ─────────────────────────────────────
  const batchHistoryAccess = canAccess(entitlements, FEATURES.BATCH_HISTORY);

  // Load batches on mount
  useEffect(() => {
    loadBatches();
    loadRiskScores();
  }, [customer.id]);

  const loadRiskScores = async () => {
    try {
      const response = await fetch('/api/alerts/risk');
      const data = await response.json();

      if (response.ok && data.farm_risks) {
        // Create a map of farm_id to risk score
        const risksMap: Record<string, { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' }> = {};
        data.farm_risks.forEach((farmRisk: any) => {
          risksMap[farmRisk.farm_id] = {
            score: farmRisk.overall_risk_score,
            level: farmRisk.overall_risk_level
          };
        });
        setFarmRisks(risksMap);
      }
    } catch (error) {
      console.error('Failed to load risk scores:', error);
    }
  };

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await getBatches(customer.id);
      setBatches(data);
    } catch (error) {
      console.error('Failed to load batches:', error);
    } finally {
      setLoading(false);
    }
  };

  // SlidersHorizontal batches based on status
  const getSlidersHorizontaledBatches = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let filtered = batches.filter(batch => {
      // Archive harvested batches older than 7 days
      if (batch.status === 'harvested') {
        const harvestDate = new Date(batch.updated_at);
        const isArchived = harvestDate < sevenDaysAgo;
        
        if (filterStatus === 'active' && isArchived) return false;
        if (filterStatus === 'archived' && !isArchived) return false;
        if (!showArchived && isArchived) return false;
      }
      
      if (filterStatus === 'archived' && batch.status !== 'harvested') return false;
      
      return true;
    });

    // ── Limit batch history for FARM plan ───────────────────────────────────────
    // FARM users: max 3 batches in history; PRO users: unlimited
    if (batchHistoryAccess.limitValue && filtered.length > batchHistoryAccess.limitValue) {
      // Sort by updated_at descending and limit to the most recent batches
      filtered = filtered
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, batchHistoryAccess.limitValue);
    }

    return filtered;
  };

  const filteredBatches = getSlidersHorizontaledBatches();

  // Group batches by column
  const getBatchesByColumn = (status: BatchRow['status']) => {
    return filteredBatches.filter(batch => batch.status === status);
  };

  // Get harvest ready batches for bulk notification
  const getHarvestReadyBatches = () => {
    return filteredBatches.filter(batch => batch.status === 'harvest_ready');
  };

  // Handle bulk notification to harvest ready farms
  const handleNotifyHarvestReady = async () => {
    const harvestReadyBatches = getHarvestReadyBatches();
    if (harvestReadyBatches.length === 0) {
      alert('No harvest ready batches to notify.');
      return;
    }

    if (!confirm(`Send harvest notification to ${harvestReadyBatches.length} farm(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/batches/notify-harvest-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchIds: harvestReadyBatches.map(b => b.id),
        }),
      });

      if (response.ok) {
        alert(`Successfully sent notifications to ${harvestReadyBatches.length} farm(s).`);
      } else {
        alert('Failed to send notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications. Please try again.');
    }
  };

  // Handle batch creation success
  const handleBatchCreated = (batchId: string) => {
    setShowRegistrationForm(false);
    loadBatches();
    // Optionally open the new batch detail drawer
    const newBatch = batches.find(b => b.batch_id === batchId);
    if (newBatch) setSelectedBatch(newBatch);
  };

  // Handle batch card click
  const handleBatchClick = (batch: BatchRow) => {
    setSelectedBatch(batch);
  };

  // S2 integrators can toggle between Kanban and Grid view
  const canToggleView = customer.segment === 'S2' || customer.role === 'integrator';

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-neutral-200 rounded animate-pulse" />
        </div>
        
        {/* Kanban Columns Skeleton */}
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="space-y-3">
              <div className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
            बैच स्टेटस बोर्ड
          </h1>
          <p className="text-sm text-neutral-600">
            Batch Status Board
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle (S2 only) */}
          {canToggleView && (
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                title="Kanban View"
              >
                <Kanban size={20} weight={viewMode === 'kanban' ? 'fill' : 'regular'} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                title="Grid View"
              >
                <Table size={20} weight={viewMode === 'grid' ? 'fill' : 'regular'} />
              </button>
            </div>
          )}

          {/* SlidersHorizontal Toggle */}
          <button
            onClick={() => setSlidersHorizontalStatus(filterStatus === 'all' ? 'active' : 'all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all' 
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' 
                : 'bg-brand-green-100 text-brand-green-700'
            }`}
          >
            <Funnel size={18} weight="regular" />
            <span className="text-sm font-medium">
              {filterStatus === 'all' ? 'All' : 'Active'}
            </span>
          </button>

          {/* New Batch Button */}
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 transition-colors font-medium"
          >
            <Plus size={18} weight="bold" />
            <span>नया बैच</span>
          </button>

          {/* Notify Harvest Ready Button */}
          {getHarvestReadyBatches().length > 0 && (
            <button
              onClick={handleNotifyHarvestReady}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              <Bell size={18} weight="bold" />
              <span>Notify Harvest Ready ({getHarvestReadyBatches().length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {COLUMNS.map((column) => {
            const columnBatches = getBatchesByColumn(column.status);
            
            return (
              <div key={column.id} className="flex flex-col min-w-[280px]">
                {/* Column Header */}
                <div className="bg-neutral-50 rounded-t-lg px-4 py-3 border border-neutral-200 border-b-0">
                  <h3 className="font-semibold text-neutral-900 text-sm">{column.title}</h3>
                  <p className="text-xs text-neutral-500">{column.subtitle}</p>
                  <div className="mt-1 text-xs text-neutral-400">
                    {columnBatches.length} {columnBatches.length === 1 ? 'batch' : 'batches'}
                  </div>
                </div>

                {/* Column Body */}
                <div className="flex-1 bg-white rounded-b-lg border border-neutral-200 p-3 space-y-3 min-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {columnBatches.map((batch) => (
                      <BatchCard
                        key={batch.id}
                        batch={batch}
                        onClick={() => handleBatchClick(batch)}
                        riskScore={batch.farm_id ? farmRisks[batch.farm_id] : undefined}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {columnBatches.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">
                      No batches
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid View (S2 Integrators) */}
      {viewMode === 'grid' && canToggleView && (
        <Card padding="lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Batch ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Shed</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Age</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Birds</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Weight</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">FCR</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Mortality %</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Signal</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr 
                    key={batch.id}
                    onClick={() => handleBatchClick(batch)}
                    className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">{batch.batch_id}</td>
                    <td className="py-3 px-4 text-sm text-neutral-600">{batch.shed_id}</td>
                    <td className="py-3 px-4 text-sm text-neutral-600">{batch.age_days} days</td>
                    <td className="py-3 px-4 text-sm text-neutral-600">{batch.current_bird_count.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {batch.avg_weight_kg ? `${batch.avg_weight_kg.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {batch.fcr ? batch.fcr.toFixed(3) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {batch.mortality_pct !== undefined ? `${batch.mortality_pct.toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {batch.sell_signal === 'sell' && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">SELL</span>
                      )}
                      {batch.sell_signal === 'hold' && (
                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">HOLD</span>
                      )}
                      {batch.sell_signal === 'caution' && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">CAUTION</span>
                      )}
                      {batch.sell_signal === 'withdrawal' && (
                        <span className="px-2 py-1 rounded-full bg-neutral-200 text-neutral-700 text-xs font-medium">WITHDRAWAL</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600 capitalize">{batch.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Batch Registration Form Modal */}
      <AnimatePresence>
        {showRegistrationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: customCubicBezier }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    नया बैच दर्ज करें
                  </h2>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X size={20} weight="regular" />
                  </button>
                </div>
                
                <BatchRegistrationForm
                  onSuccess={handleBatchCreated}
                  onCancel={() => setShowRegistrationForm(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Detail Drawer */}
      <BatchDetailDrawer
        batch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
        customer={customer}
      />
    </div>
  );
}

export default BatchStatusBoard;
