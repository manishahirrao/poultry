'use client';

/**
 * Cost Configuration Tab
 * Allows users to configure cost rates per farm/region for Batch P&L calculations
 * Issue Reference: ISSUE-015 - Batch P&L Hardcoded Cost Rates
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check, X, Plus, Trash } from '@phosphor-icons/react';

interface CostConfig {
  id?: string;
  farm_id?: string;
  farm_name?: string;
  doc_price: number;
  feed_price_per_kg: number;
  medicine_cost_per_unit: number;
  vaccine_cost_per_unit: number;
  labor_rate_per_day: number;
  electricity_rate_per_day: number;
  overhead_rate_per_day: number;
  is_default: boolean;
  effective_from: string;
  effective_until?: string;
}

interface Farm {
  id: string;
  name: string;
}

interface CostConfigTabProps {
  customer: any;
}

export function CostConfigTab({ customer }: CostConfigTabProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [costConfigs, setCostConfigs] = useState<CostConfig[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [editingConfig, setEditingConfig] = useState<CostConfig | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFarms();
    fetchCostConfigs();
  }, [customer]);

  const fetchFarms = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('farms')
        .select('id, name')
        .eq('integrator_id', customer?.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      setMessage({ type: 'error', text: 'Failed to load farms' });
    }
  };

  const fetchCostConfigs = async () => {
    try {
      setLoading(true);
      if (!supabase) return;
      const { data, error } = await supabase
        .from('farm_cost_config')
        .select(`
          *,
          farms!inner (
            name
          )
        `)
        .eq('integrator_id', customer?.id)
        .filter('deleted_at', 'is', null)
        .order('effective_from', { ascending: false });

      if (error) throw error;
      
      const configs = (data || []).map((config: any) => ({
        ...config,
        farm_name: config.farms?.name
      }));
      setCostConfigs(configs);
    } catch (error) {
      console.error('Error fetching cost configs:', error);
      setMessage({ type: 'error', text: 'Failed to load cost configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (config: CostConfig) => {
    try {
      setSaving(true);
      setMessage(null);

      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const configData = {
        farm_id: config.is_default ? null : selectedFarmId,
        integrator_id: customer?.id,
        doc_price: config.doc_price,
        feed_price_per_kg: config.feed_price_per_kg,
        medicine_cost_per_unit: config.medicine_cost_per_unit,
        vaccine_cost_per_unit: config.vaccine_cost_per_unit,
        labor_rate_per_day: config.labor_rate_per_day,
        electricity_rate_per_day: config.electricity_rate_per_day,
        overhead_rate_per_day: config.overhead_rate_per_day,
        is_default: config.is_default,
        effective_from: config.effective_from,
        effective_until: config.effective_until || null
      };

      let error;
      if (config.id) {
        // Update existing config
        const { error: updateError } = await supabase
          .from('farm_cost_config')
          .update(configData)
          .eq('id', config.id);
        error = updateError;
      } else {
        // Create new config
        const { error: insertError } = await supabase
          .from('farm_cost_config')
          .insert([configData]);
        error = insertError;
      }

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cost configuration saved successfully' });
      setEditingConfig(null);
      setSelectedFarmId('');
      fetchCostConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Failed to save cost configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost configuration?')) return;

    try {
      setSaving(true);
      if (!supabase) {
        throw new Error('Supabase not configured');
      }
      const { error } = await supabase
        .from('farm_cost_config')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cost configuration deleted successfully' });
      fetchCostConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      setMessage({ type: 'error', text: 'Failed to delete cost configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditConfig = (config: CostConfig) => {
    setEditingConfig({
      ...config,
      effective_from: config.effective_from?.split('T')[0] || '',
      effective_until: config.effective_until?.split('T')[0] || ''
    });
    setSelectedFarmId(config.farm_id || '');
  };

  const handleCreateNew = () => {
    setEditingConfig({
      doc_price: 42,
      feed_price_per_kg: 25,
      medicine_cost_per_unit: 100,
      vaccine_cost_per_unit: 50,
      labor_rate_per_day: 800,
      electricity_rate_per_day: 200,
      overhead_rate_per_day: 300,
      is_default: false,
      effective_from: new Date().toISOString().split('T')[0]
    });
    setSelectedFarmId('');
  };

  const handleCreateDefault = () => {
    setEditingConfig({
      doc_price: 42,
      feed_price_per_kg: 25,
      medicine_cost_per_unit: 100,
      vaccine_cost_per_unit: 50,
      labor_rate_per_day: 800,
      electricity_rate_per_day: 200,
      overhead_rate_per_day: 300,
      is_default: true,
      effective_from: new Date().toISOString().split('T')[0]
    });
    setSelectedFarmId('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Cost Configuration</h2>
          <p className="text-base text-neutral-600 mt-2 max-w-2xl">
            Configure cost rates per farm or set default rates for all farms. These rates are used in Batch P&L calculations.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateDefault}
            className="inline-flex items-center px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} className="mr-2" weight="bold" />
            Default Config
          </button>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2.5 bg-brandOrange700 hover:bg-brandOrange600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} className="mr-2" weight="bold" />
            Farm Config
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-brandGreen50 text-brandGreen800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <Check size={20} weight="bold" /> : <X size={20} weight="bold" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Edit Form */}
      {editingConfig && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 tracking-tight">
              {editingConfig.id ? 'Edit Cost Configuration' : 'New Cost Configuration'}
            </h3>
            {editingConfig.is_default && (
              <span className="px-3 py-1 bg-brandGreen50 text-brandGreen800 text-xs font-semibold rounded-full uppercase tracking-wide">
                Default
              </span>
            )}
          </div>
          
          <div className="space-y-6">
            {!editingConfig.is_default && (
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Farm
                </label>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                  required
                >
                  <option value="">Select a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  DOC Price (₹/bird)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.doc_price}
                  onChange={(e) => setEditingConfig({ ...editingConfig, doc_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Feed Price (₹/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.feed_price_per_kg}
                  onChange={(e) => setEditingConfig({ ...editingConfig, feed_price_per_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Medicine Cost (₹/unit)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.medicine_cost_per_unit}
                  onChange={(e) => setEditingConfig({ ...editingConfig, medicine_cost_per_unit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Vaccine Cost (₹/unit)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.vaccine_cost_per_unit}
                  onChange={(e) => setEditingConfig({ ...editingConfig, vaccine_cost_per_unit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Labor Rate (₹/day)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.labor_rate_per_day}
                  onChange={(e) => setEditingConfig({ ...editingConfig, labor_rate_per_day: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Electricity Rate (₹/day)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.electricity_rate_per_day}
                  onChange={(e) => setEditingConfig({ ...editingConfig, electricity_rate_per_day: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Overhead Rate (₹/day)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingConfig.overhead_rate_per_day}
                  onChange={(e) => setEditingConfig({ ...editingConfig, overhead_rate_per_day: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  value={editingConfig.effective_from}
                  onChange={(e) => setEditingConfig({ ...editingConfig, effective_from: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Effective Until (optional)
                </label>
                <input
                  type="date"
                  value={editingConfig.effective_until || ''}
                  onChange={(e) => setEditingConfig({ ...editingConfig, effective_until: e.target.value || undefined })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandOrange700 focus:border-brandOrange700 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-neutral-200">
              <button
                onClick={() => handleSaveConfig(editingConfig)}
                disabled={saving || (!editingConfig.is_default && !selectedFarmId)}
                className="inline-flex items-center px-6 py-3 bg-brandOrange700 hover:bg-brandOrange600 disabled:bg-neutral-300 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                onClick={() => {
                  setEditingConfig(null);
                  setSelectedFarmId('');
                }}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">Existing Configurations</h3>
        </div>
        
        {costConfigs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium">No cost configurations found</p>
            <p className="text-sm text-neutral-500 mt-1">Create a configuration to get started with farm-specific cost rates</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {costConfigs.map((config) => (
              <div key={config.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-neutral-900 text-base">
                        {config.is_default ? 'Default Configuration' : config.farm_name}
                      </span>
                      {config.is_default && (
                        <span className="px-2.5 py-1 bg-brandGreen50 text-brandGreen800 text-xs font-semibold rounded-full uppercase tracking-wide">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500 block text-xs mb-1">DOC Price</span>
                        <span className="font-medium text-neutral-900">₹{config.doc_price}/bird</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-xs mb-1">Feed Price</span>
                        <span className="font-medium text-neutral-900">₹{config.feed_price_per_kg}/kg</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-xs mb-1">Labor Rate</span>
                        <span className="font-medium text-neutral-900">₹{config.labor_rate_per_day}/day</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-xs mb-1">Effective From</span>
                        <span className="font-medium text-neutral-900">{config.effective_from?.split('T')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:mt-0">
                    <button
                      onClick={() => handleEditConfig(config)}
                      className="inline-flex items-center px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => config.id && handleDeleteConfig(config.id)}
                      className="inline-flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
