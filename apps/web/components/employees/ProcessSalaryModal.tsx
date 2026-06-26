'use client';

import { useState, useEffect } from 'react';
import { X, CurrencyDollar, Plus, Minus } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  name_hindi?: string;
  role: string;
  employment_type: string;
  base_salary_monthly?: number;
  daily_wage_rate?: number;
  assigned_farm_ids?: string[];
}

interface Farm {
  id: string;
  name: string;
}

interface ProcessSalaryModalProps {
  employee: Employee;
  month: number;
  year: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language?: 'en' | 'hi';
}

const ProcessSalarySchema = z.object({
  daysPresent: z.number().int().min(0).max(31),
  daysAbsent: z.number().int().min(0).max(31).default(0),
  daysHoliday: z.number().int().min(0).max(31).default(0),
  overtimeHrs: z.number().min(0).default(0),
  overtimeRate: z.number().min(0).default(0),
  basicSalary: z.number().min(0),
  hra: z.number().min(0).default(0),
  conveyance: z.number().min(0).default(0),
  bonusAmount: z.number().min(0).default(0),
  overtimeAmount: z.number().min(0).default(0),
  otherEarnings: z.number().min(0).default(0),
  pfDeduction: z.number().min(0).default(0),
  esiDeduction: z.number().min(0).default(0),
  advanceDeduction: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  paymentMode: z.enum(['bank_transfer', 'cash', 'upi']),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
  farmAllocations: z.array(z.object({
    farm_id: z.string().uuid(),
    allocation_pct: z.number().min(0).max(100)
  })).optional(),
});

