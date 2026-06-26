'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Calendar, MapPin, Package, Receipt as ReceiptIcon } from '@phosphor-icons/react';
import useSWR from 'swr';

const expenseSchema = z.object({
  expenseDate: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  farmId: z.string().optional(),
  batchId: z.string().optional(),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'card']),
  gstAmount: z.number().min(0).optional(),
  isTaxDeductible: z.boolean().default(true),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const CATEGORY_LABELS: Record<string, { en: string; hi: string; icon: string; group: string }> = {
  // Farm Operations
  veterinary_visit: { en: 'Veterinary Visit', hi: 'पशु चिकित्सक यात्रा', icon: '🏥', group: 'Farm Operations' },
  farm_repair: { en: 'Farm Repair', hi: 'फार्म मरम्मत', icon: '🔧', group: 'Farm Operations' },
  equipment_purchase: { en: 'Equipment Purchase', hi: 'उपकरण खरीद', icon: '🔧', group: 'Farm Operations' },
  equipment_maintenance: { en: 'Equipment Maintenance', hi: 'उपकरण रखरखाव', icon: '🔧', group: 'Farm Operations' },
  
  // Vehicle
  vehicle_fuel: { en: 'Vehicle Fuel', hi: 'वाहन ईंधन', icon: '⛽', group: 'Vehicle' },
  vehicle_maintenance: { en: 'Vehicle Maintenance', hi: 'वाहन रखरखाव', icon: '🔧', group: 'Vehicle' },
  vehicle_insurance: { en: 'Vehicle Insurance', hi: 'वाहन बीमा', icon: '🛡️', group: 'Vehicle' },
  
  // Office
  office_supplies: { en: 'Office Supplies', hi: 'कार्यालय सामग्री', icon: '📦', group: 'Office' },
  communication: { en: 'Communication', hi: 'संचार', icon: '📱', group: 'Office' },
  internet: { en: 'Internet', hi: 'इंटरनेट', icon: '🌐', group: 'Office' },
  printing: { en: 'Printing', hi: 'प्रिंटिंग', icon: '🖨️', group: 'Office' },
  
  // Professional
  audit_fees: { en: 'Audit Fees', hi: 'ऑडिट शुल्क', icon: '📊', group: 'Professional' },
  legal_fees: { en: 'Legal Fees', hi: 'विधि शुल्क', icon: '⚖️', group: 'Professional' },
  consultant_fees: { en: 'Consultant Fees', hi: 'सलाहकार शुल्क', icon: '👔', group: 'Professional' },
  
  // Other
  travel: { en: 'Travel', hi: 'यात्रा', icon: '✈️', group: 'Other' },
  insurance: { en: 'Insurance', hi: 'बीमा', icon: '🛡️', group: 'Other' },
  rent: { en: 'Rent', hi: 'किराया', icon: '🏢', group: 'Other' },
  utilities: { en: 'Utilities', hi: 'उपयोगिता', icon: '💡', group: 'Other' },
  professional_fees: { en: 'Professional Fees', hi: 'पेशेवर शुल्क', icon: '👔', group: 'Other' },
  marketing: { en: 'Marketing', hi: 'मार्केटिंग', icon: '📢', group: 'Other' },
  miscellaneous: { en: 'Miscellaneous', hi: 'विविध', icon: '📝', group: 'Other' },
  bank_charges: { en: 'Bank Charges', hi: 'बैंक शुल्क', icon: '🏦', group: 'Other' },
  equipment: { en: 'Equipment', hi: 'उपकरण', icon: '🔧', group: 'Other' },
  office: { en: 'Office', hi: 'ऑफिस', icon: '🏢', group: 'Other' },
  other: { en: 'Other', hi: 'अन्य', icon: '📝', group: 'Other' },
};

interface AddExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  language?: 'en' | 'hi';
}

