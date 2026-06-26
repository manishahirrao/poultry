'use client';

import { useState, useEffect } from 'react';
import { PencilSimple, Check, X } from '@phosphor-icons/react';

interface ChickCostData {
  cost_id?: string;
  doc_supplier: string;
  breed: string;
  date_placed: string;
  birds_placed: number;
  price_per_doc: number;
  transport_cost: number;
  total_cost: number;
}

interface BatchData {
  breed: string;
  placement_date: string;
  birds_placed: number;
  current_day: number;
}

interface ChickCostSectionProps {
  farmId: string;
  batchId: string;
  initialData?: ChickCostData;
  batchData?: BatchData;
  onSave?: (data: ChickCostData) => void;
}

export function ChickCostSection({ farmId, batchId, initialData, batchData, onSave }: ChickCostSectionProps) {
  const [isEditing, setIsEditing] = useState(!initialData);
  const [formData, setFormData] = useState<ChickCostData>(
    initialData || {
      doc_supplier: '',
      breed: batchData?.breed || '',
      date_placed: batchData?.placement_date || '',
      birds_placed: batchData?.birds_placed || 0,
      price_per_doc: 0,
      transport_cost: 0,
      total_cost: 0,
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (formData.birds_placed * formData.price_per_doc) + formData.transport_cost;

  const handleSave = async () => {
    if (!formData.doc_supplier || formData.price_per_doc <= 0) {
      setError('DOC Supplier and Price per DOC are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        total_cost: totalCost,
        category: 'chick',
        batch_id: batchId,
        farm_id: farmId,
      };

      const url = initialData?.cost_id
        ? `/api/farms/${farmId}/costs/${initialData.cost_id}`
        : `/api/farms/${farmId}/costs`;

      const response = await fetch(url, {
        method: initialData?.cost_id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save chick cost');
      }

      const savedData = await response.json();
      setFormData({ ...formData, cost_id: savedData.cost_id || initialData?.cost_id });
      setIsEditing(false);
      onSave?.({ ...formData, total_cost: totalCost, cost_id: savedData.cost_id || initialData?.cost_id });
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
      setIsEditing(false);
    } else {
      setFormData({
        doc_supplier: '',
        breed: batchData?.breed || '',
        date_placed: batchData?.placement_date || '',
        birds_placed: batchData?.birds_placed || 0,
        price_per_doc: 0,
        transport_cost: 0,
        total_cost: 0,
      });
    }
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  if (!isEditing && initialData) {
    // Summary Card View
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-900">Chick Procurement Cost</h4>
          <button
            onClick={handleEdit}
            className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
          >
            <PencilSimple size={16} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-600">DOC Supplier</p>
            <p className="font-medium text-gray-900">{formData.doc_supplier}</p>
          </div>
          <div>
            <p className="text-gray-600">Breed</p>
            <p className="font-medium text-gray-900">{formData.breed}</p>
          </div>
          <div>
            <p className="text-gray-600">Date Placed</p>
            <p className="font-medium text-gray-900">
              {new Date(formData.date_placed).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Birds Placed</p>
            <p className="font-medium text-gray-900">{formData.birds_placed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Price per DOC</p>
            <p className="font-medium text-gray-900">₹{formData.price_per_doc.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Transport Cost</p>
            <p className="font-medium text-gray-900">₹{formData.transport_cost.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">TOTAL CHICK COST</span>
            <span className="text-lg font-bold text-gray-900">₹{totalCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">Cost per Bird</span>
            <span className="font-medium text-gray-900">
              ₹{(totalCost / formData.birds_placed).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Inline Form View
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit Chick Procurement Cost' : 'Enter Chick Procurement Cost'}
      </h4>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DOC Supplier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.doc_supplier}
            onChange={(e) => setFormData({ ...formData, doc_supplier: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
            placeholder="Enter supplier name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input
            type="text"
            value={formData.breed}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Placed</label>
          <input
            type="date"
            value={formData.date_placed}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Birds Placed</label>
          <input
            type="number"
            value={formData.birds_placed}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per DOC (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price_per_doc || ''}
            onChange={(e) => setFormData({ ...formData, price_per_doc: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
            placeholder="42.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transport Cost (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.transport_cost || ''}
            onChange={(e) => setFormData({ ...formData, transport_cost: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
            placeholder="3500"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Calculated Total:</span>
          <span className="font-semibold text-gray-900">₹{totalCost.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ({formData.birds_placed.toLocaleString()} birds × ₹{formData.price_per_doc.toFixed(2)} + ₹{formData.transport_cost.toLocaleString()})
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Check size={16} /> Save Chick Cost
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
  );
}
