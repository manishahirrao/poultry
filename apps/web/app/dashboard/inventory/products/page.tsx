'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Pencil, Trash, CheckCircle, Warning, X, Package, 
  Download, Printer, Spinner, Copy, SlidersHorizontal, MagnifyingGlass
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const productSchema = z.object({
  product_code: z.string().optional(),
  product_name: z.string().min(1, 'Product name is required'),
  product_name_hi: z.string().optional(),
  category_id: z.string().optional(),
  unit_of_measure: z.enum(['kg', 'g', 'mt', 'litre', 'ml', 'pcs', 'bag', 'crate', 'dozen', 'box']),
  purchase_price: z.number().min(0, 'Purchase price must be positive').optional(),
  sale_price: z.number().min(0, 'Sale price must be positive').optional(),
  margin_pct: z.number().min(0).max(100).optional(),
  reorder_level: z.number().min(0).optional(),
  hsn_code: z.string().optional(),
  tax_id: z.string().optional(),
  withdrawal_days: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  product_name_hi: string | null;
  category_id: string | null;
  category_name: string | null;
  category_type: string | null;
  unit_of_measure: string;
  purchase_price: number | null;
  sale_price: number | null;
  margin_pct: number | null;
  reorder_level: number | null;
  hsn_code: string | null;
  tax_id: string | null;
  withdrawal_days: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface ProductCategory {
  id: string;
  category_code: string;
  category_name: string;
  category_type: string;
}

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'mt', label: 'Metric Ton (mt)' },
  { value: 'litre', label: 'Litre' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'bag', label: 'Bag' },
  { value: 'crate', label: 'Crate' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'box', label: 'Box' },
];

