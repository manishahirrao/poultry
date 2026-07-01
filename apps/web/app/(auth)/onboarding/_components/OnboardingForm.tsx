'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowRight, User, MapPin, Package } from 'lucide-react';

const DISTRICTS = [
  { id: 'gorakhpur', name: 'Gorakhpur', nameHi: 'गोरखपुर' },
  { id: 'deoria', name: 'Deoria', nameHi: 'देवरिया' },
  { id: 'kushinagar', name: 'Kushinagar', nameHi: 'कुशीनगर' },
  { id: 'maharajganj', name: 'Maharajganj', nameHi: 'महाराजगंज' },
  { id: 'basti', name: 'Basti', nameHi: 'बस्ती' },
  { id: 'sant-kabir-nagar', name: 'Sant Kabir Nagar', nameHi: 'संत कबीर नगर' },
];

const POULTRY_TYPES = [
  { id: 'Broiler', label: 'Broiler (ब्रायलर)' },
  { id: 'Layer', label: 'Layer (लेयर)' },
  { id: 'Breeder', label: 'Breeder (ब्रीडर)' },
];

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [name, setName] = useState('');
  const [district, setDistrict] = useState(DISTRICTS[0].id);
  const [poultryType, setPoultryType] = useState(POULTRY_TYPES[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      // Update the customer record that was created during activation
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          name: name.trim(),
          district: district,
          poultry_type: poultryType,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Force refresh the layout and middleware to pick up new customer details
      router.refresh();
      
      // Redirect to the dashboard overview
      router.push('/dashboard/overview');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta text-[0.9375rem]"
            placeholder="Enter your full name"
            required
            minLength={2}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">
          Primary District
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin size={18} className="text-neutral-400" />
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta text-[0.9375rem] appearance-none"
            required
          >
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.nameHi})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-2 font-jakarta">
          Poultry Type
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Package size={18} className="text-neutral-400" />
          </div>
          <select
            value={poultryType}
            onChange={(e) => setPoultryType(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-jakarta text-[0.9375rem] appearance-none"
            required
          >
            {POULTRY_TYPES.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || name.length < 2}
        className="w-full h-12 mt-4 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-jakarta font-semibold transition-all shadow-[0_4px_14px_0_rgb(22,163,74,0.39)]"
      >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Setup'}
        {!isLoading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
