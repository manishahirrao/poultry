'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { CheckCircle, Warning } from '@phosphor-icons/react';

const DailyLogSchema = z.object({
  birds_dead: z.number().int().min(0).max(10000),
  feed_kg: z.number().positive().max(50000),
  water_liters: z.number().positive().max(100000).optional(),
  temp_min: z.number().min(-10).max(60).optional(),
  temp_max: z.number().min(-10).max(60).optional(),
  avg_weight_g: z.number().positive().max(4000).optional(),
  notes: z.string().max(500).optional(),
  // Environment tracking fields (GAP4)
  temp_morning: z.number().min(0).max(50).optional(),
  temp_afternoon: z.number().min(0).max(50).optional(),
  temp_evening: z.number().min(0).max(50).optional(),
  humidity_morning: z.number().min(0).max(100).optional(),
  humidity_afternoon: z.number().min(0).max(100).optional(),
  ammonia_ppm: z.number().min(0).max(200).optional(),
  ammonia_method: z.enum(['measured', 'estimated_litter']).optional(),
  litter_condition: z.enum(['dry', 'damp', 'wet', 'very_wet']).optional(),
  light_hours: z.number().min(0).max(24).optional(),
  light_schedule: z.enum(['continuous', 'intermittent', 'other']).optional(),
  fan_speed: z.enum(['tunnel', 'low', 'medium', 'high']).optional(),
  curtain_position: z.enum(['fully_open', 'half_open', 'closed']).optional(),
  inlet_pct: z.number().int().min(0).max(100).optional(),
  ventilation_notes: z.string().max(500).optional(),
  water_temp_c: z.number().min(0).max(50).optional(),
});

type DailyLogForm = z.infer<typeof DailyLogSchema>;

interface DailyLogFormProps {
  farmId: string;
  batchId: string;
  birdsPlaced: number;
  birdsAlive: number;
  cumulativeFeedKg: number;
  cumulativeDead: number;
  yesterdayWeight?: number;
  onLogSaved: () => void;
}

