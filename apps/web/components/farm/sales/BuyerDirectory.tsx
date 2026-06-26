'use client';

/**
 * FlockIQ - Buyer/Trader Directory
 * TASK-GAP2-UI-006: Buyer/Trader Directory
 * Requirements: REQ-GAP2-SALES-006
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §2.4
 * 
 * This component implements a buyer directory for managing buyer/trader contacts:
 * - List view with avatar, name, phone, location, type, last purchase date, rating
 * - Add buyer form (inline)
 * - Buyer detail panel with purchase history
 * - Rating system (1-5 stars)
 * - Edit/View History/Delete actions
 */

import React, { useState, useEffect } from 'react';
import { Plus, DotsThreeVertical, Phone, MapPin, Star, PencilSimple, Trash, X } from '@phosphor-icons/react';

interface Buyer {
  buyer_id: string;
  name: string;
  phone: string;
  location?: string;
  buyer_type: 'trader' | 'processor' | 'cooperative' | 'direct' | 'other';
  notes?: string;
  rating?: number;
  last_purchase_date?: string;
  created_at: string;
}

interface BuyerDirectoryProps {
  farmId: string;
  integratorId: string;
}

export function BuyerDirectory({ farmId, integratorId }: BuyerDirectoryProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    location: string;
    buyer_type: 'trader' | 'processor' | 'cooperative' | 'direct' | 'other';
    notes: string;
    rating: number;
  }>({
    name: '',
    phone: '',
    location: '',
    buyer_type: 'trader',
    notes: '',
    rating: 0,
  });

  useEffect(() => {
    fetchBuyers();
  }, [farmId, integratorId]);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/farms/${farmId}/buyers`);
      if (response.ok) {
        const data = await response.json();
        setBuyers(data.buyers || []);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuyer = () => {
    setFormData({
      name: '',
      phone: '',
      location: '',
      buyer_type: 'trader',
      notes: '',
      rating: 0,
    });
    setEditingBuyer(null);
    setShowAddForm(true);
  };

  const handleEditBuyer = (buyer: Buyer) => {
    setFormData({
      name: buyer.name,
      phone: buyer.phone,
      location: buyer.location || '',
      buyer_type: buyer.buyer_type,
      notes: buyer.notes || '',
      rating: buyer.rating || 0,
    });
    setEditingBuyer(buyer);
    setShowAddForm(true);
  };

  const handleSaveBuyer = async () => {
    try {
      const url = editingBuyer
        ? `/api/farms/${farmId}/buyers/${editingBuyer.buyer_id}`
        : `/api/farms/${farmId}/buyers`;
      
      const method = editingBuyer ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddForm(false);
        fetchBuyers();
      }
    } catch (error) {
      console.error('Error saving buyer:', error);
      alert('Failed to save buyer. Please try again.');
    }
  };

  const handleDeleteBuyer = async (buyerId: string) => {
    if (!confirm('Are you sure you want to delete this buyer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/farms/${farmId}/buyers/${buyerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBuyers();
      }
    } catch (error) {
      console.error('Error deleting buyer:', error);
      alert('Failed to delete buyer. Please try again.');
    }
  };

  const handleViewHistory = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setShowDetailPanel(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400 text-sm">Not rated</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            weight={star <= rating ? 'fill' : 'regular'}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getBuyerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trader: 'Trader',
      processor: 'Processor',
      cooperative: 'Cooperative',
      direct: 'Direct',
      other: 'Other',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Buyers & Traders</h2>
        <button
          onClick={handleAddBuyer}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <Plus size={18} weight="bold" />
          Add Buyer
        </button>
      </div>

      {/* Add/Edit Buyer Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">
              {editingBuyer ? 'Edit Buyer' : 'Add New Buyer'}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Buyer name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location/Town
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="City or town"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.buyer_type}
                onChange={(e) => setFormData({ ...formData, buyer_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="trader">Trader</option>
                <option value="processor">Processor</option>
                <option value="cooperative">Cooperative</option>
                <option value="direct">Direct</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (payment habits, etc.)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Additional notes about this buyer"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBuyer}
              disabled={!formData.name || !formData.phone}
              className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
            </button>
          </div>
        </div>
      )}

      {/* Buyers List */}
      <div className="divide-y divide-gray-200">
        {buyers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">No buyers added yet</p>
            <button
              onClick={handleAddBuyer}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              <Plus size={18} weight="bold" />
              Add Your First Buyer
            </button>
          </div>
        ) : (
          buyers.map((buyer) => (
            <div key={buyer.buyer_id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-semibold text-lg">
                      {getInitials(buyer.name)}
                    </span>
                  </div>
                  
                  {/* Buyer Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900">{buyer.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {buyer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {buyer.phone}
                        </span>
                      )}
                      {buyer.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {buyer.location}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {getBuyerTypeLabel(buyer.buyer_type)}
                      </span>
                    </div>
                    {buyer.last_purchase_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last purchase: {new Date(buyer.last_purchase_date).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Rating and Actions */}
                <div className="flex items-center gap-4">
                  {renderStars(buyer.rating)}
                  
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                      <DotsThreeVertical size={20} className="text-gray-500" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                      <button
                        onClick={() => handleEditBuyer(buyer)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <PencilSimple size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewHistory(buyer)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Phone size={16} />
                        View History
                      </button>
                      <button
                        onClick={() => handleDeleteBuyer(buyer.buyer_id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buyer Detail Panel */}
      {showDetailPanel && selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{selectedBuyer.name}</h3>
              <button
                onClick={() => setShowDetailPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedBuyer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{selectedBuyer.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900">{getBuyerTypeLabel(selectedBuyer.buyer_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center gap-1">
                    {renderStars(selectedBuyer.rating)}
                  </div>
                </div>
              </div>
              
              {selectedBuyer.notes && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-900">{selectedBuyer.notes}</p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Purchase History</h4>
                <p className="text-sm text-gray-600">
                  Purchase history will be loaded from the API
                </p>
                {/* Placeholder for purchase history */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDirectory;
