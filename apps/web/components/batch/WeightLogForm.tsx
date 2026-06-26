'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Scales, Warning, CheckCircle, X } from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import breedStandards from '@/lib/data/breedStandards.json';

interface WeightLogFormProps {
  batchId: string;
  batchIdDisplay: string;
  breed: string;
  docPlacementDate: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface WeightLogData {
  log_date: string;
  sample_size: number;
  avg_weight_kg: number;
  std_deviation_kg: number;
  notes?: string;
}

export function WeightLogForm({
  batchId,
  batchIdDisplay,
  breed,
  docPlacementDate,
  onSuccess,
  onCancel,
}: WeightLogFormProps) {
  const [formData, setFormData] = useState<WeightLogData>({
    log_date: new Date().toISOString().split('T')[0],
    sample_size: 30,
    avg_weight_kg: 0,
    std_deviation_kg: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WeightLogData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [breedStandardWeight, setBreedStandardWeight] = useState<number>(0);
  const [deviationAlert, setDeviationAlert] = useState<{ type: 'warning' | 'error'; message: string } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  // Calculate breed standard weight for the selected date
  useEffect(() => {
    if (formData.log_date && breed) {
      const breedData = breedStandards.breeds.find((b: any) => b.name === breed);
      if (breedData) {
        const ageInDays = Math.ceil(
          (new Date(formData.log_date).getTime() - new Date(docPlacementDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Interpolate breed standard weight based on age
        const weightCurve = breedData.weight_curve;
        const ageKeys = Object.keys(weightCurve).map(k => parseInt(k.replace('day_', ''))).sort((a, b) => a - b);
        
        let standardWeight = 0;
        if (ageInDays <= ageKeys[0]) {
          standardWeight = (weightCurve as any)[`day_${ageKeys[0]}`];
        } else if (ageInDays >= ageKeys[ageKeys.length - 1]) {
          standardWeight = (weightCurve as any)[`day_${ageKeys[ageKeys.length - 1]}`];
        } else {
          // Linear interpolation
          for (let i = 0; i < ageKeys.length - 1; i++) {
            if (ageInDays >= ageKeys[i] && ageInDays < ageKeys[i + 1]) {
              const lowerAge = ageKeys[i];
              const upperAge = ageKeys[i + 1];
              const lowerWeight = (weightCurve as any)[`day_${lowerAge}`];
              const upperWeight = (weightCurve as any)[`day_${upperAge}`];
              const ratio = (ageInDays - lowerAge) / (upperAge - lowerAge);
              standardWeight = lowerWeight + (upperWeight - lowerWeight) * ratio;
              break;
            }
          }
        }
        
        setBreedStandardWeight(standardWeight);
      }
    }
  }, [formData.log_date, breed, docPlacementDate]);

  // Check for weight deviation
  useEffect(() => {
    if (formData.avg_weight_kg > 0 && breedStandardWeight > 0) {
      const deviationPercent = ((formData.avg_weight_kg - breedStandardWeight) / breedStandardWeight) * 100;
      
      if (formData.avg_weight_kg < breedStandardWeight * 0.90) {
        setDeviationAlert({
          type: 'error',
          message: `वज़न मानक से ${Math.abs(deviationPercent).toFixed(1)}% कम है। चारे की जाँच करें या डॉक्टर से मिलें।`,
        });
      } else if (formData.avg_weight_kg < breedStandardWeight * 0.95) {
        setDeviationAlert({
          type: 'warning',
          message: `वज़न मानक से ${Math.abs(deviationPercent).toFixed(1)}% कम है। चारे की समीक्षा करें।`,
        });
      } else {
        setDeviationAlert(null);
      }
    }
  }, [formData.avg_weight_kg, breedStandardWeight]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WeightLogData, string>> = {};

    if (!formData.log_date) {
      newErrors.log_date = 'Date is required';
    }

    if (formData.sample_size < 30) {
      newErrors.sample_size = 'Sample size must be at least 30 birds';
    }

    if (formData.avg_weight_kg <= 0 || formData.avg_weight_kg > 5) {
      newErrors.avg_weight_kg = 'Average weight must be between 0 and 5 kg';
    }

    if (formData.std_deviation_kg < 0 || formData.std_deviation_kg > 1) {
      newErrors.std_deviation_kg = 'Standard deviation must be between 0 and 1 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!supabase) {
      alert('Supabase not configured. Cannot save weight log.');
      return;
    }

    setIsSubmitting(true);

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;

    try {
      const { data, error } = await client
        .from('weight_logs')
        .insert({
          batch_id: batchId,
          log_date: formData.log_date,
          sample_size: formData.sample_size,
          avg_weight_kg: formData.avg_weight_kg,
          std_deviation_kg: formData.std_deviation_kg,
          notes: formData.notes || null,
          synced: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Update batch's current_avg_weight_kg
      await client
        .from('batches')
        .update({
          current_avg_weight_kg: formData.avg_weight_kg,
        })
        .eq('id', batchId);

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Error submitting weight log:', err);
      setErrors({ 
        avg_weight_kg: 'Failed to submit weight log. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof WeightLogData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <CheckCircle size={32} className="text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Weight Log Submitted Successfully</h3>
            <p className="text-sm text-green-700">
              {batchIdDisplay} · {formData.avg_weight_kg} kg avg weight
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Weight Log Entry</h3>
          <p className="text-sm text-neutral-600">
            {batchIdDisplay} · {breed}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} weight="regular" />
          </button>
        )}
      </div>

      {/* Date Field */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} weight="regular" />
            <span>Log Date</span>
          </div>
        </label>
        <input
          type="date"
          value={formData.log_date}
          onChange={(e) => handleInputChange('log_date', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          min={docPlacementDate}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 ${
            errors.log_date ? 'border-red-300' : 'border-neutral-300'
          }`}
        />
        {errors.log_date && (
          <p className="mt-1 text-sm text-red-600">{errors.log_date}</p>
        )}
      </div>

      {/* Sample Size Field */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          <div className="flex items-center gap-2">
            <Scales size={16} weight="regular" />
            <span>Sample Size (birds)</span>
          </div>
        </label>
        <input
          type="number"
          value={formData.sample_size}
          onChange={(e) => handleInputChange('sample_size', parseInt(e.target.value) || 0)}
          min={30}
          step={1}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 ${
            errors.sample_size ? 'border-red-300' : 'border-neutral-300'
          }`}
          placeholder="Minimum 30 birds"
        />
        {errors.sample_size && (
          <p className="mt-1 text-sm text-red-600">{errors.sample_size}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">Minimum 30 birds required for statistical significance</p>
      </div>

      {/* Average Weight Field */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Average Weight (kg/bird)
        </label>
        <input
          type="number"
          value={formData.avg_weight_kg}
          onChange={(e) => handleInputChange('avg_weight_kg', parseFloat(e.target.value) || 0)}
          min={0}
          max={5}
          step={0.001}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 ${
            errors.avg_weight_kg ? 'border-red-300' : 'border-neutral-300'
          }`}
          placeholder="e.g., 1.850"
        />
        {errors.avg_weight_kg && (
          <p className="mt-1 text-sm text-red-600">{errors.avg_weight_kg}</p>
        )}
        {breedStandardWeight > 0 && (
          <p className="mt-1 text-xs text-neutral-500">
            Breed standard for this age: {breedStandardWeight.toFixed(3)} kg
          </p>
        )}
      </div>

      {/* Standard Deviation Field */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Standard Deviation (kg)
        </label>
        <input
          type="number"
          value={formData.std_deviation_kg}
          onChange={(e) => handleInputChange('std_deviation_kg', parseFloat(e.target.value) || 0)}
          min={0}
          max={1}
          step={0.001}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 ${
            errors.std_deviation_kg ? 'border-red-300' : 'border-neutral-300'
          }`}
          placeholder="e.g., 0.120"
        />
        {errors.std_deviation_kg && (
          <p className="mt-1 text-sm text-red-600">{errors.std_deviation_kg}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">Measures weight variation within the sample</p>
      </div>

      {/* Deviation Alert */}
      {deviationAlert && (
        <div className={`flex items-start gap-3 p-4 rounded-lg ${
          deviationAlert.type === 'error' 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <Warning 
            size={20} 
            weight="regular" 
            className={deviationAlert.type === 'error' ? 'text-red-600' : 'text-amber-600'} 
          />
          <p className={`text-sm ${
            deviationAlert.type === 'error' ? 'text-red-800' : 'text-amber-800'
          }`}>
            {deviationAlert.message}
          </p>
        </div>
      )}

      {/* Notes Field (Optional) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500"
          placeholder="Any observations about the flock or weighing process..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} weight="bold" />
              <span>Submit Weight Log</span>
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default WeightLogForm;
