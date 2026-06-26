'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building, 
  MapTrifold, 
  Buildings, 
  Receipt, 
  Package, 
  Tag, 
  Calendar, 
  Users, 
  UserCircle, 
  Syringe, 
  TrendUp,
  Plus,
  Pencil,
  Trash,
  X,
  CheckCircle,
  Warning,
  ArrowRight,
  Gear
} from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

type Tab = 'company' | 'lines' | 'profit-centers' | 'tax-setup' | 'packing-types' | 'price-list' | 'financial-year' | 'employee-groups' | 'broker' | 'gc-setup' | 'gc-rate-setup';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

function SetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get('tab') as Tab) || 'company'
  );
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.replace(`/dashboard/setup?${params.toString()}`);
  }, [activeTab, searchParams, router]);

  const tabs = [
    { id: 'company' as Tab, label: 'Company', labelHi: 'कंपनी', icon: Building },
    { id: 'lines' as Tab, label: 'Lines', labelHi: 'लाइन', icon: MapTrifold },
    { id: 'profit-centers' as Tab, label: 'Profit Centers', labelHi: 'लाभ केंद्र', icon: Buildings },
    { id: 'tax-setup' as Tab, label: 'Tax Setup', labelHi: 'कर सेटअप', icon: Receipt },
    { id: 'packing-types' as Tab, label: 'Packing Types', labelHi: 'पैकिंग प्रकार', icon: Package },
    { id: 'price-list' as Tab, label: 'Price List', labelHi: 'मूल्य सूची', icon: Tag },
    { id: 'financial-year' as Tab, label: 'Financial Year', labelHi: 'वित्तीय वर्ष', icon: Calendar },
    { id: 'employee-groups' as Tab, label: 'Employee Groups', labelHi: 'कर्मचारी समूह', icon: Users },
    { id: 'broker' as Tab, label: 'Broker', labelHi: 'ब्रोकर', icon: UserCircle },
    { id: 'gc-setup' as Tab, label: 'GC Setup', labelHi: 'GC सेटअप', icon: Syringe },
    { id: 'gc-rate-setup' as Tab, label: 'GC Rate Setup', labelHi: 'GC दर सेटअप', icon: TrendUp },
  ];

  const isHindi = language === 'hi';

  if (loading) {
    return (
      <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
        <div className="h-8 bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem] w-64 animate-pulse">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] h-full" />
        </div>
        <div className="h-96 bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem] animate-pulse">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
          Setup
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
          {isHindi ? 'सेटअप / अधिक' : 'Setup / More'}
        </h1>
        <p className="text-base text-[#6B7280] mt-2">
          {isHindi 
            ? 'अपनी एकीकरण कंपनी की सेटिंग्स प्रबंधित करें' 
            : 'Manage your integration company settings'}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" />
          ) : (
            <Warning size={20} weight="fill" />
          )}
          <span className="text-sm">{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto p-1 hover:bg-black/5 rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
        <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-1">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative whitespace-nowrap rounded-xl min-h-[48px] flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-[#111827] bg-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/50'
                }`}
              >
                <tab.icon size={18} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                {isHindi ? tab.labelHi : tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'company' && <CompanyTab isHindi={isHindi} />}
        {activeTab === 'lines' && <LinesTab isHindi={isHindi} />}
        {activeTab === 'profit-centers' && <ProfitCentersTab isHindi={isHindi} />}
        {activeTab === 'tax-setup' && <TaxSetupTab isHindi={isHindi} />}
        {activeTab === 'packing-types' && <PackingTypesTab isHindi={isHindi} />}
        {activeTab === 'price-list' && <PriceListTab isHindi={isHindi} />}
        {activeTab === 'financial-year' && <FinancialYearTab isHindi={isHindi} />}
        {activeTab === 'employee-groups' && <EmployeeGroupsTab isHindi={isHindi} />}
        {activeTab === 'broker' && <BrokerTab isHindi={isHindi} />}
        {activeTab === 'gc-setup' && <GCSetupTab isHindi={isHindi} />}
        {activeTab === 'gc-rate-setup' && <GCRateSetupTab isHindi={isHindi} />}
      </div>
    </div>
  );
}

// Company Tab - Redirects to masters/company
function CompanyTab({ isHindi }: { isHindi: boolean }) {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard/masters/company');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A5C34]"></div>
    </div>
  );
}

// Lines Tab
function LinesTab({ isHindi }: { isHindi: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/setup/lines');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching lines:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-[#F4F7F5] rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'लाइन / रूट' : 'Lines / Routes'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'सुपरवाइजर रूट समूह प्रबंधित करें' : 'Manage supervisor route groupings'}
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setPanelOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'नई लाइन जोड़ें' : 'Add Line'}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState 
          icon={MapTrifold}
          title={isHindi ? 'कोई लाइन नहीं मिली' : 'No Lines Found'}
          subtitle={isHindi ? 'अपनी पहली लाइन जोड़ें' : 'Add your first line'}
          onAdd={() => { setEditingItem(null); setPanelOpen(true); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{isHindi ? 'लाइन कोड' : 'Line Code'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'लाइन का नाम' : 'Line Name'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'सुपरवाइजर' : 'Supervisor'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'जिला' : 'District'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'फार्म' : 'Farms'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'स्थिति' : 'Status'}</th>
                <th className="px-4 py-3 text-right">{isHindi ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer`}
                >
                  <td className="px-4 py-3 font-medium">{item.line_code}</td>
                  <td className="px-4 py-3">{item.line_name}</td>
                  <td className="px-4 py-3">{item.employees?.name || '-'}</td>
                  <td className="px-4 py-3">{item.district || '-'}</td>
                  <td className="px-4 py-3">{item.farm_count || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.is_active 
                        ? 'bg-[#1A5C34]/10 text-[#1A5C34]' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditingItem(item); setPanelOpen(true); }}
                      className="p-2 hover:bg-[#1A5C34]/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <LinesPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          editingItem={editingItem}
          onSuccess={() => { fetchData(); setPanelOpen(false); }}
          isHindi={isHindi}
        />
      )}
    </div>
  );
}

