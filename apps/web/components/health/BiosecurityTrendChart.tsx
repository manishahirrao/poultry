'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';

interface BiosecurityTrendChartProps {
  batchId: string;
}

interface AuditDataPoint {
  date: string;
  score: number;
}

export function BiosecurityTrendChart({ batchId }: BiosecurityTrendChartProps) {
  const [data, setData] = useState<AuditDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchAuditHistory();
  }, [batchId]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: audits, error: fetchError } = await supabase
        .from('biosecurity_audits')
        .select('audit_date, score')
        .eq('batch_id', batchId)
        .order('audit_date', { ascending: true })
        .limit(8);

      if (fetchError) throw fetchError;

      if (audits && audits.length > 0) {
        const formattedData = audits.map(audit => ({
          date: new Date(audit.audit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: audit.score
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching biosecurity audit history:', err);
      setError('Failed to load audit history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-neutral-400">
        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">No audit history yet</p>
        <p className="text-xs mt-1">Complete your first audit to see trends</p>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value}%`, 'Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BiosecurityTrendChart;
