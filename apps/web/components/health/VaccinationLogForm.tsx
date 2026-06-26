'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Calendar, Syringe, User, Package } from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import vaccinationProtocols from '@/lib/data/vaccinationProtocols.json';

interface VaccinationSchedule {
  id: string;
  vaccine_name: string;
  vaccine_type: string;
  scheduled_day: number;
  due_date: string;
  administered_date: string | null;
  brand: string | null;
  batch_number: string | null;
  dose_per_bird: string;
  route: string;
  administered_by: string | null;
  status: 'pending' | 'done' | 'overdue' | 'skipped';
  notes: string | null;
}

interface VaccinationLogFormProps {
  vaccination: VaccinationSchedule;
  batchId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VaccinationLogForm({ vaccination, batchId, onSuccess, onCancel }: VaccinationLogFormProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  const [formData, setFormData] = useState({
    administered_date: new Date().toISOString().split('T')[0],
    brand: '',
    batch_number: '',
    dose_per_bird: vaccination.dose_per_bird,
    route: vaccination.route,
    administered_by: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Supabase not configured. Cannot save vaccination log.');
      setLoading(false);
      return;
    }

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update vaccination schedule with log details
      const { error: updateError } = await client
        .from('vaccination_schedules')
        .update({
          administered_date: formData.administered_date,
          brand: formData.brand,
          batch_number: formData.batch_number,
          dose_per_bird: formData.dose_per_bird,
          route: formData.route,
          administered_by: formData.administered_by,
          notes: formData.notes,
          status: 'done'
        })
        .eq('id', vaccination.id);

      if (updateError) throw updateError;

      setSuccess(true);

      // Call success callback after delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log vaccination');
    } finally {
      setLoading(false);
    }
  };

  const getRouteLabel = (route: string) => {
    const routeObj = vaccinationProtocols.vaccine_routes.find((r: any) => r.value === route);
    return routeObj ? routeObj.label : route;
  };

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
          Vaccination Logged Successfully
        </h3>
        <p className="text-neutral-600 mb-4">
          {vaccination.vaccine_name} has been marked as completed
        </p>
        <p className="text-sm text-neutral-500">
          टीकाकरण सफलतापूर्वक दर्ज किया गया
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-1">
            Log Vaccination
          </h3>
          <p className="text-sm text-neutral-500">
            टीकाकरण दर्ज करें
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} weight="regular" />
          </button>
        )}
      </div>

      {/* Vaccine Info */}
      <div className="bg-brand-green-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Syringe size={24} weight="regular" className="text-brand-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-neutral-900">{vaccination.vaccine_name}</h4>
            <p className="text-sm text-neutral-600">
              Day {vaccination.scheduled_day} · Due: {new Date(vaccination.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Administered Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Administered Date · दिनांक
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.administered_date}
              onChange={(e) => setFormData(prev => ({ ...prev, administered_date: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Vaccine Brand */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Vaccine Brand · ब्रांड
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="e.g., Venky's, Venkateshwara"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white pl-10"
              required
            />
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
        </div>

        {/* Batch Number */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Batch Number · बैच नंबर
          </label>
          <input
            type="text"
            value={formData.batch_number}
            onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
            placeholder="e.g., VEN2026/04/1234"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            required
          />
        </div>

        {/* Route */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Administration Route · मार्ग
          </label>
          <select
            value={formData.route}
            onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            required
          >
            {vaccinationProtocols.vaccine_routes.map((route: any) => (
              <option key={route.value} value={route.value}>
                {route.label} · {route.label_hi}
              </option>
            ))}
          </select>
        </div>

        {/* Dose per Bird */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dose per Bird · प्रति पक्षी खुराक
          </label>
          <input
            type="text"
            value={formData.dose_per_bird}
            onChange={(e) => setFormData(prev => ({ ...prev, dose_per_bird: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            required
          />
        </div>

        {/* Administered By */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Administered By · द्वारा दिया गया
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.administered_by}
              onChange={(e) => setFormData(prev => ({ ...prev, administered_by: e.target.value }))}
              placeholder="Name of person who administered"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white pl-10"
              required
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Notes · नोट्स (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
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
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={18} weight="bold" />
                Log Vaccination
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
