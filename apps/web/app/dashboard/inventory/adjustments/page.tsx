'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Trash, FloppyDisk, FileText, CheckCircle, X, MagnifyingGlass, 
  Download, Printer, Package, Spinner, Warning, TrendDown, TrendUp
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const adjustmentSchema = z.object({
  adj_type: z.enum(['write_off', 'write_in', 'damage', 'expired', 'transfer_correction']),
  branch_id: z.string().optional(),
  farmer_id: z.string().optional(),
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit_rate: z.number().min(0).optional(),
  reason: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  city: string;
}

interface Farmer {
  id: string;
  farmer_code: string;
  full_name: string;
  village: string;
  district: string;
}

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  unit_of_measure: string;
  purchase_price: number;
}

interface StockAdjustment {
  id: string;
  adj_number: string;
  adj_date: string;
  adj_type: string;
  branch_id: string | null;
  farmer_id: string | null;
  product_id: string;
  quantity: number;
  unit_rate: number | null;
  reason: string | null;
  created_at: string;
  branches?: { branch_name: string };
  farmers?: { full_name: string };
  products?: { product_name: string; unit_of_measure: string };
}

const ADJUSTMENT_TYPES = [
  { value: 'write_off', label: 'Write Off', labelHi: 'लिखें बंद', icon: TrendDown },
  { value: 'write_in', label: 'Write In', labelHi: 'लिखें अंदर', icon: TrendUp },
  { value: 'damage', label: 'Damage', labelHi: 'क्षति', icon: Warning },
  { value: 'expired', label: 'Expired', labelHi: 'समाप्त', icon: Warning },
  { value: 'transfer_correction', label: 'Transfer Correction', labelHi: 'स्थानांतरण सुधार', icon: FileText },
];

