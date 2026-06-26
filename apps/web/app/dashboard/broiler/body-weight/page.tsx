'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FloppyDisk, CheckCircle, X, MagnifyingGlass, 
  Scales, Spinner, Calendar, TrendUp
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const bodyWeightSchema = z.object({
  batch_id: z.string().min(1, 'Batch is required'),
  entry_date: z.string().min(1, 'Date is required'),
  sample_birds_weighed: z.number().min(1, 'Sample birds must be at least 1'),
  total_sample_weight_kg: z.number().min(0.01, 'Total weight must be positive'),
  remarks: z.string().optional(),
});

type BodyWeightFormData = z.infer<typeof bodyWeightSchema>;

interface Batch {
  id: string;
  batch_number: number;
  placement_date: string;
  breed: string;
  birds_placed: number;
  status: string;
  farms?: { farm_name: string };
}

interface BodyWeightEntry {
  id: string;
  entry_date: string;
  sample_birds_weighed: number;
  total_sample_weight_kg: number;
  average_weight_g: number;
  remarks: string | null;
  created_at: string;
  batches?: { batch_number: number; farms?: { farm_name: string } };
}

export default function BodyWeightPage() {
  const { language } = useLanguage();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BodyWeightFormData>({
    resolver: zodResolver(bodyWeightSchema),
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
    },
  });

  const sampleBirds = watch('sample_birds_weighed');
  const totalWeight = watch('total_sample_weight_kg');

  const averageWeight = sampleBirds && totalWeight ? (totalWeight * 1000) / sampleBirds : 0;

  useEffect(() => {
    fetchBatches();
    fetchEntries();
  }, []);

  const fetchBatches = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('batches')
        .select('*, farms(farm_name)')
        .eq('integrator_id', user.id)
        .eq('status', 'active')
        .order('placement_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('body_weight_entries')
        .select('*, batches(batch_number, farms(farm_name))')
        .eq('integrator_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const onSubmit = async (data: BodyWeightFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const calculatedAverageWeight = (data.total_sample_weight_kg * 1000) / data.sample_birds_weighed;

      const { error } = await supabase
        .from('body_weight_entries')
        .insert({
          integrator_id: user.id,
          batch_id: data.batch_id,
          entry_date: data.entry_date,
          sample_birds_weighed: data.sample_birds_weighed,
          total_sample_weight_kg: data.total_sample_weight_kg,
          average_weight_g: calculatedAverageWeight,
          remarks: data.remarks || null,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'बॉडी वेट एंट्री सफलतापूर्वक बनाया गया' 
          : 'Body weight entry created successfully'
      });
      
      reset();
      await fetchEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'बॉडी वेट एंट्री बनाने में विफल' 
          : 'Failed to create body weight entry'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.batches?.batch_number?.toString().includes(query) ||
      entry.batches?.farms?.farm_name?.toLowerCase().includes(query) ||
      entry.entry_date.includes(query)
    );
  });

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-8 px-6 pt-8 pb-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Broiler
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'बॉडी वेट एंट्री' : 'Body Weight Entry'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'बैच के लिए बॉडी वेट माप दर्ज करें' 
              : 'Record body weight measurements for batches'}
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-6 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ease-out ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" className="flex-shrink-0" />
          ) : (
            <X size={20} weight="fill" className="flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
          >
            <X size={18} weight="regular" />
          </button>
        </div>
      )}

      <div className="px-6 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wide mb-6">
              {isHindi ? 'नई एंट्री' : 'New Entry'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Batch */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'बैच' : 'Batch'} <span className="text-red-500">*</span></label>
                <select
                  {...register('batch_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'बैच चुनें' : 'Select Batch'}</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      Batch #{batch.batch_number} - {batch.farms?.farm_name} ({batch.breed})
                    </option>
                  ))}
                </select>
                {errors.batch_id && (
                  <p className="text-red-600 text-xs">{errors.batch_id.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'तिथि' : 'Date'} <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  {...register('entry_date')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.entry_date && (
                  <p className="text-red-600 text-xs">{errors.entry_date.message}</p>
                )}
              </div>

              {/* Sample Birds */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'नमूना पक्षी' : 'Sample Birds'} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  {...register('sample_birds_weighed', { valueAsNumber: true })}
                  min="1"
                  placeholder={isHindi ? 'उदा. 50' : 'e.g. 50'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.sample_birds_weighed && (
                  <p className="text-red-600 text-xs">{errors.sample_birds_weighed.message}</p>
                )}
              </div>

              {/* Total Weight */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'कुल वजन (किग्रा)' : 'Total Weight (kg)'} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  {...register('total_sample_weight_kg', { valueAsNumber: true })}
                  min="0.01"
                  step="0.01"
                  placeholder={isHindi ? 'उदा. 2.5' : 'e.g. 2.5'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.total_sample_weight_kg && (
                  <p className="text-red-600 text-xs">{errors.total_sample_weight_kg.message}</p>
                )}
              </div>

              {/* Average Weight (Calculated) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'औसत वजन (ग्राम)' : 'Average Weight (g)'}</label>
                <div className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm bg-[#EDF7F1] text-[#111827] font-mono font-semibold flex items-center gap-2">
                  <TrendUp size={18} className="text-[#1A5C34]" />
                  {averageWeight > 0 ? averageWeight.toFixed(2) : '-'}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'टिप्पणियां' : 'Remarks'}</label>
                <textarea
                  {...register('remarks')}
                  rows={2}
                  placeholder={isHindi ? 'कोई अतिरिक्त नोट्स...' : 'Any additional notes...'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={18} className="animate-spin" />
                    {isHindi ? 'सहेज रहा है...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <FloppyDisk size={18} weight="bold" />
                    {isHindi ? 'सहेजें' : 'FloppyDisk Entry'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
            {/* SlidersHorizontals */}
            <div className="p-5 border-b border-[#E3EDE7]">
              <div className="relative group">
                <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1A5C34] transition-colors" />
                <input
                  type="text"
                  placeholder={isHindi ? 'बैच, खेत, तिथि खोजें...' : 'MagnifyingGlass batch, farm, date...'}
                  value={searchQuery}
                  onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'तिथि' : 'Date'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'बैच' : 'Batch'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'खेत' : 'Farm'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नमूना' : 'Sample'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कुल वजन' : 'Total (kg)'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'औसत (ग्राम)' : 'Avg (g)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Spinner size={24} className="animate-spin text-[#1A5C34]" />
                          <span className="text-sm text-[#6B7280] font-medium">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Scales size={36} className="text-[#3DAE72]/50" />
                          <span className="text-sm text-[#6B7280]">{isHindi ? 'कोई एंट्री नहीं मिली' : 'No entries found'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry, i) => (
                      <tr
                        key={entry.id}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                      >
                        <td className="px-5 py-4 text-[#6B7280] text-xs">{entry.entry_date}</td>
                        <td className="px-5 py-4 font-semibold text-[#111827]">#{entry.batches?.batch_number}</td>
                        <td className="px-5 py-4 text-[#6B7280]">{entry.batches?.farms?.farm_name}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{entry.sample_birds_weighed}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{entry.total_sample_weight_kg.toFixed(2)}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums font-semibold text-[#1A5C34]">{entry.average_weight_g.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