type ProcessSalaryFormData = z.infer<typeof ProcessSalarySchema>;

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ProcessSalaryModal({ 
  employee, 
  month, 
  year, 
  isOpen, 
  onClose, 
  onSuccess,
  language = 'en' 
}: ProcessSalaryModalProps) {
  const isHindi = language === 'hi';
  const supabase = createClient();
  
  const { data: farms } = useSWR<Farm[]>('/api/farms', fetcher);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmAllocations, setFarmAllocations] = useState<Array<{ farm_id: string; allocation_pct: number }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProcessSalaryFormData>({
    resolver: zodResolver(ProcessSalarySchema),
    defaultValues: {
      daysPresent: 30,
      daysAbsent: 0,
      daysHoliday: 0,
      overtimeHrs: 0,
      overtimeRate: 0,
      basicSalary: employee.base_salary_monthly || (employee.daily_wage_rate || 0) * 30 || 0,
      hra: 0,
      conveyance: 0,
      bonusAmount: 0,
      overtimeAmount: 0,
      otherEarnings: 0,
      pfDeduction: 0,
      esiDeduction: 0,
      advanceDeduction: 0,
      otherDeductions: 0,
      paymentMode: 'bank_transfer',
    },
  });

  const watchedValues = watch();

  // Initialize farm allocations
  useEffect(() => {
    if (farms && employee.assigned_farm_ids && employee.assigned_farm_ids.length > 0) {
      const assignedFarms = farms.filter(f => employee.assigned_farm_ids?.includes(f.id));
      const allocationPct = Math.floor(100 / assignedFarms.length);
      const allocations = assignedFarms.map(f => ({
        farm_id: f.id,
        allocation_pct: allocationPct
      }));
      setFarmAllocations(allocations);
    }
  }, [farms, employee.assigned_farm_ids]);

  // Computed values
  const grossEarnings = 
    (watchedValues.basicSalary || 0) +
    (watchedValues.hra || 0) +
    (watchedValues.conveyance || 0) +
    (watchedValues.bonusAmount || 0) +
    (watchedValues.overtimeAmount || 0) +
    (watchedValues.otherEarnings || 0);

  const totalDeductions = 
    (watchedValues.pfDeduction || 0) +
    (watchedValues.esiDeduction || 0) +
    (watchedValues.advanceDeduction || 0) +
    (watchedValues.otherDeductions || 0);

  const netSalary = grossEarnings - totalDeductions;

  const formatCurrencyDollar = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const onSubmit = async (data: ProcessSalaryFormData) => {
    if (!supabase) return;
    setIsSubmitting(true);
    try {
      // Check if salary record already exists
      const { data: existingRecord } = await supabase
        .from('salary_records')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('month', month)
        .eq('year', year)
        .single();

      if (existingRecord) {
        // Update existing record
        await supabase
          .from('salary_records')
          .update({
            days_present: data.daysPresent,
            days_absent: data.daysAbsent,
            days_holiday: data.daysHoliday,
            overtime_hrs: data.overtimeHrs,
            overtime_rate: data.overtimeRate,
            basic_salary: data.basicSalary,
            hra: data.hra,
            conveyance: data.conveyance,
            bonus_amount: data.bonusAmount,
            overtime_amount: data.overtimeAmount,
            other_earnings: data.otherEarnings,
            gross_earnings: grossEarnings,
            pf_deduction: data.pfDeduction,
            esi_deduction: data.esiDeduction,
            advance_deduction: data.advanceDeduction,
            other_deductions: data.otherDeductions,
            total_deductions: totalDeductions,
            net_salary: netSalary,
            payment_status: 'processing',
            payment_mode: data.paymentMode,
            payment_reference: data.paymentReference,
            payment_notes: data.paymentNotes,
            farm_allocations: farmAllocations,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id);
      } else {
        // Create new record
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase
          .from('salary_records')
          .insert({
            employee_id: employee.id,
            integrator_id: user?.id,
            month,
            year,
            days_present: data.daysPresent,
            days_absent: data.daysAbsent,
            days_holiday: data.daysHoliday,
            overtime_hrs: data.overtimeHrs,
            overtime_rate: data.overtimeRate,
            basic_salary: data.basicSalary,
            hra: data.hra,
            conveyance: data.conveyance,
            bonus_amount: data.bonusAmount,
            overtime_amount: data.overtimeAmount,
            other_earnings: data.otherEarnings,
            gross_earnings: grossEarnings,
            pf_deduction: data.pfDeduction,
            esi_deduction: data.esiDeduction,
            advance_deduction: data.advanceDeduction,
            other_deductions: data.otherDeductions,
            total_deductions: totalDeductions,
            net_salary: netSalary,
            payment_status: 'processing',
            payment_mode: data.paymentMode,
            payment_reference: data.paymentReference,
            payment_notes: data.paymentNotes,
            farm_allocations: farmAllocations,
          });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing salary:', error);
      alert(isHindi ? 'वेतन प्रक्रिया करने में त्रुटि' : 'Error processing salary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!supabase) return;
    setIsSubmitting(true);
    try {
      const { data: existingRecord } = await supabase
        .from('salary_records')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('month', month)
        .eq('year', year)
        .single();

      if (existingRecord) {
        await supabase
          .from('salary_records')
          .update({
            payment_status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert(isHindi ? 'भुगतान चिह्नित करने में त्रुटि' : 'Error marking as paid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E3EDE7] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isHindi ? 'वेतन प्रक्रिया करें' : 'Process Salary'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {employee.full_name} {employee.name_hindi && `(${employee.name_hindi})`} • {employee.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Days Section */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isHindi ? 'दिन उपस्थित' : 'Days Present'}
              </label>
              <input
                type="number"
                {...register('daysPresent', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              />
              {errors.daysPresent && (
                <p className="text-red-500 text-xs mt-1">{errors.daysPresent.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isHindi ? 'दिन अनुपस्थित' : 'Days Absent'}
              </label>
              <input
                type="number"
                {...register('daysAbsent', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isHindi ? 'छुट्टी के दिन' : 'Holidays'}
              </label>
              <input
                type="number"
                {...register('daysHoliday', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              />
            </div>
          </div>

          {/* Earnings Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {isHindi ? 'आय' : 'Earnings'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'बुनियादी वेतन' : 'Basic Salary'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('basicSalary', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'एचआरए' : 'HRA'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('hra', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'यात्रा भत्ता' : 'Conveyance'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('conveyance', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'बोनस' : 'Bonus'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('bonusAmount', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'ओवरटाइम' : 'Overtime'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('overtimeAmount', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'अन्य आय' : 'Other Earnings'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('otherEarnings', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-[#EDF7F1] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {isHindi ? 'कुल आय' : 'Gross Earnings'}
                </span>
                <span className="text-lg font-bold text-[#1A5C34]">
                  {formatCurrencyDollar(grossEarnings)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {isHindi ? 'कटौती' : 'Deductions'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'पीएफ कटौती' : 'PF Deduction'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('pfDeduction', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'ईएसआई कटौती' : 'ESI Deduction'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('esiDeduction', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'अग्रिम कटौती' : 'Advance Deduction'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('advanceDeduction', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isHindi ? 'अन्य कटौती' : 'Other Deductions'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    {...register('otherDeductions', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-[#FEF2F2] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {isHindi ? 'कुल कटौती' : 'Total Deductions'}
                </span>
                <span className="text-lg font-bold text-[#DC2626]">
                  {formatCurrencyDollar(totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Farm Allocation */}
          {farms && employee.assigned_farm_ids && employee.assigned_farm_ids.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {isHindi ? 'फार्म आवंटन' : 'Farm Allocation'}
              </h3>
              <div className="space-y-2">
                {farms.filter(f => employee.assigned_farm_ids?.includes(f.id)).map((farm) => {
                  const allocation = farmAllocations.find(a => a.farm_id === farm.id);
                  return (
                    <div key={farm.id} className="flex items-center gap-4">
                      <span className="flex-1 text-sm text-gray-700">{farm.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newAllocations = farmAllocations.map(a =>
                              a.farm_id === farm.id
                                ? { ...a, allocation_pct: Math.max(0, a.allocation_pct - 10) }
                                : a
                            );
                            setFarmAllocations(newAllocations);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">{allocation?.allocation_pct || 0}%</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newAllocations = farmAllocations.map(a =>
                              a.farm_id === farm.id
                                ? { ...a, allocation_pct: Math.min(100, a.allocation_pct + 10) }
                                : a
                            );
                            setFarmAllocations(newAllocations);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Net Salary Summary */}
          <div className="p-4 bg-[#1A5C34] rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">
                {isHindi ? 'नेट वेतन' : 'Net Salary'}
              </span>
              <span className="text-2xl font-bold text-white">
                {formatCurrencyDollar(netSalary)}
              </span>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isHindi ? 'भुगतान मोड' : 'Payment Mode'}
            </label>
            <select
              {...register('paymentMode')}
              className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
            >
              <option value="bank_transfer">{isHindi ? 'बैंक ट्रांसफर' : 'Bank Transfer'}</option>
              <option value="cash">{isHindi ? 'नकद' : 'Cash'}</option>
              <option value="upi">{isHindi ? 'यूपीआई' : 'UPI'}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isHindi ? 'भुगतान संदर्भ' : 'Payment Reference'}
              </label>
              <input
                type="text"
                {...register('paymentReference')}
                placeholder={isHindi ? 'यूटीआर या लेनदेन आईडी' : 'UTR or Transaction ID'}
                className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isHindi ? 'भुगतान नोट्स' : 'Payment Notes'}
              </label>
              <input
                type="text"
                {...register('paymentNotes')}
                className="w-full px-3 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#E3EDE7]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1A5C34] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A5C34]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting 
                ? (isHindi ? 'सहेज रहा है...' : 'Saving...') 
                : (isHindi ? 'सहेजें' : 'Save')
              }
            </button>
            <button
              type="button"
              onClick={handleMarkAsPaid}
              disabled={isSubmitting}
              className="flex-1 bg-[#3DAE72] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3DAE72]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting 
                ? (isHindi ? 'प्रक्रिया में...' : 'Processing...') 
                : (isHindi ? 'भुगतान के रूप में चिह्नित करें' : 'Mark as Paid')
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-[#E3EDE7] rounded-lg font-medium hover:bg-[#F4F7F5] transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
