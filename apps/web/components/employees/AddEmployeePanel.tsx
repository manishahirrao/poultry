'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Buildings, User, CurrencyDollar, Bank } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';

// Brand colors from specs
const BRAND_COLORS = {
  brand700: '#1A5C34',
  brand400: '#3DAE72',
  brand50: '#EDF7F1',
  signal: '#E8611A',
  amber: '#D97706',
  red: '#DC2626',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E3EDE7',
};

// Zod schema matching the employees table
const EmployeeSchema = z.object({
  // Step 1: Personal Info
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  name_hindi: z.string().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
  aadhaar_last4: z.string().length(4, 'Enter last 4 digits of Aadhaar').optional().or(z.literal('')),
  profile_photo_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),

  // Step 2: Role & Assignment
  role: z.enum(['farm_manager', 'field_supervisor', 'farm_worker', 'driver', 'accountant', 'office_staff', 'other']),
  role_custom: z.string().optional(),
  assigned_farm_ids: z.array(z.string().uuid()).optional(),
  employment_type: z.enum(['permanent', 'contractual', 'daily_wage', 'part_time']),
  join_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().or(z.literal('')),
  is_active: z.boolean().default(true),

  // Step 3: Compensation
  base_salary_monthly: z.number().min(0).optional(),
  daily_wage_rate: z.number().min(0).optional(),
  pf_applicable: z.boolean().default(false),
  esi_applicable: z.boolean().default(false),
  bonus_pct: z.number().min(0).max(100).optional(),

  // Step 4: Bank Details
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  bank_name: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof EmployeeSchema>;

interface AddEmployeePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language?: 'en' | 'hi';
}

const ROLE_LABELS: Record<string, { en: string; hi: string }> = {
  farm_manager: { en: 'Farm Manager', hi: 'फार्म मैनेजर' },
  field_supervisor: { en: 'Field Supervisor', hi: 'फील्ड सुपरवाइजर' },
  farm_worker: { en: 'Farm Worker', hi: 'फार्म वर्कर' },
  driver: { en: 'Driver', hi: 'ड्राइवर' },
  accountant: { en: 'Accountant', hi: 'अकाउंटेंट' },
  office_staff: { en: 'Office Staff', hi: 'ऑफिस स्टाफ' },
  other: { en: 'Other', hi: 'अन्य' },
};

const EMPLOYMENT_TYPE_LABELS: Record<string, { en: string; hi: string }> = {
  permanent: { en: 'Permanent', hi: 'स्थायी' },
  contractual: { en: 'Contractual', hi: 'अनुबंधित' },
  daily_wage: { en: 'Daily Wage', hi: 'दैनिक मजदूरी' },
  part_time: { en: 'Part Time', hi: 'अंशकालिक' },
};

const STEPS = [
  { id: 1, title: { en: 'Personal Info', hi: 'व्यक्तिगत जानकारी' }, icon: User },
  { id: 2, title: { en: 'Role & Assignment', hi: 'भूमिका और सौंपना' }, icon: Buildings },
  { id: 3, title: { en: 'Compensation', hi: 'मुआवजा' }, icon: CurrencyDollar },
  { id: 4, title: { en: 'Bank Details', hi: 'बैंक विवरण' }, icon: Bank },
  { id: 5, title: { en: 'Review & Save', hi: 'समीक्षा और सहेजें' }, icon: Check },
];

