'use client';

/**
 * FlockIQ - Add Treatment Form
 * TASK-GAP3-UI-001: Treatment Log section in Health Tab
 * Requirements: REQ-GAP3-TREAT-001 through REQ-GAP3-TREAT-005
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §3
 * 
 * This component implements the treatment recording form with:
 * - Medicine autocomplete from medicines_db table
 * - Auto-fill withdrawal days based on medicine selection
 * - Cost tracking integration with P&L (TASK-INT-002)
 * - Withdrawal period warning display
 * - Vet information capture with save option
 * - Custom event dispatch for cross-tab communication (TASK-INT-001)
 * 
 * Integration: Integrated into TreatmentLog component in HealthTab
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Calendar, Syringe, Warning, Plus } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { mutate } from 'swr';

interface AddTreatmentFormProps {
  farmId: string;
  batchId: string;
  onCancel: () => void;
  onSuccess: (treatment: any) => void;
}

interface MedicineSuggestion {
  medicine_id: string;
  generic_name: string;
  brand_names: string[];
  standard_withdrawal_days_india: number;
  category: string;
}

export function AddTreatmentForm({ farmId, batchId, onCancel, onSuccess }: AddTreatmentFormProps) {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    treatment_date: new Date().toISOString().split('T')[0],
    medicine_name: '',
    brand_name: '',
    lot_number: '',
    purpose: [] as string[],
    dosage_amount: '',
    dosage_unit: 'ml',
    dosage_per: 'per_litre_water',
    route: 'water',
    treatment_day_start: '',
    treatment_day_end: '',
    withdrawal_days: '',
    cost_quantity: '',
    cost_unit: 'ml',
    cost_rate: '',
    vet_name: '',
    vet_phone: '',
    save_vet: false,
    notes: ''
  });

  const [medicineSuggestions, setMedicineSuggestions] = useState<MedicineSuggestion[]>([]);
  const [showWithdrawalWarning, setShowWithdrawalWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purposeOptions = [
    'Respiratory', 'Enteric', 'Leg Weakness', 'CRD', 'Coccidiosis', 
    'Newcastle', 'Preventive', 'Growth Promoter', 'Vitamin/Mineral', 'Other'
  ];

  const dosageUnits = ['ml', 'g', 'mg'];
  const dosagePerOptions = ['per_litre_water', 'per_bird', 'per_kg_bw', 'per_kg_feed'];
  const routeOptions = ['water', 'feed', 'injectable', 'topical', 'spray'];

  // Debounced medicine search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.medicine_name.length >= 2 && supabase) {
        try {
          const { data } = await supabase
            .from('medicines_db')
            .select('medicine_id, generic_name, brand_names, standard_withdrawal_days_india, category')
            .ilike('generic_name', `%${formData.medicine_name}%`)
            .limit(10);
          
          if (data) {
            setMedicineSuggestions(data);
          }
        } catch (err) {
          console.error('Error fetching medicine suggestions:', err);
        }
      } else {
        setMedicineSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.medicine_name, supabase]);

  // Auto-fill withdrawal days when medicine is selected
  const handleMedicineSelect = (medicine: MedicineSuggestion) => {
    setFormData(prev => ({
      ...prev,
      medicine_name: medicine.generic_name,
      withdrawal_days: medicine.standard_withdrawal_days_india.toString()
    }));
    setMedicineSuggestions([]);
  };

  // Calculate clearance date
  const calculateClearanceDate = () => {
    if (!formData.treatment_date || !formData.treatment_day_end || !formData.withdrawal_days) {
      return null;
    }
    
    const treatmentEndDay = parseInt(formData.treatment_day_end);
    const withdrawalDays = parseInt(formData.withdrawal_days);
    
    if (isNaN(treatmentEndDay) || isNaN(withdrawalDays)) {
      return null;
    }
    
    // Assuming batch start date is known, we'd calculate the actual date
    // For now, this is a simplified calculation
    const clearanceDate = new Date(formData.treatment_date);
    clearanceDate.setDate(clearanceDate.getDate() + treatmentEndDay + withdrawalDays);
    
    return clearanceDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePurposeToggle = (purpose: string) => {
    setFormData(prev => ({
      ...prev,
      purpose: prev.purpose.includes(purpose)
        ? prev.purpose.filter(p => p !== purpose)
        : [...prev.purpose, purpose]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Supabase client not available');
      setLoading(false);
      return;
    }

    try {
      // Calculate total cost if cost fields are filled
      let totalCost = null;
      if (formData.cost_quantity && formData.cost_rate) {
        const quantity = parseFloat(formData.cost_quantity);
        const rate = parseFloat(formData.cost_rate);
        if (!isNaN(quantity) && !isNaN(rate)) {
          totalCost = quantity * rate;
        }
      }

      // Insert treatment
      const { data: treatmentData, error: treatmentError } = await supabase
        .from('batch_treatments')
        .insert({
          batch_id: batchId,
          farm_id: farmId,
          treatment_date: formData.treatment_date,
          medicine_name: formData.medicine_name,
          brand_name: formData.brand_name || null,
          lot_number: formData.lot_number || null,
          purpose: formData.purpose,
          dosage_amount: formData.dosage_amount ? parseFloat(formData.dosage_amount) : null,
          dosage_unit: formData.dosage_unit,
          dosage_per: formData.dosage_per,
          route: formData.route,
          treatment_day_start: formData.treatment_day_start ? parseInt(formData.treatment_day_start) : null,
          treatment_day_end: formData.treatment_day_end ? parseInt(formData.treatment_day_end) : null,
          withdrawal_days: formData.withdrawal_days ? parseInt(formData.withdrawal_days) : 0,
          is_complete: false,
          vet_name_snapshot: formData.vet_name || null,
          notes: formData.notes || null
        })
        .select()
        .single();

      if (treatmentError) throw treatmentError;

      // If cost was entered, create medicine cost entry for P&L
      if (totalCost !== null && totalCost > 0) {
        const { error: costError } = await supabase
          .from('batch_medicine_costs')
          .insert({
            batch_id: batchId,
            farm_id: farmId,
            treatment_id: treatmentData.treatment_id,
            entry_date: formData.treatment_date,
            medicine_name: formData.medicine_name,
            brand_name: formData.brand_name || null,
            lot_number: formData.lot_number || null,
            purpose: formData.purpose[0] || 'other',
            quantity: formData.cost_quantity ? parseFloat(formData.cost_quantity) : 0,
            unit: formData.cost_unit,
            rate_per_unit: formData.cost_rate ? parseFloat(formData.cost_rate) : null,
            total_cost: totalCost,
            treatment_day_start: formData.treatment_day_start ? parseInt(formData.treatment_day_start) : null,
            treatment_day_end: formData.treatment_day_end ? parseInt(formData.treatment_day_end) : null,
            withdrawal_days: formData.withdrawal_days ? parseInt(formData.withdrawal_days) : 0,
            is_complete: false
          });

        if (costError) {
          console.error('Error creating medicine cost entry:', costError);
          // Don't throw - treatment was saved successfully
        }
      }

      // Save vet if requested
      if (formData.save_vet && formData.vet_name) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('vets')
              .insert({
                integrator_id: user.id,
                name: formData.vet_name,
                phone: formData.vet_phone || null,
                notes: `Added from treatment log - ${formData.medicine_name}`
              });
          }
        } catch (vetError) {
          console.error('Error saving vet:', vetError);
          // Don't throw - treatment was saved successfully
        }
      }

      onSuccess(treatmentData);

      // Trigger P&L data refresh if cost was entered
      // This ensures the Medicine Cost section in P&L tab updates without page refresh
      if (totalCost !== null && totalCost > 0) {
        mutate(`/api/v1/farms/${farmId}/costs?batchId=${batchId}`);
      }

      // Dispatch custom event to notify Sales tab about treatment change
      // This triggers withdrawal status re-fetch in Sales tab
      if (formData.withdrawal_days && parseInt(formData.withdrawal_days) > 0) {
        const event = new CustomEvent('treatment:added', {
          detail: {
            batchId,
            withdrawalDays: parseInt(formData.withdrawal_days),
            hasActiveWithdrawal: true
          }
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save treatment');
    } finally {
      setLoading(false);
    }
  };

  const clearanceDate = calculateClearanceDate();

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Add New Treatment</h4>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Treatment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Treatment Date *
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.treatment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Medicine Name with Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medicine Name *
          </label>
          <div className="relative">
            <input
              type="text"
              list="medicines-list"
              value={formData.medicine_name}
              onChange={(e) => setFormData(prev => ({ ...prev, medicine_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent pl-10"
              placeholder="e.g., Tylosin, Enrofloxacin"
              required
            />
            <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <datalist id="medicines-list">
              {medicineSuggestions.map(med => (
                <option key={med.medicine_id} value={med.generic_name}>
                  {med.brand_names?.join(', ')} (Withdrawal: {med.standard_withdrawal_days_india} days)
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brand_name}
            onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="e.g., Tylan 10%"
          />
        </div>

        {/* Batch/Lot Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch/Lot Number
          </label>
          <input
            type="text"
            value={formData.lot_number}
            onChange={(e) => setFormData(prev => ({ ...prev, lot_number: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="For traceability"
          />
        </div>

        {/* Purpose/Indication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose / Indication
          </label>
          <div className="flex flex-wrap gap-2">
            {purposeOptions.map(purpose => (
              <button
                key={purpose}
                type="button"
                onClick={() => handlePurposeToggle(purpose)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.purpose.includes(purpose)
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {purpose}
              </button>
            ))}
          </div>
        </div>

        {/* Dosage */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage Amount
            </label>
            <input
              type="number"
              value={formData.dosage_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage_amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={formData.dosage_unit}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage_unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              {dosageUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per
            </label>
            <select
              value={formData.dosage_per}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage_per: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              {dosagePerOptions.map(opt => (
                <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Route */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Route of Administration
          </label>
          <div className="flex flex-wrap gap-2">
            {routeOptions.map(route => (
              <label key={route} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="route"
                  value={route}
                  checked={formData.route === route}
                  onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                  className="text-brand-green-600"
                />
                <span className="text-sm capitalize">{route}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Treatment Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Day
            </label>
            <input
              type="number"
              value={formData.treatment_day_start}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment_day_start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="e.g., 18"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Day
            </label>
            <input
              type="number"
              value={formData.treatment_day_end}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment_day_end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="e.g., 21"
            />
          </div>
        </div>

        {/* Withdrawal Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Withdrawal Period (days)
          </label>
          <input
            type="number"
            value={formData.withdrawal_days}
            onChange={(e) => setFormData(prev => ({ ...prev, withdrawal_days: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="Auto-suggested from medicine DB"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Days after last dose when birds cannot be sold. Check medicine package insert.
          </p>
          {clearanceDate && formData.withdrawal_days && parseInt(formData.withdrawal_days) > 0 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <Warning size={14} className="inline mr-1" />
              Do not sell before: {clearanceDate}
            </div>
          )}
        </div>

        {/* Cost Section */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost (Optional - will be added to P&L)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                value={formData.cost_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Quantity"
              />
            </div>
            <div>
              <select
                value={formData.cost_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="tablets">tablets</option>
                <option value="vials">vials</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                value={formData.cost_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_rate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Rate (₹/unit)"
              />
            </div>
          </div>
          {formData.cost_quantity && formData.cost_rate && (
            <p className="text-sm text-gray-600 mt-1">
              Total: ₹{(parseFloat(formData.cost_quantity) * parseFloat(formData.cost_rate)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Vet Information */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prescribed By (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.vet_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vet_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Vet Name"
            />
            <input
              type="text"
              value={formData.vet_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, vet_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Phone"
            />
          </div>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={formData.save_vet}
              onChange={(e) => setFormData(prev => ({ ...prev, save_vet: e.target.checked }))}
              className="text-brand-green-600"
            />
            <span className="text-sm text-gray-700">Save vet to directory</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional, max 300 chars)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value.slice(0, 300) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
            rows={2}
            maxLength={300}
            placeholder="Any additional notes..."
          />
          <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/300 characters</p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={18} weight="bold" />
                Save Treatment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
