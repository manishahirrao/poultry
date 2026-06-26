'use client';

/**
 * FlockIQ - Harvest Readiness Panel
 * TASK-GAP2-UI-001: Sales Tab: page shell + harvest readiness panel
 * Requirements: REQ-GAP2-SALES-001 through REQ-GAP2-SALES-003
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §2.1
 * 
 * This component implements the harvest readiness panel with:
 * - Shows when batch age >= 85% of target duration
 * - Withdrawal status check (blocks sale if active)
 * - Estimated revenue calculation at current price
 * - Sell signal indicator (SELL/HOLD/CAUTION)
 * - Integration with withdrawal status from treatments (TASK-INT-001)
 * 
 * Integration: Integrated into SalesTab component
 */

import { Truck, TrendUp, ShieldCheck, ShieldWarning } from '@phosphor-icons/react';

interface HarvestReadinessPanelProps {
  batch: {
    current_day: number;
    target_days: number;
    birds_alive: number;
    avg_weight_g: number;
    target_harvest_weight: number;
    fcr: number;
  };
  withdrawalStatus: {
    has_active_withdrawal: boolean;
    latest_clearance_date: string | null;
    active_medicines?: Array<{
      medicine_name: string;
      clearance_date: string;
    }>;
  };
  priceData?: {
    p50_price: number;
    region: string;
  };
  onRecordSale: () => void;
  onCloseBatch: () => void;
}

export function HarvestReadinessPanel({
  batch,
  withdrawalStatus,
  priceData,
  onRecordSale,
  onCloseBatch,
}: HarvestReadinessPanelProps) {
  // Show panel when weight >= 85% of target harvest weight (per GAP-014)
  const shouldShowPanel = batch.avg_weight_g >= batch.target_harvest_weight * 0.85;
  
  if (!shouldShowPanel) {
    return null;
  }

  const estimatedRevenue = batch.birds_alive * (batch.avg_weight_g / 1000) * (priceData?.p50_price || 0);
  const revenueInLakhs = estimatedRevenue / 100000;
  const avgWeightKg = batch.avg_weight_g / 1000;

  const isWithdrawalActive = withdrawalStatus.has_active_withdrawal;
  const sellSignal = !isWithdrawalActive && batch.current_day >= batch.target_days * 0.9;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">🌟</span>
        </div>
        <h3 className="text-lg font-semibold text-green-900">HARVEST WINDOW ACTIVE</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Birds Alive</p>
          <p className="text-xl font-bold text-gray-900">{batch.birds_alive.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Weight</p>
          <p className="text-xl font-bold text-gray-900">{avgWeightKg.toFixed(2)} kg</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">FCR</p>
          <p className="text-xl font-bold text-gray-900">{batch.fcr.toFixed(3)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Today's Price ({priceData?.region || 'Local'})
          </p>
          <p className="text-xl font-bold text-gray-900">
            ₹{priceData?.p50_price || 0}/kg
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
        <p className="text-sm text-gray-600 mb-1">Estimated Revenue if sold today</p>
        <p className="text-2xl font-bold text-green-700">₹{revenueInLakhs.toFixed(1)}L</p>
      </div>

      {/* Withdrawal Status */}
      <div className={`rounded-lg p-4 mb-4 ${
        isWithdrawalActive 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isWithdrawalActive ? (
            <ShieldWarning size={20} className="text-red-600" weight="fill" />
          ) : (
            <ShieldCheck size={20} className="text-green-600" weight="fill" />
          )}
          <span className={`font-semibold ${
            isWithdrawalActive ? 'text-red-900' : 'text-green-900'
          }`}>
            WITHDRAWAL STATUS
          </span>
        </div>
        
        {isWithdrawalActive ? (
          <div>
            <p className="text-red-800 font-medium">
              🔴 DO NOT SELL — Withdrawal active until {withdrawalStatus.latest_clearance_date}
            </p>
            {withdrawalStatus.active_medicines && withdrawalStatus.active_medicines.length > 0 && (
              <div className="mt-2 text-sm text-red-700">
                <p>Active medicines:</p>
                <ul className="list-disc list-inside">
                  {withdrawalStatus.active_medicines.map((med, idx) => (
                    <li key={idx}>{med.medicine_name} — Clear by {med.clearance_date}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-green-800 font-medium">
            ✅ CLEAR — No active withdrawal periods
          </p>
        )}
      </div>

      {/* Sell Signal */}
      <div className="flex items-center gap-2 mb-4">
        {sellSignal ? (
          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-green-800 font-medium">🟢 आज बेचें (Sell Now)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full">
            <TrendUp size={16} className="text-amber-600" />
            <span className="text-amber-800 font-medium">Wait for optimal weight</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRecordSale}
          disabled={isWithdrawalActive}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            isWithdrawalActive
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-700 hover:bg-green-800 text-white'
          }`}
          title={isWithdrawalActive ? `Withdrawal period active until ${withdrawalStatus.latest_clearance_date}` : 'Record new sale'}
        >
          <Truck size={20} weight="bold" />
          {isWithdrawalActive ? 'Sale Blocked' : 'Record Sale / Lifting Event →'}
        </button>
        
        <button
          onClick={onCloseBatch}
          className="py-3 px-4 rounded-lg font-semibold border-2 border-green-700 text-green-700 hover:bg-green-50 transition-colors"
        >
          Close Batch →
        </button>
      </div>
    </div>
  );
}
