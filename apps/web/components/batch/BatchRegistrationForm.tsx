'use client';

/**
 * FlockIQ - Batch Registration Form
 * TASK-030: Batch Registration Form & DOC Supplier Registry
 * Requirement Refs: REQ-013 §13.1, §13.4, Design Addendum §11.2
 * 
 * This component implements the batch registration wizard for both web (single-page form)
 * and mobile (4-step wizard) interfaces. It includes DOC supplier registry with quality
 * tracking, breed-specific auto-population of target weights, and integration with the
 * Batch ROI Optimizer.
 * 
 * Features:
 * - Single-page 2-column form for web (Design Addendum §11.2)
 * - Breed dropdown auto-populates target_harvest_weight_kg from breed standards lookup
 * - DOC Supplier Registry with quality rating (1-5 stars) and autocomplete
 * - Success toast with Hindi message on batch creation
 * - Automatic pre-population of Batch ROI Optimizer flock_size
 * - Support for both broiler and layer poultry types
 * - Integration with Supabase for batch creation and supplier management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, CheckCircle, WarningCircle, Sparkle } from '@phosphor-icons/react';
import breedStandards from '@/lib/data/breedStandards.json';
import layerBreedStandards from '@/lib/data/layerBreedStandards.json';
import { Toast } from '@/components/ui/Toast';

/**
 * Batch form data structure matching REQ-013 §13.1 requirements
 * Includes all required fields for batch registration with support for
 * both broiler and layer poultry types.
 */
interface BatchFormData {
  shedId: string;
  docPlacementDate: string;
  docCount: number;
  docSupplier: string;
  breed: string;
  targetHarvestWeightKg: number;
  targetHarvestAgeDays: number;
  initialFeedBrand: string;
  initialFeedType: string;
  initialFeedQuantity: number;
  poultryType: 'broiler' | 'layer';
  productionPeakAgeWeeks?: number; // For layers - peak production age in weeks
}

/**
 * DOC Supplier structure for the supplier registry (REQ-013 §13.4)
 * Tracks supplier quality ratings and historical performance
 */
interface DocSupplier {
  id: string;
  name: string;
  location: string;
  avg_rating: number; // 1-5 star rating from previous batches
  total_batches_supplied: number; // Total batches from this supplier
  avg_survival_rate?: number; // Average survival rate across batches
}

interface BatchRegistrationFormProps {
  onSuccess?: (batchId: string) => void;
  onCancel?: () => void;
  initialShedId?: string;
}