export default function StockAdjustmentPage() {
  const { language } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [adjNumber, setAdjNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [filterType, setSlidersHorizontalType] = useState('');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adj_type: 'write_off',
    },
  });

  const adjType = watch('adj_type');

  useEffect(() => {
    fetchBranches();
    fetchFarmers();
    fetchProducts();
    fetchAdjustments();
    generateAdjNumber();
  }, []);

  const generateAdjNumber = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      
      const { data: lastAdj } = await supabase
        .from('stock_adjustments')
        .select('adj_number')
        .eq('integrator_id', user.id)
        .like('adj_number', `SA/${yearSuffix}/%`)
        .order('adj_number', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (lastAdj) {
        const lastSequence = parseInt(lastAdj.adj_number.split('/').pop() || '0');
        sequence = lastSequence + 1;
      }

      setAdjNumber(`SA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating adjustment number:', error);
      setAdjNumber(`SA/${new Date().getFullYear()}/001`);
    }
  };

  const fetchBranches = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('branch_name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchFarmers = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setFarmers(data || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdjustments = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('stock_adjustments')
        .select(`
          *,
          branches(id, branch_name),
          farmers(id, full_name),
          products(id, product_name, unit_of_measure)
        `)
        .eq('integrator_id', user.id)
        .order('adj_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAdjustments(data || []);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
    }
  };

  const onSubmit = async (data: AdjustmentFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to create adjustment');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'स्टॉक समायोजन सफलतापूर्वक बनाया गया' 
          : 'Stock adjustment created successfully'
      });
      
      reset();
      await generateAdjNumber();
      await fetchAdjustments();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'स्टॉक समायोजन बनाने में विफल' 
          : 'Failed to create stock adjustment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatINR = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '-';
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getAdjustmentTypeLabel = (type: string) => {
    const adjType = ADJUSTMENT_TYPES.find(t => t.value === type);
    return adjType ? (language === 'hi' ? adjType.labelHi : adjType.label) : type;
  };

  const filteredAdjustments = adjustments.filter(adj => {
    if (filterType && adj.adj_type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        adj.adj_number.toLowerCase().includes(query) ||
        adj.products?.product_name?.toLowerCase().includes(query) ||
        adj.branches?.branch_name?.toLowerCase().includes(query) ||
        adj.farmers?.full_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-8 px-6 pt-8 pb-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Inventory
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'स्टॉक समायोजन' : 'Stock Adjustment'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'स्टॉक में समायोजन करें - लिखें बंद, लिखें अंदर, क्षति, समाप्त, और स्थानांतरण सुधार' 
              : 'Adjust stock - write off, write in, damage, expired, and transfer corrections'}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button 
            className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-[#E3EDE7] bg-white hover:bg-[#EDF7F1] hover:border-[#1A5C34]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Download size={18} weight="regular" />
            <span>CSV</span>
          </button>
          <button 
            className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-[#E3EDE7] bg-white hover:bg-[#EDF7F1] hover:border-[#1A5C34]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Printer size={18} weight="regular" />
            <span>Print</span>
          </button>
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
              {isHindi ? 'नया समायोजन' : 'New Adjustment'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Adjustment Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'समायोजन नंबर' : 'Adjustment Number'}</label>
                <input
                  type="text"
                  value={adjNumber}
                  disabled
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm bg-[#EDF7F1] text-[#111827] font-mono"
                />
              </div>

              {/* Adjustment Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'समायोजन प्रकार' : 'Adjustment Type'}</label>
                <select
                  {...register('adj_type')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  {ADJUSTMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'स्थान' : 'Location'}</label>
                <div className="space-y-2">
                  <select
                    {...register('branch_id')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="">{isHindi ? 'शाखा चुनें' : 'Select Branch'}</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name} ({branch.branch_code})
                      </option>
                    ))}
                  </select>
                  <select
                    {...register('farmer_id')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="">{isHindi ? 'किसान चुनें' : 'Select Farmer'}</option>
                    {farmers.map(farmer => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.full_name} ({farmer.village})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'उत्पाद' : 'Product'} <span className="text-red-500">*</span></label>
                <select
                  {...register('product_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'उत्पाद चुनें' : 'Select Product'}</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} ({product.unit_of_measure})
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p className="text-red-600 text-xs">{errors.product_id.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'मात्रा' : 'Quantity'} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
                {errors.quantity && (
                  <p className="text-red-600 text-xs">{errors.quantity.message}</p>
                )}
              </div>

              {/* Unit Rate */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'दर' : 'Unit Rate'}</label>
                <input
                  type="number"
                  {...register('unit_rate', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'कारण' : 'Reason'}</label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  placeholder={isHindi ? 'कारण दर्ज करें...' : 'Enter reason...'}
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
                    {isHindi ? 'सहेजें' : 'FloppyDisk Adjustment'}
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
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="relative group">
                    <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1A5C34] transition-colors" />
                    <input
                      type="text"
                      placeholder={isHindi ? 'खोजें...' : 'MagnifyingGlass...'}
                      value={searchQuery}
                      onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="min-w-[180px]">
                  <select
                    value={filterType}
                    onChange={(e) => setSlidersHorizontalType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                  >
                    <option value="">{isHindi ? 'सभी प्रकार' : 'All Types'}</option>
                    {ADJUSTMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(filterType || searchQuery) && (
                  <button
                    onClick={() => {
                      setSlidersHorizontalType('');
                      setMagnifyingGlassQuery('');
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-all duration-200"
                  >
                    {isHindi ? 'साफ़ करें' : 'Clear'}
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नंबर' : 'Number'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'तिथि' : 'Date'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'प्रकार' : 'Type'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'उत्पाद' : 'Product'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'स्थान' : 'Location'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मात्रा' : 'Qty'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'दर' : 'Rate'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कारण' : 'Reason'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Spinner size={24} className="animate-spin text-[#1A5C34]" />
                          <span className="text-sm text-[#6B7280] font-medium">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAdjustments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Package size={36} className="text-[#3DAE72]/50" />
                          <span className="text-sm text-[#6B7280]">{isHindi ? 'कोई समायोजन नहीं मिला' : 'No adjustments found'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAdjustments.map((adj, i) => (
                      <tr
                        key={adj.id}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-[#6B7280] tabular-nums">{adj.adj_number}</td>
                        <td className="px-5 py-4 text-[#6B7280] text-xs">{adj.adj_date}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            adj.adj_type === 'write_off' ? 'bg-red-100 text-red-700' :
                            adj.adj_type === 'write_in' ? 'bg-green-100 text-green-700' :
                            adj.adj_type === 'damage' ? 'bg-orange-100 text-orange-700' :
                            adj.adj_type === 'expired' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {getAdjustmentTypeLabel(adj.adj_type)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#111827] text-sm">{adj.products?.product_name}</div>
                          <div className="text-xs text-[#6B7280]">{adj.products?.unit_of_measure}</div>
                        </td>
                        <td className="px-5 py-4 text-[#6B7280] text-xs">
                          {adj.branches?.branch_name || adj.farmers?.full_name || '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{adj.quantity}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{formatINR(adj.unit_rate)}</td>
                        <td className="px-5 py-4 text-[#6B7280] text-xs max-w-[150px] truncate">{adj.reason || '-'}</td>
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
