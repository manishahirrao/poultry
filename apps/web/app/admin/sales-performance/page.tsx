'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, Banknote, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type AgentStats = {
  agent_id: string;
  agent_name: string;
  keys_generated: number;
  keys_activated: number;
  conversion_rate: number;
  total_revenue: number;
  commission_owed: number;
  target_progress_pct: number;
};

export default function SalesPerformancePage() {
  const [leaderboard, setLeaderboard] = useState<AgentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = createClient();
        if (!supabase) throw new Error('Auth client not initialized');
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/sales/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'X-Device-Token': localStorage.getItem('flockiq_device_token') || 'fallback'
          }
        });

        if (!res.ok) throw new Error('Failed to fetch sales data');
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
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

  const totalRevenue = leaderboard.reduce((sum, agent) => sum + agent.total_revenue, 0);
  const totalCommission = leaderboard.reduce((sum, agent) => sum + agent.commission_owed, 0);

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 font-sora">Sales Performance</h1>
        <p className="text-neutral-500 font-jakarta mt-2">Track agent revenue, conversions, and monthly targets.</p>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-neutral-500">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><Banknote size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-neutral-500">Total Commissions</p>
              <p className="text-2xl font-bold text-neutral-900 font-mono">₹{totalCommission.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-neutral-500">Active Agents</p>
              <p className="text-2xl font-bold text-neutral-900 font-mono">{leaderboard.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900 font-sora flex items-center gap-2">
            <Target size={20} className="text-brand-600" />
            Agent Leaderboard
          </h2>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Target: ₹5 Lakhs/mo</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-jakarta">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <th className="p-4 font-semibold">Sales Agent</th>
                <th className="p-4 font-semibold">Conversion</th>
                <th className="p-4 font-semibold text-right">Revenue (₹)</th>
                <th className="p-4 font-semibold text-right">Commission (₹)</th>
                <th className="p-4 font-semibold w-48">Target Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leaderboard.map((agent, idx) => (
                <tr key={agent.agent_id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-xs">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-neutral-900">{agent.agent_name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-neutral-700">
                      {agent.conversion_rate}%
                    </span>
                    <span className="text-xs text-neutral-400 ml-2 block">
                      ({agent.keys_activated}/{agent.keys_generated})
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-neutral-900">
                    {agent.total_revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-green-600">
                    {agent.commission_owed.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-1 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${agent.target_progress_pct >= 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(100, agent.target_progress_pct)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-neutral-500 font-semibold">{agent.target_progress_pct}%</span>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500">
                    No sales data found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
