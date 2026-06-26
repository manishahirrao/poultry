'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Trash, FloppyDisk, CheckCircle, X, MagnifyingGlass, 
  Folder, Spinner, PencilSimple, Warning
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const accountGroupSchema = z.object({
  group_name: z.string().min(1, 'Group name is required'),
  groupCode: z.string().optional(),
  parent_id: z.string().optional(),
  group_type: z.enum(['asset', 'liability', 'income', 'expense', 'equity']).default('asset'),
  nature: z.enum(['debit', 'credit']).default('debit'),
  remarks: z.string().optional(),
});

type AccountGroupFormData = z.infer<typeof accountGroupSchema>;

interface AccountGroup {
  id: string;
  groupCode: string;
  group_name: string;
  parent_id: string | null;
  group_type: string;
  nature: string;
  remarks: string | null;
  is_active: boolean;
  created_at: string;
  children?: AccountGroup[];
  parent?: { group_name: string };
}

const GROUP_TYPES = [
  { value: 'asset', label: 'Asset', labelHi: 'संपत्ति', color: 'blue' },
  { value: 'liability', label: 'Liability', labelHi: 'दायित्व', color: 'red' },
  { value: 'income', label: 'Income', labelHi: 'आय', color: 'green' },
  { value: 'expense', label: 'Expense', labelHi: 'व्यय', color: 'orange' },
  { value: 'equity', label: 'Equity', labelHi: 'पूंजी', color: 'purple' },
];

