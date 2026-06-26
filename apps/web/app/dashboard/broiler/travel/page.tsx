'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FloppyDisk, CheckCircle, X, MagnifyingGlass, 
  Spinner, Truck, MapPin, Calendar, CurrencyDollar
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const travelSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  travel_date: z.string().min(1, 'Date is required'),
  from_location: z.string().min(1, 'From location is required'),
  to_location: z.string().min(1, 'To location is required'),
  km_travelled: z.number().min(0, 'KM travelled must be positive'),
  vehicle_id: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  allowance_rate: z.number().min(0).optional(),
  allowance_amount: z.number().min(0).optional(),
  remarks: z.string().optional(),
});

type TravelFormData = z.infer<typeof travelSchema>;

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
}

interface TravelEntry {
  id: string;
  travel_date: string;
  from_location: string;
  to_location: string;
  km_travelled: number;
  purpose: string;
  allowance_rate: number | null;
  allowance_amount: number | null;
  remarks: string | null;
  created_at: string;
  employees?: { name: string };
  vehicles?: { vehicle_number: string };
}

export default function TravelPage() {
  const { language } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<TravelEntry[]>([]);
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
    setValue,
    formState: { errors },
  } = useForm<TravelFormData>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      travel_date: new Date().toISOString().split('T')[0],
    },
  });

  const kmTravelled = watch('km_travelled');
  const allowanceRate = watch('allowance_rate');

  const allowanceAmount = kmTravelled && allowanceRate ? kmTravelled * allowanceRate : 0;

  useEffect(() => {
    fetchEmployees();
    fetchVehicles();
    fetchEntries();
  }, []);

  const fetchEmployees = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('vehicle_number');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('travel_entries')
        .select('*, employees(name), vehicles(vehicle_number)')
        .eq('integrator_id', user.id)
        .order('travel_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const onSubmit = async (data: TravelFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const calculatedAllowance = data.allowance_amount || (data.km_travelled * (data.allowance_rate || 0));

      const { error } = await supabase
        .from('travel_entries')
        .insert({
          integrator_id: user.id,
          employee_id: data.employee_id,
          travel_date: data.travel_date,
          from_location: data.from_location,
          to_location: data.to_location,
          km_travelled: data.km_travelled,
          vehicle_id: data.vehicle_id || null,
          purpose: data.purpose,
          allowance_rate: data.allowance_rate || null,
          allowance_amount: calculatedAllowance,
          remarks: data.remarks || null,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'यात्रा एंट्री सफलतापूर्वक बनाया गया' 
          : 'Travel entry created successfully'
      });
      
      reset();
      await fetchEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'यात्रा एंट्री बनाने में विफल' 
          : 'Failed to create travel entry'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.employees?.name?.toLowerCase().includes(query) ||
      entry.from_location.toLowerCase().includes(query) ||
      entry.to_location.toLowerCase().includes(query) ||
      entry.purpose.toLowerCase().includes(query) ||
      entry.travel_date.includes(query)
    );
  });

  const formatINR = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '-';
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
            {isHindi ? 'यात्रा एंट्री' : 'Travel Entry'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'कर्मचारियों की यात्रा और भत्ता दर्ज करें' 
              : 'Record employee travel and allowances'}
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
              {/* Employee */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'कर्मचारी' : 'Employee'} <span className="text-red-500">*</span></label>
                <select
                  {...register('employee_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'कर्मचारी चुनें' : 'Select Employee'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                {errors.employee_id && (
                  <p className="text-red-600 text-xs">{errors.employee_id.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'तिथि' : 'Date'} <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  {...register('travel_date')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.travel_date && (
                  <p className="text-red-600 text-xs">{errors.travel_date.message}</p>
                )}
              </div>

              {/* From Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'से स्थान' : 'From Location'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('from_location')}
                  placeholder={isHindi ? 'उदा. शाखा' : 'e.g. Branch'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.from_location && (
                  <p className="text-red-600 text-xs">{errors.from_location.message}</p>
                )}
              </div>

              {/* To Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'तक स्थान' : 'To Location'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('to_location')}
                  placeholder={isHindi ? 'उदा. खेत' : 'e.g. Farm'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.to_location && (
                  <p className="text-red-600 text-xs">{errors.to_location.message}</p>
                )}
              </div>

              {/* KM Travelled */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'किमी यात्रा' : 'KM Travelled'} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  {...register('km_travelled', { valueAsNumber: true })}
                  min="0"
                  step="0.1"
                  placeholder={isHindi ? 'उदा. 25.5' : 'e.g. 25.5'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.km_travelled && (
                  <p className="text-red-600 text-xs">{errors.km_travelled.message}</p>
                )}
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'वाहन' : 'Vehicle'}</label>
                <select
                  {...register('vehicle_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'वाहन चुनें' : 'Select Vehicle'}</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} ({vehicle.vehicle_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'उद्देश्य' : 'Purpose'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('purpose')}
                  placeholder={isHindi ? 'उदा. फार्म विजिट' : 'e.g. Farm Visit'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.purpose && (
                  <p className="text-red-600 text-xs">{errors.purpose.message}</p>
                )}
              </div>

              {/* Allowance Rate */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'भत्ता दर (प्रति किमी)' : 'Allowance Rate (per km)'}</label>
                <input
                  type="number"
                  {...register('allowance_rate', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  placeholder={isHindi ? 'उदा. 5' : 'e.g. 5'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
              </div>

              {/* Allowance Amount (Calculated) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'भत्ता राशि' : 'Allowance Amount'}</label>
                <div className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm bg-[#EDF7F1] text-[#111827] font-mono font-semibold flex items-center gap-2">
                  <CurrencyDollar size={18} className="text-[#1A5C34]" />
                  {allowanceAmount > 0 ? formatINR(allowanceAmount) : '-'}
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
                  placeholder={isHindi ? 'कर्मचारी, स्थान, उद्देश्य खोजें...' : 'MagnifyingGlass employee, location, purpose...'}
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
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कर्मचारी' : 'Employee'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मार्ग' : 'Route'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'उद्देश्य' : 'Purpose'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'किमी' : 'KM'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'भत्ता' : 'Allowance'}</th>
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
                          <Truck size={36} className="text-[#3DAE72]/50" />
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
                        <td className="px-5 py-4 text-[#6B7280] text-xs">{entry.travel_date}</td>
                        <td className="px-5 py-4 font-semibold text-[#111827]">{entry.employees?.name}</td>
                        <td className="px-5 py-4 text-[#6B7280]">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin size={14} />
                            {entry.from_location} → {entry.to_location}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#6B7280]">{entry.purpose}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{entry.km_travelled}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums font-semibold text-[#1A5C34]">{formatINR(entry.allowance_amount)}</td>
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
