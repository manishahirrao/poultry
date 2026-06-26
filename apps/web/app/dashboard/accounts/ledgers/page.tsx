'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Trash, CheckCircle, X, MagnifyingGlass, 
  Book, Spinner, PencilSimple, Warning, FloppyDisk
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const ledgerSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  accountCode: z.string().optional(),
  account_group_id: z.string().min(1, 'Account group is required'),
  opening_balance: z.number().min(0).optional(),
  opening_balance_type: z.enum(['Dr', 'Cr']).default('Dr'),
  gstin: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  remarks: z.string().optional(),
});

type LedgerFormData = z.infer<typeof ledgerSchema>;

interface Ledger {
  id: string;
  accountCode: string;
  account_name: string;
  account_group_id: string;
  opening_balance: number | null;
  opening_balance_type: string;
  gstin: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  remarks: string | null;
  is_active: boolean;
  created_at: string;
  account_groups?: { group_name: string; group_type: string };
}

interface AccountGroup {
  id: string;
  group_name: string;
  group_type: string;
}

export default function LedgersPage() {
  const { language } = useLanguage();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [filterGroup, setSlidersHorizontalGroup] = useState('');
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LedgerFormData>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      opening_balance: 0,
      opening_balance_type: 'Dr',
    },
  });

  useEffect(() => {
    fetchLedgers();
    fetchGroups();
  }, []);

  const fetchLedgers = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ledger_accounts')
        .select('*, account_groups(group_name, group_type)')
        .eq('integrator_id', user.id)
        .order('account_name');

      if (error) throw error;
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('account_groups')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('group_name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const onSubmit = async (data: LedgerFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingLedger) {
        // Update existing ledger
        const { error } = await supabase
          .from('ledger_accounts')
          .update({
            account_name: data.account_name,
            accountCode: data.accountCode || null,
            account_group_id: data.account_group_id,
            opening_balance: data.opening_balance || 0,
            opening_balance_type: data.opening_balance_type,
            gstin: data.gstin || null,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            remarks: data.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLedger.id);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: language === 'hi' 
            ? 'लेजर सफलतापूर्वक अपडेट किया गया' 
            : 'Ledger updated successfully'
        });
      } else {
        // Generate ledger code if not provided
        const accountCode = data.accountCode || await generateLedgerCode(data.account_group_id);

        // Create new ledger
        const { error } = await supabase
          .from('ledger_accounts')
          .insert({
            integrator_id: user.id,
            accountCode,
            account_name: data.account_name,
            account_group_id: data.account_group_id,
            opening_balance: data.opening_balance || 0,
            opening_balance_type: data.opening_balance_type,
            gstin: data.gstin || null,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            remarks: data.remarks || null,
            is_active: true,
            created_by: user.id,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: language === 'hi' 
            ? 'लेजर सफलतापूर्वक बनाया गया' 
            : 'Ledger created successfully'
        });
      }

      reset();
      setShowForm(false);
      setEditingLedger(null);
      await fetchLedgers();
    } catch (error) {
      console.error('Error saving ledger:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'लेजर सहेजने में विफल' 
          : 'Failed to save ledger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateLedgerCode = async (groupId: string): Promise<string> => {
    try {
      if (!supabase) return '';
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return '';

      const { data: group } = await supabase
        .from('account_groups')
        .select('group_code')
        .eq('id', groupId)
        .single();

      const groupPrefix = group?.group_code?.substring(0, 3) || 'LED';
      
      const { data: lastLedger } = await supabase
        .from('ledger_accounts')
        .select('accountCode')
        .eq('integrator_id', user.id)
        .like('accountCode', `${groupPrefix}%`)
        .order('accountCode', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (lastLedger) {
        const lastSequence = parseInt(lastLedger.accountCode.replace(`${groupPrefix}`, ''));
        sequence = lastSequence + 1;
      }

      return `${groupPrefix}${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating ledger code:', error);
      return 'LED0001';
    }
  };

  const handleEdit = (ledger: Ledger) => {
    setEditingLedger(ledger);
    setShowForm(true);
    reset({
      account_name: ledger.account_name,
      accountCode: ledger.accountCode || '',
      account_group_id: ledger.account_group_id,
      opening_balance: ledger.opening_balance || 0,
      opening_balance_type: ledger.opening_balance_type as any,
      gstin: ledger.gstin || '',
      phone: ledger.phone || '',
      email: ledger.email || '',
      address: ledger.address || '',
      remarks: ledger.remarks || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप वाकई इस लेजर को हटाना चाहते हैं?' : 'Are you sure you want to delete this ledger?')) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase
        .from('ledger_accounts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'लेजर सफलतापूर्वक हटाया गया' 
          : 'Ledger deleted successfully'
      });

      await fetchLedgers();
    } catch (error) {
      console.error('Error deleting ledger:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'लेजर हटाने में विफल' 
          : 'Failed to delete ledger'
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLedger(null);
    reset();
  };

  const filteredLedgers = ledgers.filter(ledger => {
    if (filterGroup && ledger.account_group_id !== filterGroup) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ledger.account_name.toLowerCase().includes(query) ||
        ledger.accountCode?.toLowerCase().includes(query) ||
        ledger.gstin?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatINR = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '-';
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-8 px-6 pt-8 pb-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Accounts
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'लेजर मास्टर' : 'Ledger Master'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'लेजर खातों का प्रबंधन करें - ग्राहक, आपूर्तिकर्ता, बैंक, व्यय' 
              : 'Manage ledger accounts - customers, suppliers, banks, expenses'}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button 
            onClick={() => {
              setShowForm(true);
              setEditingLedger(null);
              reset();
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            {isHindi ? 'लेजर जोड़ें' : 'Add Ledger'}
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
      {showForm && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {editingLedger 
                  ? (isHindi ? 'लेजर संपादित करें' : 'Edit Ledger')
                  : (isHindi ? 'नया लेजर जोड़ें' : 'Add New Ledger')
                }
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-[#EDF7F1] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Ledger Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'लेजर नाम' : 'Ledger Name'} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('account_name')}
                    placeholder={isHindi ? 'उदा. राम लाल' : 'e.g. Ram Lal'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                  {errors.account_name && (
                    <p className="text-red-600 text-xs">{errors.account_name.message}</p>
                  )}
                </div>

                {/* Ledger Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'लेजर कोड' : 'Ledger Code'}</label>
                  <input
                    type="text"
                    {...register('accountCode')}
                    placeholder={isHindi ? 'उदा. LED0001' : 'e.g. LED0001'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Account Group */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'खाता समूह' : 'Account Group'} <span className="text-red-500">*</span></label>
                  <select
                    {...register('account_group_id')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="">{isHindi ? 'समूह चुनें' : 'Select Group'}</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                  {errors.account_group_id && (
                    <p className="text-red-600 text-xs">{errors.account_group_id.message}</p>
                  )}
                </div>

                {/* Opening Balance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'ओपनिंग बैलेंस' : 'Opening Balance'}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      {...register('opening_balance', { valueAsNumber: true })}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="flex-1 px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                    />
                    <select
                      {...register('opening_balance_type')}
                      className="w-24 px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                    >
                      <option value="debit">{isHindi ? 'डेबिट' : 'Dr'}</option>
                      <option value="credit">{isHindi ? 'क्रेडिट' : 'Cr'}</option>
                    </select>
                  </div>
                </div>

                {/* GSTIN */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'GSTIN' : 'GSTIN'}</label>
                  <input
                    type="text"
                    {...register('gstin')}
                    placeholder={isHindi ? 'उदा. 22AAAAA0000A1Z5' : 'e.g. 22AAAAA0000A1Z5'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'फोन' : 'Phone'}</label>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder={isHindi ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'ईमेल' : 'Email'}</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder={isHindi ? 'उदा. example@email.com' : 'e.g. example@email.com'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs">{errors.email.message}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'पता' : 'Address'}</label>
                  <textarea
                    {...register('address')}
                    rows={2}
                    placeholder={isHindi ? 'पता दर्ज करें...' : 'Enter address...'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'टिप्पणियां' : 'Remarks'}</label>
                  <textarea
                    {...register('remarks')}
                    rows={2}
                    placeholder={isHindi ? 'कोई अतिरिक्त नोट्स...' : 'Any additional notes...'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#E3EDE7]">
                <button
                  type="submit"
                  disabled={isSubmitting}
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
                      {isHindi ? 'सहेजें' : 'FloppyDisk'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#E3EDE7] bg-white hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
          {/* SlidersHorizontals */}
          <div className="p-5 border-b border-[#E3EDE7]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative group">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1A5C34] transition-colors" />
                  <input
                    type="text"
                    placeholder={isHindi ? 'नाम, कोड, GSTIN खोजें...' : 'MagnifyingGlass name, code, GSTIN...'}
                    value={searchQuery}
                    onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={filterGroup}
                  onChange={(e) => setSlidersHorizontalGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white transition-all duration-200"
                >
                  <option value="">{isHindi ? 'सभी समूह' : 'All Groups'}</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.group_name}
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
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कोड' : 'Code'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नाम' : 'Name'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'समूह' : 'Group'}</th>
                  <th className="px-5 py-4 text-right font-semibold text-xs uppercase tracking-wider">{isHindi ? 'ओपनिंग' : 'Opening'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'GSTIN' : 'GSTIN'}</th>
                  <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कार्य' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Spinner size={24} className="animate-spin text-[#1A5C34]" />
                        <span className="text-sm text-[#6B7280] font-medium">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Book size={36} className="text-[#3DAE72]/50" />
                        <span className="text-sm text-[#6B7280]">{isHindi ? 'कोई लेजर नहीं मिला' : 'No ledgers found'}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((ledger, i) => (
                    <tr
                      key={ledger.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-[#6B7280] tabular-nums">{ledger.accountCode}</td>
                      <td className="px-5 py-4 font-semibold text-[#111827]">{ledger.account_name}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{ledger.account_groups?.group_name}</td>
                      <td className="px-5 py-4 text-right font-mono text-xs tabular-nums">
                        {formatINR(ledger.opening_balance)} {ledger.opening_balance_type === 'Dr' ? 'Dr' : 'Cr'}
                      </td>
                      <td className="px-5 py-4 text-[#6B7280] font-mono text-xs">{ledger.gstin || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(ledger)}
                            className="p-1.5 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-colors"
                            title={isHindi ? 'संपादित करें' : 'Edit'}
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(ledger.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={isHindi ? 'हटाएं' : 'Delete'}
                          >
                            <Trash size={16} />
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
      </div>
    </div>
  );
}