export function AddExpenseForm({ onSuccess, onCancel, language = 'en' }: AddExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  
  const { data: farms } = useSWR('/api/farms');
  const { data: batches } = useSWR(selectedFarmId ? `/api/farms/${selectedFarmId}/batches` : null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      isTaxDeductible: true,
      gstAmount: 0,
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          farmId: data.farmId || null,
          batchId: data.batchId || null,
          gstAmount: data.gstAmount || 0,
          receiptUrl: data.receiptUrl || null,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Error creating expense:', error);
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHindi = language === 'hi';

  // Group categories
  const groupedCategories = Object.entries(CATEGORY_LABELS).reduce((acc, [key, value]) => {
    if (!acc[value.group]) {
      acc[value.group] = [];
    }
    acc[value.group].push({ key, ...value });
    return acc;
  }, {} as Record<string, Array<{ key: string; en: string; hi: string; icon: string; group: string }>>);

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isHindi ? 'खर्च जोड़ें' : 'Add Expense'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'दिनांक' : 'Date'}
          </label>
          <div className="relative">
            <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              {...register('expenseDate')}
              className="w-full pl-10 pr-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
            />
          </div>
          {errors.expenseDate && (
            <p className="text-red-600 text-xs mt-1">{errors.expenseDate.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'श्रेणी' : 'Category'}
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
          >
            <option value="">{isHindi ? 'श्रेणी चुनें' : 'Select category'}</option>
            {Object.entries(groupedCategories).map(([group, categories]) => (
              <optgroup key={group} label={group}>
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {isHindi ? cat.hi : cat.en}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'विवरण' : 'Description'}
          </label>
          <input
            type="text"
            {...register('description')}
            placeholder={isHindi ? 'खर्च का विवरण दर्ज करें' : 'Enter expense description'}
            className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'राशि (₹)' : 'Amount (₹)'}
          </label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
          />
          {errors.amount && (
            <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Farm (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'फार्म (वैकल्पिक)' : 'Farm (Optional)'}
          </label>
          <div className="relative">
            <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              {...register('farmId')}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
            >
              <option value="">{isHindi ? 'फार्म चुनें (वैकल्पिक)' : 'Select farm (optional)'}</option>
              {farms?.map((farm: any) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'बैच (वैकल्पिक)' : 'Batch (Optional)'}
          </label>
          <div className="relative">
            <Package size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              {...register('batchId')}
              disabled={!selectedFarmId}
              className="w-full pl-10 pr-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{isHindi ? 'बैच चुनें (वैकल्पिक)' : 'Select batch (optional)'}</option>
              {batches?.map((batch: any) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'भुगतान का तरीका' : 'Payment Mode'}
          </label>
          <select
            {...register('paymentMode')}
            className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
          >
            <option value="cash">{isHindi ? 'नकद' : 'Cash'}</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">{isHindi ? 'बैंक ट्रांसफर' : 'Bank Transfer'}</option>
            <option value="card">{isHindi ? 'कार्ड' : 'Card'}</option>
          </select>
        </div>

        {/* GST Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'GST राशि (₹)' : 'GST Amount (₹)'}
          </label>
          <input
            type="number"
            step="0.01"
            {...register('gstAmount', { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
          />
        </div>

        {/* Tax Deductible */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('isTaxDeductible')}
            className="w-4 h-4 text-[#3DAE72] border-gray-300 rounded focus:ring-[#3DAE72]"
          />
          <label className="text-sm text-gray-700">
            {isHindi ? 'कर कटौती योग्य' : 'Tax Deductible'}
          </label>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'रसीद URL (वैकल्पिक)' : 'Receipt URL (Optional)'}
          </label>
          <div className="relative">
            <ReceiptIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              {...register('receiptUrl')}
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
            />
          </div>
          {errors.receiptUrl && (
            <p className="text-red-600 text-xs mt-1">{errors.receiptUrl.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isHindi ? 'टिप्पणियाँ (वैकल्पिक)' : 'Notes (Optional)'}
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder={isHindi ? 'अतिरिक्त टिप्पणियाँ' : 'Additional notes'}
            className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[#E3EDE7] rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (isHindi ? 'जोड़ रहा है...' : 'Adding...') : (isHindi ? 'खर्च जोड़ें' : 'Add Expense')}
          </button>
        </div>
      </form>
    </div>
  );
}
