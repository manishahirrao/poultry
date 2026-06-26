'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Upload, X, CheckCircle, Warning, Phone, Envelope, MapPin, Calendar, CurrencyDollar } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const companySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_name_hi: z.string().optional(),
  gst_number: z.string().optional(),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  financial_year_start: z.number().min(1).max(12).default(4),
  currency_code: z.string().default('INR'),
  logo_url: z.string().url().optional().or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

const MONTHS = [
  { value: 1, label: 'January', labelHi: 'जनवरी' },
  { value: 2, label: 'February', labelHi: 'फरवरी' },
  { value: 3, label: 'March', labelHi: 'मार्च' },
  { value: 4, label: 'April', labelHi: 'अप्रैल' },
  { value: 5, label: 'May', labelHi: 'मई' },
  { value: 6, label: 'June', labelHi: 'जून' },
  { value: 7, label: 'July', labelHi: 'जुलाई' },
  { value: 8, label: 'August', labelHi: 'अगस्त' },
  { value: 9, label: 'September', labelHi: 'सितंबर' },
  { value: 10, label: 'October', labelHi: 'अक्टूबर' },
  { value: 11, label: 'November', labelHi: 'नवंबर' },
  { value: 12, label: 'December', labelHi: 'दिसंबर' },
];

export default function CompanySetupPage() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingCompany, setExistingCompany] = useState<any>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      financial_year_start: 4,
      currency_code: 'INR',
      state: 'Uttar Pradesh',
    },
  });

  const watchedLogoUrl = watch('logo_url');

  useEffect(() => {
    if (watchedLogoUrl) {
      setLogoPreview(watchedLogoUrl);
    }
  }, [watchedLogoUrl]);

  useEffect(() => {
    fetchExistingCompany();
  }, []);

  const fetchExistingCompany = async () => {
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase!
        .from('companies')
        .select('*')
        .eq('integrator_id', user.id)
        .single();

      if (company) {
        setExistingCompany(company);
        setValue('company_name', company.company_name);
        setValue('company_name_hi', company.company_name_hi || '');
        setValue('gst_number', company.gst_number || '');
        setValue('pan_number', company.pan_number || '');
        setValue('address_line1', company.address_line1 || '');
        setValue('address_line2', company.address_line2 || '');
        setValue('city', company.city || '');
        setValue('state', company.state || 'Uttar Pradesh');
        setValue('pincode', company.pincode || '');
        setValue('phone', company.phone || '');
        setValue('email', company.email || '');
        setValue('financial_year_start', company.financial_year_start || 4);
        setValue('currency_code', company.currency_code || 'INR');
        setValue('logo_url', company.logo_url || '');
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase!
        .storage
        .from('company-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase!
        .storage
        .from('company-assets')
        .getPublicUrl(fileName);

      setValue('logo_url', publicUrl);
      setLogoPreview(publicUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: language === 'hi' ? 'लोगो अपलोड करने में विफल' : 'Failed to upload logo' });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const payload = {
        integrator_id: user.id,
        company_name: data.company_name,
        company_name_hi: data.company_name_hi || null,
        gst_number: data.gst_number || null,
        pan_number: data.pan_number || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state,
        pincode: data.pincode || null,
        phone: data.phone || null,
        email: data.email || null,
        financial_year_start: data.financial_year_start,
        currency_code: data.currency_code,
        logo_url: data.logo_url || null,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existingCompany) {
        const result = await supabase!
          .from('companies')
          .update(payload)
          .eq('id', existingCompany.id);
        error = result.error;
      } else {
        const result = await supabase!
          .from('companies')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = result.error;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'कंपनी विवरण सफलतापूर्वक सहेजे गए' 
          : 'Company details saved successfully'
      });
      
      await fetchExistingCompany();
    } catch (error) {
      console.error('Error saving company:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'कंपनी विवरण सहेजने में विफल' 
          : 'Failed to save company details'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHindi = language === 'hi';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-brand-700/10 text-brand-700">
          Masters
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
          {isHindi ? 'कंपनी सेटअप' : 'Company Setup'}
        </h1>
        <p className="text-base text-neutral-500 mt-2">
          {isHindi 
            ? 'अपनी एकीकरण कंपनी की जानकारी प्रबंधित करें' 
            : 'Manage your integration company information'}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-brand-700/10 text-brand-700 border border-brand-700/20' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" />
          ) : (
            <Warning size={20} weight="fill" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building size={32} className="text-neutral-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'कंपनी लोगो' : 'Company Logo'}
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-500 transition-colors">
                  <Upload size={18} weight="bold" />
                  <span className="text-sm">
                    {isUploading 
                      ? (isHindi ? 'अपलोड हो रहा है...' : 'Uploading...') 
                      : (isHindi ? 'लोगो अपलोड करें' : 'Upload Logo')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('logo_url', '');
                      setLogoPreview('');
                    }}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                {isHindi ? 'अनुशंसित: PNG या JPG, अधिकतम 2MB' : 'Recommended: PNG or JPG, max 2MB'}
              </p>
            </div>
          </div>

          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'कंपनी का नाम *' : 'Company Name *'}
              </label>
              <input
                type="text"
                {...register('company_name')}
                placeholder={isHindi ? 'उदाहरण: RS Poultry Integrations' : 'Example: RS Poultry Integrations'}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              />
              {errors.company_name && (
                <p className="text-red-600 text-xs mt-1">{errors.company_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'कंपनी का नाम (हिंदी)' : 'Company Name (Hindi)'}
              </label>
              <input
                type="text"
                {...register('company_name_hi')}
                placeholder={isHindi ? 'उदाहरण: आरएस पोल्ट्री इंटीग्रेशन' : 'Example: आरएस पोल्ट्री इंटीग्रेशन'}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              />
            </div>
          </div>

          {/* GST & PAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'GST नंबर' : 'GST Number'}
              </label>
              <input
                type="text"
                {...register('gst_number')}
                placeholder="27ABCDE1234F1Z5"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent uppercase"
              />
              {errors.gst_number && (
                <p className="text-red-600 text-xs mt-1">{errors.gst_number.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'PAN नंबर' : 'PAN Number'}
              </label>
              <input
                type="text"
                {...register('pan_number')}
                placeholder="ABCDE1234F"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent uppercase"
              />
              {errors.pan_number && (
                <p className="text-red-600 text-xs mt-1">{errors.pan_number.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'पता लाइन 1' : 'Address Line 1'}
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  {...register('address_line1')}
                  placeholder={isHindi ? 'वीराना, मोहल्ला' : 'Street, Locality'}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <input
                type="text"
                {...register('address_line2')}
                placeholder={isHindi ? 'पता लाइन 2 (वैकल्पिक)' : 'Address Line 2 (Optional)'}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              />
            </div>
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'शहर' : 'City'}
              </label>
              <input
                type="text"
                {...register('city')}
                placeholder={isHindi ? 'गोरखपुर' : 'Gorakhpur'}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'राज्य' : 'State'}
              </label>
              <input
                type="text"
                {...register('state')}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'पिनकोड' : 'Pincode'}
              </label>
              <input
                type="text"
                {...register('pincode')}
                placeholder="273001"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              />
              {errors.pincode && (
                <p className="text-red-600 text-xs mt-1">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'फोन नंबर' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'ईमेल' : 'Email'}
              </label>
              <div className="relative">
                <Envelope size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="company@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Financial Year Start & CurrencyDollar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'वित्तीय वर्ष प्रारंभ माह' : 'Financial Year Start Month'}
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <select
                  {...register('financial_year_start', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent appearance-none bg-white"
                >
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {isHindi ? month.labelHi : month.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {isHindi ? 'अप्रैल = 4 (डिफ़ॉल्ट)' : 'April = 4 (default)'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                {isHindi ? 'मुद्रा' : 'CurrencyDollar'}
              </label>
              <div className="relative">
                <CurrencyDollar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <select
                  {...register('currency_code')}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent appearance-none bg-white"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="w-full md:w-auto px-8 py-3 bg-brand-700 text-white rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting 
                ? (isHindi ? 'सहेज रहा है...' : 'Saving...') 
                : (isHindi ? 'कंपनी विवरण सहेजें' : 'FloppyDisk Company Details')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
