'use client';

import { useState, useEffect } from 'react';
import { Users, AlertTriangle, Calendar, CheckCircle2, Loader2, AlertCircle, Key } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format, differenceInDays } from 'date-fns';

type RenewalStats = {
  customer_id: string;
  customer_name: string;
  phone: string;
  status: string;
  expires_at: string;
  days_remaining: number;
  key_code: string;
  farm_name: string;
  district: string;
  poultry_type: string;
  status_flag: 'healthy' | 'warning' | 'expired' | 'pending';
};

export default function MyCustomersPage() {
  const [renewals, setRenewals] = useState<RenewalStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRenewals() {
      try {
        const supabase = createClient();
        if (!supabase) throw new Error('Auth client not initialized');
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch(`/api/v1/sales/my-renewals`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch renewals data');
        const data = await res.json();
        setRenewals(data.renewals || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRenewals();
  }, []);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const expiredCount = renewals.filter(r => r.status_flag === 'expired').length;
  const warningCount = renewals.filter(r => r.status_flag === 'warning').length;

  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 font-sora">My Customers</h1>
        <p className="text-neutral-500 font-jakarta mt-2">Track your clients and manage upcoming renewals.</p>
      </div>

      {/* Actionable Alerts Banner */}
      {(expiredCount > 0 || warningCount > 0) && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 border border-red-200">
          <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-red-800 font-bold font-sora text-lg">Action Required</h3>
            <p className="text-red-600 font-jakarta text-sm mt-1">
              You have <strong>{expiredCount} expired</strong> and <strong>{warningCount} expiring soon</strong> subscriptions. 
              Contact these customers immediately to collect their ₹5,000 renewal fee to avoid service interruption.
            </p>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900 font-sora flex items-center gap-2">
            <Users size={20} className="text-brand-600" />
            Client Roster
          </h2>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-200 px-3 py-1 rounded-full">{renewals.length} Total</span>
        </div>
        
        <div className="divide-y divide-neutral-100">
          {renewals.map((customer) => {
            const isExpired = customer.status_flag === 'expired';
            const isWarning = customer.status_flag === 'warning';
            
            return (
              <div key={customer.customer_id} className={`p-6 transition-colors ${isExpired ? 'bg-red-50/50' : isWarning ? 'bg-yellow-50/30' : 'hover:bg-neutral-50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isExpired ? 'bg-red-100 text-red-600' : 
                      isWarning ? 'bg-yellow-100 text-yellow-600' : 'bg-brand-50 text-brand-600'
                    }`}>
                      {customer.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 text-lg font-sora">{customer.customer_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm font-jakarta text-neutral-500">
                        <span className="font-mono tracking-tight font-medium text-neutral-700">{customer.phone}</span>
                        {customer.key_code && customer.key_code !== 'N/A' && (
                          <span className="flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded text-xs font-mono text-neutral-600">
                            <Key size={12} />
                            {customer.key_code}
                          </span>
                        )}
                        {customer.farm_name && customer.farm_name !== 'N/A' && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                            {customer.farm_name}
                          </span>
                        )}
                        {customer.district && customer.district !== 'N/A' && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                            {customer.district}
                          </span>
                        )}
                        {customer.poultry_type && customer.poultry_type !== 'N/A' && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                            {customer.poultry_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        {isExpired ? <AlertTriangle size={16} className="text-red-500" /> :
                         isWarning ? <Calendar size={16} className="text-yellow-500" /> :
                         customer.status_flag === 'pending' ? <AlertCircle size={16} className="text-orange-500" /> :
                         <CheckCircle2 size={16} className="text-green-500" />}
                        <span className={`text-sm font-bold uppercase tracking-wider ${
                          isExpired ? 'text-red-600' : 
                          isWarning ? 'text-yellow-600' : 
                          customer.status_flag === 'pending' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {isExpired ? 'Expired' : 
                           isWarning ? 'Expiring Soon' : 
                           customer.status_flag === 'pending' ? 'Pending Activation' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs font-jakarta text-neutral-500">
                        {isExpired ? (
                          <span className="text-red-500 font-semibold">Expired {Math.abs(customer.days_remaining)} days ago</span>
                        ) : customer.status_flag === 'pending' ? (
                          <span className="text-orange-500 font-medium">Awaiting Farmer Login</span>
                        ) : (
                          <span>Expires: {format(new Date(customer.expires_at), 'MMM dd, yyyy')} ({customer.days_remaining} days left)</span>
                        )}
                      </p>
                    </div>
                    
                    <a 
                      href={`/dashboard/admin/licenses?renew=${customer.customer_id}`}
                      className={`px-4 py-2 rounded-lg font-jakarta font-semibold text-sm transition-all ${
                        isExpired || isWarning 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' 
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      Log Renewal (₹5k)
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          
          {renewals.length === 0 && (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-bold text-neutral-900 font-sora">No customers yet</h3>
              <p className="text-neutral-500 font-jakarta mt-2">Generate a license key to board your first farmer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
