'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Trash, FloppyDisk, FileText, CheckCircle, X, 
  Download, Printer, Package, Spinner, Calendar
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const purchaseItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  unit_rate: z.number().min(0, 'Unit rate must be positive'),
  batch_number: z.string().optional(),
  hatch_date: z.string().optional(),
  strain: z.string().optional(),
});

const purchaseSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  branch_id: z.string().optional(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional(),
  freight_charges: z.number().min(0).default(0),
  other_charges: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface Supplier {
  id: string;
  supplier_code: string;
  supplier_name: string;
  supplier_type: string;
  contact_person: string;
  phone: string;
  city: string;
}

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  city: string;
}

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category_id: string;
  unit_of_measure: string;
  purchase_price: number;
  hsn_code: string;
}

interface LineItem {
  product_id: string;
  quantity: number;
  unit_rate: number;
  batch_number: string;
  hatch_date: string;
  strain: string;
  line_total: number;
}

export default function ChickPurchasePage() {
  const { language } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      freight_charges: 0,
      other_charges: 0,
    },
  });

  const freightCharges = watch('freight_charges');
  const otherCharges = watch('other_charges');

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
    fetchProducts();
    generatePurchaseNumber();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [lineItems, freightCharges, otherCharges]);

  const generatePurchaseNumber = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      
      const { data: lastPurchase } = await supabase
        .from('purchases')
        .select('purchase_number')
        .eq('integrator_id', user.id)
        .like('purchase_number', `PUR/${yearSuffix}/%`)
        .order('purchase_number', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (lastPurchase) {
        const lastSequence = parseInt(lastPurchase.purchase_number.split('/').pop() || '0');
        sequence = lastSequence + 1;
      }

      setPurchaseNumber(`PUR/${yearSuffix}/${sequence.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating purchase number:', error);
      setPurchaseNumber(`PUR/${new Date().getFullYear()}/001`);
    }
  };

  const fetchSuppliers = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('supplier_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
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

  const fetchProducts = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories!inner(category_type)
        `)
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      // SlidersHorizontal only chick products
      const chickProducts = (data || []).filter(p => 
        p.product_categories?.category_type === 'chick'
      );
      setProducts(chickProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addLineItem = () => {
    if (products.length > 0) {
      setLineItems([
        ...lineItems,
        {
          product_id: products[0].id,
          quantity: 0,
          unit_rate: products[0].purchase_price || 0,
          batch_number: '',
          hatch_date: '',
          strain: '',
          line_total: 0
        }
      ]);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: number | string) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    // Recalculate line total
    if (field === 'quantity' || field === 'unit_rate') {
      updated[index].line_total = updated[index].quantity * updated[index].unit_rate;
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    // Totals calculated in onSubmit
  };

  const onSubmit = async (data: PurchaseFormData) => {
    if (lineItems.length === 0) {
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'कम से कम एक आइटम जोड़ें' : 'Please add at least one item'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
      const totalAmount = subtotal + data.freight_charges + data.other_charges;

      const payload = {
        purchase_type: 'chick',
        supplier_id: data.supplier_id,
        branch_id: data.branch_id || null,
        invoice_number: data.invoice_number || null,
        invoice_date: data.invoice_date || null,
        freight_charges: data.freight_charges,
        other_charges: data.other_charges,
        notes: data.notes || null,
        items: lineItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_rate: item.unit_rate,
          tax_id: null,
          batch_number: item.batch_number || null,
          expiry_date: item.hatch_date || null,
        })),
      };

      const response = await fetch('/api/inventory/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to create purchase');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'चूज़ा खरीद सफलतापूर्वक बनाई गई' 
          : 'Chick purchase created successfully'
      });
      
      reset();
      setLineItems([]);
      await generatePurchaseNumber();
    } catch (error) {
      console.error('Error creating purchase:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'चूज़ा खरीद बनाने में विफल' 
          : 'Failed to create chick purchase'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.product_name} (${product.unit_of_measure})` : '';
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
  const totalAmount = subtotal + (freightCharges || 0) + (otherCharges || 0);

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
            {isHindi ? 'चूज़ा खरीद' : 'Chick Purchase'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'चूज़ों की खरीद करें - बैच नंबर, हैच तिथि, और नस दर्ज करें' 
              : 'Purchase chicks - enter batch number, hatch date, and strain'}
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

      {/* Form */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Purchase Header */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wide">{isHindi ? 'खरीद विवरण' : 'Purchase Details'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Purchase Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'खरीद नंबर' : 'Purchase Number'}</label>
                  <input
                    type="text"
                    value={purchaseNumber}
                    disabled
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm bg-[#EDF7F1] text-[#111827] font-mono"
                  />
                </div>

                {/* Purchase Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'खरीद तिथि' : 'Purchase Date'}</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    disabled
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm bg-[#EDF7F1] text-[#111827]"
                  />
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'आपूर्तिकर्ता' : 'Supplier'} <span className="text-red-500">*</span></label>
                  <select
                    {...register('supplier_id')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="">{isHindi ? 'आपूर्तिकर्ता चुनें' : 'Select Supplier'}</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplier_name} ({supplier.supplier_code})
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="text-red-600 text-xs">{errors.supplier_id.message}</p>
                  )}
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'शाखा' : 'Branch'}</label>
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
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'चालान नंबर' : 'Invoice Number'}</label>
                  <input
                    type="text"
                    {...register('invoice_number')}
                    placeholder={isHindi ? 'चालान नंबर' : 'Invoice Number'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'चालान तिथि' : 'Invoice Date'}</label>
                  <input
                    type="date"
                    {...register('invoice_date')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wide">{isHindi ? 'चूज़े' : 'Chicks'}</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  {isHindi ? 'चूज़ा जोड़ें' : 'Add Chick'}
                </button>
              </div>

              {lineItems.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] border-2 border-dashed border-[#E3EDE7] rounded-lg bg-[#EDF7F1]/30">
                  <Package size={36} className="mx-auto mb-3 text-[#3DAE72]/50" />
                  <p className="text-sm">{isHindi ? 'कोई चूज़ा नहीं जोड़ा गया' : 'No chicks added yet'}</p>
                  <p className="text-xs mt-1">{isHindi ? 'चूज़ा जोड़ने के लिए बटन पर क्लिक करें' : 'Click the button above to add chicks'}</p>
                </div>
              ) : (
                <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'उत्पाद' : 'Product'}</th>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मात्रा' : 'Quantity'}</th>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'दर' : 'Rate'}</th>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'बैच' : 'Batch'}</th>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'हैच तिथि' : 'Hatch Date'}</th>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नस' : 'Strain'}</th>
                        <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'राशि' : 'Amount'}</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कार्य' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={index} className="border-t border-[#E3EDE7] hover:bg-[#EDF7F1]/30">
                          <td className="px-4 py-3">
                            <select
                              value={item.product_id}
                              onChange={(e) => {
                                const product = products.find(p => p.id === e.target.value);
                                updateLineItem(index, 'product_id', e.target.value);
                                if (product) {
                                  updateLineItem(index, 'unit_rate', product.purchase_price || 0);
                                }
                              }}
                              className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] bg-white"
                            >
                              {products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.product_name} ({product.unit_of_measure})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity || ''}
                              onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min="1"
                              step="1"
                              className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.unit_rate || ''}
                              onChange={(e) => updateLineItem(index, 'unit_rate', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.batch_number}
                              onChange={(e) => updateLineItem(index, 'batch_number', e.target.value)}
                              placeholder={isHindi ? 'बैच' : 'Batch'}
                              className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={item.hatch_date}
                              onChange={(e) => updateLineItem(index, 'hatch_date', e.target.value)}
                              className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.strain}
                              onChange={(e) => updateLineItem(index, 'strain', e.target.value)}
                              placeholder={isHindi ? 'नस' : 'Strain'}
                              className="w-full px-2 py-1.5 border border-[#E3EDE7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#1A5C34]">
                            {formatINR(item.line_total)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Charges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'माल ढुलाई शुल्क' : 'Freight Charges'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">₹</span>
                  <input
                    type="number"
                    {...register('freight_charges', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'अन्य शुल्क' : 'Other Charges'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">₹</span>
                  <input
                    type="number"
                    {...register('other_charges', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">{isHindi ? 'टिप्पणियां' : 'Notes'}</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder={isHindi ? 'कोई अतिरिक्त नोट्स...' : 'Any additional notes...'}
                className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
              />
            </div>

            {/* Totals */}
            <div className="bg-[#EDF7F1] rounded-lg p-5 border border-[#E3EDE7]">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">{isHindi ? 'उप-कुल' : 'Subtotal'}</span>
                  <span className="font-medium text-[#111827]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">{isHindi ? 'माल ढुलाई शुल्क' : 'Freight Charges'}</span>
                  <span className="font-medium text-[#111827]">{formatINR(freightCharges || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">{isHindi ? 'अन्य शुल्क' : 'Other Charges'}</span>
                  <span className="font-medium text-[#111827]">{formatINR(otherCharges || 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#3DAE72]/30">
                  <span className="text-base font-semibold text-[#111827]">{isHindi ? 'कुल राशि' : 'Total Amount'}</span>
                  <span className="text-xl font-bold text-[#1A5C34]">{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
              <button
                type="submit"
                disabled={isSubmitting || lineItems.length === 0}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={18} className="animate-spin" />
                    {isHindi ? 'सहेज रहा है...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <FloppyDisk size={18} weight="bold" />
                    {isHindi ? 'सहेजें' : 'FloppyDisk Purchase'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
