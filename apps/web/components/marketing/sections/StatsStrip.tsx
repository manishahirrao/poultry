// FlockIQ — Stats Strip Component (v3.0)
// File: apps/web/components/marketing/sections/StatsStrip.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.2 (Section H-02)
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §4.2 (FR-HOME-002)

import { CountUp } from '@/components/motion/CountUp';

interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  sub: string;
}

// customer_count is SSR-fetched from Supabase
async function getCustomerCount(): Promise<number> {
  try {
    const { createServerClient } = await import('@supabase/ssr');
    // TODO: Implement actual Supabase query when database is ready
    // const supabase = createServerClient(/* cookies */);
    // const { data } = await supabase
    //   .from('platform_stats')
    //   .select('count')
    //   .eq('key', 'active_farms')
    //   .single();
    // return data?.count || 500;
    return 500; // fallback
  } catch {
    return 500; // safe fallback
  }
}

export async function StatsStrip() {
  const farmCount = await getCustomerCount();

  const stats: Stat[] = [
    { value: farmCount, suffix: '+', label: 'Farms Active', sub: 'Across India, Indonesia, Vietnam' },
    { value: 15, suffix: '+', label: 'Countries Served', sub: 'India, SE Asia, MENA, Africa' },
    { value: 97, suffix: '%', label: 'Log Compliance', sub: 'vs 42% with manual collection' },
    { value: 1.8, prefix: '₹', suffix: 'L', decimals: 1, label: 'Avg Annual Savings', sub: 'Per farm, timing + FCR improvements' },
  ];

  return (
    <section 
      className="bg-white py-12 border-y border-neutral-150 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" 
      aria-label="Platform statistics"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {stats.map((stat, i) => (
            <div 
              key={stat.label} 
              className={`text-center relative px-6 ${i < 3 ? 'lg:border-r border-neutral-200' : ''}`}
              style={{ minHeight: '120px' }}
            >
              {/* Vertical divider - 40% height centred */}
              {i < 3 && (
                <div 
                  className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px bg-neutral-200" 
                  style={{ height: '40%' }}
                  aria-hidden="true"
                />
              )}
              
              {/* Stat number with CountUp animation */}
              <div 
                className="font-sora font-extrabold text-brand-700 tracking-tight mb-1.5 tabular-nums"
                style={{ 
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  lineHeight: '1',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                <CountUp
                  end={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  duration={1200}
                />
              </div>
              
              {/* Label */}
              <div className="font-jakarta font-semibold text-neutral-900 text-[0.9375rem] mb-1 leading-snug">
                {stat.label}
              </div>
              
              {/* Sub-label */}
              <div className="font-jakarta text-neutral-500 text-[0.8125rem] leading-relaxed">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

