'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Pencil, Trash, MagnifyingGlass, Funnel, X, CheckCircle, Warning, 
  Phone, Envelope, MapPin, CurrencyDollar, Building, Download, Printer, Star 
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const traderSchema = z.object({
  full_name: z.string().min(1, 'Trader name is required'),
  company_name: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  opening_balance: z.number().default(0),
  balance_type: z.enum(['payable', 'receivable']).default('receivable'),
  credit_days: z.number().min(0).default(0),
  rating: z.number().min(1).max(5).default(3),
  notes: z.string().optional(),
});

type TraderFormData = z.infer<typeof traderSchema>;

interface Trader {
  id: string;
  trader_code: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  opening_balance: number;
  balance_type: string;
  credit_days: number;
  rating: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export default function TradersPage() {
  const { language } = useLanguage();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [filteredTraders, setSlidersHorizontaledTraders] = useState<Trader[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingTrader, setEditingTrader] = useState<Trader | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TraderFormData>({
    resolver: zodResolver(traderSchema),
    defaultValues: {
      balance_type: 'receivable',
      credit_days: 0,
      opening_balance: 0,
      rating: 3,
      state: 'Uttar Pradesh',
    },
  });

  useEffect(() => {
    fetchTraders();
  }, []);

  useEffect(() => {
    filterTraders();
  }, [traders, searchQuery]);

  const fetchTraders = async () => {
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('traders')
        .select('*')
        .eq('integrator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTraders(data || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'ट्रेडर्स लोड करने में विफल' : 'Failed to load traders'
      });
    }
  };

  const filterTraders = () => {
    let filtered = traders;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trader_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone?.includes(searchQuery)
      );
    }

    setSlidersHorizontaledTraders(filtered);
  };

  const onSubmit = async (data: TraderFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate trader code
      const traderCount = traders.length + 1;
      const traderCode = `TRD-${String(traderCount).padStart(3, '0')}`;

      const payload = {
        integrator_id: user.id,
        trader_code: editingTrader ? editingTrader.trader_code : traderCode,
        full_name: data.full_name,
        company_name: data.company_name || null,
        phone: data.phone || null,
        gst_number: data.gst_number || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state,
        opening_balance: data.opening_balance,
        balance_type: data.balance_type,
        credit_days: data.credit_days,
        rating: data.rating,
        notes: data.notes || null,
      };

      let error;
      if (editingTrader) {
        const result = await supabaseClient
          .from('traders')
          .update(payload)
          .eq('id', editingTrader.id);
        error = result.error;
      } else {
        const result = await supabaseClient
          .from('traders')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = result.error;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'ट्रेडर सफलतापूर्वक सहेजा गया' 
          : 'Trader saved successfully'
      });
      
      setIsPanelOpen(false);
      setEditingTrader(null);
      reset();
      await fetchTraders();
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'ट्रेडर सहेजने में विफल' 
          : 'Failed to save trader'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (trader: Trader) => {
    setEditingTrader(trader);
    setValue('full_name', trader.full_name);
    setValue('company_name', trader.company_name || '');
    setValue('phone', trader.phone || '');
    setValue('gst_number', trader.gst_number || '');
    setValue('address', trader.address || '');
    setValue('city', trader.city || '');
    setValue('state', trader.state || 'Uttar Pradesh');
    setValue('opening_balance', trader.opening_balance);
    setValue('balance_type', trader.balance_type as any);
    setValue('credit_days', trader.credit_days);
    setValue('rating', trader.rating);
    setValue('notes', trader.notes || '');
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { error } = await supabaseClient
        .from('traders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'ट्रेडर हटा दिया गया' 
          : 'Trader deleted successfully'
      });
      
      await fetchTraders();
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'ट्रेडर हटाने में विफल' 
          : 'Failed to delete trader'
      });
    }
  };

  const handleAddNew = () => {
    setEditingTrader(null);
    reset();
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingTrader(null);
    reset();
  };

  const formatINR = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            weight={star <= rating ? 'fill' : 'regular'}
            className={star <= rating ? 'text-[#E8611A]' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <div className="space-y-2">
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Masters
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'ट्रेडर मास्टर' : 'Trader Master'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-xl">
            {isHindi 
              ? 'अपने सभी ट्रेडर्स (खरीदारों) का प्रबंधन करें' 
              : 'Manage all your traders (buyers)'}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-[#1A5C34] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#3DAE72] transition-all duration-200 ease-out flex items-center gap-2.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
        >
          <Plus size={20} weight="bold" />
          {isHindi ? 'नया ट्रेडर जोड़ें' : 'Add Trader'}
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
      <div className="px-6 pb-6 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            placeholder={isHindi ? 'नाम, कंपनी, फोन से खोजें...' : 'MagnifyingGlass by name, company, phone...'}
            value={searchQuery}
            onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="border border-[#E3EDE7] px-4 py-3 rounded-xl text-sm flex items-center gap-2 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-medium">
            <Download size={18} />
            CSV
          </button>
          <button className="border border-[#E3EDE7] px-4 py-3 rounded-xl text-sm flex items-center gap-2 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-medium">
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="px-6 pb-8">
        {filteredTraders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-[#E3EDE7]">
            <div className="w-20 h-20 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-6">
              <Building size={36} className="text-[#1A5C34]" />
            </div>
            <h3 className="text-xl font-semibold text-[#111827] mb-3">
              {isHindi ? 'कोई ट्रेडर नहीं मिला' : 'No traders found'}
            </h3>
            <p className="text-base text-[#6B7280] mb-8 max-w-sm leading-relaxed">
              {isHindi 
                ? 'अपना पहला ट्रेडर जोड़ने के लिए नीचे बटन पर क्लिक करें' 
                : 'Click the button below to add your first trader'}
            </p>
            <button
              onClick={handleAddNew}
              className="bg-[#1A5C34] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
            >
              {isHindi ? '+ पहला ट्रेडर जोड़ें' : '+ Add First Trader'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E3EDE7] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कोड' : 'Code'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नाम' : 'Name'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कंपनी' : 'Company'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'फोन' : 'Phone'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'शहर' : 'City'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'ओपनिंग बैलेंस' : 'Opening Balance'}</th>
                    <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'क्रेडिट दिन' : 'Credit Days'}</th>
                    <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'रेटिंग' : 'Rating'}</th>
                    <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTraders.map((trader, i) => (
                    <tr
                      key={trader.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                      onClick={() => handleEdit(trader)}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-[#6B7280] font-medium">{trader.trader_code}</td>
                      <td className="px-5 py-4 font-semibold text-[#111827]">{trader.full_name}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{trader.company_name || '-'}</td>
                      <td className="px-5 py-4 text-[#6B7280] font-mono">{trader.phone || '-'}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{trader.city || '-'}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={trader.balance_type === 'payable' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {trader.balance_type === 'payable' ? 'Dr ' : 'Cr '}
                          {formatINR(trader.opening_balance)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-[#6B7280] font-medium">{trader.credit_days}</td>
                      <td className="px-5 py-4 text-center">{renderStars(trader.rating)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          trader.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {trader.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(trader)}
                            className="p-2 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                            aria-label="Edit trader"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(trader.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                            aria-label="Delete trader"
                          >
                            <Trash size={18} />
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
                  {editingTrader 
                    ? (isHindi ? 'ट्रेडर संपादित करें' : 'Edit Trader')
                    : (isHindi ? 'नया ट्रेडर जोड़ें' : 'Add New Trader')
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Trader Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'ट्रेडर का नाम *' : 'Trader Name *'}
                  </label>
                  <input
                    type="text"
                    {...register('full_name')}
                    placeholder={isHindi ? 'उदाहरण: राहुल कुमार' : 'Example: Rahul Kumar'}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm"
                  />
                  {errors.full_name && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'कंपनी का नाम' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    {...register('company_name')}
                    placeholder={isHindi ? 'उदाहरण: राजपूत पोल्ट्री' : 'Example: Rajput Poultry'}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'फोन नंबर' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{errors.phone.message}</p>
                  )}
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'GST नंबर' : 'GST Number'}
                  </label>
                  <input
                    type="text"
                    {...register('gst_number')}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent uppercase transition-all duration-200 text-sm font-mono"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'पता' : 'Address'}
                  </label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-4 top-3.5 text-[#6B7280] pointer-events-none" />
                    <textarea
                      {...register('address')}
                      placeholder={isHindi ? 'पूरा पता' : 'Full address'}
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent resize-none transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'शहर' : 'City'}
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder={isHindi ? 'गोरखपुर' : 'Gorakhpur'}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'राज्य' : 'State'}
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                {/* Opening Balance & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'ओपनिंग बैलेंस' : 'Opening Balance'}
                    </label>
                    <div className="relative">
                      <CurrencyDollar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                      <input
                        type="number"
                        {...register('opening_balance', { valueAsNumber: true })}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'बैलेंस प्रकार' : 'Balance Type'}
                    </label>
                    <select
                      {...register('balance_type')}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 text-sm"
                    >
                      <option value="payable">{isHindi ? 'देय (Payable)' : 'Payable (Dr)'}</option>
                      <option value="receivable">{isHindi ? 'प्राप्य (Receivable)' : 'Receivable (Cr)'}</option>
                    </select>
                  </div>
                </div>

                {/* Credit Days */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'क्रेडिट दिन' : 'Credit Days'}
                  </label>
                  <input
                    type="number"
                    {...register('credit_days', { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-sm font-mono"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'रेटिंग (1-5)' : 'Rating (1-5)'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setValue('rating', star)}
                        className="p-1.5 hover:bg-[#EDF7F1] rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                      >
                        <Star
                          size={32}
                          weight={star <= (editingTrader?.rating || 3) ? 'fill' : 'regular'}
                          className={star <= (editingTrader?.rating || 3) ? 'text-[#E8611A]' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <input
                      type="hidden"
                      {...register('rating', { valueAsNumber: true })}
                    />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2 font-medium">
                    {isHindi ? '1 = सबसे खराब, 5 = सबसे अच्छा' : '1 = Worst, 5 = Best'}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'टिप्पणियाँ' : 'Notes'}
                  </label>
                  <textarea
                    {...register('notes')}
                    placeholder={isHindi ? 'कोई अतिरिक्त नोट्स' : 'Additional notes'}
                    rows={2}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent resize-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-8 border-t border-[#E3EDE7]">
                  <button
                    type="button"
                    onClick={handleClosePanel}
                    className="flex-1 border border-[#E3EDE7] px-4 py-3 rounded-xl hover:bg-[#F4F7F5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-medium"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1A5C34] text-white px-4 py-3 rounded-xl hover:bg-[#3DAE72] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
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
