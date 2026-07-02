'use client';

import { useState } from 'react';
import { CreditCard, Banknote, QrCode, Key, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminLicenseGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    plan_name: 'FLOCKIQ_FARM',
    payment_method: 'cash',
    payment_amount: 105000,
    payment_reference: '',
    validity_days: 30,
    validity_days: 30,
    assigned_phone: '',
    farmer_details: {
      name: '',
      farmName: '',
      district: '',
      poultryType: 'Broiler'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedKey(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Auth client not initialized');
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/v1/admin/licenses/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'X-Device-Token': localStorage.getItem('flockiq_device_token') || 'fallback'
        },
        body: JSON.stringify({
          agent_id: session?.user.id,
          ...formData
        })
      });

      if (!res.ok) throw new Error('Failed to generate license');
      const data = await res.json();
      setGeneratedKey(data.key_code);
    } catch (error) {
      alert('Error generating key. Check console.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-neutral-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 font-sora">Generate License Key</h2>
        <p className="text-neutral-500 font-jakarta mt-1">Create a new activation key for a customer sale.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Plan Type</label>
          <select 
            value={formData.plan_name}
            onChange={e => setFormData({...formData, plan_name: e.target.value})}
            className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
          >
            <option value="FLOCKIQ_FARM">FlockIQ Farm (Standard)</option>
            <option value="FLOCKIQ_PRO">FlockIQ Pro (Enterprise)</option>
          </select>
        </div>

        {/* Customer Phone & CRM Details */}
        <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-5">
          <div>
            <h3 className="text-base font-bold text-neutral-900 font-sora">Farmer Details (CRM)</h3>
            <p className="text-xs text-neutral-500 font-jakarta mt-1">Pre-onboard the farmer. They will automatically bypass onboarding when they log in.</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Assign to Phone Number *</label>
            <input 
              type="tel"
              required
              value={formData.assigned_phone}
              onChange={e => setFormData({...formData, assigned_phone: e.target.value})}
              placeholder="e.g. 9876543210"
              className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Farmer Name</label>
              <input 
                type="text"
                value={formData.farmer_details.name}
                onChange={e => setFormData({...formData, farmer_details: {...formData.farmer_details, name: e.target.value}})}
                placeholder="e.g. Rajesh Kumar"
                className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Farm Name</label>
              <input 
                type="text"
                value={formData.farmer_details.farmName}
                onChange={e => setFormData({...formData, farmer_details: {...formData.farmer_details, farmName: e.target.value}})}
                placeholder="e.g. Sunrise Poultry"
                className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">District/Location</label>
              <input 
                type="text"
                value={formData.farmer_details.district}
                onChange={e => setFormData({...formData, farmer_details: {...formData.farmer_details, district: e.target.value}})}
                placeholder="e.g. Pune"
                className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Poultry Type</label>
              <select 
                value={formData.farmer_details.poultryType}
                onChange={e => setFormData({...formData, farmer_details: {...formData.farmer_details, poultryType: e.target.value}})}
                className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-white focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
              >
                <option value="Broiler">Broiler</option>
                <option value="Layer">Layer</option>
                <option value="Breeder">Breeder</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Amount Collected (₹)</label>
            <input 
              type="number"
              value={formData.payment_amount}
              onChange={e => setFormData({...formData, payment_amount: Number(e.target.value)})}
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Validity (Days)</label>
            <input 
              type="number"
              value={formData.validity_days}
              onChange={e => setFormData({...formData, validity_days: Number(e.target.value)})}
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-3 font-jakarta">Payment Method</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, payment_method: 'cash'})}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.payment_method === 'cash' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
            >
              <Banknote className="mb-2" size={24} />
              <span className="font-semibold text-sm">Cash</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, payment_method: 'upi'})}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.payment_method === 'upi' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
            >
              <QrCode className="mb-2" size={24} />
              <span className="font-semibold text-sm">UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, payment_method: 'razorpay'})}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.payment_method === 'razorpay' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
            >
              <CreditCard className="mb-2" size={24} />
              <span className="font-semibold text-sm">Razorpay</span>
            </button>
          </div>
        </div>

        {/* Payment Reference */}
        {(formData.payment_method === 'upi' || formData.payment_method === 'razorpay') && (
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">Transaction / Reference ID</label>
            <input 
              type="text"
              required
              value={formData.payment_reference}
              onChange={e => setFormData({...formData, payment_reference: e.target.value})}
              placeholder="e.g. pay_XXXXX or UPI Ref"
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white rounded-xl font-jakarta font-semibold transition-all mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Key size={18} />}
          Generate License Key
        </button>
      </form>

      {generatedKey && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="mx-auto text-green-600 mb-3" size={32} />
          <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-1">License Generated Successfully</h3>
          <p className="text-xs text-green-600 mb-4">Share this key with the customer to activate their software.</p>
          <div className="bg-white px-6 py-4 rounded-lg font-mono text-2xl font-bold tracking-widest text-neutral-900 border border-green-200 shadow-sm">
            {generatedKey}
          </div>
        </div>
      )}
    </div>
  );
}