const CATEGORY_TYPES = [
  { value: 'chick', label: 'Chick', labelHi: 'चूज़ा' },
  { value: 'feed', label: 'Feed', labelHi: 'फ़ीड' },
  { value: 'medicine', label: 'Medicine', labelHi: 'दवा' },
  { value: 'vaccine', label: 'Vaccine', labelHi: 'वैक्सीन' },
  { value: 'equipment', label: 'Equipment', labelHi: 'उपकरण' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

const formatINR = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '-';
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function ProductMasterPage() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // SlidersHorizontals
  const [filterCategory, setSlidersHorizontalCategory] = useState<string>('');
  const [filterType, setSlidersHorizontalType] = useState<string>('');
  const [filterActive, setSlidersHorizontalActive] = useState<string>('all');
  const [searchQuery, setMagnifyingGlassQuery] = useState<string>('');
  
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit_of_measure: 'kg',
      is_active: true,
    },
  });

  // Watch purchase and sale price to auto-calculate margin
  const purchasePrice = watch('purchase_price');
  const salePrice = watch('sale_price');

  useEffect(() => {
    if (purchasePrice && salePrice && purchasePrice > 0) {
      const margin = ((salePrice - purchasePrice) / purchasePrice) * 100;
      setValue('margin_pct', Math.round(margin * 100) / 100);
    }
  }, [purchasePrice, salePrice, setValue]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      let query = supabaseClient
        .from('products')
        .select(`
          *,
          product_categories!inner(category_name, category_type)
        `)
        .eq('integrator_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = (data || []).map((p: any) => ({
        ...p,
        category_name: p.product_categories?.category_name || null,
        category_type: p.product_categories?.category_type || null,
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'उत्पाद लोड करने में विफल' : 'Failed to load products'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('product_categories')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('category_name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate product code if not provided
      const productCount = products.length + 1;
      const productCode = data.product_code || `PRD-${String(productCount).padStart(3, '0')}`;

      const payload = {
        integrator_id: user.id,
        product_code: editingProduct ? editingProduct.product_code : productCode,
        product_name: data.product_name,
        product_name_hi: data.product_name_hi || null,
        category_id: data.category_id || null,
        unit_of_measure: data.unit_of_measure,
        purchase_price: data.purchase_price || null,
        sale_price: data.sale_price || null,
        margin_pct: data.margin_pct || null,
        reorder_level: data.reorder_level || null,
        hsn_code: data.hsn_code || null,
        tax_id: data.tax_id || null,
        withdrawal_days: data.withdrawal_days || null,
        is_active: data.is_active,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editingProduct) {
        const result = await supabaseClient
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        error = result.error;
      } else {
        const result = await supabaseClient
          .from('products')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = result.error;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'उत्पाद सफलतापूर्वक सहेजा गया' 
          : 'Product saved successfully'
      });
      
      setIsPanelOpen(false);
      setEditingProduct(null);
      reset();
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'उत्पाद सहेजने में विफल' 
          : 'Failed to save product'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue('product_code', product.product_code || '');
    setValue('product_name', product.product_name);
    setValue('product_name_hi', product.product_name_hi || '');
    setValue('category_id', product.category_id || '');
    setValue('unit_of_measure', product.unit_of_measure as any);
    setValue('purchase_price', product.purchase_price || 0);
    setValue('sale_price', product.sale_price || 0);
    setValue('margin_pct', product.margin_pct || 0);
    setValue('reorder_level', product.reorder_level || 0);
    setValue('hsn_code', product.hsn_code || '');
    setValue('tax_id', product.tax_id || '');
    setValue('withdrawal_days', product.withdrawal_days || 0);
    setValue('is_active', product.is_active);
    setValue('notes', product.notes || '');
    setIsPanelOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    setEditingProduct(null);
    setValue('product_code', '');
    setValue('product_name', `${product.product_name} (Copy)`);
    setValue('product_name_hi', product.product_name_hi || '');
    setValue('category_id', product.category_id || '');
    setValue('unit_of_measure', product.unit_of_measure as any);
    setValue('purchase_price', product.purchase_price || 0);
    setValue('sale_price', product.sale_price || 0);
    setValue('margin_pct', product.margin_pct || 0);
    setValue('reorder_level', product.reorder_level || 0);
    setValue('hsn_code', product.hsn_code || '');
    setValue('tax_id', product.tax_id || '');
    setValue('withdrawal_days', product.withdrawal_days || 0);
    setValue('is_active', true);
    setValue('notes', product.notes || '');
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'उत्पाद हटा दिया गया' 
          : 'Product deleted successfully'
      });
      
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'उत्पाद हटाने में विफल' 
          : 'Failed to delete product'
      });
    }
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setEditingProduct(null);
    reset();
  };

  // SlidersHorizontal products
  const filteredProducts = products.filter(product => {
    if (filterCategory && product.category_id !== filterCategory) return false;
    if (filterType && product.category_type !== filterType) return false;
    if (filterActive === 'active' && !product.is_active) return false;
    if (filterActive === 'inactive' && product.is_active) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.product_name.toLowerCase().includes(query) ||
        product.product_code.toLowerCase().includes(query) ||
        (product.product_name_hi && product.product_name_hi.toLowerCase().includes(query))
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
            {isHindi ? 'उत्पाद मास्टर' : 'Product Master'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'अपने उत्पादों का प्रबंधन करें - कोड, नाम, श्रेणी, मूल्य और स्टॉक स्तर' 
              : 'Manage your products - code, name, category, pricing and stock levels'}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button 
            className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-[#E3EDE7] bg-white hover:bg-[#EDF7F1] hover:border-[#1A5C34]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Export to CSV"
          >
            <Download size={18} weight="regular" />
            <span>CSV</span>
          </button>
          <button 
            className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-[#E3EDE7] bg-white hover:bg-[#EDF7F1] hover:border-[#1A5C34]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Print table"
          >
            <Printer size={18} weight="regular" />
            <span>Print</span>
          </button>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2 min-w-[140px] justify-center"
            aria-label="Add new product"
          >
            <Plus size={18} weight="bold" />
            <span>{isHindi ? 'उत्पाद जोड़ें' : 'Add Product'}</span>
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
            <Warning size={20} weight="fill" className="flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
            aria-label="Dismiss message"
          >
            <X size={18} weight="regular" />
          </button>
        </div>
      )}

      {/* SlidersHorizontals */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* MagnifyingGlass */}
            <div className="flex-1 min-w-[240px]">
              <div className="relative group">
                <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1A5C34] transition-colors" />
                <input
                  type="text"
                  placeholder={isHindi ? 'उत्पाद खोजें...' : 'MagnifyingGlass products...'}
                  value={searchQuery}
                  onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Category SlidersHorizontal */}
            <div className="min-w-[180px]">
              <select
                value={filterCategory}
                onChange={(e) => setSlidersHorizontalCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="">{isHindi ? 'सभी श्रेणियां' : 'All Categories'}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            </div>

            {/* Type SlidersHorizontal */}
            <div className="min-w-[150px]">
              <select
                value={filterType}
                onChange={(e) => setSlidersHorizontalType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="">{isHindi ? 'सभी प्रकार' : 'All Types'}</option>
                {CATEGORY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {isHindi ? type.labelHi : type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status SlidersHorizontal */}
            <div className="min-w-[130px]">
              <select
                value={filterActive}
                onChange={(e) => setSlidersHorizontalActive(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="all">{isHindi ? 'सभी स्थिति' : 'All Status'}</option>
                <option value="active">{isHindi ? 'सक्रिय' : 'Active'}</option>
                <option value="inactive">{isHindi ? 'निष्क्रिय' : 'Inactive'}</option>
              </select>
            </div>

            {/* Clear SlidersHorizontals */}
            {(filterCategory || filterType || filterActive !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSlidersHorizontalCategory('');
                  setSlidersHorizontalType('');
                  setSlidersHorizontalActive('all');
                  setMagnifyingGlassQuery('');
                }}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
              >
                {isHindi ? 'साफ़ करें' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="px-6 pb-8">
        {filteredProducts.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-[#E3EDE7]">
            <div className="w-20 h-20 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-6">
              <Package size={36} className="text-[#1A5C34]" weight="regular" />
            </div>
            <h3 className="text-xl font-semibold text-[#111827] mb-3">
              {isHindi ? 'कोई उत्पाद नहीं मिला' : 'No products found'}
            </h3>
            <p className="text-base text-[#6B7280] mb-8 max-w-sm leading-relaxed">
              {isHindi 
                ? 'अपना पहला उत्पाद जोड़ने के लिए बटन पर क्लिक करें' 
                : 'Click the button above to add your first product'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कोड' : 'Code'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नाम' : 'Name'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'श्रेणी' : 'Category'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'इकाई' : 'Unit'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'खरीद मूल्य' : 'Purchase'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'बिक्री मूल्य' : 'Sale'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मार्जिन %' : 'Margin %'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'रीऑर्डर स्तर' : 'Reorder'}</th>
                    <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Spinner size={24} className="animate-spin text-[#1A5C34]" />
                          <span className="text-sm text-[#6B7280] font-medium">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, i) => (
                      <tr
                        key={product.id}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-[#6B7280] tabular-nums">{product.product_code}</td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#111827] text-sm">{product.product_name}</div>
                          {product.product_name_hi && (
                            <div className="text-xs text-[#6B7280] mt-0.5">{product.product_name_hi}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {product.category_name ? (
                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
                              {product.category_name}
                            </span>
                          ) : (
                            <span className="text-[#6B7280] text-xs">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[#6B7280] uppercase text-xs font-medium">{product.unit_of_measure}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs text-[#6B7280] tabular-nums">{formatINR(product.purchase_price)}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs text-[#E8611A] font-semibold tabular-nums">{formatINR(product.sale_price)}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">
                          {product.margin_pct !== null ? `${product.margin_pct.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{product.reorder_level || '-'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            product.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                              aria-label="Edit product"
                            >
                              <Pencil size={18} weight="regular" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(product)}
                              className="p-2 text-[#6B7280] hover:bg-[#EDF7F1] hover:text-[#1A5C34] rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                              aria-label="Duplicate product"
                            >
                              <Copy size={18} weight="regular" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                              aria-label="Delete product"
                            >
                              <Trash size={18} weight="regular" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel for Add/Edit Product */}
      <Dialog open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-[#111827]">
              {editingProduct 
                ? (isHindi ? 'उत्पाद संपादित करें' : 'Edit Product') 
                : (isHindi ? 'नया उत्पाद जोड़ें' : 'Add New Product')
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'उत्पाद कोड' : 'Product Code'}</label>
                <input
                  type="text"
                  {...register('product_code')}
                  placeholder="PRD-001"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'श्रेणी' : 'Category'} <span className="text-red-500">*</span></label>
                <select
                  {...register('category_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                >
                  <option value="">{isHindi ? 'श्रेणी चुनें' : 'Select Category'}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'उत्पाद नाम' : 'Product Name'} <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('product_name')}
                placeholder={isHindi ? 'उत्पाद का नाम' : 'Product name'}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
              />
              {errors.product_name && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.product_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'उत्पाद नाम (हिंदी)' : 'Product Name (Hindi)'}</label>
              <input
                type="text"
                {...register('product_name_hi')}
                placeholder={isHindi ? 'हिंदी में नाम' : 'Name in Hindi'}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'माप की इकाई' : 'Unit of Measure'}</label>
                <select
                  {...register('unit_of_measure')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                >
                  {UNIT_OPTIONS.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'HSN कोड' : 'HSN Code'}</label>
                <input
                  type="text"
                  {...register('hsn_code')}
                  placeholder="HSN Code"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'खरीद मूल्य (₹)' : 'Purchase Price (₹)'}</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('purchase_price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'बिक्री मूल्य (₹)' : 'Sale Price (₹)'}</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('sale_price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'मार्जिन %' : 'Margin %'}</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('margin_pct', { valueAsNumber: true })}
                  placeholder="Auto"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-gray-50 transition-all duration-200 tabular-nums"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'रीऑर्डर स्तर' : 'Reorder Level'}</label>
                <input
                  type="number"
                  {...register('reorder_level', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'वापसी दिन' : 'Withdrawal Days'}</label>
                <input
                  type="number"
                  {...register('withdrawal_days', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'टैक्स ID' : 'Tax ID'}</label>
              <input
                type="text"
                {...register('tax_id')}
                placeholder="Tax ID"
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#111827]">{isHindi ? 'टिप्पणियाँ' : 'Notes'}</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder={isHindi ? 'कोई टिप्पणी नहीं' : 'Additional notes'}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent resize-none transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4.5 h-4.5 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-[#1A5C34] focus:ring-offset-0"
              />
              <label className="text-sm font-medium text-[#111827]">{isHindi ? 'सक्रिय' : 'Active'}</label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#1A5C34] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={18} className="animate-spin" />
                    <span>{isHindi ? 'सहेज रहा है...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} weight="fill" />
                    <span>{editingProduct ? (isHindi ? 'अपडेट करें' : 'Update') : (isHindi ? 'सहेजें' : 'FloppyDisk')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePanelClose}
                className="px-5 py-3 border border-[#E3EDE7] rounded-lg text-sm font-semibold hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