export default function BatchRegistrationForm({ 
  onSuccess, 
  onCancel,
  initialShedId = 'Shed 1'
}: BatchRegistrationFormProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<BatchFormData>({
    shedId: initialShedId,
    docPlacementDate: new Date().toISOString().split('T')[0],
    docCount: 25000,
    docSupplier: '',
    breed: breedStandards.default_breed,
    targetHarvestWeightKg: 2.2,
    targetHarvestAgeDays: 42,
    initialFeedBrand: '',
    initialFeedType: 'starter',
    initialFeedQuantity: 0,
    poultryType: 'broiler',
    productionPeakAgeWeeks: 28,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docSuppliers, setDocSuppliers] = useState<DocSupplier[]>([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState<DocSupplier[]>([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  // Load DOC suppliers on mount
  useEffect(() => {
    loadDocSuppliers();
  }, []);

  const loadDocSuppliers = async () => {
    if (!supabase) {
      console.warn('[BatchRegistrationForm] Supabase not configured, skipping DOC suppliers load');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('doc_suppliers')
        .select('*')
        .eq('customer_id', user.id)
        .order('avg_rating', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setDocSuppliers(data || []);
    } catch (err) {
      console.error('Failed to load DOC suppliers:', err);
    }
  };

  /**
   * Handle breed selection - auto-populate target weight and age based on poultry type
   * Uses static breed standards lookup tables (TASK-030 requirement)
   * - Cobb 500 → 2.2kg, Ross 308 → 2.3kg, Vencobb → 2.0kg, Hubbard → 2.1kg
   * - Layer breeds auto-populate egg weight and production duration
   */
  const handleBreedChange = (breedName: string) => {
    if (formData.poultryType === 'broiler') {
      const selectedBreed = breedStandards.breeds.find(b => b.name === breedName);
      if (selectedBreed) {
        setFormData(prev => ({
          ...prev,
          breed: breedName,
          targetHarvestWeightKg: selectedBreed.target_harvest_weight_kg,
          targetHarvestAgeDays: selectedBreed.target_harvest_age_days,
        }));
      }
    } else {
      const selectedBreed = layerBreedStandards.breeds.find(b => b.name === breedName);
      if (selectedBreed) {
        setFormData(prev => ({
          ...prev,
          breed: breedName,
          targetHarvestWeightKg: selectedBreed.target_egg_weight_g / 1000, // Convert g to kg
          targetHarvestAgeDays: selectedBreed.production_duration_weeks * 7,
          productionPeakAgeWeeks: selectedBreed.target_peak_age_weeks,
        }));
      }
    }
  };

  // Handle poultry type change
  const handlePoultryTypeChange = (poultryType: 'broiler' | 'layer') => {
    const defaultBreed = poultryType === 'broiler' 
      ? breedStandards.default_breed 
      : layerBreedStandards.default_breed;
    
    setFormData(prev => ({
      ...prev,
      poultryType,
      breed: defaultBreed,
    }));
    
    // Trigger breed change to update target values
    handleBreedChange(defaultBreed);
  };

  // Handle supplier input with autocomplete
  const handleSupplierInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, docSupplier: value }));
    
    if (value.length > 0) {
      const suggestions = docSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(value.toLowerCase())
      );
      setSupplierSuggestions(suggestions);
      setShowSupplierSuggestions(suggestions.length > 0);
    } else {
      setShowSupplierSuggestions(false);
    }
  };

  const handleSupplierSelect = (supplier: DocSupplier) => {
    setFormData(prev => ({ ...prev, docSupplier: supplier.name }));
    setShowSupplierSuggestions(false);
  };

  // Generate star rating display
  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('⭐');
      } else if (i - 0.5 <= rating) {
        stars.push('✫');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.shedId) {
      setError('शेड चुनें (Select shed)');
      return false;
    }
    if (!formData.docPlacementDate) {
      setError('DOC तारीख चुनें (Select DOC date)');
      return false;
    }
    if (formData.docCount < 1000 || formData.docCount > 100000) {
      setError('DOC संख्या 1,000 से 100,000 के बीच होनी चाहिए');
      return false;
    }
    if (!formData.docSupplier.trim()) {
      setError('DOC सप्लायर नाम दर्ज करें (Enter DOC supplier name)');
      return false;
    }
    if (!formData.breed) {
      setError('नस्ल चुनें (Select breed)');
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
      setError('Supabase not configured. Cannot create batch.');
      return;
    }

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;
    setLoading(true);

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get customer district for batch ID generation
      const { data: customerData } = await client
        .from('customers')
        .select('district')
        .eq('id', user.id)
        .single();

      const district = customerData?.district || 'UNK';

      // Call Supabase function to generate batch ID and create batch
      const { data: batchData, error: batchError } = await client
        .rpc('create_batch_with_id', {
          p_district: district,
          p_doc_placement_date: formData.docPlacementDate,
          p_doc_count: formData.docCount,
          p_doc_supplier: formData.docSupplier,
          p_breed: formData.breed,
          p_target_harvest_weight_kg: formData.targetHarvestWeightKg,
          p_shed_id: formData.shedId,
          p_initial_feed_brand: formData.initialFeedBrand || null,
          p_initial_feed_type: formData.initialFeedType || null,
          p_batch_type: formData.poultryType,
        });

      if (batchError) throw batchError;

      // Save/update DOC supplier if new
      if (formData.docSupplier && !docSuppliers.find(s => s.name === formData.docSupplier)) {
        await client
          .from('doc_suppliers')
          .insert({
            customer_id: user.id,
            name: formData.docSupplier,
            total_batches_supplied: 1,
          });
      } else {
        // Update existing supplier batch count
        const existingSupplier = docSuppliers.find(s => s.name === formData.docSupplier);
        if (existingSupplier) {
          await client
            .from('doc_suppliers')
            .update({ 
              total_batches_supplied: existingSupplier.total_batches_supplied + 1 
            })
            .eq('id', existingSupplier.id);
        }
      }

      setCreatedBatchId(batchData);
      setSuccess(true);
      setShowToast(true);

      // Call success callback and navigate after delay
      setTimeout(() => {
        if (onSuccess) onSuccess(batchData);
        // Navigate to batch detail drawer/page
        router.push(`/dashboard/batches/${batchData}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch');
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
          बैच सफलतापूर्वक बनाया गया
        </h3>
        <p className="text-neutral-600 mb-4">
          {createdBatchId} बनाया गया ✅
        </p>
        <p className="text-sm text-neutral-500">
          Batch created successfully
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
          message={`${createdBatchId} बनाया गया ✅`}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            नया बैच दर्ज करें
          </h2>
          <p className="text-neutral-600">
            Register new batch
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
          {/* Poultry Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              पक्षी प्रकार · Poultry Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handlePoultryTypeChange('broiler')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                  formData.poultryType === 'broiler'
                    ? 'border-brand-green-700 bg-brand-green-50 text-brand-green-800'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                ब्रॉयलर · Broiler
              </button>
              <button
                type="button"
                onClick={() => handlePoultryTypeChange('layer')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                  formData.poultryType === 'layer'
                    ? 'border-brand-green-700 bg-brand-green-50 text-brand-green-800'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                लेयर · Layer
              </button>
            </div>
          </div>

          {/* Shed Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              शेड नंबर · Shed Number
            </label>
            <select
              value={formData.shedId}
              onChange={(e) => setFormData(prev => ({ ...prev, shedId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="Shed 1">Shed 1</option>
              <option value="Shed 2">Shed 2</option>
              <option value="Shed 3">Shed 3</option>
              <option value="Shed 4">Shed 4</option>
            </select>
          </div>

          {/* DOC Placement Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              DOC तारीख · DOC Placement Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.docPlacementDate}
                onChange={(e) => setFormData(prev => ({ ...prev, docPlacementDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* DOC Count */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              DOC संख्या · DOC Count (birds)
            </label>
            <input
              type="number"
              value={formData.docCount}
              onChange={(e) => setFormData(prev => ({ ...prev, docCount: Number(e.target.value) }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              min="1000"
              max="100000"
              step="100"
              required
            />
          </div>

          {/* DOC Supplier */}
          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              DOC सप्लायर · DOC Supplier
            </label>
            <input
              type="text"
              value={formData.docSupplier}
              onChange={(e) => handleSupplierInputChange(e.target.value)}
              onFocus={() => formData.docSupplier && setShowSupplierSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSupplierSuggestions(false), 200)}
              placeholder="Enter supplier name..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              required
            />
            
            {/* Supplier Autocomplete Suggestions */}
            {showSupplierSuggestions && supplierSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {supplierSuggestions.map((supplier) => (
                  <button
                    key={supplier.id}
                    type="button"
                    onClick={() => handleSupplierSelect(supplier)}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-900">{supplier.name}</span>
                      <div className="flex items-center gap-2 text-sm">
                        {supplier.avg_rating && (
                          <span className="text-neutral-600">
                            {renderStarRating(supplier.avg_rating)} ({supplier.total_batches_supplied} batches)
                          </span>
                        )}
                      </div>
                    </div>
                    {supplier.location && (
                      <p className="text-xs text-neutral-500 mt-1">{supplier.location}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breed Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              नस्ल · Breed
            </label>
            <select
              value={formData.breed}
              onChange={(e) => handleBreedChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              required
            >
              {formData.poultryType === 'broiler' ? (
                breedStandards.breeds.map((breed) => (
                  <option key={breed.name} value={breed.name}>
                    {breed.name} (Target: {breed.target_harvest_weight_kg}kg)
                  </option>
                ))
              ) : (
                layerBreedStandards.breeds.map((breed) => (
                  <option key={breed.name} value={breed.name}>
                    {breed.name} (Peak: {breed.target_peak_age_weeks} weeks)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Target Harvest Weight / Egg Weight */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {formData.poultryType === 'layer' 
                ? 'टारगेट अंडा वजन · Target Egg Weight (g/bird)'
                : 'टारगेट हार्वेस्ट वजन · Target Harvest Weight (kg/bird)'
              }
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.targetHarvestWeightKg}
                onChange={(e) => setFormData(prev => ({ ...prev, targetHarvestWeightKg: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min={formData.poultryType === 'layer' ? 50 : 1.5}
                max={formData.poultryType === 'layer' ? 75 : 3.5}
                required
              />
              <Sparkle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-green-500 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Auto-populated from breed standard
            </p>
          </div>

          {/* Layer-specific: Production Peak Age */}
          {formData.poultryType === 'layer' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                पीक उत्पादन आयु · Peak Production Age (weeks)
              </label>
              <input
                type="number"
                value={formData.productionPeakAgeWeeks}
                onChange={(e) => setFormData(prev => ({ ...prev, productionPeakAgeWeeks: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                min="20"
                max="35"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Age at which HDP reaches peak production
              </p>
            </div>
          )}

          {/* Target Harvest Age */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {formData.poultryType === 'layer'
                ? 'उत्पादन अवधि · Production Duration (days)'
                : 'टारगेट हार्वेस्ट आयु · Target Harvest Age (days)'
              }
            </label>
            <input
              type="number"
              value={formData.targetHarvestAgeDays}
              onChange={(e) => setFormData(prev => ({ ...prev, targetHarvestAgeDays: Number(e.target.value) }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
              min={formData.poultryType === 'layer' ? 350 : 35}
              max={formData.poultryType === 'layer' ? 600 : 50}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.poultryType === 'layer' ? 'Total laying period' : 'Auto-populated from breed standard'}
            </p>
          </div>

          {/* Initial Feed Brand */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              प्रारंभिक चारा ब्रांड · Initial Feed Brand
            </label>
            <input
              type="text"
              value={formData.initialFeedBrand}
              onChange={(e) => setFormData(prev => ({ ...prev, initialFeedBrand: e.target.value }))}
              placeholder="e.g., Godrej Agrovet"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Initial Feed Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              चारा प्रकार · Feed Type
            </label>
            <select
              value={formData.initialFeedType}
              onChange={(e) => setFormData(prev => ({ ...prev, initialFeedType: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
            >
              {formData.poultryType === 'broiler' ? (
                <>
                  <option value="starter">Starter</option>
                  <option value="grower">Grower</option>
                  <option value="finisher">Finisher</option>
                  <option value="pre-starter">Pre-Starter</option>
                </>
              ) : (
                <>
                  <option value="layer_starter">Layer Starter</option>
                  <option value="layer_grower">Layer Grower</option>
                  <option value="layer_developer">Layer Developer</option>
                  <option value="layer_peak">Layer Peak</option>
                  <option value="layer_late">Layer Late</option>
                </>
              )}
            </select>
          </div>
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
                बनाया जा रहा है...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                बैच बनाएं · Create Batch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
