'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Trash, FloppyDisk, CheckCircle, X, MagnifyingGlass, 
  Package, Spinner, Truck, User, FileText, Warning
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const feedAllocItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit_rate: z.number().min(0).optional(),
  batch_no: z.string().optional(),
});

const feedAllocSchema = z.object({
  alloc_type: z.enum(['feed', 'medicine', 'vaccine', 'other']).default('feed'),
  farm_id: z.string().min(1, 'Farm is required'),
  farmer_id: z.string().min(1, 'Farmer is required'),
  batch_id: z.string().optional(),
  from_branch_id: z.string().min(1, 'Branch is required'),
  vehicle_id: z.string().optional(),
  driver_id: z.string().optional(),
  supervisor_id: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(feedAllocItemSchema).min(1, 'At least one item is required'),
});

type FeedAllocFormData = z.infer<typeof feedAllocSchema>;

interface Farm {
  id: string;
  farm_name: string;
  village: string;
  district: string;
}

interface Farmer {
  id: string;
  full_name: string;
  village: string;
}

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
}

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category_name: string;
  unit_of_measure: string;
  purchase_price: number;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface Batch {
  id: string;
  batch_number: number;
  placement_date: string;
}

interface AllocationItem {
  product_id: string;
  quantity: number;
  unit_rate: number;
  batch_no: string;
  line_value: number;
}

interface FeedAllocation {
  id: string;
  alloc_number: string;
  alloc_date: string;
  alloc_type: string;
  farm_id: string;
  farmer_id: string;
  batch_id: string | null;
  from_branch_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  supervisor_id: string | null;
  total_quantity: number;
  total_value: number;
  remarks: string | null;
  farms?: { farm_name: string };
  farmers?: { full_name: string };
  batches?: { batch_number: number };
  branches?: { branch_name: string };
  vehicles?: { vehicle_number: string };
  employees?: { name: string };
}

