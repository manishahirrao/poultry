'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Pencil, Trash, MagnifyingGlass, X, CheckCircle, Warning, 
  Phone, Envelope, User, Shield, Lock, Download, Printer,
  Farm, Building, ChartBar, Gear, Users, FileText, CurrencyDollar
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const inviteUserSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  role_name: z.string().min(1, 'Role name is required'),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

const privilegesSchema = z.object({
  role_name: z.string().min(1, 'Role name is required'),
  can_view_dashboard: z.boolean(),
  can_view_farms: z.boolean(),
  can_edit_farms: z.boolean(),
  can_view_inventory: z.boolean(),
  can_edit_inventory: z.boolean(),
  can_view_accounts: z.boolean(),
  can_edit_accounts: z.boolean(),
  can_view_payroll: z.boolean(),
  can_edit_payroll: z.boolean(),
  can_view_reports: z.boolean(),
  can_manage_users: z.boolean(),
  can_approve_payments: z.boolean(),
  allowed_farm_ids: z.array(z.string()),
});

type PrivilegesFormData = z.infer<typeof privilegesSchema>;

interface UserPrivilege {
  id: string;
  user_id: string;
  role_name: string;
  can_view_dashboard: boolean;
  can_view_farms: boolean;
  can_edit_farms: boolean;
  can_view_inventory: boolean;
  can_edit_inventory: boolean;
  can_view_accounts: boolean;
  can_edit_accounts: boolean;
  can_view_payroll: boolean;
  can_edit_payroll: boolean;
  can_view_reports: boolean;
  can_manage_users: boolean;
  can_approve_payments: boolean;
  allowed_farm_ids: string[];
  created_at: string;
  updated_at: string;
  auth_users?: {
    email: string;
    phone: string;
    created_at: string;
  };
}

