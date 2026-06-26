'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Pencil, Trash, MagnifyingGlass, Funnel, X, CheckCircle, Warning, 
  Phone, Envelope, MapPin, CurrencyDollar, Building, Download, Printer 
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const supplierSchema = z.object({
  supplier_name: z.string().min(1, 'Supplier name is required'),
  supplier_type: z.enum(['chick', 'feed', 'medicine', 'equipment', 'other']),
  contact_person: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  opening_balance: z.number().default(0),
  balance_type: z.enum(['payable', 'receivable']).default('payable'),
  credit_days: z.number().min(0).default(0),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface Supplier {
  id: string;
  supplier_code: string;
  supplier_name: string;
  supplier_type: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  opening_balance: number;
  balance_type: string;
  credit_days: number;
  is_active: boolean;
  created_at: string;
}

const SUPPLIER_TYPES = [
  { value: 'chick', label: 'Chick', labelHi: 'चूज़ा' },
  { value: 'feed', label: 'Feed', labelHi: 'फ़ीड' },
  { value: 'medicine', label: 'Medicine', labelHi: 'दवा' },
  { value: 'equipment', label: 'Equipment', labelHi: 'उपकरण' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export default function SuppliersPage() {
  const { language } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setSlidersHorizontaledSuppliers] = useState<Supplier[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [filterType, setSlidersHorizontalType] = useState<string>('all');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier_type: 'other',
      balance_type: 'payable',
      credit_days: 0,
      opening_balance: 0,
      state: 'Uttar Pradesh',
    },
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchQuery, filterType]);

  const fetchSuppliers = async () => {
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('suppliers')
        .select('*')
        .eq('integrator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'सप्लायर्स लोड करने में विफल' : 'Failed to load suppliers'
      });
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supplier_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone?.includes(searchQuery)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.supplier_type === filterType);
    }

    setSlidersHorizontaledSuppliers(filtered);
  };

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate supplier code
      const supplierCount = suppliers.length + 1;
      const supplierCode = `SUP-${String(supplierCount).padStart(3, '0')}`;

      const payload = {
        integrator_id: user.id,
        supplier_code: editingSupplier ? editingSupplier.supplier_code : supplierCode,
        supplier_name: data.supplier_name,
        supplier_type: data.supplier_type,
        contact_person: data.contact_person || null,
        phone: data.phone || null,
        email: data.email || null,
        gst_number: data.gst_number || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state,
        opening_balance: data.opening_balance,
        balance_type: data.balance_type,
        credit_days: data.credit_days,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editingSupplier) {
        const result = await supabaseClient
          .from('suppliers')
          .update(payload)
          .eq('id', editingSupplier.id);
        error = result.error;
      } else {
        const result = await supabaseClient
          .from('suppliers')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = result.error;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'सप्लायर सफलतापूर्वक सहेजा गया' 
          : 'Supplier saved successfully'
      });
      
      setIsPanelOpen(false);
      setEditingSupplier(null);
      reset();
      await fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'सप्लायर सहेजने में विफल' 
          : 'Failed to save supplier'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setValue('supplier_name', supplier.supplier_name);
    setValue('supplier_type', supplier.supplier_type as any);
    setValue('contact_person', supplier.contact_person || '');
    setValue('phone', supplier.phone || '');
    setValue('email', supplier.email || '');
    setValue('gst_number', supplier.gst_number || '');
    setValue('address', supplier.address || '');
    setValue('city', supplier.city || '');
    setValue('state', supplier.state || 'Uttar Pradesh');
    setValue('opening_balance', supplier.opening_balance);
    setValue('balance_type', supplier.balance_type as any);
    setValue('credit_days', supplier.credit_days);
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { error } = await supabaseClient
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'सप्लायर हटा दिया गया' 
          : 'Supplier deleted successfully'
      });
      
      await fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'सप्लायर हटाने में विफल' 
          : 'Failed to delete supplier'
      });
    }
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    reset();
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingSupplier(null);
    reset();
  };

  const formatINR = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="space-y-1">
          <span className="inline-block rounded-full px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
            Masters
          </span>
          <h1 className="text-2xl font-bold text-[#111827] leading-tight">
            {isHindi ? 'सप्लायर मास्टर' : 'Supplier Master'}
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {isHindi 
              ? 'अपने सभी सप्लायर्स का प्रबंधन करें' 
              : 'Manage all your suppliers'}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-[#1A5C34] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3DAE72] transition-all duration-200 ease-out flex items-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'नया सप्लायर जोड़ें' : 'Add Supplier'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-4 p-4 rounded-lg flex items-center gap-3 transition-all duration-300 ease-out ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" className="flex-shrink-0" />
          ) : (
            <Warning size={20} weight="fill" className="flex-shrink-0" />
          )}
          <span className="text-sm flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:bg-black/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SlidersHorizontals */}
      <div className="px-6 pb-4 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            placeholder={isHindi ? 'खोजें...' : 'MagnifyingGlass...'}
            value={searchQuery}
            onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setSlidersHorizontalType(e.target.value)}
          className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
        >
          <option value="all">{isHindi ? 'सभी प्रकार' : 'All Types'}</option>
          {SUPPLIER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {isHindi ? type.labelHi : type.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button className="border border-[#E3EDE7] px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2">
            <Download size={16} />
            CSV
          </button>
          <button className="border border-[#E3EDE7] px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="px-6 pb-6">
        {filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#E3EDE7]">
            <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-4">
              <Building size={28} className="text-[#1A5C34]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              {isHindi ? 'कोई सप्लायर नहीं मिला' : 'No suppliers found'}
            </h3>
            <p className="text-sm text-[#6B7280] mb-6 max-w-xs leading-relaxed">
              {isHindi 
                ? 'अपना पहला सप्लायर जोड़ने के लिए नीचे बटन पर क्लिक करें' 
                : 'Click the button below to add your first supplier'}
            </p>
            <button
              onClick={handleAddNew}
              className="bg-[#1A5C34] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
            >
              {isHindi ? '+ पहला सप्लायर जोड़ें' : '+ Add First Supplier'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">{isHindi ? 'कोड' : 'Code'}</th>
                    <th className="px-4 py-3 text-left font-medium">{isHindi ? 'नाम' : 'Name'}</th>
                    <th className="px-4 py-3 text-left font-medium">{isHindi ? 'प्रकार' : 'Type'}</th>
                    <th className="px-4 py-3 text-left font-medium">{isHindi ? 'संपर्क' : 'Contact'}</th>
                    <th className="px-4 py-3 text-left font-medium">{isHindi ? 'फोन' : 'Phone'}</th>
                    <th className="px-4 py-3 text-left font-medium">{isHindi ? 'शहर' : 'City'}</th>
                    <th className="px-4 py-3 text-right font-medium">{isHindi ? 'ओपनिंग बैलेंस' : 'Opening Balance'}</th>
                    <th className="px-4 py-3 text-center font-medium">{isHindi ? 'क्रेडिट दिन' : 'Credit Days'}</th>
                    <th className="px-4 py-3 text-center font-medium">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-4 py-3 text-center font-medium">{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, i) => (
                    <tr
                      key={supplier.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer transition-colors duration-150`}
                      onClick={() => handleEdit(supplier)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#6B7280]">{supplier.supplier_code}</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">{supplier.supplier_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
                          {SUPPLIER_TYPES.find(t => t.value === supplier.supplier_type)?.[isHindi ? 'labelHi' : 'label'] || supplier.supplier_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">{supplier.contact_person || '-'}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{supplier.phone || '-'}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{supplier.city || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={supplier.balance_type === 'payable' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {supplier.balance_type === 'payable' ? 'Dr ' : 'Cr '}
                          {formatINR(supplier.opening_balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[#6B7280]">{supplier.credit_days}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          supplier.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {supplier.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="p-1.5 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                            aria-label="Edit supplier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                            aria-label="Delete supplier"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel / Drawer */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleClosePanel}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ease-out">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111827] leading-tight">
                  {editingSupplier 
                    ? (isHindi ? 'सप्लायर संपादित करें' : 'Edit Supplier')
                    : (isHindi ? 'नया सप्लायर जोड़ें' : 'Add New Supplier')
                  }
                </h2>
                <button
                  onClick={handleClosePanel}
                  className="p-2 hover:bg-[#F4F7F5] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                  aria-label="Close panel"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'सप्लायर का नाम *' : 'Supplier Name *'}
                  </label>
                  <input
                    type="text"
                    {...register('supplier_name')}
                    placeholder={isHindi ? 'उदाहरण: राजपूत फ़ीड्स' : 'Example: Rajput Feeds'}
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                  />
                  {errors.supplier_name && (
                    <p className="text-red-600 text-xs mt-1.5 leading-relaxed">{errors.supplier_name.message}</p>
                  )}
                </div>

                {/* Supplier Type */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'सप्लायर प्रकार *' : 'Supplier Type *'}
                  </label>
                  <select
                    {...register('supplier_type')}
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                  >
                    {SUPPLIER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'संपर्क व्यक्ति' : 'Contact Person'}
                  </label>
                  <input
                    type="text"
                    {...register('contact_person')}
                    placeholder={isHindi ? 'उदाहरण: राहुल शर्मा' : 'Example: Rahul Sharma'}
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'फोन नंबर' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1.5 leading-relaxed">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'ईमेल' : 'Email'}
                  </label>
                  <div className="relative">
                    <Envelope size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="supplier@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1.5 leading-relaxed">{errors.email.message}</p>
                  )}
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'GST नंबर' : 'GST Number'}
                  </label>
                  <input
                    type="text"
                    {...register('gst_number')}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent uppercase transition-all duration-200"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'पता' : 'Address'}
                  </label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-3 top-3 text-[#6B7280] pointer-events-none" />
                    <textarea
                      {...register('address')}
                      placeholder={isHindi ? 'पूरा पता' : 'Full address'}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent resize-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                      {isHindi ? 'शहर' : 'City'}
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder={isHindi ? 'गोरखपुर' : 'Gorakhpur'}
                      className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                      {isHindi ? 'राज्य' : 'State'}
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Opening Balance & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                      {isHindi ? 'ओपनिंग बैलेंस' : 'Opening Balance'}
                    </label>
                    <div className="relative">
                      <CurrencyDollar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                      <input
                        type="number"
                        {...register('opening_balance', { valueAsNumber: true })}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                      {isHindi ? 'बैलेंस प्रकार' : 'Balance Type'}
                    </label>
                    <select
                      {...register('balance_type')}
                      className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                    >
                      <option value="payable">{isHindi ? 'देय (Payable)' : 'Payable (Dr)'}</option>
                      <option value="receivable">{isHindi ? 'प्राप्य (Receivable)' : 'Receivable (Cr)'}</option>
                    </select>
                  </div>
                </div>

                {/* Credit Days */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-2 leading-relaxed">
                    {isHindi ? 'क्रेडिट दिन' : 'Credit Days'}
                  </label>
                  <input
                    type="number"
                    {...register('credit_days', { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
                  <button
                    type="button"
                    onClick={handleClosePanel}
                    className="flex-1 border border-[#E3EDE7] px-4 py-2.5 rounded-lg hover:bg-[#F4F7F5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1A5C34] text-white px-4 py-2.5 rounded-lg hover:bg-[#3DAE72] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                  >
                    {isSubmitting 
                      ? (isHindi ? 'सहेज रहा है...' : 'Saving...') 
                      : (isHindi ? 'सहेजें' : 'FloppyDisk')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
