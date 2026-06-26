'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Plus, CheckCircle, WarningCircle, Drop, Scales, PaintBucket } from '@phosphor-icons/react';
import { Toast } from '@/components/ui/Toast';
import { checkFeedWaterRatio } from '@/lib/fcrCalculator';

interface FeedLogFormData {
  date: string;
  batchId: string;
  morningFeedKg: number;
  eveningFeedKg: number;
  waterLitres: number;
  feedBrand: string;
  feedRefusalKg: number;
  feedRate: number;
}

interface Batch {
  id: string;
  batch_id: string;
  shed_id: string;
  breed: string;
  doc_placement_date: string;
  current_bird_count: number;
  status: string;
}

interface FeedBrand {
  id: string;
  name: string;
  supplier: string;
}

interface DailyFeedLogFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialBatchId?: string;
  initialDate?: string;
}

export default function DailyFeedLogForm({ 
  onSuccess, 
  onCancel,
  initialBatchId = '',
  initialDate = new Date().toISOString().split('T')[0]
}: DailyFeedLogFormProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
  
  // Form state
  const [formData, setFormData] = useState<FeedLogFormData>({
    date: initialDate,
    batchId: initialBatchId,
    morningFeedKg: 0,
    eveningFeedKg: 0,
    waterLitres: 0,
    feedBrand: '',
    feedRefusalKg: 0,
    feedRate: 0,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [feedBrands, setFeedBrands] = useState<FeedBrand[]>([]);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [feedWaterAlert, setFeedWaterAlert] = useState<{ isDeviated: boolean; ratio: number; alertType: 'low' | 'high' | 'normal' } | null>(null);
  const [marketRate, setMarketRate] = useState<number | null>(null);
  const [marketRateLoading, setMarketRateLoading] = useState(false);

  // Load active batches and feed brands on mount
  useEffect(() => {
    loadActiveBatches();
    loadFeedBrands();
  }, []);

  // Check feed-water ratio when water or feed values change
  useEffect(() => {
    const totalFeedKg = formData.morningFeedKg + formData.eveningFeedKg - formData.feedRefusalKg;
    if (totalFeedKg > 0 && formData.waterLitres > 0) {
      const result = checkFeedWaterRatio(formData.waterLitres, totalFeedKg);
      setFeedWaterAlert(result);
    } else {
      setFeedWaterAlert(null);
    }
  }, [formData.morningFeedKg, formData.eveningFeedKg, formData.waterLitres, formData.feedRefusalKg]);

  // Fetch market rate when feed rate changes
  useEffect(() => {
    if (formData.feedRate > 0) {
      fetchMarketRate();
    } else {
      setMarketRate(null);
    }
  }, [formData.feedRate]);

  const fetchMarketRate = async () => {
    setMarketRateLoading(true);
    try {
      const response = await fetch('/api/feed/commodity-history?id=composite&days=1');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Convert from ₹/quintal to ₹/kg (divide by 100)
        setMarketRate(data[0].price / 100);
      }
    } catch (error) {
      console.error('Failed to fetch market rate:', error);
    } finally {
      setMarketRateLoading(false);
    }
  };

  const loadActiveBatches = async () => {
    if (!supabase) {
      console.warn('[DailyFeedLogForm] Supabase not configured, skipping batch load');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('customer_id', user.id)
        .in('status', ['placement', 'growing', 'pre_harvest', 'harvest_ready'])
        .order('doc_placement_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
      
      // Auto-select first batch if none selected
      if (data && data.length > 0 && !formData.batchId) {
        setFormData(prev => ({ ...prev, batchId: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load active batches:', err);
    }
  };

  const loadFeedBrands = async () => {
    if (!supabase) {
      console.warn('[DailyFeedLogForm] Supabase not configured, skipping feed brands load');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('feed_brands')
        .select('*')
        .eq('customer_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setFeedBrands(data || []);
    } catch (err) {
      console.error('Failed to load feed brands:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase not configured. Cannot save feed log.');
      setLoading(false);
      return;
    }

    // TypeScript: supabase is guaranteed to be non-null after the check above
    const client = supabase;

    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate form
      if (!formData.batchId) {
        throw new Error('Please select a batch');
      }
      if (formData.morningFeedKg <= 0 && formData.eveningFeedKg <= 0) {
        throw new Error('Please enter feed amount');
      }

      // Insert feed log
      const { error: insertError } = await client
        .from('feed_logs')
        .insert({
          customer_id: user.id,
          batch_id: formData.batchId,
          log_date: formData.date,
          morning_feed_kg: formData.morningFeedKg,
          evening_feed_kg: formData.eveningFeedKg,
          water_litres: formData.waterLitres,
          feed_brand: formData.feedBrand,
          feed_refusal_kg: formData.feedRefusalKg,
          synced: true, // For web, always synced initially
        });

      if (insertError) throw insertError;

      // Check for feed-water deviation alert
      const totalFeedKg = formData.morningFeedKg + formData.eveningFeedKg - formData.feedRefusalKg;
      if (totalFeedKg > 0 && formData.waterLitres > 0) {
        const ratioCheck = checkFeedWaterRatio(formData.waterLitres, totalFeedKg);
        if (ratioCheck.isDeviated) {
          // Create alert
          const alertMessage = ratioCheck.alertType === 'low' 
            ? `पानी कम पिया जा रहा है - अनुपात: ${ratioCheck.ratio.toFixed(2)} (मानक: 1.8-3.5)`
            : `बहुत अधिक पानी - अनुपात: ${ratioCheck.ratio.toFixed(2)} (मानक: 1.8-3.5)`;
          
          await client
            .from('alerts')
            .insert({
              customer_id: user.id,
              batch_id: formData.batchId,
              alert_type: 'feed_water_deviation',
              severity: 'medium',
              message: alertMessage,
              metadata: {
                ratio: ratioCheck.ratio,
                alert_type: ratioCheck.alertType,
                date: formData.date,
              },
              is_read: false,
            });
        }
      }

      setSuccess(true);
      setToastMessage('चारा लॉग सफलतापूर्वक दर्ज किया गया ✅');
      setShowToast(true);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        batchId: formData.batchId, // Keep batch selected
        morningFeedKg: 0,
        eveningFeedKg: 0,
        waterLitres: 0,
        feedBrand: '',
        feedRefusalKg: 0,
        feedRate: 0,
      });

      setTimeout(() => {
        setShowToast(false);
        onSuccess?.();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feed log');
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find(b => b.id === formData.batchId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-neutral-100 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Scales size={24} className="text-brand-green-600" />
          दैनिक चारा लॉग
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          {selectedBatch ? `${selectedBatch.batch_id} · ${selectedBatch.shed_id} · ${selectedBatch.breed}` : 'बैच चुनें'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            तारीख
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Batch Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            बैच
          </label>
          <select
            value={formData.batchId}
            onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
            required
          >
            <option value="">बैच चुनें</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.batch_id} · {batch.shed_id} · {batch.breed} · {batch.current_bird_count} पक्षी
              </option>
            ))}
          </select>
        </div>

        {/* Morning Feed */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            सुबह का चारा (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.morningFeedKg || ''}
            onChange={(e) => setFormData({ ...formData, morningFeedKg: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent text-lg"
            placeholder="0"
          />
        </div>

        {/* Evening Feed */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            शाम का चारा (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.eveningFeedKg || ''}
            onChange={(e) => setFormData({ ...formData, eveningFeedKg: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent text-lg"
            placeholder="0"
          />
        </div>

        {/* Water */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            पानी (litres)
          </label>
          <div className="relative">
            <Drop className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.waterLitres || ''}
              onChange={(e) => setFormData({ ...formData, waterLitres: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent text-lg"
              placeholder="0"
            />
          </div>
        </div>

        {/* Feed Brand */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            चारा ब्रांड
          </label>
          <select
            value={formData.feedBrand}
            onChange={(e) => setFormData({ ...formData, feedBrand: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
          >
            <option value="">ब्रांड चुनें</option>
            {feedBrands.map(brand => (
              <option key={brand.id} value={brand.name}>
                {brand.name} · {brand.supplier}
              </option>
            ))}
          </select>
        </div>

        {/* Feed Rate with Market Rate Comparison */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            चारा दर (₹/kg)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.feedRate || ''}
              onChange={(e) => setFormData({ ...formData, feedRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent text-lg"
              placeholder="0.00"
            />
            {marketRate && (
              <div className="mt-2 flex items-center gap-2">
                {formData.feedRate > 0 && (
                  <span className={`text-xs font-medium ${
                    formData.feedRate < marketRate ? 'text-green-600' :
                    formData.feedRate > marketRate ? 'text-red-600' :
                    'text-neutral-600'
                  }`}>
                    {formData.feedRate < marketRate ? '↓' : formData.feedRate > marketRate ? '↑' : '→'} 
                    Market: ₹{marketRate.toFixed(2)}/kg
                    {formData.feedRate !== marketRate && (
                      <span className="ml-1">
                        ({formData.feedRate < marketRate ? 'Good' : formData.feedRate > marketRate ? 'High' : 'Match'})
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
            {marketRateLoading && (
              <div className="mt-2 text-xs text-neutral-500">Loading market rate...</div>
            )}
          </div>
        </div>

        {/* Feed Refusal */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            चारा अस्वीकृत (kg) - वैकल्पिक
          </label>
          <div className="relative">
            <PaintBucket className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.feedRefusalKg || ''}
              onChange={(e) => setFormData({ ...formData, feedRefusalKg: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Feed-Water Ratio Alert */}
        {feedWaterAlert && feedWaterAlert.isDeviated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              feedWaterAlert.alertType === 'low'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <WarningCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">
                  {feedWaterAlert.alertType === 'low'
                    ? 'पानी कम पिया जा रहा है'
                    : 'बहुत अधिक पानी'}
                </p>
                <p className="text-sm mt-1">
                  अनुपात: {feedWaterAlert.ratio.toFixed(2)} (मानक: 1.8-3.5)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-3">
            <WarningCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            रद्द करें
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand-green-600 text-white rounded-xl font-medium hover:bg-brand-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                सबमिट हो रहा है...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                दर्ज करें
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  );
}