export function AddEmployeePanel({ isOpen, onClose, onSuccess, language = 'en' }: AddEmployeePanelProps) {
  const isHindi = language === 'hi';
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: farms } = useSWR('/api/farms');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      employment_type: 'permanent',
      is_active: true,
      pf_applicable: false,
      esi_applicable: false,
    },
  });

  const watchedRole = watch('role');
  const watchedEmploymentType = watch('employment_type');

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form and step
        setCurrentStep(1);
      } else {
        const error = await response.json();
        console.error('Error creating employee:', error);
        alert(isHindi ? 'कर्मचारी बनाने में त्रुटि' : 'Error creating employee');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(isHindi ? 'कर्मचारी बनाने में त्रुटि' : 'Error creating employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate: (keyof EmployeeFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate.push('full_name', 'phone');
        break;
      case 2:
        fieldsToValidate.push('role', 'employment_type', 'join_date');
        break;
      case 3:
        if (watchedEmploymentType === 'permanent' || watchedEmploymentType === 'contractual') {
          fieldsToValidate.push('base_salary_monthly');
        } else {
          fieldsToValidate.push('daily_wage_rate');
        }
        break;
      case 4:
        // Bank details are optional, skip validation
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3EDE7] px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">
              {isHindi ? 'नया कर्मचारी जोड़ें' : 'Add New Employee'}
            </h2>
            <p className="text-sm text-[#6B7280]">
              {isHindi ? 'चरण' : 'Step'} {currentStep} {isHindi ? 'का' : 'of'} 5 — {STEPS[currentStep - 1].title[language]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-4 border-b border-[#E3EDE7]">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.id
                      ? 'bg-[#1A5C34] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check size={16} weight="bold" />
                  ) : (
                    <step.icon size={16} weight="bold" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-[#1A5C34]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {isHindi ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
              </h3>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'पूरा नाम *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder={isHindi ? 'राम कुमार' : 'Ram Kumar'}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
                {errors.full_name && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'नाम (हिंदी)' : 'Name (Hindi)'}
                </label>
                <input
                  type="text"
                  {...register('name_hindi')}
                  placeholder={isHindi ? 'राम कुमार' : 'राम कुमार'}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'फोन नंबर *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
                {errors.phone && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'आधार (अंतिम 4 अंक)' : 'Aadhaar (Last 4 digits)'}
                </label>
                <input
                  type="text"
                  {...register('aadhaar_last4')}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
                {errors.aadhaar_last4 && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.aadhaar_last4.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'नोट्स' : 'Notes'}
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder={isHindi ? 'अतिरिक्त जानकारी...' : 'Additional information...'}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {isHindi ? 'भूमिका और सौंपना' : 'Role & Assignment'}
              </h3>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'भूमिका *' : 'Role *'}
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent bg-white"
                >
                  {Object.entries(ROLE_LABELS).map(([value, labels]) => (
                    <option key={value} value={value}>
                      {labels[language]}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.role.message}</p>
                )}
              </div>

              {watchedRole === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    {isHindi ? 'कस्टम भूमिका' : 'Custom Role'}
                  </label>
                  <input
                    type="text"
                    {...register('role_custom')}
                    placeholder={isHindi ? 'भूमिका निर्दिष्ट करें' : 'Specify role'}
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'रोजगार प्रकार *' : 'Employment Type *'}
                </label>
                <select
                  {...register('employment_type')}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent bg-white"
                >
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, labels]) => (
                    <option key={value} value={value}>
                      {labels[language]}
                    </option>
                  ))}
                </select>
                {errors.employment_type && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.employment_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'शामिल होने की तारीख *' : 'Join Date *'}
                </label>
                <input
                  type="date"
                  {...register('join_date')}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
                {errors.join_date && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.join_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'अंतिम तारीख (वैकल्पिक)' : 'End Date (Optional)'}
                </label>
                <input
                  type="date"
                  {...register('end_date')}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
                {errors.end_date && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.end_date.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  id="is_active"
                  className="w-4 h-4 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-[#3DAE72]"
                />
                <label htmlFor="is_active" className="text-sm text-[#111827]">
                  {isHindi ? 'वर्तमान में सक्रिय' : 'Currently Active'}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'सौंपे गए फार्म' : 'Assigned Farms'}
                </label>
                <div className="space-y-2">
                  {farms?.map((farm: any) => (
                    <label key={farm.id} className="flex items-center gap-3 p-3 border border-[#E3EDE7] rounded-lg hover:bg-[#EDF7F1] cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('assigned_farm_ids')}
                        value={farm.id}
                        className="w-4 h-4 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-[#3DAE72]"
                      />
                      <span className="text-sm text-[#111827]">{farm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {isHindi ? 'मुआवजा' : 'Compensation'}
              </h3>

              {(watchedEmploymentType === 'permanent' || watchedEmploymentType === 'contractual') && (
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    {isHindi ? 'मासिक आधार वेतन (₹) *' : 'Monthly Base Salary (₹) *'}
                  </label>
                  <input
                    type="number"
                    {...register('base_salary_monthly', { valueAsNumber: true })}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                  />
                  {errors.base_salary_monthly && (
                    <p className="text-sm text-[#DC2626] mt-1">{errors.base_salary_monthly.message}</p>
                  )}
                </div>
              )}

              {(watchedEmploymentType === 'daily_wage' || watchedEmploymentType === 'part_time') && (
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    {isHindi ? 'दैनिक मजदूरी दर (₹) *' : 'Daily Wage Rate (₹) *'}
                  </label>
                  <input
                    type="number"
                    {...register('daily_wage_rate', { valueAsNumber: true })}
                    placeholder="500"
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                  />
                  {errors.daily_wage_rate && (
                    <p className="text-sm text-[#DC2626] mt-1">{errors.daily_wage_rate.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'बोनस (%)' : 'Bonus (%)'}
                </label>
                <input
                  type="number"
                  {...register('bonus_pct', { valueAsNumber: true })}
                  placeholder="10"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
                {errors.bonus_pct && (
                  <p className="text-sm text-[#DC2626] mt-1">{errors.bonus_pct.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('pf_applicable')}
                    className="w-4 h-4 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-[#3DAE72]"
                  />
                  <span className="text-sm text-[#111827]">
                    {isHindi ? 'PF लागू' : 'PF Applicable'}
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('esi_applicable')}
                    className="w-4 h-4 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-[#3DAE72]"
                  />
                  <span className="text-sm text-[#111827]">
                    {isHindi ? 'ESI लागू' : 'ESI Applicable'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {isHindi ? 'बैंक विवरण' : 'Bank Details'}
              </h3>
              <p className="text-sm text-[#6B7280]">
                {isHindi ? 'वेतन हस्तांतरण के लिए बैंक विवरण (वैकल्पिक)' : 'Bank details for salary transfer (optional)'}
              </p>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'बैंक का नाम' : 'Bank Name'}
                </label>
                <input
                  type="text"
                  {...register('bank_name')}
                  placeholder={isHindi ? 'स्टेट बैंक ऑफ इंडिया' : 'State Bank of India'}
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'खाता संख्या' : 'Account Number'}
                </label>
                <input
                  type="text"
                  {...register('bank_account_number')}
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  {isHindi ? 'IFSC कोड' : 'IFSC Code'}
                </label>
                <input
                  type="text"
                  {...register('bank_ifsc')}
                  placeholder="SBIN0001234"
                  className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DAE72] focus:border-transparent uppercase"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {isHindi ? 'समीक्षा और सहेजें' : 'Review & Save'}
              </h3>

              <div className="bg-[#EDF7F1] rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'नाम' : 'Name'}</span>
                  <span className="text-sm font-medium text-[#111827]">{watch('full_name')}</span>
                </div>
                {watch('name_hindi') && (
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6B7280]">{isHindi ? 'नाम (हिंदी)' : 'Name (Hindi)'}</span>
                    <span className="text-sm font-medium text-[#111827]">{watch('name_hindi')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'फोन' : 'Phone'}</span>
                  <span className="text-sm font-medium text-[#111827]">{watch('phone')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'भूमिका' : 'Role'}</span>
                  <span className="text-sm font-medium text-[#111827]">
                    {watchedRole === 'other' ? watch('role_custom') : ROLE_LABELS[watchedRole]?.[language]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'रोजगार प्रकार' : 'Employment Type'}</span>
                  <span className="text-sm font-medium text-[#111827]">
                    {EMPLOYMENT_TYPE_LABELS[watchedEmploymentType]?.[language]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'वेतन' : 'Salary'}</span>
                  <span className="text-sm font-medium text-[#111827]">
                    {watch('base_salary_monthly')
                      ? `₹${watch('base_salary_monthly')?.toLocaleString('en-IN')}/month`
                      : watch('daily_wage_rate')
                        ? `₹${watch('daily_wage_rate')?.toLocaleString('en-IN')}/day`
                        : isHindi
                          ? 'निर्धारित नहीं'
                          : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'शामिल होने की तारीख' : 'Join Date'}</span>
                  <span className="text-sm font-medium text-[#111827]">{watch('join_date')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">{isHindi ? 'स्थिति' : 'Status'}</span>
                  <span className="text-sm font-medium text-[#111827]">
                    {watch('is_active')
                      ? isHindi
                        ? 'सक्रिय'
                        : 'Active'
                      : isHindi
                        ? 'निष्क्रिय'
                        : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#EDF7F1] rounded-lg">
                <Check size={20} className="text-[#1A5C34]" weight="bold" />
                <span className="text-sm text-[#111827]">
                  {isHindi
                    ? 'सभी जानकारी सही है। कर्मचारी बनाने के लिए "सहेजें" पर क्लिक करें।'
                    : 'All information is correct. Click "Save" to create the employee.'}
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[#E3EDE7] px-6 py-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E3EDE7] rounded-lg hover:bg-[#EDF7F1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ArrowLeft size={18} />
            {isHindi ? 'पीछे' : 'Back'}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors text-sm font-medium"
            >
              {isHindi ? 'अगला' : 'Next'}
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isHindi ? 'सहेज रहा है...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Check size={18} weight="bold" />
                  {isHindi ? 'सहेजें' : 'Save'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