export function DailyLogForm({
  farmId,
  batchId,
  birdsPlaced,
  birdsAlive,
  cumulativeFeedKg,
  cumulativeDead,
  yesterdayWeight,
  onLogSaved,
}: DailyLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [draftFloppyDiskd, setDraftFloppyDiskd] = useState(false);
  const [envExpanded, setEnvExpanded] = useState(() => {
    // Check localStorage for collapse preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`env_expanded_${farmId}`);
      return saved === null ? true : saved === 'true';
    }
    return true;
  });

  const today = new Date().toISOString().split('T')[0];

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DailyLogForm>({
    resolver: zodResolver(DailyLogSchema),
    defaultValues: {
      birds_dead: 0,
      feed_kg: 0,
      water_liters: 0,
      temp_min: undefined,
      temp_max: undefined,
      avg_weight_g: undefined,
      notes: '',
      // Environment tracking fields (GAP4)
      temp_morning: undefined,
      temp_afternoon: undefined,
      temp_evening: undefined,
      humidity_morning: undefined,
      humidity_afternoon: undefined,
      ammonia_ppm: undefined,
      ammonia_method: undefined,
      litter_condition: undefined,
      light_hours: undefined,
      light_schedule: undefined,
      fan_speed: undefined,
      curtain_position: undefined,
      inlet_pct: undefined,
      ventilation_notes: undefined,
      water_temp_c: undefined,
    },
  });

  const watchedValues = watch();

  // FloppyDisk environment section collapse preference
  useEffect(() => {
    localStorage.setItem(`env_expanded_${farmId}`, envExpanded.toString());
  }, [envExpanded, farmId]);

  // Environment status calculation
  const envStatus = {
    temp: (watchedValues.temp_afternoon !== undefined && watchedValues.temp_afternoon <= 35 && watchedValues.temp_morning !== undefined && watchedValues.temp_morning >= 10) ? 'ok' : 'warning',
    humidity: (watchedValues.humidity_morning !== undefined && watchedValues.humidity_morning <= 75 && watchedValues.humidity_afternoon !== undefined && watchedValues.humidity_afternoon <= 75) ? 'ok' : 'warning',
    ammonia: !watchedValues.ammonia_ppm || watchedValues.ammonia_ppm < 10 ? 'ok' : watchedValues.ammonia_ppm < 25 ? 'warning' : 'critical',
  };

  // Litter condition to ammonia mapping
  const litterToAmmonia: Record<string, string> = {
    dry: '2–5 ppm',
    damp: '10–20 ppm',
    wet: '25–40 ppm',
    very_wet: '40+ ppm'
  };

  // Water:Feed ratio calculation
  const waterFeedRatio = (() => {
    if (!watchedValues.feed_kg || !watchedValues.water_liters) return null;
    const ratio = watchedValues.water_liters / watchedValues.feed_kg;
    return ratio.toFixed(2);
  })();

  // Check online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      submitPendingDraft();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [farmId]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await idbGet(`log_draft_${farmId}_${today}`);
        if (draft) {
          Object.keys(draft).forEach((key) => {
            setValue(key as any, draft[key]);
          });
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    };
    loadDraft();
  }, [farmId, today, setValue]);

  // FloppyDisk draft to IndexedDB on every field change
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await idbSet(`log_draft_${farmId}_${today}`, watchedValues);
        setDraftFloppyDiskd(true);
        setTimeout(() => setDraftFloppyDiskd(false), 2000);
      } catch (e) {
        console.error('Failed to save draft:', e);
      }
    };

    const timer = setTimeout(saveDraft, 500);
    return () => clearTimeout(timer);
  }, [watchedValues, farmId, today]);

  const submitPendingDraft = async () => {
    try {
      const draft = await idbGet(`log_draft_${farmId}_${today}`);
      if (draft && !isOffline) {
        await submitLog(draft);
        await idbDel(`log_draft_${farmId}_${today}`);
      }
    } catch (e) {
      console.error('Failed to submit pending draft:', e);
    }
  };

  // Auto-computed values
  const computedFCR = (() => {
    if (!watchedValues.feed_kg || !watchedValues.avg_weight_g || birdsAlive === 0) {
      return null;
    }
    const birdsAliveKg = birdsAlive * (watchedValues.avg_weight_g / 1000);
    const totalFeedKg = cumulativeFeedKg + watchedValues.feed_kg;
    return totalFeedKg / birdsAliveKg;
  })();

  const computedADG = (() => {
    if (!watchedValues.avg_weight_g || yesterdayWeight === undefined) {
      return null;
    }
    return watchedValues.avg_weight_g - yesterdayWeight;
  })();

  const computedMortalityPct = (() => {
    const totalDead = cumulativeDead + watchedValues.birds_dead;
    return (totalDead / birdsPlaced) * 100;
  })();

  const onSubmit = async (data: DailyLogForm) => {
    setIsSubmitting(true);
    try {
      await submitLog(data);
    } catch (error) {
      console.error('Failed to submit log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLog = async (data: DailyLogForm) => {
    try {
      const response = await fetch(`/api/farms/${farmId}/daily-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_date: today,
          deaths_today: data.birds_dead,
          feed_consumed_kg: data.feed_kg,
          water_litres: data.water_liters,
          temp_min_c: data.temp_min,
          temp_max_c: data.temp_max,
          sample_birds: data.avg_weight_g ? 10 : undefined,
          sample_weight_kg: data.avg_weight_g ? (data.avg_weight_g / 1000) * 10 : undefined,
          weigh_in_today: !!data.avg_weight_g,
          notes: data.notes,
          // Environment tracking fields (GAP4)
          temp_morning: data.temp_morning,
          temp_afternoon: data.temp_afternoon,
          temp_evening: data.temp_evening,
          humidity_morning: data.humidity_morning,
          humidity_afternoon: data.humidity_afternoon,
          ammonia_ppm: data.ammonia_ppm,
          ammonia_method: data.ammonia_method,
          litter_condition: data.litter_condition,
          light_hours: data.light_hours,
          light_schedule: data.light_schedule,
          fan_speed: data.fan_speed,
          curtain_position: data.curtain_position,
          inlet_pct: data.inlet_pct,
          ventilation_notes: data.ventilation_notes,
          water_temp_c: data.water_temp_c,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save log');
      }

      await idbSet(`log_draft_${farmId}_${today}`, null);
      
      // Trigger GC recompute after daily log submission (GAP-020)
      try {
        await fetch(`/api/farms/${farmId}/gc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}), // Empty body to trigger recompute only
        });
      } catch (gcError) {
        console.error('Failed to trigger GC recompute:', gcError);
        // Don't fail the log submission if GC recompute fails
      }
      
      onLogSaved();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="bg-white border border-[#E3EDE7] rounded-xl p-6 mb-6">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4" role="alert" aria-live="polite">
          <p className="text-sm flex items-center gap-2">
            <Warning size={16} />
            You are offline. Your log will be saved and submitted when you reconnect.
          </p>
        </div>
      )}

      {/* Draft FloppyDiskd Indicator */}
      {draftFloppyDiskd && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg mb-4 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          Draft saved
        </div>
      )}

      {/* Form Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Log Today's Data</h3>
        <p className="text-sm text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: birds_dead, feed_kg, water_liters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Birds Dead Today <span className="text-red-500">*</span>
            </label>
            <input
              {...register('birds_dead', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="0"
              max="10000"
              className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] text-lg"
              placeholder="0"
              aria-label="Number of birds dead today"
            />
            {errors.birds_dead && <p className="text-red-500 text-sm mt-1">{errors.birds_dead.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Feed (kg) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('feed_kg', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="0"
              step="0.1"
              max="50000"
              className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] text-lg"
              placeholder="0"
              aria-label="Feed consumed in kg"
            />
            {errors.feed_kg && <p className="text-red-500 text-sm mt-1">{errors.feed_kg.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Water (L)
            </label>
            <input
              {...register('water_liters', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="0"
              step="0.1"
              max="100000"
              className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
              placeholder="0"
              aria-label="Water consumed in liters"
            />
            {errors.water_liters && <p className="text-red-500 text-sm mt-1">{errors.water_liters.message}</p>}
            {waterFeedRatio && (
              <p className={`text-xs mt-1 ${parseFloat(waterFeedRatio) >= 1.5 && parseFloat(waterFeedRatio) <= 2.5 ? 'text-green-600' : 'text-amber-600'}`}>
                W:F: {waterFeedRatio} {parseFloat(waterFeedRatio) >= 1.5 && parseFloat(waterFeedRatio) <= 2.5 ? '✓' : '⚠'}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: temp_min, temp_max, avg_weight_g */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Temp (°C)
            </label>
            <input
              {...register('temp_min', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="-10"
              max="60"
              className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
              placeholder="20"
              aria-label="Minimum temperature in Celsius"
            />
            {errors.temp_min && <p className="text-red-500 text-sm mt-1">{errors.temp_min.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Temp (°C)
            </label>
            <input
              {...register('temp_max', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="-10"
              max="60"
              className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
              placeholder="30"
              aria-label="Maximum temperature in Celsius"
            />
            {errors.temp_max && <p className="text-red-500 text-sm mt-1">{errors.temp_max.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Avg Weight (g)
            </label>
            <input
              {...register('avg_weight_g', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              max="4000"
              className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
              placeholder="0"
              aria-label="Average weight in grams"
            />
            {errors.avg_weight_g && <p className="text-red-500 text-sm mt-1">{errors.avg_weight_g.message}</p>}
          </div>
        </div>

        {/* Environment Data Section (GAP4) */}
        <div className="border border-[#E3EDE7] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setEnvExpanded(!envExpanded)}
            className="w-full px-6 py-4 bg-[#F4F7F5] flex items-center justify-between hover:bg-[#E9F0EC] transition-colors"
            aria-expanded={envExpanded}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌡️</span>
              <h4 className="text-lg font-semibold text-gray-900">Environment Data</h4>
            </div>
            <span className="text-gray-500 transform transition-transform">{envExpanded ? '▲' : '▼'}</span>
          </button>

          {envExpanded && (
            <div className="p-6 space-y-6">
              {/* Temperature Row - Morning, Afternoon, Evening */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Temperature (°C) <span className="text-gray-500 font-normal">— Morning | Afternoon | Evening</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      {...register('temp_morning', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="22"
                      aria-label="Morning temperature in Celsius"
                    />
                    {errors.temp_morning && <p className="text-red-500 text-sm mt-1">{errors.temp_morning.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('temp_afternoon', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="31"
                      aria-label="Afternoon temperature in Celsius"
                    />
                    {errors.temp_afternoon && <p className="text-red-500 text-sm mt-1">{errors.temp_afternoon.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('temp_evening', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="27"
                      aria-label="Evening temperature in Celsius"
                    />
                    {errors.temp_evening && <p className="text-red-500 text-sm mt-1">{errors.temp_evening.message}</p>}
                  </div>
                </div>
                {/* Temperature Alerts */}
                {(watchedValues.temp_morning !== undefined && watchedValues.temp_morning < 10) && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Warning size={16} />
                    ⚠ Cold stress risk — check heating and litter moisture
                  </div>
                )}
                {(watchedValues.temp_afternoon !== undefined && watchedValues.temp_afternoon > 35) && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Warning size={16} />
                    ⚠ Heat stress risk — monitor water intake and ventilation
                  </div>
                )}
              </div>

              {/* Humidity Row - Morning, Afternoon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Humidity (%) <span className="text-gray-500 font-normal">— Optional but recommended</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('humidity_morning', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="65"
                      aria-label="Morning humidity percentage"
                    />
                    {errors.humidity_morning && <p className="text-red-500 text-sm mt-1">{errors.humidity_morning.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('humidity_afternoon', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="75"
                      aria-label="Afternoon humidity percentage"
                    />
                    {errors.humidity_afternoon && <p className="text-red-500 text-sm mt-1">{errors.humidity_afternoon.message}</p>}
                  </div>
                </div>
                {/* Humidity Alerts */}
                {(watchedValues.humidity_morning !== undefined && watchedValues.humidity_morning > 75) && (
                  <div className="mt-2 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
                    🔴 HIGH HUMIDITY — Respiratory disease risk elevated. Check ventilation and litter condition.
                  </div>
                )}
                {(watchedValues.humidity_morning !== undefined && watchedValues.humidity_morning < 40) && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm">
                    ⚠ LOW HUMIDITY — Dust and respiratory irritation risk.
                  </div>
                )}
              </div>

              {/* Ammonia Field with Measured/Estimated Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ammonia Level (ppm)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        {...register('ammonia_method')}
                        type="radio"
                        value="measured"
                        className="w-4 h-4 text-[#1A5C34] focus:ring-[#1A5C34]"
                      />
                      <span className="text-sm text-gray-700">Measured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        {...register('ammonia_method')}
                        type="radio"
                        value="estimated_litter"
                        className="w-4 h-4 text-[#1A5C34] focus:ring-[#1A5C34]"
                      />
                      <span className="text-sm text-gray-700">Estimated via Litter Condition</span>
                    </label>
                  </div>

                  {watchedValues.ammonia_method === 'measured' && (
                    <input
                      {...register('ammonia_ppm', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="200"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="8"
                      aria-label="Ammonia level in ppm"
                    />
                  )}

                  {watchedValues.ammonia_method === 'estimated_litter' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Litter Condition</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['dry', 'damp', 'wet', 'very_wet'].map((condition) => (
                          <label key={condition} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                            <input
                              {...register('litter_condition')}
                              type="radio"
                              value={condition}
                              className="w-4 h-4 text-[#1A5C34] focus:ring-[#1A5C34]"
                            />
                            <span className="text-sm text-gray-700 capitalize">{condition.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                      {watchedValues.litter_condition && (
                        <p className="mt-2 text-sm text-gray-600">
                          Estimated: ~{litterToAmmonia[watchedValues.litter_condition]} {watchedValues.litter_condition !== 'dry' && '⚠'}
                        </p>
                      )}
                    </div>
                  )}

                  {errors.ammonia_ppm && <p className="text-red-500 text-sm mt-1">{errors.ammonia_ppm.message}</p>}
                </div>

                {/* Ammonia Alerts */}
                {watchedValues.ammonia_ppm !== undefined && (
                  <>
                    {watchedValues.ammonia_ppm < 10 && (
                      <div className="mt-2 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm">
                    Normal ✓
                  </div>
                )}
                    {watchedValues.ammonia_ppm >= 10 && watchedValues.ammonia_ppm < 25 && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm">
                    ⚠ Elevated — check litter condition and ventilation
                  </div>
                )}
                    {watchedValues.ammonia_ppm >= 25 && (
                  <div className="mt-2 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
                    🔴 DANGEROUS — Birds experience eye damage and respiratory disease. Immediate ventilation increase required. Consult your vet.
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Light Programme */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Light Programme
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('light_hours', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="24"
                      step="0.1"
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                      placeholder="16"
                      aria-label="Light hours today"
                    />
                    {errors.light_hours && <p className="text-red-500 text-sm mt-1">{errors.light_hours.message}</p>}
                  </div>
                  <div>
                    <select
                      {...register('light_schedule')}
                      className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] bg-white"
                      aria-label="Light schedule"
                    >
                      <option value="">Select schedule...</option>
                      <option value="continuous">Continuous</option>
                      <option value="intermittent">Intermittent</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.light_schedule && <p className="text-red-500 text-sm mt-1">{errors.light_schedule.message}</p>}
                  </div>
                </div>
              </div>

              {/* Ventilation Section (Optional, Collapsible) */}
              <div className="border border-[#E3EDE7] rounded-lg p-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-semibold text-gray-700">Ventilation Settings (Optional)</span>
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Fan Speed</label>
                        <select
                          {...register('fan_speed')}
                          className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] bg-white text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="tunnel">Tunnel</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Curtain Position</label>
                        <select
                          {...register('curtain_position')}
                          className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] bg-white text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="fully_open">Fully Open</option>
                          <option value="half_open">Half Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Inlet Opening (%)</label>
                        <input
                          {...register('inlet_pct', { valueAsNumber: true })}
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] text-sm"
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Ventilation Notes</label>
                      <textarea
                        {...register('ventilation_notes')}
                        className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34] text-sm"
                        rows={2}
                        maxLength={500}
                        placeholder="Any ventilation observations..."
                      />
                    </div>
                  </div>
                </details>
              </div>

              {/* Water Temperature */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Water Temperature (°C) <span className="text-gray-500 font-normal">— Optional</span>
                </label>
                <input
                  {...register('water_temp_c', { valueAsNumber: true })}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="50"
                  className="w-full md:w-1/2 px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
                  placeholder="25"
                  aria-label="Water temperature in Celsius"
                />
                {errors.water_temp_c && <p className="text-red-500 text-sm mt-1">{errors.water_temp_c.message}</p>}
              </div>

              {/* Environment Summary Bar */}
              <div className="bg-[#F4F7F5] border border-[#E3EDE7] rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Today's Environment Summary</h5>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className={`flex items-center gap-1 ${envStatus.temp === 'ok' ? 'text-green-700' : 'text-amber-700'}`}>
                    {envStatus.temp === 'ok' ? '✅' : '⚠'} Temp: {envStatus.temp === 'ok' ? 'OK' : 'Check values'}
                  </span>
                  <span className={`flex items-center gap-1 ${envStatus.humidity === 'ok' ? 'text-green-700' : 'text-amber-700'}`}>
                    {envStatus.humidity === 'ok' ? '✅' : '⚠'} Humidity: {envStatus.humidity === 'ok' ? 'OK' : 'Elevated'}
                  </span>
                  <span className={`flex items-center gap-1 ${envStatus.ammonia === 'ok' ? 'text-green-700' : envStatus.ammonia === 'warning' ? 'text-amber-700' : 'text-red-700'}`}>
                    {envStatus.ammonia === 'ok' ? '✅' : envStatus.ammonia === 'warning' ? '⚠' : '🔴'} Ammonia: {envStatus.ammonia === 'ok' ? 'OK' : envStatus.ammonia === 'warning' ? 'Elevated' : 'Dangerous'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-4 py-3 border border-[#CBD5CE] rounded-lg focus:ring-2 focus:ring-[#1A5C34] focus:border-[#1A5C34]"
            rows={3}
            maxLength={500}
            placeholder="कोई special observation? Visitor, power cut, water issue, medication given..."
            aria-label="Additional notes"
          />
          <p className="text-xs text-gray-500 mt-1">{watchedValues.notes?.length || 0}/500</p>
          {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
        </div>

        {/* Computed Values Row */}
        <div className="bg-[#F4F7F5] border border-[#E3EDE7] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Computed Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">FCR</p>
              <p className="text-lg font-semibold text-gray-900 tabular-nums">
                {computedFCR ? computedFCR.toFixed(3) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">ADG (g)</p>
              <p className="text-lg font-semibold text-gray-900 tabular-nums">
                {computedADG !== null ? (computedADG > 0 ? `+${computedADG.toFixed(0)}` : computedADG.toFixed(0)) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Mortality %</p>
              <p className="text-lg font-semibold text-gray-900 tabular-nums">
                {computedMortalityPct.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-4 bg-[#1A5C34] text-white rounded-lg hover:bg-[#1F7040] transition-colors font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'FloppyDisk Today\'s Log ✓'}
        </button>
      </form>
    </div>
  );
}
