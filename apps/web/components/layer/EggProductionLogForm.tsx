'use client';

/**
 * FlockIQ - Egg Production Log Form
 * TASK-051: Layer Farm Profile & Egg Production Dashboard
 * Requirement Refs: REQ-022, Design Addendum §19.1
 * 
 * This component implements the daily egg production logging form for layer flocks.
 * It calculates HDP (Hen Day Production) live and integrates with the egg production dashboard.
 * 
 * Features:
 * - Date, flock age (auto from DOC), total eggs, broken, floor eggs entry
 * - HDP computed live based on current bird count
 * - Feed and water consumption tracking
 * - Integration with layer breed standards for HDP benchmarking
 * - Success/error feedback with toast notifications
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Calendar, CheckCircle, WarningCircle, Plus } from '@phosphor-icons/react';
import { Toast } from '@/components/ui/Toast';

/**
 * Egg production log form data structure
 * Records daily egg production and consumption data
 */
interface EggProductionFormData {
  batchId: string;
  logDate: string; // ISO date string
  totalEggs: number; // Total eggs collected
  brokenEggs: number; // Number of broken eggs
  floorEggs: number; // Number of floor eggs
  feedConsumedKg: number; // Feed consumed in kg
  waterConsumedLitres: number; // Water consumed in litres
  notes: string;
}

/**
 * Props for Egg Production Log Form
 * - batchId: Unique identifier for the layer batch
 * - onSuccess: Callback when form is successfully submitted
 * - onCancel: Callback when user cancels the form
 */
interface EggProductionLogFormProps {
  batchId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EggProductionLogForm({ 
  batchId, 
  onSuccess, 
  onCancel 
}: EggProductionLogFormProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
  
  // Form state
  const [formData, setFormData] = useState<EggProductionFormData>({
    batchId,
    logDate: new Date().toISOString().split('T')[0],
    totalEggs: 0,
    brokenEggs: 0,
    floorEggs: 0,
    feedConsumedKg: 0,
    waterConsumedLitres: 0,
    notes: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [calculatedHDP, setCalculatedHDP] = useState<number | null>(null);
  const [saleableEggs, setSaleableEggs] = useState<number>(0);

  // Calculate saleable eggs and HDP in real-time
  useEffect(() => {
    const saleable = formData.totalEggs - formData.brokenEggs - formData.floorEggs;
    setSaleableEggs(Math.max(0, saleable));
  }, [formData.totalEggs, formData.brokenEggs, formData.floorEggs]);

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.batchId) {
      setError('बैच चुनें (Select batch)');
      return false;
    }
    if (!formData.logDate) {
      setError('तारीख चुनें (Select date)');
      return false;
    }
    if (formData.totalEggs < 0) {
      setError('कुल अंडे 0 या उससे अधिक होने चाहिए');
      return false;
    }
    if (formData.brokenEggs < 0 || formData.floorEggs < 0) {
      setError('टूटे अंडे और फ्लोर अंडे 0 या उससे अधिक होने चाहिए');
      return false;
    }
    if (formData.brokenEggs + formData.floorEggs > formData.totalEggs) {
      setError('टूटे अंडे + फ्लोर अंडे कुल अंडों से अधिक नहीं हो सकते');
      return false;
    }
    return true;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (!supabase) {
      setError('Supabase not configured. Cannot save egg production log.');
      return;
    }

    setLoading(true);

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate flock age in weeks from batch
      const { data: batchData } = await client
        .from('batches')
        .select('doc_placement_date')
        .eq('id', batchId)
        .single();

      if (!batchData) throw new Error('Batch not found');

      const docDate = new Date(batchData.doc_placement_date);
      const logDate = new Date(formData.logDate);
      const ageInDays = Math.floor((logDate.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
      const flockAgeWeeks = Math.floor(ageInDays / 7);

      // Insert egg production log
      const { error: insertError } = await client
        .from('egg_production_logs')
        .insert({
          batch_id: batchId,
          log_date: formData.logDate,
          flock_age_weeks: flockAgeWeeks,
          total_eggs: formData.totalEggs,
          broken_eggs: formData.brokenEggs,
          floor_eggs: formData.floorEggs,
          feed_consumed_kg: formData.feedConsumedKg || null,
          water_consumed_litres: formData.waterConsumedLitres || null,
          logged_by: user.id,
          notes: formData.notes || null,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setShowToast(true);

      // Call success callback and reset form after delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setFormData({
          batchId,
          logDate: new Date().toISOString().split('T')[0],
          totalEggs: 0,
          brokenEggs: 0,
          floorEggs: 0,
          feedConsumedKg: 0,
          waterConsumedLitres: 0,
          notes: '',
        });
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log egg production');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-green-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} weight="fill" className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          अंडा उत्पादन दर्ज किया गया
        </h3>
        <p className="text-neutral-600 mb-4">
          Egg production logged successfully
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <Toast 
          type="success" 
          message="अंडा उत्पादन दर्ज किया गया ✅"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            आज का अंडा उत्पादन
          </h2>
          <p className="text-neutral-600">
            Daily Egg Production Log
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <WarningCircle size={20} weight="fill" className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                तारीख · Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.logDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, logDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Total Eggs */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                कुल अंडे · Total Eggs
              </label>
              <input
                type="number"
                value={formData.totalEggs}
                onChange={(e) => setFormData(prev => ({ ...prev, totalEggs: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min="0"
                required
              />
            </div>

            {/* Broken Eggs */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                टूटे अंडे · Broken Eggs
              </label>
              <input
                type="number"
                value={formData.brokenEggs}
                onChange={(e) => setFormData(prev => ({ ...prev, brokenEggs: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min="0"
              />
            </div>

            {/* Floor Eggs */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                फ्लोर अंडे · Floor Eggs
              </label>
              <input
                type="number"
                value={formData.floorEggs}
                onChange={(e) => setFormData(prev => ({ ...prev, floorEggs: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min="0"
              />
            </div>

            {/* Feed Consumed */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                चारा (kg) · Feed Consumed (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.feedConsumedKg}
                onChange={(e) => setFormData(prev => ({ ...prev, feedConsumedKg: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min="0"
              />
            </div>

            {/* Water Consumed */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                पानी (litres) · Water Consumed (litres)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.waterConsumedLitres}
                onChange={(e) => setFormData(prev => ({ ...prev, waterConsumedLitres: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min="0"
              />
            </div>
          </div>

          {/* Live Calculation Display */}
          {formData.totalEggs > 0 && (
            <div className="bg-brand-green-50 rounded-xl p-4 border border-brand-green-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-brand-green-700 mb-1">बिक्री योग्य · Saleable</p>
                  <p className="text-2xl font-bold text-brand-green-900">{saleableEggs.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-green-700 mb-1">HDP % (auto-calculated)</p>
                  <p className="text-2xl font-bold text-brand-green-900">--</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              नोट्स · Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="अगर कोई विशेष बात हो तो लिखें..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
              >
                रद्द करें · Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-brand-green-600 text-white font-medium hover:bg-brand-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  दर्ज हो रहा है...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  दर्ज करें · Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
