'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Pencil, Trash, MagnifyingGlass, Funnel, X, CheckCircle, Warning, 
  Phone, MapPin, CurrencyDollar, User, Link as LinkIcon, Download, Printer, 
  Upload, Building, Tractor
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const farmerSchema = z.object({
  full_name: z.string().min(1, 'Farmer name is required'),
  name_hi: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  alternate_phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  village: z.string().optional(),
  tehsil: z.string().optional(),
  district: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  bank_account: z.string().optional(),
  bank_ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').optional().or(z.literal('')),
  bank_name: z.string().optional(),
  aadhar_number: z.string().regex(/^\d{12}$/, 'Invalid Aadhar number').optional().or(z.literal('')),
  supervisor_id: z.string().uuid().optional().or(z.literal('')),
  line_id: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FarmerFormData = z.infer<typeof farmerSchema>;

interface Farmer {
  id: string;
  farmer_code: string;
  full_name: string;
  name_hi?: string;
  phone: string;
  alternate_phone?: string;
  village?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  bank_account?: string;
  bank_ifsc?: string;
  bank_name?: string;
  aadhar_number?: string;
  linked_farm_ids?: string[];
  supervisor_id?: string;
  supervisor_name?: string;
  line_id?: string;
  line_name?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

interface Supervisor {
  id: string;
  full_name: string;
}

interface Line {
  id: string;
  branch_name: string;
  line_name?: string;
}

interface Farm {
  id: string;
  farm_name: string;
}

export default function FarmersPage() {
  const { language } = useLanguage();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [filteredFarmers, setSlidersHorizontaledFarmers] = useState<Farmer[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [filterSupervisor, setSlidersHorizontalSupervisor] = useState<string>('all');
  const [filterLine, setSlidersHorizontalLine] = useState<string>('all');
  const [filterDistrict, setSlidersHorizontalDistrict] = useState<string>('all');
  const [filterActive, setSlidersHorizontalActive] = useState<string>('all');
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      state: 'Uttar Pradesh',
    },
  });

  useEffect(() => {
    fetchFarmers();
    fetchSupervisors();
    fetchLines();
    fetchFarms();
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [farmers, searchQuery, filterSupervisor, filterLine, filterDistrict, filterActive]);

  const fetchFarmers = async () => {
    try {
      const client = supabase;
      if (!client) return;
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { data, error } = await client
        .from('farmers')
        .select(`
          *,
          employees!farmers_supervisor_id_fkey (full_name),
          branches!farmers_line_id_fkey (branch_name)
        `)
        .eq('integrator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const farmersWithNames = (data || []).map((farmer: any) => ({
        ...farmer,
        supervisor_name: farmer.employees?.full_name,
        line_name: farmer.branches?.branch_name,
      }));
      
      setFarmers(farmersWithNames);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'किसानों को लोड करने में विफल' : 'Failed to load farmers'
      });
    }
  };

  const fetchSupervisors = async () => {
    try {
      const client = supabase;
      if (!client) return;
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { data, error } = await client
        .from('employees')
        .select('id, full_name')
        .eq('integrator_id', user.id)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const fetchLines = async () => {
    try {
      const client = supabase;
      if (!client) return;
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { data, error } = await client
        .from('branches')
        .select('id, branch_name')
        .eq('integrator_id', user.id)
        .eq('branch_type', 'godown')
        .order('branch_name', { ascending: true });

      if (error) throw error;
      setLines((data || []).map((line: any) => ({
        id: line.id,
        branch_name: line.branch_name,
        line_name: line.branch_name
      })));
    } catch (error) {
      console.error('Error fetching lines:', error);
    }
  };

  const fetchFarms = async () => {
    try {
      const client = supabase;
      if (!client) return;
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { data, error } = await client
        .from('farms')
        .select('id, farm_name')
        .eq('integrator_id', user.id)
        .order('farm_name', { ascending: true });

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const filterFarmers = () => {
    let filtered = farmers;

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.farmer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone?.includes(searchQuery) ||
        f.village?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterSupervisor !== 'all') {
      filtered = filtered.filter(f => f.supervisor_id === filterSupervisor);
    }

    if (filterLine !== 'all') {
      filtered = filtered.filter(f => f.line_id === filterLine);
    }

    if (filterDistrict !== 'all') {
      filtered = filtered.filter(f => f.district === filterDistrict);
    }

    if (filterActive !== 'all') {
      filtered = filtered.filter(f => 
        filterActive === 'active' ? f.is_active : !f.is_active
      );
    }

    setSlidersHorizontaledFarmers(filtered);
  };

  const onSubmit = async (data: FarmerFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const client = supabase;
      if (!client) throw new Error('Supabase client not initialized');
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate farmer code
      const farmerCount = farmers.length + 1;
      const farmerCode = `FMR-${String(farmerCount).padStart(3, '0')}`;

      const payload = {
        integrator_id: user.id,
        farmer_code: editingFarmer ? editingFarmer.farmer_code : farmerCode,
        full_name: data.full_name,
        name_hi: data.name_hi || null,
        phone: data.phone,
        alternate_phone: data.alternate_phone || null,
        village: data.village || null,
        tehsil: data.tehsil || null,
        district: data.district || null,
        state: data.state,
        bank_account: data.bank_account || null,
        bank_ifsc: data.bank_ifsc || null,
        bank_name: data.bank_name || null,
        aadhar_number: data.aadhar_number || null,
        supervisor_id: data.supervisor_id || null,
        line_id: data.line_id || null,
        linked_farm_ids: selectedFarmIds.length > 0 ? selectedFarmIds : null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editingFarmer) {
        const result = await client
          .from('farmers')
          .update(payload)
          .eq('id', editingFarmer.id);
        error = result.error;
      } else {
        const result = await client
          .from('farmers')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = result.error;
      }

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'किसान सफलतापूर्वक सहेजा गया' 
          : 'Farmer saved successfully'
      });
      
      setIsPanelOpen(false);
      setEditingFarmer(null);
      setSelectedFarmIds([]);
      reset();
      await fetchFarmers();
    } catch (error) {
      console.error('Error saving farmer:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'किसान सहेजने में विफल' 
          : 'Failed to save farmer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setValue('full_name', farmer.full_name);
    setValue('name_hi', farmer.name_hi || '');
    setValue('phone', farmer.phone);
    setValue('alternate_phone', farmer.alternate_phone || '');
    setValue('village', farmer.village || '');
    setValue('tehsil', farmer.tehsil || '');
    setValue('district', farmer.district || '');
    setValue('state', farmer.state || 'Uttar Pradesh');
    setValue('bank_account', farmer.bank_account || '');
    setValue('bank_ifsc', farmer.bank_ifsc || '');
    setValue('bank_name', farmer.bank_name || '');
    setValue('aadhar_number', farmer.aadhar_number || '');
    setValue('supervisor_id', farmer.supervisor_id || '');
    setValue('line_id', farmer.line_id || '');
    setValue('notes', farmer.notes || '');
    setSelectedFarmIds(farmer.linked_farm_ids || []);
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const client = supabase;
      if (!client) throw new Error('Supabase client not initialized');
      const { error } = await client
        .from('farmers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'किसान हटा दिया गया' 
          : 'Farmer deleted successfully'
      });
      
      await fetchFarmers();
    } catch (error) {
      console.error('Error deleting farmer:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'किसान हटाने में विफल' 
          : 'Failed to delete farmer'
      });
    }
  };

  const handleAddNew = () => {
    setEditingFarmer(null);
    setSelectedFarmIds([]);
    reset();
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingFarmer(null);
    setSelectedFarmIds([]);
    reset();
  };

  const handleToggleActive = async (farmer: Farmer) => {
    try {
      const client = supabase;
      if (!client) throw new Error('Supabase client not initialized');
      const { error } = await client
        .from('farmers')
        .update({ is_active: !farmer.is_active, updated_at: new Date().toISOString() })
        .eq('id', farmer.id);

      if (error) throw error;
      await fetchFarmers();
    } catch (error) {
      console.error('Error toggling farmer status:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Farmer Code', 'Name', 'Phone', 'District', 'Supervisor', 'Line', 'Status'];
    const rows = filteredFarmers.map(f => [
      f.farmer_code,
      f.full_name,
      f.phone,
      f.district || '',
      f.supervisor_name || '',
      f.line_name || '',
      f.is_active ? 'Active' : 'Inactive'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farmers_export.csv';
    a.click();
  };

  const handleDownloadTemplate = () => {
    const headers = ['Name*', 'Phone*', 'Village', 'Tehsil', 'District', 'State', 'Alternate Phone', 'Bank Account', 'Bank IFSC', 'Bank Name', 'Aadhar Number'];
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farmers_import_template.csv';
    a.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const client = supabase;
      if (!client) throw new Error('Supabase client not initialized');
      const text = await file.text();
      const lines = text.split('\n').slice(1); // Skip header
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const farmerCount = farmers.length;
      const importData = lines.map((line, index) => {
        const cols = line.split(',');
        if (cols.length < 2) return null;
        return {
          integrator_id: user.id,
          farmer_code: `FMR-${String(farmerCount + index + 1).padStart(3, '0')}`,
          full_name: cols[0]?.trim() || '',
          phone: cols[1]?.trim() || '',
          village: cols[2]?.trim() || null,
          tehsil: cols[3]?.trim() || null,
          district: cols[4]?.trim() || null,
          state: cols[5]?.trim() || 'Uttar Pradesh',
          alternate_phone: cols[6]?.trim() || null,
          bank_account: cols[7]?.trim() || null,
          bank_ifsc: cols[8]?.trim() || null,
          bank_name: cols[9]?.trim() || null,
          aadhar_number: cols[10]?.trim() || null,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      const { error } = await client
        .from('farmers')
        .insert(importData);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? `${importData.length} किसान आयात किए गए` 
          : `${importData.length} farmers imported successfully`
      });

      setIsImportModalOpen(false);
      await fetchFarmers();
    } catch (error) {
      console.error('Error importing farmers:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'किसान आयात करने में विफल' 
          : 'Failed to import farmers'
      });
    }
  };

  const getUniqueDistricts = () => {
    const districts = new Set(farmers.map(f => f.district).filter(Boolean));
    return Array.from(districts).sort();
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <div className="space-y-2">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Masters
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'किसान मास्टर' : 'Farmer Master'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-xl">
            {isHindi 
              ? 'अपने सभी अनुबंधित किसानों का प्रबंधन करें' 
              : 'Manage all your contract farmers'}
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="border border-[#E3EDE7] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#EDF7F1] transition-all duration-200 ease-out flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
          >
            <Upload size={18} weight="regular" />
            {isHindi ? 'आयात' : 'Import'}
          </button>
          <button
            onClick={handleAddNew}
            className="bg-[#1A5C34] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3DAE72] transition-all duration-200 ease-out flex items-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
          >
            <Plus size={18} weight="bold" />
            {isHindi ? 'नया किसान जोड़ें' : 'Add Farmer'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-6 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ease-out animate-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-600 border border-red-200'
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
            <X size={16} weight="regular" />
          </button>
        </div>
      )}

      {/* SlidersHorizontals */}
      <div className="px-6 pb-6 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <MagnifyingGlass size={20} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            placeholder={isHindi ? 'खोजें...' : 'MagnifyingGlass farmers...'}
            value={searchQuery}
            onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
          />
        </div>
        <select
          value={filterSupervisor}
          onChange={(e) => setSlidersHorizontalSupervisor(e.target.value)}
          className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 ease-out min-w-[160px]"
        >
          <option value="all">{isHindi ? 'सभी पर्यवेक्षक' : 'All Supervisors'}</option>
          {supervisors.map(sup => (
            <option key={sup.id} value={sup.id}>{sup.full_name}</option>
          ))}
        </select>
        <select
          value={filterLine}
          onChange={(e) => setSlidersHorizontalLine(e.target.value)}
          className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 ease-out min-w-[140px]"
        >
          <option value="all">{isHindi ? 'सभी लाइन' : 'All Lines'}</option>
          {lines.map(line => (
            <option key={line.id} value={line.id}>{line.branch_name}</option>
          ))}
        </select>
        <select
          value={filterDistrict}
          onChange={(e) => setSlidersHorizontalDistrict(e.target.value)}
          className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 ease-out min-w-[140px]"
        >
          <option value="all">{isHindi ? 'सभी जिले' : 'All Districts'}</option>
          {getUniqueDistricts().map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setSlidersHorizontalActive(e.target.value)}
          className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 ease-out min-w-[130px]"
        >
          <option value="all">{isHindi ? 'सभी स्थिति' : 'All Status'}</option>
          <option value="active">{isHindi ? 'सक्रिय' : 'Active'}</option>
          <option value="inactive">{isHindi ? 'निष्क्रिय' : 'Inactive'}</option>
        </select>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="border border-[#E3EDE7] px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
          >
            <Download size={16} weight="regular" />
            CSV
          </button>
          <button className="border border-[#E3EDE7] px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#EDF7F1] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1">
            <Printer size={16} weight="regular" />
            Print
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="px-6 pb-8">
        {filteredFarmers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
            <div className="w-20 h-20 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-6">
              <Tractor size={32} weight="regular" className="text-[#1A5C34]" />
            </div>
            <h3 className="text-xl font-semibold text-[#111827] mb-3">
              {isHindi ? 'कोई किसान नहीं मिला' : 'No farmers found'}
            </h3>
            <p className="text-base text-[#6B7280] mb-8 max-w-sm leading-relaxed">
              {isHindi 
                ? 'अपना पहला किसान जोड़ने के लिए नीचे बटन पर क्लिक करें' 
                : 'Click the button below to add your first farmer'}
            </p>
            <button
              onClick={handleAddNew}
              className="bg-[#1A5C34] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#3DAE72] transition-all duration-200 ease-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
            >
              {isHindi ? '+ पहला किसान जोड़ें' : '+ Add First Farmer'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'कोड' : 'Code'}</th>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'नाम' : 'Name'}</th>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'फोन' : 'Phone'}</th>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'जिला' : 'District'}</th>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'फार्म' : 'Farm'}</th>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'पर्यवेक्षक' : 'Supervisor'}</th>
                    <th className="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">{isHindi ? 'लाइन' : 'Line'}</th>
                    <th className="px-5 py-3.5 text-center font-medium text-xs uppercase tracking-wider">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-5 py-3.5 text-center font-medium text-xs uppercase tracking-wider">{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer, i) => (
                    <tr
                      key={farmer.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer transition-colors duration-150 ease-out`}
                      onClick={() => handleEdit(farmer)}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-[#6B7280]">{farmer.farmer_code}</td>
                      <td className="px-5 py-3.5">
                        <div>
                          <div className="font-medium text-[#111827]">{farmer.full_name}</div>
                          {farmer.village && (
                            <div className="text-xs text-[#6B7280] mt-0.5">{farmer.village}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#6B7280] font-mono">{farmer.phone}</td>
                      <td className="px-5 py-3.5 text-[#6B7280]">{farmer.district || '-'}</td>
                      <td className="px-5 py-3.5 text-[#6B7280]">
                        {farmer.linked_farm_ids && farmer.linked_farm_ids.length > 0 ? (
                          <span className="text-xs font-medium bg-[#1A5C34]/10 text-[#1A5C34] px-2.5 py-1 rounded-full">
                            {farmer.linked_farm_ids.length} {isHindi ? 'फार्म' : 'Farm(s)'}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-[#6B7280]">{farmer.supervisor_name || '-'}</td>
                      <td className="px-5 py-3.5 text-[#6B7280]">{farmer.line_name || '-'}</td>
                      <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleActive(farmer)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ease-out ${
                            farmer.is_active 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {farmer.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(farmer)}
                            className="p-2 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
                            aria-label="Edit farmer"
                          >
                            <Pencil size={16} weight="regular" />
                          </button>
                          <button
                            onClick={() => handleDelete(farmer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-1"
                            aria-label="Delete farmer"
                          >
                            <Trash size={16} weight="regular" />
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out"
            onClick={handleClosePanel}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ease-out">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#111827] leading-tight tracking-tight">
                  {editingFarmer 
                    ? (isHindi ? 'किसान संपादित करें' : 'Edit Farmer')
                    : (isHindi ? 'नया किसान जोड़ें' : 'Add New Farmer')
                  }
                </h2>
                <button
                  onClick={handleClosePanel}
                  className="p-2 hover:bg-[#F4F7F5] rounded-lg transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
                  aria-label="Close panel"
                >
                  <X size={20} weight="regular" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Farmer Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'किसान का नाम *' : 'Farmer Name *'}
                  </label>
                  <input
                    type="text"
                    {...register('full_name')}
                    placeholder={isHindi ? 'उदाहरण: रामप्रकाश यादव' : 'Example: Ramprakash Yadav'}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                  />
                  {errors.full_name && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Name in Hindi */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'नाम (हिंदी)' : 'Name (Hindi)'}
                  </label>
                  <input
                    type="text"
                    {...register('name_hi')}
                    placeholder={isHindi ? 'उदाहरण: रामप्रकाश यादव' : 'Example: रामप्रकाश यादव'}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'फोन नंबर *' : 'Phone Number *'}
                  </label>
                  <div className="relative">
                    <Phone size={20} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{errors.phone.message}</p>
                  )}
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'वैकल्पिक फोन' : 'Alternate Phone'}
                  </label>
                  <div className="relative">
                    <Phone size={20} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="tel"
                      {...register('alternate_phone')}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'गांव' : 'Village'}
                    </label>
                    <input
                      type="text"
                      {...register('village')}
                      placeholder={isHindi ? 'उदाहरण: सिसवा' : 'Example: Siswa'}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'तहसील' : 'Tehsil'}
                    </label>
                    <input
                      type="text"
                      {...register('tehsil')}
                      placeholder={isHindi ? 'उदाहरण: खोराबार' : 'Example: Khoraabar'}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'जिला' : 'District'}
                    </label>
                    <input
                      type="text"
                      {...register('district')}
                      placeholder={isHindi ? 'उदाहरण: गोरखपुर' : 'Example: Gorakhpur'}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'राज्य' : 'State'}
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-5 pt-6 border-t border-[#E3EDE7]">
                  <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">{isHindi ? 'बैंक विवरण' : 'Bank Details'}</h3>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'बैंक खाता' : 'Bank Account'}
                    </label>
                    <input
                      type="text"
                      {...register('bank_account')}
                      placeholder="1234567890123456"
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'IFSC कोड' : 'IFSC Code'}
                    </label>
                    <input
                      type="text"
                      {...register('bank_ifsc')}
                      placeholder="SBIN0001234"
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent uppercase transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                    {errors.bank_ifsc && (
                      <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{errors.bank_ifsc.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'बैंक का नाम' : 'Bank Name'}
                    </label>
                    <input
                      type="text"
                      {...register('bank_name')}
                      placeholder={isHindi ? 'उदाहरण: स्टेट बैंक ऑफ इंडिया' : 'Example: State Bank of India'}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Aadhar Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'आधार नंबर (वैकल्पिक)' : 'Aadhar Number (Optional)'}
                  </label>
                  <input
                    type="text"
                    {...register('aadhar_number')}
                    placeholder="123456789012"
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                  />
                  {errors.aadhar_number && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{errors.aadhar_number.message}</p>
                  )}
                </div>

                {/* Supervisor & Line */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'पर्यवेक्षक' : 'Supervisor'}
                    </label>
                    <select
                      {...register('supervisor_id')}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 ease-out"
                    >
                      <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                      {supervisors.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                      {isHindi ? 'लाइन/रूट' : 'Line/Route'}
                    </label>
                    <select
                      {...register('line_id')}
                      className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200 ease-out"
                    >
                      <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                      {lines.map(line => (
                        <option key={line.id} value={line.id}>{line.branch_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Link Farms */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'फार्म लिंक करें' : 'Link Farms'}
                  </label>
                  <div className="border border-[#E3EDE7] rounded-lg p-4 max-h-48 overflow-y-auto">
                    {farms.length === 0 ? (
                      <p className="text-sm text-[#6B7280] text-center py-4">
                        {isHindi ? 'कोई फार्म उपलब्ध नहीं' : 'No farms available'}
                      </p>
                    ) : (
                      farms.map(farm => (
                        <label key={farm.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-[#F4F7F5] px-2 rounded-md transition-colors duration-150">
                          <input
                            type="checkbox"
                            checked={selectedFarmIds.includes(farm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFarmIds([...selectedFarmIds, farm.id]);
                              } else {
                                setSelectedFarmIds(selectedFarmIds.filter(id => id !== farm.id));
                              }
                            }}
                            className="w-4 h-4 text-[#1A5C34] border-[#E3EDE7] rounded focus:ring-[#1A5C34] focus:ring-offset-2"
                          />
                          <span className="text-sm text-[#111827]">{farm.farm_name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'नोट्स' : 'Notes'}
                  </label>
                  <textarea
                    {...register('notes')}
                    placeholder={isHindi ? 'कोई अतिरिक्त जानकारी' : 'Any additional information'}
                    rows={3}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent resize-none transition-all duration-200 ease-out placeholder:text-[#9CA3AF]"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
                  <button
                    type="button"
                    onClick={handleClosePanel}
                    className="flex-1 border border-[#E3EDE7] px-4 py-3 rounded-lg hover:bg-[#F4F7F5] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1A5C34] text-white px-4 py-3 rounded-lg hover:bg-[#3DAE72] transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out"
            onClick={() => setIsImportModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-300 ease-out">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#111827] leading-tight tracking-tight">
                {isHindi ? 'किसान आयात करें' : 'Import Farmers'}
              </h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 hover:bg-[#F4F7F5] rounded-lg transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
                aria-label="Close modal"
              >
                <X size={20} weight="regular" />
              </button>
            </div>

            <div className="space-y-5">
              <button
                onClick={handleDownloadTemplate}
                className="w-full border border-[#E3EDE7] px-4 py-3 rounded-lg hover:bg-[#EDF7F1] transition-all duration-200 ease-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
              >
                <Download size={18} weight="regular" />
                {isHindi ? 'टेम्पलेट डाउनलोड करें' : 'Download Template'}
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="w-full border-2 border-dashed border-[#E3EDE7] px-4 py-10 rounded-lg hover:border-[#1A5C34] hover:bg-[#EDF7F1]/30 transition-all duration-200 ease-out flex flex-col items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-1"
                >
                  <Upload size={32} weight="regular" className="text-[#6B7280]" />
                  <span className="text-sm font-medium text-[#111827]">
                    {isHindi ? 'CSV फ़ाइल अपलोड करें' : 'Upload CSV file'}
                  </span>
                </label>
              </div>

              <p className="text-xs text-[#6B7280] text-center leading-relaxed">
                {isHindi 
                  ? 'CSV फ़ाइल में कॉलम होने चाहिए: Name*, Phone*, Village, Tehsil, District, State, Alternate Phone, Bank Account, Bank IFSC, Bank Name, Aadhar Number'
                  : 'CSV file should have columns: Name*, Phone*, Village, Tehsil, District, State, Alternate Phone, Bank Account, Bank IFSC, Bank Name, Aadhar Number'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
