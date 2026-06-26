'use client';

/**
 * FlockIQ - Egg Grading Log Form
 * TASK-051: Layer Farm Profile & Egg Production Dashboard
 * Requirement Refs: REQ-022, Design Addendum §19.1
 * 
 * This component implements the egg grading log form for layer flocks.
 * It records daily egg grading by size (Large/Medium/Small/Cracked) according to breed standards.
 * 
 * Features:
 * - Egg grading log: Large/Medium/Small/Cracked counts per day entry
 * - Integration with layer breed standards grading thresholds
 * - Automatic calculation of total and saleable eggs
 * - Support for Lohmann Brown, HH-260, BV-300, Hy-Line Brown breeds
 * - Success/error feedback with toast notifications
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Calendar, CheckCircle, WarningCircle, Plus, Cube } from '@phosphor-icons/react';
import { Toast } from '@/components/ui/Toast';
import layerBreedStandards from '@/lib/data/layerBreedStandards.json';

/**
 * Egg grading log form data structure
 * Records daily egg grading by size category
 */
interface EggGradingFormData {
  batchId: string;
  logDate: string; // ISO date string
  largeCount: number; // Large eggs (≥63g per breed standards)
  mediumCount: number; // Medium eggs (56-62g per breed standards)
  smallCount: number; // Small eggs (49-55g per breed standards)
  crackedCount: number; // Cracked/damaged eggs
  notes: string;
}

/**
 * Props for Egg Grading Log Form
 * - batchId: Unique identifier for the layer batch
 * - onSuccess: Callback when form is successfully submitted
 * - onCancel: Callback when user cancels the form
 */
interface EggGradingLogFormProps {
  batchId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EggGradingLogForm({ 
  batchId, 
  onSuccess, 
  onCancel 
}: EggGradingLogFormProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
  
  // Form state
  const [formData, setFormData] = useState<EggGradingFormData>({
    batchId,
    logDate: new Date().toISOString().split('T')[0],
    largeCount: 0,
    mediumCount: 0,
    smallCount: 0,
    crackedCount: 0,
    notes: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [totalGraded, setTotalGraded] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState({
    large: 0,
    medium: 0,
    small: 0,
    cracked: 0,
  });

  // Calculate totals and distribution in real-time
  useEffect(() => {
    const total = formData.largeCount + formData.mediumCount + formData.smallCount + formData.crackedCount;
    setTotalGraded(total);
    
    if (total > 0) {
      setGradeDistribution({
        large: (formData.largeCount / total) * 100,
        medium: (formData.mediumCount / total) * 100,
        small: (formData.smallCount / total) * 100,
        cracked: (formData.crackedCount / total) * 100,
      });
    } else {
      setGradeDistribution({ large: 0, medium: 0, small: 0, cracked: 0 });
    }
  }, [formData.largeCount, formData.mediumCount, formData.smallCount, formData.crackedCount]);

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
    if (totalGraded === 0) {
      setError('कम से कम एक ग्रेड में अंडे दर्ज करें');
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
      setError('Supabase not configured. Cannot save egg grading log.');
      return;
    }

    setLoading(true);

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert egg grading log
      const { error: insertError } = await client
        .from('egg_grading_logs')
        .insert({
          batch_id: batchId,
          log_date: formData.logDate,
          large_count: formData.largeCount,
          medium_count: formData.mediumCount,
          small_count: formData.smallCount,
          cracked_count: formData.crackedCount,
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
          largeCount: 0,
          mediumCount: 0,
          smallCount: 0,
          crackedCount: 0,
          notes: '',
        });
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log egg grading');
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
          अंडा ग्रेडिंग दर्ज किया गया
        </h3>
        <p className="text-neutral-600 mb-4">
          Egg grading logged successfully
        </p>
      </motion.div>
    );
  }

  const gradingStandards = layerBreedStandards.grading_standards;

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <Toast 
          type="success" 
          message="अंडा ग्रेडिंग दर्ज किया गया ✅"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            अंडा ग्रेडिंग लॉग
          </h2>
          <p className="text-neutral-600">
            Egg Grading Log
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

          {/* Grading Standards Reference */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-sm font-medium text-neutral-700 mb-3">ग्रेडिंग मानक · Grading Standards</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <p className="font-semibold text-neutral-900">Large</p>
                <p className="text-neutral-500">{gradingStandards.large.min_weight_g}-{gradingStandards.large.max_weight_g}g</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <p className="font-semibold text-neutral-900">Medium</p>
                <p className="text-neutral-500">{gradingStandards.medium.min_weight_g}-{gradingStandards.medium.max_weight_g}g</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <p className="font-semibold text-neutral-900">Small</p>
                <p className="text-neutral-500">{gradingStandards.small.min_weight_g}-{gradingStandards.small.max_weight_g}g</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-neutral-200">
                <p className="font-semibold text-neutral-900">Cracked</p>
                <p className="text-neutral-500">{gradingStandards.cracked.description}</p>
              </div>
            </div>
          </div>

          {/* Grade Counts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Large */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <span className="text-green-600">●</span> Large
              </label>
              <input
                type="number"
                value={formData.largeCount}
                onChange={(e) => setFormData(prev => ({ ...prev, largeCount: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                min="0"
                placeholder="0"
              />
            </div>

            {/* Medium */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <span className="text-blue-600">●</span> Medium
              </label>
              <input
                type="number"
                value={formData.mediumCount}
                onChange={(e) => setFormData(prev => ({ ...prev, mediumCount: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                min="0"
                placeholder="0"
              />
            </div>

            {/* Small */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <span className="text-amber-600">●</span> Small
              </label>
              <input
                type="number"
                value={formData.smallCount}
                onChange={(e) => setFormData(prev => ({ ...prev, smallCount: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                min="0"
                placeholder="0"
              />
            </div>

            {/* Cracked */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <span className="text-red-600">●</span> Cracked
              </label>
              <input
                type="number"
                value={formData.crackedCount}
                onChange={(e) => setFormData(prev => ({ ...prev, crackedCount: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Live Calculation Display */}
          {totalGraded > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-green-50 rounded-xl p-4 border border-brand-green-200"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-brand-green-900">
                  कुल ग्रेड किए गए · Total Graded
                </p>
                <p className="text-2xl font-bold text-brand-green-900">{totalGraded.toLocaleString()}</p>
              </div>

              {/* Distribution Bars */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-16">Large</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gradeDistribution.large}%` }}
                      className="h-full bg-green-500"
                    />
                  </div>
                  <span className="text-xs text-neutral-600 w-12 text-right">{gradeDistribution.large.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-16">Medium</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gradeDistribution.medium}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <span className="text-xs text-neutral-600 w-12 text-right">{gradeDistribution.medium.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-16">Small</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gradeDistribution.small}%` }}
                      className="h-full bg-amber-500"
                    />
                  </div>
                  <span className="text-xs text-neutral-600 w-12 text-right">{gradeDistribution.small.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-16">Cracked</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gradeDistribution.cracked}%` }}
                      className="h-full bg-red-500"
                    />
                  </div>
                  <span className="text-xs text-neutral-600 w-12 text-right">{gradeDistribution.cracked.toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
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
