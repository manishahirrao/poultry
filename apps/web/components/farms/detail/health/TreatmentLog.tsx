'use client';

import { useState } from 'react';
import { Plus, Pill } from '@phosphor-icons/react';
import { TreatmentLogTable } from './TreatmentLogTable';
import { AddTreatmentForm } from './AddTreatmentForm';
import { WithdrawalTracker } from './WithdrawalTracker';

interface TreatmentLogProps {
  farmId: string;
  batchId: string;
}

interface Treatment {
  treatment_id: string;
  treatment_date: string;
  medicine_name: string;
  brand_name: string | null;
  lot_number: string | null;
  purpose: string[];
  dosage_amount: number | null;
  dosage_unit: string | null;
  dosage_per: string | null;
  route: string;
  treatment_day_start: number | null;
  treatment_day_end: number | null;
  last_dose_date: string | null;
  withdrawal_days: number;
  clearance_date: string | null;
  is_complete: boolean;
  cost: number | null;
  vet_name_snapshot: string | null;
  notes: string | null;
}

export function TreatmentLog({ farmId, batchId }: TreatmentLogProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleTreatmentAdded = (newTreatment: Treatment) => {
    setTreatments([...treatments, newTreatment]);
    setShowAddForm(false);
  };

  const handleTreatmentUpdated = (updatedTreatment: Treatment) => {
    setTreatments(treatments.map(t => 
      t.treatment_id === updatedTreatment.treatment_id ? updatedTreatment : t
    ));
  };

  const handleTreatmentDeleted = (treatmentId: string) => {
    setTreatments(treatments.filter(t => t.treatment_id !== treatmentId));
  };

  // Check for active withdrawal periods
  const activeWithdrawals = treatments.filter(t => 
    t.withdrawal_days > 0 && 
    t.clearance_date && 
    new Date(t.clearance_date) > new Date()
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill size={24} className="text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">💊 Treatment Log</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors flex items-center gap-1"
        >
          <Plus size={16} weight="bold" />
          Add Treatment
        </button>
      </div>

      {/* Active Withdrawal Alert */}
      {activeWithdrawals.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 text-sm font-bold">⚠</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                ACTIVE WITHDRAWAL PERIOD
              </h4>
              {activeWithdrawals.map(treatment => (
                <div key={treatment.treatment_id} className="text-sm text-red-700">
                  {treatment.medicine_name} · Administered {treatment.treatment_date} · {treatment.withdrawal_days}-day period
                  <br />
                  <span className="font-medium">Earliest harvest: {treatment.clearance_date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Treatment Form */}
      {showAddForm && (
        <AddTreatmentForm
          farmId={farmId}
          batchId={batchId}
          onCancel={() => setShowAddForm(false)}
          onSuccess={handleTreatmentAdded}
        />
      )}

      {/* Treatment Log Table */}
      <TreatmentLogTable
        farmId={farmId}
        batchId={batchId}
        treatments={treatments}
        expandedRow={expandedRow}
        onRowExpand={setExpandedRow}
        onTreatmentUpdate={handleTreatmentUpdated}
        onTreatmentDelete={handleTreatmentDeleted}
      />

      {/* Withdrawal Period Tracker */}
      <WithdrawalTracker treatments={treatments} />
    </div>
  );
}
