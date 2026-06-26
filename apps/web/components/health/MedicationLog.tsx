'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Calendar, Pill, User, Syringe, Warning } from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import antibioticsList from '@/lib/data/antibioticsList.json';

interface MedicationLogProps {
  batchId: string;
  batchIdDisplay: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MedicationLog({ batchId, batchIdDisplay, onSuccess, onCancel }: MedicationLogProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    symptom: '',
    diagnosis: '',
    drug_name: '',
    dose: '',
    route: 'oral',
    duration_days: '',
    withdrawal_days: '',
    administered_by: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAntibiotic, setIsAntibiotic] = useState(false);

  const symptoms = [
    { value: 'respiratory', label: 'Respiratory', label_hi: 'श्वसन' },
    { value: 'digestive', label: 'Digestive', label_hi: 'पाचन' },
    { value: 'nervous', label: 'Nervous', label_hi: 'तंत्रिका' },
    { value: 'skin', label: 'Skin', label_hi: 'त्वचा' },
    { value: 'other', label: 'Other', label_hi: 'अन्य' }
  ];

  const routes = [
    { value: 'oral', label: 'Oral', label_hi: 'मौखिक' },
    { value: 'injection', label: 'Injection', label_hi: 'इंजेक्शन' },
    { value: 'topical', label: 'Topical', label_hi: 'स्थानिक' },
    { value: 'intramuscular', label: 'Intramuscular', label_hi: 'मांसपेशी में' },
    { value: 'subcutaneous', label: 'Subcutaneous', label_hi: 'उपक्षयी' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError('Supabase not configured. Cannot save medication log.');
      setLoading(false);
      return;
    }

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if drug is antibiotic
      const isAntibioticDrug = antibioticsList.antibiotics.some(
        (antibiotic: string) => antibiotic.toLowerCase() === formData.drug_name.toLowerCase()
      );

      // Calculate withdrawal end date (for display only - DB computes it)
      const duration = parseInt(formData.duration_days) || 0;
      const withdrawal = parseInt(formData.withdrawal_days) || 0;
      const withdrawalEndDate = new Date(formData.log_date);
      withdrawalEndDate.setDate(withdrawalEndDate.getDate() + duration + withdrawal);

      // Insert medication log
      const { error: insertError } = await client
        .from('medication_logs')
        .insert({
          batch_id: batchId,
          log_date: formData.log_date,
          symptom: formData.symptom || null,
          diagnosis: formData.diagnosis || null,
          drug_name: formData.drug_name,
          dose: formData.dose,
          route: formData.route,
          duration_days: duration,
          withdrawal_days: withdrawal,
          administered_by: formData.administered_by,
          is_antibiotic: isAntibioticDrug,
          notes: formData.notes || null,
          synced: true
        });

      if (insertError) throw insertError;

      setSuccess(true);

      // Call success callback after delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log medication');
    } finally {
      setLoading(false);
    }
  };

  const handleDrugNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, drug_name: value }));
    // Check if it's an antibiotic
    const isAntibioticDrug = antibioticsList.antibiotics.some(
      (antibiotic: string) => antibiotic.toLowerCase() === value.toLowerCase()
    );
    setIsAntibiotic(isAntibioticDrug);
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
          Medication Logged Successfully
        </h3>
        <p className="text-neutral-600 mb-4">
          {formData.drug_name} has been recorded for {batchIdDisplay}
        </p>
        {isAntibiotic && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Warning size={16} weight="fill" />
              <span className="text-sm font-medium">
                Antibiotic detected - AB-Free certification withdrawn for this batch
              </span>
            </div>
          </div>
        )}
        <p className="text-sm text-neutral-500">
          दवा दर्ज करना सफल रहा
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
            Log Medication
          </h3>
          <p className="text-sm text-neutral-500">
            दवा दर्ज करें
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

      {/* Batch Info */}
      <div className="bg-brand-green-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Pill size={24} weight="regular" className="text-brand-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-neutral-900">{batchIdDisplay}</h4>
            <p className="text-sm text-neutral-600">
              Withdrawal period will be automatically calculated
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
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Date · दिनांक
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.log_date}
              onChange={(e) => setFormData(prev => ({ ...prev, log_date: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Symptom */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Symptom · लक्षण (Optional)
          </label>
          <select
            value={formData.symptom}
            onChange={(e) => setFormData(prev => ({ ...prev, symptom: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select symptom</option>
            {symptoms.map(symptom => (
              <option key={symptom.value} value={symptom.value}>
                {symptom.label} · {symptom.label_hi}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Diagnosis · निदान (Optional)
          </label>
          <input
            type="text"
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            placeholder="e.g., Respiratory infection"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Drug Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Drug Name · दवा का नाम *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.drug_name}
              onChange={(e) => handleDrugNameChange(e.target.value)}
              placeholder="e.g., Tylosin, Doxycycline"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white pl-10"
              required
            />
            <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
          {isAntibiotic && (
            <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
              <Warning size={14} weight="fill" />
              <span>This is an antibiotic - AB-Free certification will be withdrawn</span>
            </div>
          )}
        </div>

        {/* Dose */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dose · खुराक
          </label>
          <input
            type="text"
            value={formData.dose}
            onChange={(e) => setFormData(prev => ({ ...prev, dose: e.target.value }))}
            placeholder="e.g., 20 mg/kg, 10 ml/liter"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
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
            {routes.map(route => (
              <option key={route.value} value={route.value}>
                {route.label} · {route.label_hi}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Days */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Treatment Duration (days) · उपचार अवधि (दिन) *
          </label>
          <input
            type="number"
            value={formData.duration_days}
            onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
            placeholder="e.g., 5"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            required
          />
        </div>

        {/* Withdrawal Days */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Withdrawal Period (days) · विथड्रॉल अवधि (दिन) *
          </label>
          <input
            type="number"
            value={formData.withdrawal_days}
            onChange={(e) => setFormData(prev => ({ ...prev, withdrawal_days: e.target.value }))}
            placeholder="e.g., 7"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            required
          />
          <p className="text-xs text-neutral-500 mt-1">
            Days after treatment ends before birds can be sold
          </p>
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
                Log Medication
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