export default function AccountGroupsPage() {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [filterType, setSlidersHorizontalType] = useState('');
  const [editingGroup, setEditingGroup] = useState<AccountGroup | null>(null);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountGroupFormData>({
    resolver: zodResolver(accountGroupSchema),
    defaultValues: {
      group_type: 'asset',
      nature: 'debit',
    },
  });

  const groupType = watch('group_type');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('account_groups')
        .select('*, parent(group_name)')
        .eq('integrator_id', user.id)
        .order('groupCode');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AccountGroupFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingGroup) {
        // Update existing group
        const { error } = await supabase
          .from('account_groups')
          .update({
            group_name: data.group_name,
            groupCode: data.groupCode || null,
            parent_id: data.parent_id || null,
            group_type: data.group_type,
            nature: data.nature,
            remarks: data.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingGroup.id);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: language === 'hi' 
            ? 'खाता समूह सफलतापूर्वक अपडेट किया गया' 
            : 'Account group updated successfully'
        });
      } else {
        // Generate group code if not provided
        const groupCode = data.groupCode || await generateGroupCode(data.group_type);

        // Create new group
        const { error } = await supabase
          .from('account_groups')
          .insert({
            integrator_id: user.id,
            groupCode,
            group_name: data.group_name,
            parent_id: data.parent_id || null,
            group_type: data.group_type,
            nature: data.nature,
            remarks: data.remarks || null,
            is_active: true,
            created_by: user.id,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: language === 'hi' 
            ? 'खाता समूह सफलतापूर्वक बनाया गया' 
            : 'Account group created successfully'
        });
      }

      reset();
      setShowForm(false);
      setEditingGroup(null);
      await fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'खाता समूह सहेजने में विफल' 
          : 'Failed to save account group'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateGroupCode = async (type: string): Promise<string> => {
    try {
      if (!supabase) return '';
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return '';

      const typePrefix = type.substring(0, 3).toUpperCase();
      
      const { data: lastGroup } = await supabase
        .from('account_groups')
        .select('groupCode')
        .eq('integrator_id', user.id)
        .like('groupCode', `${typePrefix}%`)
        .order('groupCode', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (lastGroup) {
        const lastSequence = parseInt(lastGroup.groupCode.replace(`${typePrefix}`, ''));
        sequence = lastSequence + 1;
      }

      return `${typePrefix}${sequence.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating group code:', error);
      return `${type.substring(0, 3).toUpperCase()}001`;
    }
  };

  const handleEdit = (group: AccountGroup) => {
    setEditingGroup(group);
    setShowForm(true);
    reset({
      group_name: group.group_name,
      groupCode: group.groupCode || '',
      parent_id: group.parent_id || '',
      group_type: group.group_type as any,
      nature: group.nature as any,
      remarks: group.remarks || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप वाकई इस खाता समूह को हटाना चाहते हैं?' : 'Are you sure you want to delete this account group?')) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase
        .from('account_groups')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'खाता समूह सफलतापूर्वक हटाया गया' 
          : 'Account group deleted successfully'
      });

      await fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'खाता समूह हटाने में विफल' 
          : 'Failed to delete account group'
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGroup(null);
    reset();
  };

  const filteredGroups = groups.filter(group => {
    if (filterType && group.group_type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        group.group_name.toLowerCase().includes(query) ||
        group.groupCode?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getGroupTypeInfo = (type: string) => {
    return GROUP_TYPES.find(t => t.value === type);
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
            {isHindi ? 'खाता समूह' : 'Account Groups'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'खाता समूहों का प्रबंधन करें - संपत्ति, दायित्व, आय, व्यय, पूंजी' 
              : 'Manage account groups - assets, liabilities, income, expenses, equity'}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button 
            onClick={() => {
              setShowForm(true);
              setEditingGroup(null);
              reset();
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            {isHindi ? 'समूह जोड़ें' : 'Add Group'}
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
                {editingGroup 
                  ? (isHindi ? 'समूह संपादित करें' : 'Edit Group')
                  : (isHindi ? 'नया समूह जोड़ें' : 'Add New Group')
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
                {/* Group Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'समूह नाम' : 'Group Name'} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('group_name')}
                    placeholder={isHindi ? 'उदा. चल संपत्ति' : 'e.g. Current Assets'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                  {errors.group_name && (
                    <p className="text-red-600 text-xs">{errors.group_name.message}</p>
                  )}
                </div>

                {/* Group Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'समूह कोड' : 'Group Code'}</label>
                  <input
                    type="text"
                    {...register('groupCode')}
                    placeholder={isHindi ? 'उदा. AST001' : 'e.g. AST001'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Group Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'समूह प्रकार' : 'Group Type'} <span className="text-red-500">*</span></label>
                  <select
                    {...register('group_type')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    {GROUP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {isHindi ? `${type.labelHi} - ${type.label}` : type.label}
                      </option>
                    ))}
                  </select>
                  {errors.group_type && (
                    <p className="text-red-600 text-xs">{errors.group_type.message}</p>
                  )}
                </div>

                {/* Nature */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'प्रकृति' : 'Nature'} <span className="text-red-500">*</span></label>
                  <select
                    {...register('nature')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="debit">{isHindi ? 'डेबिट (Debit)' : 'Debit'}</option>
                    <option value="credit">{isHindi ? 'क्रेडिट (Credit)' : 'Credit'}</option>
                  </select>
                  {errors.nature && (
                    <p className="text-red-600 text-xs">{errors.nature.message}</p>
                  )}
                </div>

                {/* Parent Group */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'मूल समूह' : 'Parent Group'}</label>
                  <select
                    {...register('parent_id')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="">{isHindi ? 'कोई नहीं (रूट)' : 'None (Root)'}</option>
                    {groups.filter(g => g.group_type === groupType).map(group => (
                      <option key={group.id} value={group.id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'टिप्पणियां' : 'Remarks'}</label>
                  <textarea
                    {...register('remarks')}
                    rows={3}
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
                    placeholder={isHindi ? 'समूह नाम, कोड खोजें...' : 'MagnifyingGlass group name, code...'}
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
                  {GROUP_TYPES.map(type => (
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
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कोड' : 'Code'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नाम' : 'Name'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'प्रकार' : 'Type'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'प्रकृति' : 'Nature'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मूल' : 'Parent'}</th>
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
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Folder size={36} className="text-[#3DAE72]/50" />
                        <span className="text-sm text-[#6B7280]">{isHindi ? 'कोई समूह नहीं मिला' : 'No groups found'}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group, i) => {
                    const typeInfo = getGroupTypeInfo(group.group_type);
                    return (
                      <tr
                        key={group.id}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-[#6B7280] tabular-nums">{group.groupCode}</td>
                        <td className="px-5 py-4 font-semibold text-[#111827]">{group.group_name}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            typeInfo?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            typeInfo?.color === 'red' ? 'bg-red-100 text-red-700' :
                            typeInfo?.color === 'green' ? 'bg-green-100 text-green-700' :
                            typeInfo?.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {isHindi ? typeInfo?.labelHi : typeInfo?.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#6B7280] capitalize">{group.nature}</td>
                        <td className="px-5 py-4 text-[#6B7280]">{group.parent?.group_name || '-'}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(group)}
                              className="p-1.5 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-colors"
                              title={isHindi ? 'संपादित करें' : 'Edit'}
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(group.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={isHindi ? 'हटाएं' : 'Delete'}
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
