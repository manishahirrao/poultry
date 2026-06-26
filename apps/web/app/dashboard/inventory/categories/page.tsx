'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Pencil, Trash, CheckCircle, Warning, X, Tag, 
  Download, Printer, Package, Spinner
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const categorySchema = z.object({
  category_code: z.string().optional(),
  category_name: z.string().min(1, 'Category name is required'),
  category_type: z.enum(['chick', 'feed', 'medicine', 'vaccine', 'equipment', 'other']),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface ProductCategory {
  id: string;
  category_code: string;
  category_name: string;
  category_type: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORY_TYPES = [
  { value: 'chick', label: 'Chick', labelHi: 'चूज़ा' },
  { value: 'feed', label: 'Feed', labelHi: 'फ़ीड' },
  { value: 'medicine', label: 'Medicine', labelHi: 'दवा' },
  { value: 'vaccine', label: 'Vaccine', labelHi: 'वैक्सीन' },
  { value: 'equipment', label: 'Equipment', labelHi: 'उपकरण' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export default function ProductCategoriesPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_type: 'other',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('product_categories')
        .select('*')
        .eq('integrator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);

      // Fetch product counts for each category
      if (data && data.length > 0) {
        const counts: Record<string, number> = {};
        for (const category of data) {
          const { count } = await supabaseClient
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          counts[category.id] = count || 0;
        }
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'श्रेणियां लोड करने में विफल' : 'Failed to load categories'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate category code if not provided
      const categoryCount = categories.length + 1;
      const categoryCode = data.category_code || `CAT-${String(categoryCount).padStart(3, '0')}`;

      const payload = {
        integrator_id: user.id,
        category_code: editingCategory ? editingCategory.category_code : categoryCode,
        category_name: data.category_name,
        category_type: data.category_type,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editingCategory) {
        const result = await supabaseClient
          .from('product_categories')
          .update(payload)
          .eq('id', editingCategory.id);
        error = result.error;
      } else {
        const result = await supabaseClient
          .from('product_categories')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = result.error;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'श्रेणी सफलतापूर्वक सहेजी गई' 
          : 'Category saved successfully'
      });
      
      setIsAddingRow(false);
      setEditingCategory(null);
      reset();
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'श्रेणी सहेजने में विफल' 
          : 'Failed to save category'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setValue('category_code', category.category_code || '');
    setValue('category_name', category.category_name);
    setValue('category_type', category.category_type as any);
    setValue('is_active', category.is_active);
    setIsAddingRow(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const { error } = await supabaseClient
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'श्रेणी हटा दी गई' 
          : 'Category deleted successfully'
      });
      
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'श्रेणी हटाने में विफल' 
          : 'Failed to delete category'
      });
    }
  };

  const handleCancelAdd = () => {
    setIsAddingRow(false);
    setEditingCategory(null);
    reset();
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="space-y-1">
          <span className="inline-block rounded-full px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
            Inventory
          </span>
          <h1 className="text-2xl font-bold text-[#111827] leading-tight">
            {isHindi ? 'उत्पाद श्रेणी' : 'Product Category'}
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed max-w-md">
            {isHindi 
              ? 'अपनी उत्पाद श्रेणियों का प्रबंधन करें' 
              : 'Manage your product categories'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="border border-[#E3EDE7] px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
            disabled={isLoading}
          >
            <Download size={16} />
            CSV
          </button>
          <button 
            className="border border-[#E3EDE7] px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
            disabled={isLoading}
          >
            <Printer size={16} />
            Print
          </button>
        </div>
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

      {/* Data Table */}
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#E3EDE7]">
            <Spinner size={32} className="text-[#1A5C34] animate-spin mb-4" />
            <p className="text-sm text-[#6B7280]">
              {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
            </p>
          </div>
        ) : categories.length === 0 && !isAddingRow ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#E3EDE7]">
            <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-4">
              <Tag size={28} className="text-[#1A5C34]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              {isHindi ? 'कोई श्रेणी नहीं मिली' : 'No categories found'}
            </h3>
            <p className="text-sm text-[#6B7280] mb-6 max-w-xs leading-relaxed">
              {isHindi 
                ? 'अपनी पहली श्रेणी जोड़ने के लिए नीचे बटन पर क्लिक करें' 
                : 'Click the button below to add your first category'}
            </p>
            <button
              onClick={() => setIsAddingRow(true)}
              className="bg-[#1A5C34] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
            >
              {isHindi ? '+ पहली श्रेणी जोड़ें' : '+ Add First Category'}
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
                    <th className="px-4 py-3 text-center font-medium">{isHindi ? 'उत्पाद' : 'Products'}</th>
                    <th className="px-4 py-3 text-center font-medium">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-4 py-3 text-center font-medium">{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, i) => (
                    <tr
                      key={category.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#6B7280] tabular-nums">{category.category_code}</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">{category.category_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
                          {CATEGORY_TYPES.find(t => t.value === category.category_type)?.[isHindi ? 'labelHi' : 'label'] || category.category_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[#6B7280] tabular-nums">
                          <Package size={14} />
                          {productCounts[category.id] || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {category.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1.5 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.95]"
                            aria-label="Edit category"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 active:scale-[0.95]"
                            aria-label="Delete category"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Inline Add Row Form */}
                  {isAddingRow && (
                    <tr className="bg-[#EDF7F1]">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          {...register('category_code')}
                          placeholder={isHindi ? 'CAT-001' : 'CAT-001'}
                          className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          {...register('category_name')}
                          placeholder={isHindi ? 'श्रेणी नाम' : 'Category name'}
                          className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                        />
                        {errors.category_name && (
                          <p className="text-red-600 text-[10px] mt-1">{errors.category_name.message}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          {...register('category_type')}
                          className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                        >
                          {CATEGORY_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center text-[#6B7280]">-</td>
                      <td className="px-4 py-3 text-center">
                        <label className="flex items-center justify-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('is_active')}
                            className="w-4 h-4 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-[#1A5C34] focus:ring-offset-0"
                          />
                          <span className="text-xs">{isHindi ? 'सक्रिय' : 'Active'}</span>
                        </label>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-[#1A5C34] text-white rounded-md hover:bg-[#3DAE72] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.95]"
                            aria-label="FloppyDisk category"
                          >
                            {isSubmitting ? (
                              <Spinner size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle size={16} weight="fill" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelAdd}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 active:scale-[0.95]"
                            aria-label="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Add Button at Bottom */}
            {!isAddingRow && (
              <div className="px-4 py-3 border-t border-[#E3EDE7]">
                <button
                  onClick={() => setIsAddingRow(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#E3EDE7] rounded-lg text-sm text-[#6B7280] hover:border-[#1A5C34] hover:text-[#1A5C34] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
                >
                  <Plus size={18} weight="bold" />
                  {isHindi ? 'नई श्रेणी जोड़ें' : 'Add New Category'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