// Lines Panel Component
function LinesPanel({ isOpen, onClose, editingItem, onSuccess, isHindi }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editingItem || {
      line_code: '',
      line_name: '',
      supervisor_id: '',
      district: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const url = '/api/setup/lines';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...data, id: editingItem.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving line:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">
            {editingItem ? (isHindi ? 'लाइन संपादित करें' : 'Edit Line') : (isHindi ? 'नई लाइन जोड़ें' : 'Add Line')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'लाइन कोड *' : 'Line Code *'}
            </label>
            <input
              {...register('line_code', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="L001"
            />
            {errors.line_code && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'लाइन का नाम *' : 'Line Name *'}
            </label>
            <input
              {...register('line_name', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder={isHindi ? 'गोरखपुर रूट' : 'Gorakhpur Route'}
            />
            {errors.line_name && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'जिला' : 'District'}
            </label>
            <input
              {...register('district')}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder={isHindi ? 'गोरखपुर' : 'Gorakhpur'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (isHindi ? 'सहेज रहा है...' : 'Saving...') : (isHindi ? 'सहेजें' : 'FloppyDisk')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Profit Centers Tab
function ProfitCentersTab({ isHindi }: { isHindi: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/setup/profit-centers');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching profit centers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-[#F4F7F5] rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'लाभ केंद्र' : 'Profit Centers'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'लाभ केंद्र प्रबंधित करें' : 'Manage profit centers'}
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setPanelOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'नया केंद्र जोड़ें' : 'Add Center'}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState 
          icon={Buildings}
          title={isHindi ? 'कोई लाभ केंद्र नहीं मिला' : 'No Profit Centers Found'}
          subtitle={isHindi ? 'अपना पहला लाभ केंद्र जोड़ें' : 'Add your first profit center'}
          onAdd={() => { setEditingItem(null); setPanelOpen(true); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{isHindi ? 'कोड' : 'Code'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'नाम' : 'Name'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'प्रकार' : 'Type'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'स्थिति' : 'Status'}</th>
                <th className="px-4 py-3 text-right">{isHindi ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer`}
                >
                  <td className="px-4 py-3 font-medium">{item.center_code}</td>
                  <td className="px-4 py-3">{item.center_name}</td>
                  <td className="px-4 py-3 capitalize">{item.center_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.is_active 
                        ? 'bg-[#1A5C34]/10 text-[#1A5C34]' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.is_active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditingItem(item); setPanelOpen(true); }}
                      className="p-2 hover:bg-[#1A5C34]/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <ProfitCentersPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          editingItem={editingItem}
          onSuccess={() => { fetchData(); setPanelOpen(false); }}
          isHindi={isHindi}
        />
      )}
    </div>
  );
}

// Profit Centers Panel Component
function ProfitCentersPanel({ isOpen, onClose, editingItem, onSuccess, isHindi }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editingItem || {
      center_code: '',
      center_name: '',
      center_type: 'integration',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const url = '/api/setup/profit-centers';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...data, id: editingItem.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving profit center:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">
            {editingItem ? (isHindi ? 'लाभ केंद्र संपादित करें' : 'Edit Profit Center') : (isHindi ? 'नया लाभ केंद्र जोड़ें' : 'Add Profit Center')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'कोड *' : 'Code *'}
            </label>
            <input
              {...register('center_code', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="PC001"
            />
            {errors.center_code && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'नाम *' : 'Name *'}
            </label>
            <input
              {...register('center_name', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder={isHindi ? 'मुख्य केंद्र' : 'Main Center'}
            />
            {errors.center_name && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'प्रकार' : 'Type'}
            </label>
            <select
              {...register('center_type')}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
            >
              <option value="integration">{isHindi ? 'एकीकरण' : 'Integration'}</option>
              <option value="trading">{isHindi ? 'व्यापार' : 'Trading'}</option>
              <option value="feed">{isHindi ? 'फीड' : 'Feed'}</option>
              <option value="other">{isHindi ? 'अन्य' : 'Other'}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (isHindi ? 'सहेज रहा है...' : 'Saving...') : (isHindi ? 'सहेजें' : 'FloppyDisk')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Tax Setup Tab
function TaxSetupTab({ isHindi }: { isHindi: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/setup/tax-setup');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching tax setup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-[#F4F7F5] rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'कर सेटअप' : 'Tax Setup'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'GST दर और HSN कोड प्रबंधित करें' : 'Manage GST rates and HSN codes'}
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setPanelOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'कर जोड़ें' : 'Add Tax'}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState 
          icon={Receipt}
          title={isHindi ? 'कोई कर सेटअप नहीं मिला' : 'No Tax Setup Found'}
          subtitle={isHindi ? 'अपना पहला कर सेटअप जोड़ें' : 'Add your first tax setup'}
          onAdd={() => { setEditingItem(null); setPanelOpen(true); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{isHindi ? 'कर नाम' : 'Tax Name'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'दर' : 'Rate'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'CGST' : 'CGST'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'SGST' : 'SGST'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'IGST' : 'IGST'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'HSN कोड' : 'HSN Code'}</th>
                <th className="px-4 py-3 text-right">{isHindi ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer`}
                >
                  <td className="px-4 py-3 font-medium">{item.tax_name}</td>
                  <td className="px-4 py-3">{item.tax_rate}%</td>
                  <td className="px-4 py-3">{item.cgst_rate || '-'}%</td>
                  <td className="px-4 py-3">{item.sgst_rate || '-'}%</td>
                  <td className="px-4 py-3">{item.igst_rate || '-'}%</td>
                  <td className="px-4 py-3">{item.hsn_code || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditingItem(item); setPanelOpen(true); }}
                      className="p-2 hover:bg-[#1A5C34]/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <TaxSetupPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          editingItem={editingItem}
          onSuccess={() => { fetchData(); setPanelOpen(false); }}
          isHindi={isHindi}
        />
      )}
    </div>
  );
}

// Tax Setup Panel Component
function TaxSetupPanel({ isOpen, onClose, editingItem, onSuccess, isHindi }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editingItem || {
      tax_name: '',
      tax_rate: 0,
      cgst_rate: 0,
      sgst_rate: 0,
      igst_rate: 0,
      hsn_code: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const url = '/api/setup/tax-setup';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...data, id: editingItem.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving tax setup:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">
            {editingItem ? (isHindi ? 'कर सेटअप संपादित करें' : 'Edit Tax Setup') : (isHindi ? 'नया कर सेटअप जोड़ें' : 'Add Tax Setup')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'कर नाम *' : 'Tax Name *'}
            </label>
            <input
              {...register('tax_name', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="GST 5%"
            />
            {errors.tax_name && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'दर (%) *' : 'Rate (%) *'}
            </label>
            <input
              type="number"
              {...register('tax_rate', { required: true, min: 0, max: 100 })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="5"
            />
            {errors.tax_rate && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">CGST %</label>
              <input
                type="number"
                {...register('cgst_rate', { min: 0, max: 100 })}
                className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                placeholder="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">SGST %</label>
              <input
                type="number"
                {...register('sgst_rate', { min: 0, max: 100 })}
                className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                placeholder="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">IGST %</label>
              <input
                type="number"
                {...register('igst_rate', { min: 0, max: 100 })}
                className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'HSN कोड' : 'HSN Code'}
            </label>
            <input
              {...register('hsn_code')}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="0101"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (isHindi ? 'सहेज रहा है...' : 'Saving...') : (isHindi ? 'सहेजें' : 'FloppyDisk')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simplified tabs for the remaining tabs (following the same pattern)
function PackingTypesTab({ isHindi }: { isHindi: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'पैकिंग प्रकार' : 'Packing Types'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'पक्षी बिक्री के लिए क्रेट प्रकार' : 'Crate types for bird sales'}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <p className="text-sm text-[#6B7280]">
          {isHindi ? 'डिफ़ॉल्ट पैकिंग प्रकार: 20kg क्रेट, 25kg क्रेट, 30kg क्रेट' : 'Default packing types: 20kg Crate, 25kg Crate, 30kg Crate'}
        </p>
      </div>
    </div>
  );
}

function PriceListTab({ isHindi }: { isHindi: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'मूल्य सूची' : 'Price List'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'किसान/लाइन/सीज़न के लिए उत्पाद मूल्य सूची' : 'Product price lists per farmer/line/season'}
          </p>
        </div>
      </div>
      <EmptyState 
        icon={Tag}
        title={isHindi ? 'कोई मूल्य सूची नहीं मिली' : 'No Price Lists Found'}
        subtitle={isHindi ? 'अपनी पहली मूल्य सूची जोड़ें' : 'Add your first price list'}
        onAdd={() => {}}
      />
    </div>
  );
}

function FinancialYearTab({ isHindi }: { isHindi: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/setup/financial-years');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching financial years:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-[#F4F7F5] rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'वित्तीय वर्ष' : 'Financial Year'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'वित्तीय वर्ष प्रबंधित करें' : 'Manage financial years'}
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setPanelOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'वर्ष जोड़ें' : 'Add Year'}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState 
          icon={Calendar}
          title={isHindi ? 'कोई वित्तीय वर्ष नहीं मिला' : 'No Financial Years Found'}
          subtitle={isHindi ? 'अपना पहला वित्तीय वर्ष जोड़ें' : 'Add your first financial year'}
          onAdd={() => { setEditingItem(null); setPanelOpen(true); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{isHindi ? 'लेबल' : 'Label'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'प्रारंभ तिथि' : 'Start Date'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'समाप्ति तिथि' : 'End Date'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'स्थिति' : 'Status'}</th>
                <th className="px-4 py-3 text-right">{isHindi ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer`}
                >
                  <td className="px-4 py-3 font-medium">{item.year_label}</td>
                  <td className="px-4 py-3">{item.start_date}</td>
                  <td className="px-4 py-3">{item.end_date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {item.is_current && (
                        <span className="px-2 py-1 rounded-full text-xs bg-[#1A5C34]/10 text-[#1A5C34]">
                          {isHindi ? 'वर्तमान' : 'Current'}
                        </span>
                      )}
                      {item.is_closed && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          {isHindi ? 'बंद' : 'Closed'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditingItem(item); setPanelOpen(true); }}
                      className="p-2 hover:bg-[#1A5C34]/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <FinancialYearPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          editingItem={editingItem}
          onSuccess={() => { fetchData(); setPanelOpen(false); }}
          isHindi={isHindi}
        />
      )}
    </div>
  );
}

// Financial Year Panel Component
function FinancialYearPanel({ isOpen, onClose, editingItem, onSuccess, isHindi }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editingItem || {
      year_label: '',
      start_date: '',
      end_date: '',
      is_current: false,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const url = '/api/setup/financial-years';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...data, id: editingItem.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving financial year:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">
            {editingItem ? (isHindi ? 'वित्तीय वर्ष संपादित करें' : 'Edit Financial Year') : (isHindi ? 'नया वित्तीय वर्ष जोड़ें' : 'Add Financial Year')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'लेबल *' : 'Label *'}
            </label>
            <input
              {...register('year_label', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="2025-26"
            />
            {errors.year_label && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'प्रारंभ तिथि *' : 'Start Date *'}
            </label>
            <input
              type="date"
              {...register('start_date', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
            />
            {errors.start_date && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'समाप्ति तिथि *' : 'End Date *'}
            </label>
            <input
              type="date"
              {...register('end_date', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
            />
            {errors.end_date && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_current')}
              className="w-4 h-4 text-[#1A5C34] border-[#E3EDE7] rounded focus:ring-[#1A5C34]"
            />
            <label className="text-sm text-[#111827]">
              {isHindi ? 'वर्तमान के रूप में सेट करें' : 'Set as Current'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (isHindi ? 'सहेज रहा है...' : 'Saving...') : (isHindi ? 'सहेजें' : 'FloppyDisk')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeGroupsTab({ isHindi }: { isHindi: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'कर्मचारी समूह' : 'Employee Groups'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'कर्मचारी समूह प्रबंधित करें' : 'Manage employee groups'}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <p className="text-sm text-[#6B7280]">
          {isHindi ? 'डिफ़ॉल्ट समूह: फार्म मैनेजर, फील्ड सुपरवाइजर, ऑफिस स्टाफ, ड्राइवर, अन्य' : 'Default groups: Farm Manager, Field Supervisor, Office Staff, Driver, Other'}
        </p>
      </div>
    </div>
  );
}

function BrokerTab({ isHindi }: { isHindi: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'ब्रोकर' : 'Broker'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'ब्रोकर/एजेंट मास्टर' : 'Broker/agent master'}
          </p>
        </div>
      </div>
      <EmptyState 
        icon={UserCircle}
        title={isHindi ? 'कोई ब्रोकर नहीं मिला' : 'No Brokers Found'}
        subtitle={isHindi ? 'अपना पहला ब्रोकर जोड़ें' : 'Add your first broker'}
        onAdd={() => {}}
      />
    </div>
  );
}

function GCSetupTab({ isHindi }: { isHindi: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'GC सेटअप' : 'GC Setup'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'वैक्सीन अनुसूची' : 'Vaccine schedules'}
          </p>
        </div>
      </div>
      <EmptyState 
        icon={Syringe}
        title={isHindi ? 'कोई GC सेटअप नहीं मिला' : 'No GC Setup Found'}
        subtitle={isHindi ? 'अपना पहला GC सेटअप जोड़ें' : 'Add your first GC setup'}
        onAdd={() => {}}
      />
    </div>
  );
}

function GCRateSetupTab({ isHindi }: { isHindi: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/setup/gc-rate-setup');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching GC rate setup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-[#F4F7F5] rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            {isHindi ? 'GC दर सेटअप' : 'GC Rate Setup'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {isHindi ? 'नस्ल/सीज़न के लिए दर कार्ड' : 'Rate cards per breed/season'}
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setPanelOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'दर कार्ड जोड़ें' : 'Add Rate Card'}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState 
          icon={TrendUp}
          title={isHindi ? 'कोई GC दर सेटअप नहीं मिला' : 'No GC Rate Setup Found'}
          subtitle={isHindi ? 'अपना पहला दर कार्ड जोड़ें' : 'Add your first rate card'}
          onAdd={() => { setEditingItem(null); setPanelOpen(true); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E3EDE7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">{isHindi ? 'नाम' : 'Name'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'नस्ल' : 'Breed'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'सीज़न' : 'Season'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'टारगेट GC' : 'Target GC'}</th>
                <th className="px-4 py-3 text-left">{isHindi ? 'प्रभावी से' : 'Effective From'}</th>
                <th className="px-4 py-3 text-right">{isHindi ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer`}
                >
                  <td className="px-4 py-3 font-medium">{item.rate_name}</td>
                  <td className="px-4 py-3">{item.breed || '-'}</td>
                  <td className="px-4 py-3 capitalize">{item.season}</td>
                  <td className="px-4 py-3">₹{item.target_gc}/kg</td>
                  <td className="px-4 py-3">{item.effective_from}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditingItem(item); setPanelOpen(true); }}
                      className="p-2 hover:bg-[#1A5C34]/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panelOpen && (
        <GCRateSetupPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          editingItem={editingItem}
          onSuccess={() => { fetchData(); setPanelOpen(false); }}
          isHindi={isHindi}
        />
      )}
    </div>
  );
}

// GC Rate Setup Panel Component
function GCRateSetupPanel({ isOpen, onClose, editingItem, onSuccess, isHindi }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editingItem || {
      rate_name: '',
      breed: '',
      season: 'all',
      chick_rate: 0,
      feed_rate: 0,
      target_gc: 0,
      incentive_above: 0,
      effective_from: '',
      effective_to: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const url = '/api/setup/gc-rate-setup';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...data, id: editingItem.id } : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving GC rate setup:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">
            {editingItem ? (isHindi ? 'GC दर सेटअप संपादित करें' : 'Edit GC Rate Setup') : (isHindi ? 'नया GC दर सेटअप जोड़ें' : 'Add GC Rate Setup')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'दर नाम *' : 'Rate Name *'}
            </label>
            <input
              {...register('rate_name', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="Cobb 430 Summer 2026"
            />
            {errors.rate_name && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'नस्ल' : 'Breed'}
            </label>
            <input
              {...register('breed')}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="Cobb 430"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'सीज़न' : 'Season'}
            </label>
            <select
              {...register('season')}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
            >
              <option value="all">{isHindi ? 'सभी' : 'All'}</option>
              <option value="summer">{isHindi ? 'गर्मी' : 'Summer'}</option>
              <option value="winter">{isHindi ? 'सर्दी' : 'Winter'}</option>
              <option value="monsoon">{isHindi ? 'मानसून' : 'Monsoon'}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                {isHindi ? 'चिक दर (₹)' : 'Chick Rate (₹)'}
              </label>
              <input
                type="number"
                {...register('chick_rate', { min: 0 })}
                className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                {isHindi ? 'फीड दर (₹/kg)' : 'Feed Rate (₹/kg)'}
              </label>
              <input
                type="number"
                {...register('feed_rate', { min: 0 })}
                className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
                placeholder="35"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'टारगेट GC (₹/kg) *' : 'Target GC (₹/kg) *'}
            </label>
            <input
              type="number"
              {...register('target_gc', { required: true, min: 0 })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="65"
            />
            {errors.target_gc && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'प्रोत्साहन ऊपर (₹/kg)' : 'Incentive Above (₹/kg)'}
            </label>
            <input
              type="number"
              {...register('incentive_above', { min: 0 })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
              placeholder="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'प्रभावी से *' : 'Effective From *'}
            </label>
            <input
              type="date"
              {...register('effective_from', { required: true })}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
            />
            {errors.effective_from && <p className="text-red-600 text-xs mt-1">{isHindi ? 'आवश्यक' : 'Required'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              {isHindi ? 'प्रभावी तक' : 'Effective To'}
            </label>
            <input
              type="date"
              {...register('effective_to')}
              className="w-full px-4 py-2 border border-[#E3EDE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E3EDE7] rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#3DAE72] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (isHindi ? 'सहेज रहा है...' : 'Saving...') : (isHindi ? 'सहेजें' : 'FloppyDisk')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, subtitle, onAdd }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#1A5C34]" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-xs">{subtitle}</p>
      <button 
        onClick={onAdd}
        className="bg-[#1A5C34] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#3DAE72] transition-colors"
      >
        + Add First
      </button>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A5C34]"></div>
      </div>
    }>
      <SetupContent />
    </Suspense>
  );
}
