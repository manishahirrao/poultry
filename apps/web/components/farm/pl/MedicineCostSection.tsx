'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check, Warning } from '@phosphor-icons/react';

interface MedicineCostRecord {
  med_cost_id?: string;
  entry_date: string;
  medicine_name: string;
  brand_name?: string;
  lot_number?: string;
  purpose: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
  total_cost: number;
  treatment_day_start?: number;
  treatment_day_end?: number;
  withdrawal_days: number;
  last_dose_date?: string;
  is_complete: boolean;
}

interface MedicineSuggestion {
  generic_name: string;
  brand_names: string[];
  standard_withdrawal_days_india: number;
}

interface MedicineCostSectionProps {
  medicineCosts: MedicineCostRecord[];
  farmId: string;
  batchId: string;
  batchDay?: number;
  onSave?: (data: MedicineCostRecord) => void;
  onDelete?: (id: string) => void;
}

export function MedicineCostSection({ medicineCosts, farmId, batchId, batchDay, onSave, onDelete }: MedicineCostSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<MedicineCostRecord>({
    entry_date: new Date().toISOString().split('T')[0],
    medicine_name: '',
    brand_name: '',
    lot_number: '',
    purpose: 'preventive',
    quantity: 0,
    unit: 'ml',
    rate_per_unit: 0,
    total_cost: 0,
    withdrawal_days: 0,
    is_complete: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicineSuggestions, setMedicineSuggestions] = useState<MedicineSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const totalCost = medicineCosts.reduce((sum, record) => sum + record.total_cost, 0);

  // Calculate clearance date
  const getClearanceDate = (lastDoseDate?: string, withdrawalDays?: number): string | null => {
    if (!lastDoseDate || !withdrawalDays || withdrawalDays === 0) return null;
    const date = new Date(lastDoseDate);
    date.setDate(date.getDate() + withdrawalDays);
    return date.toISOString().split('T')[0];
  };

  // Check if withdrawal period is active
  const isWithdrawalActive = (record: MedicineCostRecord): boolean => {
    if (record.withdrawal_days === 0 || !record.last_dose_date) return false;
    const clearanceDate = getClearanceDate(record.last_dose_date, record.withdrawal_days);
    if (!clearanceDate) return false;
    return new Date(clearanceDate) > new Date();
  };

  // Fetch medicine suggestions
  const fetchMedicineSuggestions = async (query: string) => {
    if (query.length < 2) {
      setMedicineSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/medicines?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setMedicineSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Failed to fetch medicine suggestions:', err);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.medicine_name) {
        fetchMedicineSuggestions(formData.medicine_name);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.medicine_name]);

  const handleMedicineSelect = (suggestion: MedicineSuggestion) => {
    setFormData({
      ...formData,
      medicine_name: suggestion.generic_name,
      brand_name: suggestion.brand_names[0] || '',
      withdrawal_days: suggestion.standard_withdrawal_days_india,
    });
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!formData.medicine_name || formData.quantity <= 0) {
      setError('Medicine name and quantity are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        total_cost: formData.quantity * formData.rate_per_unit,
        batch_id: batchId,
        farm_id: farmId,
      };

      const response = await fetch(`/api/farms/${farmId}/medicine-costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save medicine cost');
      }

      const savedData = await response.json();
      onSave?.({ ...formData, total_cost: formData.quantity * formData.rate_per_unit, med_cost_id: savedData.med_cost_id });
      
      // Reset form
      setFormData({
        entry_date: new Date().toISOString().split('T')[0],
        medicine_name: '',
        brand_name: '',
        lot_number: '',
        purpose: 'preventive',
        quantity: 0,
        unit: 'ml',
        rate_per_unit: 0,
        total_cost: 0,
        withdrawal_days: 0,
        is_complete: false,
      });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine entry?')) return;

    try {
      const response = await fetch(`/api/farms/${farmId}/medicine-costs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete medicine cost');
      }

      onDelete?.(id);
    } catch (err) {
      setError('Failed to delete. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFormData({
      entry_date: new Date().toISOString().split('T')[0],
      medicine_name: '',
      brand_name: '',
      lot_number: '',
      purpose: 'preventive',
      quantity: 0,
      unit: 'ml',
      rate_per_unit: 0,
      total_cost: 0,
      withdrawal_days: 0,
      is_complete: false,
    });
    setShowAddForm(false);
    setError(null);
    setShowSuggestions(false);
  };

  // Check if any withdrawal period is active
  const hasActiveWithdrawal = medicineCosts.some(record => isWithdrawalActive(record));

  return (
    <div className="space-y-4">
      {/* Withdrawal Alert */}
      {hasActiveWithdrawal && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
          <div className="flex items-start gap-3">
            <Warning className="text-orange-500 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-orange-800">⚠ WITHDRAWAL PERIOD ACTIVE</p>
              <p className="text-sm text-orange-700 mt-1">
                {medicineCosts.filter(r => isWithdrawalActive(r)).map(r => (
                  <span key={r.med_cost_id}>
                    {r.medicine_name} — Earliest safe harvest: {getClearanceDate(r.last_dose_date, r.withdrawal_days)}
                  </span>
                )).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Cost Table */}
      {medicineCosts.length === 0 ? (
        <p className="text-sm text-gray-600 italic">No medicine entries recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Medicine</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Brand</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Purpose</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Qty</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Cost</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Withdrawal</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Status</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {medicineCosts.map((record) => {
                const clearanceDate = getClearanceDate(record.last_dose_date, record.withdrawal_days);
                const isActive = isWithdrawalActive(record);
                
                return (
                  <tr key={record.med_cost_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{new Date(record.entry_date).toLocaleDateString()}</td>
                    <td className="py-2 px-3 font-medium">{record.medicine_name}</td>
                    <td className="py-2 px-3 text-gray-600">{record.brand_name || '-'}</td>
                    <td className="py-2 px-3 capitalize">{record.purpose}</td>
                    <td className="py-2 px-3">
                      {record.quantity} {record.unit}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">₹{record.total_cost.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">
                      {record.withdrawal_days > 0 ? (
                        <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {record.withdrawal_days} days
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {record.is_complete ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Complete</span>
                      ) : isActive ? (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Withdrawal</span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => record.med_cost_id && handleDelete(record.med_cost_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Total Medicine Cost */}
      {medicineCosts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total medicine & vaccine cost this batch:</span>
            <span className="font-semibold text-gray-900">₹{totalCost.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Add Medicine Entry Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
        >
          <Plus size={16} /> Add Medicine Entry
        </button>
      )}

      {/* Add Medicine Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Add Medicine Entry</h4>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.medicine_name}
                onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                onFocus={() => formData.medicine_name && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="Start typing for autocomplete..."
              />
              {showSuggestions && medicineSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {medicineSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.generic_name}
                      type="button"
                      onClick={() => handleMedicineSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{suggestion.generic_name}</div>
                      <div className="text-xs text-gray-500">{suggestion.brand_names.join(', ')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch/Lot Number</label>
              <input
                type="text"
                value={formData.lot_number}
                onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="preventive">Preventive</option>
                <option value="therapeutic">Therapeutic</option>
                <option value="vaccination">Vaccination</option>
                <option value="vitamin">Vitamin</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="tablets">tablets</option>
                <option value="vials">vials</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹/unit)</label>
              <input
                type="number"
                step="0.01"
                value={formData.rate_per_unit || ''}
                onChange={(e) => setFormData({ ...formData, rate_per_unit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="180"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Period (days)</label>
              <input
                type="number"
                value={formData.withdrawal_days || ''}
                onChange={(e) => setFormData({ ...formData, withdrawal_days: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="Auto-suggested from DB"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Duration</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={formData.treatment_day_start || ''}
                    onChange={(e) => setFormData({ ...formData, treatment_day_start: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                    placeholder="Day X"
                  />
                </div>
                <span className="self-center text-gray-500">to</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={formData.treatment_day_end || ''}
                    onChange={(e) => setFormData({ ...formData, treatment_day_end: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                    placeholder="Day Y"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_complete}
                  onChange={(e) => setFormData({ ...formData, is_complete: e.target.checked })}
                  className="rounded border-gray-300 text-green-700 focus:ring-green-700"
                />
                <span className="text-sm text-gray-700">Mark as Completed</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-md p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-semibold text-gray-900">₹{(formData.quantity * formData.rate_per_unit).toLocaleString()}</span>
            </div>
            {formData.withdrawal_days > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠ Do not sell before: {getClearanceDate(formData.entry_date, formData.withdrawal_days)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check size={16} /> Save Entry
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
