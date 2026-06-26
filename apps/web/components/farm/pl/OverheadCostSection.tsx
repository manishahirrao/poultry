'use client';

import { useState } from 'react';
import { Plus, X, Check } from '@phosphor-icons/react';

interface OverheadCostRecord {
  cost_id?: string;
  category: string;
  description: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'monthly';
  batch_share_pct: number;
  entry_date: string;
  notes?: string;
  batch_id?: string;
  farm_id?: string;
}

interface BatchData {
  current_day: number;
  target_days: number;
}

interface OverheadCostSectionProps {
  farmId: string;
  batchId: string;
  initialData?: OverheadCostRecord[];
  batchData?: BatchData;
  onSave?: (data: OverheadCostRecord) => void;
  onDelete?: (id: string) => void;
}

const OVERHEAD_CATEGORIES = [
  'Electricity',
  'Water',
  'Litter/Bedding',
  'Fuel',
  'Repairs',
  'Insurance',
  'Depreciation',
  'Other',
];

export function OverheadCostSection({ farmId, batchId, initialData = [], batchData, onSave, onDelete }: OverheadCostSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<OverheadCostRecord>({
    category: '',
    description: '',
    amount: 0,
    frequency: 'once',
    batch_share_pct: 100,
    entry_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overheadCosts, setOverheadCosts] = useState<OverheadCostRecord[]>(initialData);

  const batchDays = batchData?.current_day || batchData?.target_days || 42;
  const totalOverheadCost = overheadCosts.reduce((sum, record) => sum + record.amount, 0);

  const calculateBatchShare = (amount: number, frequency: string): number => {
    if (frequency === 'once') {
      return amount;
    } else if (frequency === 'monthly') {
      return amount * (batchDays / 30);
    } else if (frequency === 'weekly') {
      return amount * (batchDays / 7);
    }
    return amount;
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setShowAddForm(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.description || formData.amount <= 0) {
      setError('Category, description, and amount are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const batchShareAmount = calculateBatchShare(formData.amount, formData.frequency);
      
      const payload: OverheadCostRecord = {
        ...formData,
        amount: batchShareAmount,
        batch_id: batchId,
        farm_id: farmId,
      };

      const response = await fetch(`/api/farms/${farmId}/costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save overhead cost');
      }

      const savedData = await response.json();
      const newRecord = { ...formData, amount: batchShareAmount, cost_id: savedData.cost_id };
      setOverheadCosts([...overheadCosts, newRecord]);
      onSave?.(newRecord);
      
      // Reset form
      setFormData({
        category: '',
        description: '',
        amount: 0,
        frequency: 'once',
        batch_share_pct: 100,
        entry_date: new Date().toISOString().split('T')[0],
        notes: '',
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
    if (!confirm('Are you sure you want to delete this overhead entry?')) return;

    try {
      const response = await fetch(`/api/farms/${farmId}/costs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete overhead cost');
      }

      setOverheadCosts(overheadCosts.filter(record => record.cost_id !== id));
      onDelete?.(id);
    } catch (err) {
      setError('Failed to delete. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFormData({
      category: '',
      description: '',
      amount: 0,
      frequency: 'once',
      batch_share_pct: 100,
      entry_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAddForm(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {OVERHEAD_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              formData.category === category && showAddForm
                ? 'border-green-700 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-green-700 hover:text-green-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Overhead Entries Table */}
      {overheadCosts.length === 0 && !showAddForm ? (
        <p className="text-sm text-gray-500 italic">No overhead entries recorded yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Category</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Description</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Frequency</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Amount</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {overheadCosts.map((record) => (
                <tr key={record.cost_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">{new Date(record.entry_date).toLocaleDateString()}</td>
                  <td className="py-2 px-3 capitalize">{record.category}</td>
                  <td className="py-2 px-3">{record.description}</td>
                  <td className="py-2 px-3 capitalize">{record.frequency}</td>
                  <td className="py-2 px-3 text-right font-medium">₹{record.amount.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => record.cost_id && handleDelete(record.cost_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
        >
          <Plus size={16} /> Add Overhead Entry
        </button>
      )}

      {/* Add Overhead Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">
            {formData.category ? `Add ${formData.category} Entry` : 'Add Overhead Entry'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="">Select category</option>
                {OVERHEAD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="e.g., Monthly electricity bill"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="8500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'once' | 'weekly' | 'monthly' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="once">Once</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Share %</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.batch_share_pct}
                onChange={(e) => setFormData({ ...formData, batch_share_pct: parseFloat(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.frequency === 'monthly' 
                  ? `If monthly, FlockIQ calculates the portion attributable to this batch (${batchDays} days)`
                  : 'Percentage of this cost attributable to this batch'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="Optional notes"
              />
            </div>
          </div>

          {formData.amount > 0 && (
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Batch share calculation:</span>
                <span className="font-semibold text-gray-900">
                  ₹{formData.amount.toLocaleString()} × {formData.batch_share_pct}% = ₹{(formData.amount * formData.batch_share_pct / 100).toLocaleString()}
                </span>
              </div>
              {formData.frequency === 'monthly' && (
                <p className="text-xs text-gray-500 mt-1">
                  Monthly cost × (batch days / 30) = ₹{formData.amount.toLocaleString()} × ({batchDays} / 30) = ₹{(formData.amount * batchDays / 30).toLocaleString()}
                </p>
              )}
            </div>
          )}

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

      {/* Total Overhead */}
      {overheadCosts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total overhead:</span>
            <span className="font-semibold text-gray-900">₹{totalOverheadCost.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