const ALLOC_TYPES = [
  { value: 'feed', label: 'Feed', labelHi: 'फीड' },
  { value: 'medicine', label: 'Medicine', labelHi: 'दवा' },
  { value: 'vaccine', label: 'Vaccine', labelHi: 'वैक्सीन' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export default function FeedAllocPage() {
  const { language } = useLanguage();
  const [allocations, setAllocations] = useState<FeedAllocation[]>([]);
  const [allocItems, setAllocItems] = useState<AllocationItem[]>([]);
  const [allocNumber, setAllocNumber] = useState('');
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
  } = useForm<FeedAllocFormData>({
    resolver: zodResolver(feedAllocSchema),
    defaultValues: {
      alloc_type: 'feed',
    },
  });

  const allocType = watch('alloc_type');
  const farmId = watch('farm_id');

  useEffect(() => {
    fetchFarms();
    fetchBranches();
    fetchProducts();
    fetchVehicles();
    fetchEmployees();
    fetchAllocations();
    generateAllocNumber();
  }, []);

  useEffect(() => {
    if (farmId) {
      fetchFarmers(farmId);
      fetchBatches(farmId);
    }
  }, [farmId]);

  const generateAllocNumber = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      
      const { data: lastAlloc } = await supabase
        .from('feed_medicine_allocations')
        .select('alloc_number')
        .eq('integrator_id', user.id)
        .like('alloc_number', `FA/${yearSuffix}/%`)
        .order('alloc_number', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (lastAlloc) {
        const lastSequence = parseInt(lastAlloc.alloc_number.split('/').pop() || '0');
        sequence = lastSequence + 1;
      }

      setAllocNumber(`FA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`);
    } catch (error) {
      console.error('Error generating allocation number:', error);
      setAllocNumber(`FA/${new Date().getFullYear()}/001`);
    }
  };

  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const fetchFarms = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('status', 'active')
        .order('farm_name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchFarmers = async (farmId: string) => {
    try {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('farm_id', farmId)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setFarmers(data || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const fetchBatches = async (farmId: string) => {
    try {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('farm_id', farmId)
        .eq('status', 'active')
        .order('placement_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
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
        .select('*, product_categories(category_name)')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('vehicle_number');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .in('role', ['driver', 'supervisor'])
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAllocations = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('feed_medicine_allocations')
        .select(`
          *,
          farms(farm_name),
          farmers(full_name),
          batches(batch_number),
          branches(branch_name),
          vehicles(vehicle_number),
          employees(name)
        `)
        .eq('integrator_id', user.id)
        .order('alloc_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAllocations(data || []);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAllocItem = () => {
    if (products.length > 0) {
      setAllocItems([
        ...allocItems,
        {
          product_id: products[0].id,
          quantity: 0,
          unit_rate: products[0].purchase_price || 0,
          batch_no: '',
          line_value: 0
        }
      ]);
    }
  };

  const updateAllocItem = (index: number, field: keyof AllocationItem, value: number | string) => {
    const updated = [...allocItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    if (field === 'quantity' || field === 'unit_rate') {
      updated[index].line_value = updated[index].quantity * updated[index].unit_rate;
    }
    
    setAllocItems(updated);
  };

  const removeAllocItem = (index: number) => {
    setAllocItems(allocItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FeedAllocFormData) => {
    if (allocItems.length === 0) {
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

      const payload = {
        alloc_type: data.alloc_type,
        farm_id: data.farm_id,
        farmer_id: data.farmer_id,
        batch_id: data.batch_id || null,
        from_branch_id: data.from_branch_id,
        vehicle_id: data.vehicle_id || null,
        driver_id: data.driver_id || null,
        supervisor_id: data.supervisor_id || null,
        remarks: data.remarks || null,
        items: allocItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_rate: item.unit_rate || null,
          batch_no: item.batch_no || null,
        })),
      };

      const response = await fetch('/api/broiler/feed-allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to create allocation');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'एलोकेशन सफलतापूर्वक बनाया गया' 
          : 'Allocation created successfully'
      });
      
      reset();
      setAllocItems([]);
      await generateAllocNumber();
      await fetchAllocations();
    } catch (error) {
      console.error('Error creating allocation:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'एलोकेशन बनाने में विफल' 
          : 'Failed to create allocation'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatINR = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '-';
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getAllocTypeLabel = (type: string) => {
    const allocType = ALLOC_TYPES.find(t => t.value === type);
    return allocType ? (language === 'hi' ? allocType.labelHi : allocType.label) : type;
  };

  const filteredAllocations = allocations.filter(alloc => {
    if (filterType && alloc.alloc_type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alloc.alloc_number.toLowerCase().includes(query) ||
        alloc.farms?.farm_name?.toLowerCase().includes(query) ||
        alloc.farmers?.full_name?.toLowerCase().includes(query) ||
        alloc.branches?.branch_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalQuantity = allocItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = allocItems.reduce((sum, item) => sum + item.line_value, 0);

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-8 px-6 pt-8 pb-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Broiler
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'फीड/दवा एलोकेशन' : 'Feed/Medicine Allocation'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'शाखा से किसानों को फीड, दवा, और वैक्सीन आवंटित करें' 
              : 'Allocate feed, medicine, and vaccines from branch to farmers'}
          </p>
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
              {isHindi ? 'नया एलोकेशन' : 'New Allocation'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Allocation Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'एलोकेशन नंबर' : 'Allocation Number'}</label>
                <input
                  type="text"
                  value={allocNumber}
                  disabled
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm bg-[#EDF7F1] text-[#111827] font-mono"
                />
              </div>

              {/* Allocation Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'एलोकेशन प्रकार' : 'Allocation Type'}</label>
                <select
                  {...register('alloc_type')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  {ALLOC_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Farm */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'खेत' : 'Farm'} <span className="text-red-500">*</span></label>
                <select
                  {...register('farm_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'खेत चुनें' : 'Select Farm'}</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farm_name} ({farm.village})
                    </option>
                  ))}
                </select>
                {errors.farm_id && (
                  <p className="text-red-600 text-xs">{errors.farm_id.message}</p>
                )}
              </div>

              {/* Farmer */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'किसान' : 'Farmer'} <span className="text-red-500">*</span></label>
                <select
                  {...register('farmer_id')}
                  disabled={!farmId}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{isHindi ? 'किसान चुनें' : 'Select Farmer'}</option>
                  {farmers.map(farmer => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.full_name}
                    </option>
                  ))}
                </select>
                {errors.farmer_id && (
                  <p className="text-red-600 text-xs">{errors.farmer_id.message}</p>
                )}
              </div>

              {/* Batch */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'बैच' : 'Batch'}</label>
                <select
                  {...register('batch_id')}
                  disabled={!farmId}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{isHindi ? 'बैच चुनें' : 'Select Batch'}</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      Batch #{batch.batch_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Branch */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'से शाखा' : 'From Branch'} <span className="text-red-500">*</span></label>
                <select
                  {...register('from_branch_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'शाखा चुनें' : 'Select Branch'}</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name} ({branch.branch_code})
                    </option>
                  ))}
                </select>
                {errors.from_branch_id && (
                  <p className="text-red-600 text-xs">{errors.from_branch_id.message}</p>
                )}
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'वाहन' : 'Vehicle'}</label>
                <select
                  {...register('vehicle_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'वाहन चुनें' : 'Select Vehicle'}</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} ({vehicle.vehicle_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'चालक' : 'Driver'}</label>
                <select
                  {...register('driver_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'चालक चुनें' : 'Select Driver'}</option>
                  {employees.filter(e => e.role === 'driver').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supervisor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'पर्यवेक्षक' : 'Supervisor'}</label>
                <select
                  {...register('supervisor_id')}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                >
                  <option value="">{isHindi ? 'पर्यवेक्षक चुनें' : 'Select Supervisor'}</option>
                  {employees.filter(e => e.role === 'supervisor').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'आइटम' : 'Items'} <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={addAllocItem}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 flex items-center gap-1"
                  >
                    <Plus size={14} weight="bold" />
                    {isHindi ? 'जोड़ें' : 'Add'}
                  </button>
                </div>

                {allocItems.length === 0 ? (
                  <div className="text-center py-6 text-[#6B7280] border-2 border-dashed border-[#E3EDE7] rounded-lg bg-[#EDF7F1]/30">
                    <Package size={24} className="mx-auto mb-2 text-[#3DAE72]/50" />
                    <p className="text-xs">{isHindi ? 'कोई आइटम नहीं' : 'No items'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allocItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <select
                          value={item.product_id}
                          onChange={(e) => {
                            const product = products.find(p => p.id === e.target.value);
                            updateAllocItem(index, 'product_id', e.target.value);
                            if (product) {
                              updateAllocItem(index, 'unit_rate', product.purchase_price || 0);
                            }
                          }}
                          className="flex-1 px-2 py-1.5 border border-[#E3EDE7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5C34] bg-white"
                        >
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.product_name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => updateAllocItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                          placeholder={isHindi ? 'मात्रा' : 'Qty'}
                          className="w-16 px-2 py-1.5 border border-[#E3EDE7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                        />
                        <input
                          type="number"
                          value={item.unit_rate || ''}
                          onChange={(e) => updateAllocItem(index, 'unit_rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder={isHindi ? 'दर' : 'Rate'}
                          className="w-16 px-2 py-1.5 border border-[#E3EDE7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                        />
                        <button
                          type="button"
                          onClick={() => removeAllocItem(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'टिप्पणियां' : 'Remarks'}</label>
                <textarea
                  {...register('remarks')}
                  rows={2}
                  placeholder={isHindi ? 'कोई अतिरिक्त नोट्स...' : 'Any additional notes...'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || allocItems.length === 0}
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
                    {isHindi ? 'सहेजें' : 'FloppyDisk Allocation'}
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
                <div className="flex-1 min-w-[200px]">
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
                <div className="min-w-[150px]">
                  <select
                    value={filterType}
                    onChange={(e) => setSlidersHorizontalType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                  >
                    <option value="">{isHindi ? 'सभी प्रकार' : 'All Types'}</option>
                    {ALLOC_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'खेत/किसान' : 'Farm/Farmer'}</th>
                    <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'शाखा' : 'Branch'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मात्रा' : 'Qty'}</th>
                    <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मूल्य' : 'Value'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Spinner size={24} className="animate-spin text-[#1A5C34]" />
                          <span className="text-sm text-[#6B7280] font-medium">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Package size={36} className="text-[#3DAE72]/50" />
                          <span className="text-sm text-[#6B7280]">{isHindi ? 'कोई एलोकेशन नहीं मिला' : 'No allocations found'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAllocations.map((alloc, i) => (
                      <tr
                        key={alloc.id}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-[#6B7280] tabular-nums">{alloc.alloc_number}</td>
                        <td className="px-5 py-4 text-[#6B7280] text-xs">{alloc.alloc_date}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alloc.alloc_type === 'feed' ? 'bg-green-100 text-green-700' :
                            alloc.alloc_type === 'medicine' ? 'bg-blue-100 text-blue-700' :
                            alloc.alloc_type === 'vaccine' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {getAllocTypeLabel(alloc.alloc_type)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#111827]">
                          <div className="font-medium">{alloc.farms?.farm_name}</div>
                          <div className="text-xs text-[#6B7280]">{alloc.farmers?.full_name}</div>
                        </td>
                        <td className="px-5 py-4 text-[#6B7280]">{alloc.branches?.branch_name}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{alloc.total_quantity.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">{formatINR(alloc.total_value)}</td>
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
