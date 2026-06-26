'use client';

import { useState, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { motion } from 'framer-motion';
import { ArrowClockwise, TrendUp, TrendDown, Minus, Users, House, Skull, Bird, CurrencyDollar, CaretRight, Book, User } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { KpiCard } from '../KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/Button';

const colours = {
  brand700: '#1A5C34',
  brand400: '#3DAE72',
  brand50: '#EDF7F1',
  signal: '#E8611A',
  amber: '#D97706',
  red: '#DC2626',
  sidebar: '#0D1F16',
  pageBg: '#F4F7F5',
  cardBg: '#FFFFFF',
  border: '#E3EDE7',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
};

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const formatNumber = (n: number) => {
  if (n >= 100000) {
    return `${(n / 100000).toFixed(1)}L`;
  }
  return n.toLocaleString('en-IN');
};

interface DashboardOverviewData {
  active_farms: number;
  total_farmers: number;
  birds_0_7d: number;
  birds_8_14d: number;
  birds_15_21d: number;
  birds_22_28d: number;
  birds_29_35d: number;
  birds_35plus: number;
  today_mortality: number;
  total_live_birds: number;
  not_visited_1d: number;
  not_visited_3d: number;
  not_visited_7d: number;
  avg_sale_rate: number;
  month_revenue: number;
  month_cost: number;
  month_profit: number;
  supervisor_count: number;
  active_supervisors_today: number;
  visits_today: number;
  birds_sold_this_month: number;
  last_refresh: string;
}

export function IntegrationDashboard() {
  const { mutate } = useSWRConfig();
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [showNotVisitedDrilldown, setShowNotVisitedDrilldown] = useState(false);
  const [notVisitedFarms, setNotVisitedFarms] = useState<any[]>([]);
  const [loadingNotVisited, setLoadingNotVisited] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/overview');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const dashboardData = await response.json();
      setData(dashboardData);
      setLastRefresh(dashboardData.last_refresh || new Date().toISOString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    mutate('/api/dashboard/overview');
    fetchDashboardData();
  };

  const fetchNotVisitedFarms = async (days: number) => {
    setLoadingNotVisited(true);
    try {
      const response = await fetch(`/api/dashboard/not-visited-farms?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch not-visited farms');
      const farmsData = await response.json();
      setNotVisitedFarms(farmsData.data || []);
      setShowNotVisitedDrilldown(true);
    } catch (error) {
      console.error('Error fetching not-visited farms:', error);
    } finally {
      setLoadingNotVisited(false);
    }
  };

  // Format last refresh time in IST
  const formatLastRefresh = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Prepare live stock by age data for chart
  const liveStockData = [
    { age: '≤7 days', birds: data?.birds_0_7d || 0, avgWeight: 0.04 },
    { age: '8-14 days', birds: data?.birds_8_14d || 0, avgWeight: 0.35 },
    { age: '15-21 days', birds: data?.birds_15_21d || 0, avgWeight: 0.75 },
    { age: '22-28 days', birds: data?.birds_22_28d || 0, avgWeight: 1.25 },
    { age: '29-35 days', birds: data?.birds_29_35d || 0, avgWeight: 1.75 },
    { age: '35+ days', birds: data?.birds_35plus || 0, avgWeight: 2.25 },
  ];

  // Calculate mortality rate
  const mortalityRate = data && data.total_live_birds > 0 
    ? ((data.today_mortality / data.total_live_birds) * 100).toFixed(1)
    : '0.0';

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-xl border border-neutral-700">
        <p className="text-sm font-semibold mb-2">{data.age}</p>
        <p className="text-xs">
          <span className="text-green-400">Birds:</span> {formatNumber(data.birds)}
        </p>
        <p className="text-xs">
          <span className="text-amber-400">Avg Weight:</span> {data.avgWeight.toFixed(2)} kg
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Status Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-neutral-600 mt-1">
              STATUS AS ON: {formatLastRefresh(lastRefresh)}
            </p>
          </div>
          <motion.button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand50 hover:bg-brand100 text-brand700 rounded-lg transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowClockwise size={18} weight="bold" />
            <span className="text-sm">Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Row 1: Quick Numbers (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <KpiCard
          icon={House}
          title="Active Farms"
          value={data?.active_farms?.toString() || '0'}
          subtitle="↑3 this month"
          delta="3"
          deltaDirection="up"
          isLoading={isLoading}
        />
        <KpiCard
          icon={Book}
          title="Closed (Mo.)"
          value="12"
          subtitle={`${formatINR(1420000)} revenue`}
          isLoading={isLoading}
        />
        <KpiCard
          icon={User}
          title="Total Farmers"
          value={data?.total_farmers?.toString() || '0'}
          subtitle={`${data?.supervisor_count || 0} supervisors`}
          isLoading={isLoading}
        />
        <KpiCard
          icon={Skull}
          title="Today Mort."
          value={formatNumber(data?.today_mortality || 0)}
          subtitle={`${mortalityRate}% rate`}
          isLoading={isLoading}
        />
        <KpiCard
          icon={Bird}
          title="Chicks Left"
          value={formatNumber(data?.total_live_birds || 0)}
          subtitle={`live in ${data?.active_farms || 0} farms`}
          isLoading={isLoading}
        />
        <KpiCard
          icon={Bird}
          title="Bird Sale"
          value={formatNumber(data?.birds_sold_this_month || 0)}
          subtitle="birds this month"
          isLoading={isLoading}
        />
      </div>

      {/* Row 2: Live Stock by Age (BarChart) */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">Live Stock Distribution by Age</h2>
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={liveStockData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(122,156,138,0.15)" />
              <XAxis
                dataKey="age"
                stroke={colours.textSecondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                stroke={colours.textSecondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="birds" radius={[8, 8, 0, 0]}>
                {liveStockData.map((entry, index) => {
                  const colors = [colours.brand50, colours.brand400, colours.brand700];
                  const colorIndex = Math.min(index, colors.length - 1);
                  return <Cell key={`cell-${index}`} fill={colors[colorIndex]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Supervisor Status (2 cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Users size={20} className={colours.brand700} weight="fill" />
              Supervisor Activity
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Total Supervisors</span>
              <span className="text-lg font-bold text-neutral-900">{data?.supervisor_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Active Today</span>
              <span className="text-lg font-bold text-brand700">{data?.active_supervisors_today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Visits Today</span>
              <span className="text-lg font-bold text-neutral-900">{data?.visits_today || 0}</span>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-neutral-200 cursor-pointer hover:border-brand400 transition-colors"
          onClick={() => fetchNotVisitedFarms(3)}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <House size={20} className={colours.signal} weight="fill" />
              Not Visited Farms
            </h3>
            <CaretRight size={16} className="text-neutral-400" weight="bold" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Last 1 day</span>
              <span className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                {data?.not_visited_1d || 0}
                <TrendUp size={16} className="text-red-600" weight="bold" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Last 3 days</span>
              <span className="text-lg font-bold text-amber-600 flex items-center gap-2">
                {data?.not_visited_3d || 0}
                <span className="text-xs">🟡</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Last 7 days</span>
              <span className="text-lg font-bold text-red-600 flex items-center gap-2">
                {data?.not_visited_7d || 0}
                <span className="text-xs">🔴</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Financial Snapshot (2 cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <CurrencyDollar size={20} className={colours.brand700} weight="fill" />
              Avg Sale Rate
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Current Rate</span>
              <span className="text-2xl font-bold text-neutral-900">
                {formatINR(data?.avg_sale_rate || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Today's Market</span>
              <span className="text-lg font-semibold text-brand700">
                {formatINR(171)} (P50)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <TrendUp size={20} className={colours.brand700} weight="fill" />
              Closed P&L
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Revenue</span>
              <span className="text-lg font-bold text-neutral-900">
                {formatINR(data?.month_revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Cost</span>
              <span className="text-lg font-bold text-neutral-900">
                {formatINR(data?.month_cost || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <span className="text-sm font-semibold text-neutral-900">Profit</span>
              <span className={`text-lg font-bold ${data?.month_profit && data.month_profit > 0 ? 'text-brand700' : 'text-red600'}`}>
                {formatINR(data?.month_profit || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Not Visited Farms Drill-down Modal */}
      {showNotVisitedDrilldown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Not Visited Farms / नहीं देखे गए फार्म</h3>
                <p className="text-sm text-neutral-600 mt-1">Farms that haven't been visited by supervisors</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowNotVisitedDrilldown(false)}
                className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {loadingNotVisited ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-brand400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-neutral-600">Loading farms...</p>
                </div>
              ) : notVisitedFarms.length === 0 ? (
                <div className="text-center py-12">
                  <House size={48} className="mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-600">No farms found / कोई फार्म नहीं मिला</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-neutral-900 font-semibold">Farm / फार्म</TableHead>
                      <TableHead className="text-neutral-900 font-semibold">Farmer / किसान</TableHead>
                      <TableHead className="text-neutral-900 font-semibold">Supervisor / सुपरवाइजर</TableHead>
                      <TableHead className="text-neutral-900 font-semibold">Last Visit / अंतिम दौरा</TableHead>
                      <TableHead className="text-neutral-900 font-semibold">Days Since / दिन</TableHead>
                      <TableHead className="text-neutral-900 font-semibold">Action / कार्य</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notVisitedFarms.map((farm) => (
                      <TableRow key={farm.id}>
                        <TableCell className="font-medium">{farm.farm_name}</TableCell>
                        <TableCell>{farm.farmer_name}</TableCell>
                        <TableCell>{farm.supervisor_name || '-'}</TableCell>
                        <TableCell>{farm.last_visit_date ? new Date(farm.last_visit_date).toLocaleDateString('en-IN') : 'Never'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            farm.days_since_visit >= 7 ? 'bg-red-100 text-red-800' :
                            farm.days_since_visit >= 3 ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {farm.days_since_visit} days
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              window.location.href = `/dashboard/farms/${farm.farm_id}`;
                            }}
                            className="bg-brand700 hover:bg-brand400 text-white"
                          >
                            View / देखें
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