const MODULES = [
  { key: 'can_view_dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: ChartBar },
  { key: 'can_view_farms', label: 'Farms (View)', labelHi: 'फार्म (देखें)', icon: Farm },
  { key: 'can_edit_farms', label: 'Farms (Edit)', labelHi: 'फार्म (संपादित करें)', icon: Farm },
  { key: 'can_view_inventory', label: 'Inventory (View)', labelHi: 'इन्वेंटरी (देखें)', icon: Building },
  { key: 'can_edit_inventory', label: 'Inventory (Edit)', labelHi: 'इन्वेंटरी (संपादित करें)', icon: Building },
  { key: 'can_view_accounts', label: 'Accounts (View)', labelHi: 'लेखा (देखें)', icon: CurrencyDollar },
  { key: 'can_edit_accounts', label: 'Accounts (Edit)', labelHi: 'लेखा (संपादित करें)', icon: CurrencyDollar },
  { key: 'can_view_payroll', label: 'Payroll (View)', labelHi: 'पेरोल (देखें)', icon: Users },
  { key: 'can_edit_payroll', label: 'Payroll (Edit)', labelHi: 'पेरोल (संपादित करें)', icon: Users },
  { key: 'can_view_reports', label: 'Reports', labelHi: 'रिपोर्ट', icon: FileText },
  { key: 'can_manage_users', label: 'Manage Users', labelHi: 'उपयोगकर्ता प्रबंधन', icon: Shield },
  { key: 'can_approve_payments', label: 'Approve Payments', labelHi: 'भुगतान अनुमोदन', icon: Lock },
];

export default function UsersManagementPage() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<UserPrivilege[]>([]);
  const [filteredUsers, setSlidersHorizontaledUsers] = useState<UserPrivilege[]>([]);
  const [isInvitePanelOpen, setIsInvitePanelOpen] = useState(false);
  const [isPrivilegesPanelOpen, setIsPrivilegesPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserPrivilege | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [farms, setFarms] = useState<any[]>([]);
  const supabase = createClient();

  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    reset: resetInvite,
    formState: { errors: inviteErrors },
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role_name: 'Staff',
    },
  });

  const {
    register: registerPrivileges,
    handleSubmit: handleSubmitPrivileges,
    reset: resetPrivileges,
    setValue: setPrivilegeValue,
    watch: watchPrivileges,
    formState: { errors: privilegeErrors },
  } = useForm<PrivilegesFormData>({
    resolver: zodResolver(privilegesSchema),
  });

  useEffect(() => {
    fetchUsers();
    fetchFarms();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('user_privileges')
        .select(`
          *,
          auth_users:user_id (
            email,
            phone,
            created_at
          )
        `)
        .eq('integrator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'उपयोगकर्ता लोड करने में विफल' : 'Failed to load users'
      });
    }
  };

  const fetchFarms = async () => {
    try {
      const supabaseClient = supabase;
      if (!supabaseClient) return;

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('farms')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.auth_users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.auth_users?.phone?.includes(searchQuery)
      );
    }

    setSlidersHorizontaledUsers(filtered);
  };

  const onInviteSubmit = async (data: InviteUserFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const response = await fetch('/api/masters/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to invite user');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'उपयोगकर्ता को सफलतापूर्वक आमंत्रित किया गया' 
          : 'User invited successfully'
      });
      
      setIsInvitePanelOpen(false);
      resetInvite();
      await fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'उपयोगकर्ता आमंत्रित करने में विफल' 
          : 'Failed to invite user'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPrivilegesSubmit = async (data: PrivilegesFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const response = await fetch(`/api/masters/users/${editingUser?.id}/privileges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to update privileges');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'विशेषाधिकार सफलतापूर्वक अपडेट किए गए' 
          : 'Privileges updated successfully'
      });
      
      setIsPrivilegesPanelOpen(false);
      setEditingUser(null);
      resetPrivileges();
      await fetchUsers();
    } catch (error) {
      console.error('Error updating privileges:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'विशेषाधिकार अपडेट करने में विफल' 
          : 'Failed to update privileges'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPrivileges = (user: UserPrivilege) => {
    setEditingUser(user);
    setPrivilegeValue('role_name', user.role_name);
    setPrivilegeValue('can_view_dashboard', user.can_view_dashboard);
    setPrivilegeValue('can_view_farms', user.can_view_farms);
    setPrivilegeValue('can_edit_farms', user.can_edit_farms);
    setPrivilegeValue('can_view_inventory', user.can_view_inventory);
    setPrivilegeValue('can_edit_inventory', user.can_edit_inventory);
    setPrivilegeValue('can_view_accounts', user.can_view_accounts);
    setPrivilegeValue('can_edit_accounts', user.can_edit_accounts);
    setPrivilegeValue('can_view_payroll', user.can_view_payroll);
    setPrivilegeValue('can_edit_payroll', user.can_edit_payroll);
    setPrivilegeValue('can_view_reports', user.can_view_reports);
    setPrivilegeValue('can_manage_users', user.can_manage_users);
    setPrivilegeValue('can_approve_payments', user.can_approve_payments);
    setPrivilegeValue('allowed_farm_ids', user.allowed_farm_ids || []);
    setIsPrivilegesPanelOpen(true);
  };

  const handleSuspendUser = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const response = await fetch('/api/masters/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_suspended: true }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to suspend user');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'उपयोगकर्ता को निलंबित कर दिया गया' 
          : 'User suspended successfully'
      });
      
      await fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'उपयोगकर्ता निलंबित करने में विफल' 
          : 'Failed to suspend user'
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?')) return;

    try {
      const supabaseClient = supabase;
      if (!supabaseClient) throw new Error('Supabase client not initialized');

      const response = await fetch(`/api/masters/users?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to delete user');

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'उपयोगकर्ता हटा दिया गया' 
          : 'User deleted successfully'
      });
      
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'उपयोगकर्ता हटाने में विफल' 
          : 'Failed to delete user'
      });
    }
  };

  const handleInviteNew = () => {
    resetInvite();
    setIsInvitePanelOpen(true);
  };

  const handleCloseInvitePanel = () => {
    setIsInvitePanelOpen(false);
    resetInvite();
  };

  const handleClosePrivilegesPanel = () => {
    setIsPrivilegesPanelOpen(false);
    setEditingUser(null);
    resetPrivileges();
  };

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header - improved spacing rhythm and hierarchy */}
      <div className="flex items-start justify-between px-8 pt-8 pb-6">
        <div className="space-y-2">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Masters
          </span>
          <h1 className="text-[2rem] font-bold text-[#111827] leading-[1.15] tracking-tight">
            {isHindi ? 'उपयोगकर्ता प्रबंधन' : 'User Management'}
          </h1>
          <p className="text-[0.9375rem] text-[#6B7280] leading-[1.6] max-w-[32rem]">
            {isHindi 
              ? 'अपने सभी उप-उपयोगकर्ताओं का प्रबंधन करें' 
              : 'Manage all your sub-users'}
          </p>
        </div>
        <button
          onClick={handleInviteNew}
          className="bg-[#1A5C34] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#3DAE72] transition-all duration-200 ease-out flex items-center gap-2.5 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98]"
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'उपयोगकर्ता आमंत्रित करें' : 'Invite User'}
        </button>
      </div>

      {/* Message - improved visual feedback */}
      {message && (
        <div className={`mx-8 mb-5 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ease-out animate-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" className="flex-shrink-0" />
          ) : (
            <Warning size={20} weight="fill" className="flex-shrink-0" />
          )}
          <span className="text-[0.9375rem] flex-1 font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
            aria-label="Dismiss message"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* SlidersHorizontals - improved layout rhythm */}
      <div className="px-8 pb-6 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[280px]">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            placeholder={isHindi ? 'खोजें...' : 'MagnifyingGlass by name, email, or phone...'}
            value={searchQuery}
            onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-[0.9375rem] placeholder:text-[#9CA3AF]"
          />
        </div>
        <div className="flex gap-2">
          <button className="border border-[#E3EDE7] px-4 py-3 rounded-xl text-sm flex items-center gap-2 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]">
            <Download size={16} weight="bold" />
            CSV
          </button>
          <button className="border border-[#E3EDE7] px-4 py-3 rounded-xl text-sm flex items-center gap-2 hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]">
            <Printer size={16} weight="bold" />
            Print
          </button>
        </div>
      </div>

      {/* Data Table - improved empty state and table design */}
      <div className="px-8 pb-8">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-[#E3EDE7] shadow-sm">
            <div className="w-20 h-20 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-6">
              <Users size={32} className="text-[#1A5C34]" weight="duotone" />
            </div>
            <h3 className="text-[1.25rem] font-semibold text-[#111827] mb-3 leading-tight">
              {isHindi ? 'कोई उपयोगकर्ता नहीं मिला' : 'No users found'}
            </h3>
            <p className="text-[0.9375rem] text-[#6B7280] mb-8 max-w-[20rem] leading-[1.6]">
              {isHindi 
                ? 'अपना पहला उपयोगकर्ता आमंत्रित करने के लिए नीचे बटन पर क्लिक करें' 
                : 'Click the button below to invite your first user'}
            </p>
            <button
              onClick={handleInviteNew}
              className="bg-[#1A5C34] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
            >
              {isHindi ? '+ पहला उपयोगकर्ता आमंत्रित करें' : '+ Invite First User'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E3EDE7] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[0.9375rem]">
                <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-[0.1em]">{isHindi ? 'भूमिका' : 'Role'}</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-[0.1em]">{isHindi ? 'ईमेल' : 'Email'}</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-[0.1em]">{isHindi ? 'फोन' : 'Phone'}</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-[0.1em]">{isHindi ? 'फार्म' : 'Farms'}</th>
                    <th className="px-6 py-4 text-center font-semibold text-xs uppercase tracking-[0.1em]">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-6 py-4 text-center font-semibold text-xs uppercase tracking-[0.1em]">{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-[#E3EDE7] hover:bg-[#EDF7F1] cursor-pointer transition-colors duration-200 group"
                      onClick={() => handleEditPrivileges(user)}
                    >
                      <td className="px-6 py-4 font-semibold text-[#111827]">{user.role_name}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{user.auth_users?.email || '-'}</td>
                      <td className="px-6 py-4 text-[#6B7280] font-mono">{user.auth_users?.phone || '-'}</td>
                      <td className="px-6 py-4 text-[#6B7280]">
                        {user.allowed_farm_ids && user.allowed_farm_ids.length > 0 
                          ? `${user.allowed_farm_ids.length} farms` 
                          : isHindi ? 'सभी फार्म' : 'All farms'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
                          {isHindi ? 'सक्रिय' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditPrivileges(user)}
                            className="p-2 text-[#1A5C34] hover:bg-[#1A5C34]/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                            aria-label="Edit privileges"
                            title={isHindi ? 'विशेषाधिकार संपादित करें' : 'Edit privileges'}
                          >
                            <Shield size={18} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
                            aria-label="Suspend user"
                            title={isHindi ? 'उपयोगकर्ता निलंबित करें' : 'Suspend user'}
                          >
                            <Lock size={18} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                            aria-label="Delete user"
                            title={isHindi ? 'उपयोगकर्ता हटाएं' : 'Delete user'}
                          >
                            <Trash size={18} weight="bold" />
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

      {/* Invite User Panel - improved design with polish */}
      {isInvitePanelOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseInvitePanel}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ease-out">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-[1.5rem] font-bold text-[#111827] leading-tight tracking-tight">
                    {isHindi ? 'उपयोगकर्ता आमंत्रित करें' : 'Invite User'}
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {isHindi ? 'नए टीम सदस्य को जोड़ें' : 'Add a new team member'}
                  </p>
                </div>
                <button
                  onClick={handleCloseInvitePanel}
                  className="p-2 hover:bg-[#F4F7F5] rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                  aria-label="Close panel"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <form onSubmit={handleSubmitInvite(onInviteSubmit)} className="space-y-6">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'फोन नंबर *' : 'Phone Number *'}
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="tel"
                      {...registerInvite('phone')}
                      placeholder="9876543210"
                      className="w-full pl-11 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-[0.9375rem] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  {inviteErrors.phone && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{inviteErrors.phone.message}</p>
                  )}
                  <p className="text-xs text-[#6B7280] mt-2 flex items-center gap-1.5">
                    <CheckCircle size={14} weight="fill" className="text-[#1A5C34]" />
                    {isHindi ? 'OTP इस नंबर पर भेजा जाएगा' : 'OTP will be sent to this number'}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                  </label>
                  <div className="relative">
                    <Envelope size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                    <input
                      type="email"
                      {...registerInvite('email')}
                      placeholder="user@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-[0.9375rem] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  {inviteErrors.email && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{inviteErrors.email.message}</p>
                  )}
                </div>

                {/* Role Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'भूमिका *' : 'Role *'}
                  </label>
                  <input
                    type="text"
                    {...registerInvite('role_name')}
                    placeholder={isHindi ? 'उदाहरण: स्टाफ, सुपरवाइजर' : 'Example: Staff, Supervisor'}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-[0.9375rem] placeholder:text-[#9CA3AF]"
                  />
                  {inviteErrors.role_name && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{inviteErrors.role_name.message}</p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
                  <button
                    type="button"
                    onClick={handleCloseInvitePanel}
                    className="flex-1 border border-[#E3EDE7] px-4 py-3 rounded-xl hover:bg-[#F4F7F5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-semibold active:scale-[0.98]"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1A5C34] text-white px-4 py-3 rounded-xl hover:bg-[#3DAE72] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
                  >
                    {isSubmitting 
                      ? (isHindi ? 'भेज रहा है...' : 'Sending...') 
                      : (isHindi ? 'आमंत्रित करें' : 'Invite')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Privileges Panel - improved design with polish */}
      {isPrivilegesPanelOpen && editingUser && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleClosePrivilegesPanel}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-[640px] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ease-out">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-[1.5rem] font-bold text-[#111827] leading-tight tracking-tight">
                    {isHindi ? 'विशेषाधिकार संपादित करें' : 'Edit Privileges'}
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {isHindi ? 'उपयोगकर्ता पहुंच और अनुमतियां प्रबंधित करें' : 'Manage user access and permissions'}
                  </p>
                </div>
                <button
                  onClick={handleClosePrivilegesPanel}
                  className="p-2 hover:bg-[#F4F7F5] rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                  aria-label="Close panel"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <form onSubmit={handleSubmitPrivileges(onPrivilegesSubmit)} className="space-y-6">
                {/* Role Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2.5 leading-relaxed">
                    {isHindi ? 'भूमिका *' : 'Role *'}
                  </label>
                  <input
                    type="text"
                    {...registerPrivileges('role_name')}
                    className="w-full px-4 py-3 border border-[#E3EDE7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200 text-[0.9375rem] placeholder:text-[#9CA3AF]"
                  />
                  {privilegeErrors.role_name && (
                    <p className="text-red-600 text-xs mt-2 leading-relaxed font-medium">{privilegeErrors.role_name.message}</p>
                  )}
                </div>

                {/* Module Access Toggles - grouped by category for better UX */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-3.5 leading-relaxed">
                    {isHindi ? 'मॉड्यूल पहुंच' : 'Module Access'}
                  </label>
                  <div className="space-y-3">
                    {/* Core Modules */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-2">Core</p>
                      {MODULES.slice(0, 3).map((module) => {
                        const Icon = module.icon;
                        return (
                          <div key={module.key} className="flex items-center justify-between p-3.5 bg-[#F4F7F5] rounded-xl hover:bg-[#EDF7F1] transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Icon size={18} className="text-[#1A5C34]" weight="bold" />
                              </div>
                              <span className="text-sm font-medium text-[#111827]">
                                {isHindi ? module.labelHi : module.label}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                {...registerPrivileges(module.key as any)}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1A5C34] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1A5C34] shadow-inner"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {/* Operations Modules */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-2">Operations</p>
                      {MODULES.slice(3, 9).map((module) => {
                        const Icon = module.icon;
                        return (
                          <div key={module.key} className="flex items-center justify-between p-3.5 bg-[#F4F7F5] rounded-xl hover:bg-[#EDF7F1] transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Icon size={18} className="text-[#1A5C34]" weight="bold" />
                              </div>
                              <span className="text-sm font-medium text-[#111827]">
                                {isHindi ? module.labelHi : module.label}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                {...registerPrivileges(module.key as any)}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1A5C34] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1A5C34] shadow-inner"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {/* Admin Modules */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-2">Admin</p>
                      {MODULES.slice(9).map((module) => {
                        const Icon = module.icon;
                        return (
                          <div key={module.key} className="flex items-center justify-between p-3.5 bg-[#F4F7F5] rounded-xl hover:bg-[#EDF7F1] transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Icon size={18} className="text-[#1A5C34]" weight="bold" />
                              </div>
                              <span className="text-sm font-medium text-[#111827]">
                                {isHindi ? module.labelHi : module.label}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                {...registerPrivileges(module.key as any)}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1A5C34] peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1A5C34] shadow-inner"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Farm Access */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-3.5 leading-relaxed">
                    {isHindi ? 'फार्म पहुंच' : 'Farm Access'}
                  </label>
                  <div className="p-5 bg-[#F4F7F5] rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="all-farms"
                        checked={!watchPrivileges('allowed_farm_ids') || watchPrivileges('allowed_farm_ids').length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPrivilegeValue('allowed_farm_ids', []);
                          }
                        }}
                        className="w-5 h-5 text-[#1A5C34] border-gray-300 rounded-lg focus:ring-[#1A5C34] focus:ring-offset-0"
                      />
                      <label htmlFor="all-farms" className="text-sm font-medium text-[#111827]">
                        {isHindi ? 'सभी फार्म' : 'All Farms'}
                      </label>
                    </div>
                    {farms.length > 0 && (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto">
                        {farms.map((farm) => (
                          <div key={farm.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                            <input
                              type="checkbox"
                              id={`farm-${farm.id}`}
                              checked={watchPrivileges('allowed_farm_ids')?.includes(farm.id)}
                              onChange={(e) => {
                                const currentIds = watchPrivileges('allowed_farm_ids') || [];
                                if (e.target.checked) {
                                  setPrivilegeValue('allowed_farm_ids', [...currentIds, farm.id]);
                                } else {
                                  setPrivilegeValue('allowed_farm_ids', currentIds.filter(id => id !== farm.id));
                                }
                              }}
                              className="w-5 h-5 text-[#1A5C34] border-gray-300 rounded-lg focus:ring-[#1A5C34] focus:ring-offset-0"
                            />
                            <label htmlFor={`farm-${farm.id}`} className="text-sm text-[#6B7280]">
                              {farm.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
                  <button
                    type="button"
                    onClick={handleClosePrivilegesPanel}
                    className="flex-1 border border-[#E3EDE7] px-4 py-3 rounded-xl hover:bg-[#F4F7F5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 font-semibold active:scale-[0.98]"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1A5C34] text-white px-4 py-3 rounded-xl hover:bg-[#3DAE72] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
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
