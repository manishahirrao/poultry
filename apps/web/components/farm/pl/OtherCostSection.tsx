'use client';

import { useState } from 'react';
import { Plus, X, Check } from '@phosphor-icons/react';

interface OtherCostRecord {
  cost_id?: string;
  description: string;
  amount: number;
  entry_date: string;
  notes?: string;
  category?: string;
  batch_id?: string;
  farm_id?: string;
}

interface OtherCostSectionProps {
  farmId: string;
  batchId: string;
  initialData?: OtherCostRecord[];
  onSave?: (data: OtherCostRecord) => void;
  onDelete?: (id: string) => void;
}

export function OtherCostSection({ farmId, batchId, initialData = [], onSave, onDelete }: OtherCostSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<OtherCostRecord>({
    description: '',
    amount: 0,
    entry_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherCosts, setOtherCosts] = useState<OtherCostRecord[]>(initialData);

  const totalOtherCost = otherCosts.reduce((sum, record) => sum + record.amount, 0);

  const handleSave = async () => {
    if (!formData.description || formData.amount <= 0) {
      setError('Description and amount are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: OtherCostRecord = {
        ...formData,
        category: 'other',
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
        throw new Error('Failed to save other cost');
      }

      const savedData = await response.json();
      const newRecord = { ...formData, cost_id: savedData.cost_id };
      setOtherCosts([...otherCosts, newRecord]);
      onSave?.(newRecord);
      
      // Reset form
      setFormData({
        description: '',
        amount: 0,
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
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/farms/${farmId}/costs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete other cost');
      }

      setOtherCosts(otherCosts.filter(record => record.cost_id !== id));
      onDelete?.(id);
    } catch (err) {
      setError('Failed to delete. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFormData({
      description: '',
      amount: 0,
      entry_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAddForm(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Other Cost Entries Table */}
      {otherCosts.length === 0 && !showAddForm ? (
        <p className="text-sm text-gray-500 italic">No other costs recorded yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Description</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Notes</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Amount</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {otherCosts.map((record) => (
                <tr key={record.cost_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">{new Date(record.entry_date).toLocaleDateString()}</td>
                  <td className="py-2 px-3">{record.description}</td>
                  <td className="py-2 px-3 text-gray-600">{record.notes || '-'}</td>
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
          <Plus size={16} /> Add Entry
        </button>
      )}

      {/* Add Other Cost Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Add Other Cost Entry</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="e.g., Miscellaneous expense"
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
                placeholder="500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="Optional notes (max 300 chars)"
                rows={2}
                maxLength={300}
              />
            </div>
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

      {/* Total Other Cost */}
      {otherCosts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total other costs:</span>
            <span className="font-semibold text-gray-900">₹{totalOtherCost.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
