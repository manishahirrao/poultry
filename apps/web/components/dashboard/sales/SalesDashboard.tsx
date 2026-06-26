'use client';

import { useState, useEffect } from 'react';
import { 
  TrendUp, TrendDown, Money, Bird, Package, 
  ChartLine, Funnel, Pill, Users, 
  Building, ArrowRight, Calendar
} from '@phosphor-icons/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerProfile {
  id: string;
  name?: string;
  segment: string;
  role: string;
  plan: string;
  district: string;
}

interface SalesMetrics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  birdsSold: number;
  avgRatePerKg: number;
  totalWeightKg: number;
}

interface CostBreakdown {
  chickCost: number;
  feedCost: number;
  medicineCost: number;
  vaccineCost: number;
  labourCost: number;
  overheadCost: number;
  otherCost: number;
}

interface FarmPnL {
  farmId: string;
  farmName: string;
  revenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  birdsSold: number;
  activeBatches: number;
}

interface SalesDashboardProps {
  customer: CustomerProfile;
}

export function SalesDashboard({ customer }: SalesDashboardProps) {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y' | 'ALL'>('90D');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [farmPnL, setFarmPnL] = useState<FarmPnL[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [customer.id, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In production, fetch from API
      // For now, using mock data
      const mockMetrics: SalesMetrics = {
        totalRevenue: 45800000,
        totalCost: 38500000,
        grossProfit: 7300000,
        netProfit: 5200000,
        profitMargin: 11.4,
        birdsSold: 125000,
        avgRatePerKg: 185,
        totalWeightKg: 247500,
      };

      const mockCostBreakdown: CostBreakdown = {
        chickCost: 12500000,
        feedCost: 18500000,
        medicineCost: 3200000,
        vaccineCost: 1800000,
        labourCost: 1500000,
        overheadCost: 800000,
        otherCost: 200000,
      };

      const mockFarmPnL: FarmPnL[] = [
        {
          farmId: '1',
          farmName: 'Sharma Farms - Gorakhpur',
          revenue: 12500000,
          totalCost: 10200000,
          profit: 2300000,
          profitMargin: 18.4,
          birdsSold: 35000,
          activeBatches: 3,
        },
        {
          farmId: '2',
          farmName: 'Verma Poultry - Lucknow',
          revenue: 18200000,
          totalCost: 15800000,
          profit: 2400000,
          profitMargin: 13.2,
          birdsSold: 48000,
          activeBatches: 4,
        },
        {
          farmId: '3',
          farmName: 'Singh Agro - Varanasi',
          revenue: 15100000,
          totalCost: 12500000,
          profit: 2600000,
          profitMargin: 17.2,
          birdsSold: 42000,
          activeBatches: 3,
        },
      ];

      setMetrics(mockMetrics);
      setCostBreakdown(mockCostBreakdown);
      setFarmPnL(mockFarmPnL);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyDollar = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 100000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Analytics
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Sales & P&L Dashboard</h1>
        <p className="text-base text-neutral-600 mt-2">
          Track revenue, costs, and profitability across all farms
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-neutral-500" />
        <div className="flex gap-2">
          {(['30D', '90D', '1Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-green-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Money size={24} className="text-green-600" weight="fill" />
              </div>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendUp size={16} />
                +12.5%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrencyDollar(metrics.totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-2">{formatNumber(metrics.birdsSold)} birds sold</p>
          </div>

          {/* Total Cost */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Funnel size={24} className="text-red-600" weight="fill" />
              </div>
              <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                <TrendUp size={16} />
                +8.3%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrencyDollar(metrics.totalCost)}</p>
            <p className="text-xs text-gray-500 mt-2">Across all farms</p>
          </div>

          {/* Net Profit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartLine size={24} className="text-blue-600" weight="fill" />
              </div>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendUp size={16} />
                +18.2%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrencyDollar(metrics.netProfit)}</p>
            <p className="text-xs text-gray-500 mt-2">{metrics.profitMargin.toFixed(1)}% margin</p>
          </div>

          {/* Average Rate */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendUp size={24} className="text-purple-600" weight="fill" />
              </div>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendUp size={16} />
                +5.2%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Rate/kg</p>
            <p className="text-2xl font-bold text-gray-900">₹{metrics.avgRatePerKg}</p>
            <p className="text-xs text-gray-500 mt-2">{formatNumber(metrics.totalWeightKg)} kg total</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">P&L Overview</TabsTrigger>
          <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="farms">Farm-wise P&L</TabsTrigger>
        </TabsList>

        {/* P&L Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {metrics && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profit & Loss Summary</h2>
              
              <div className="space-y-4">
                {/* Revenue */}
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Money size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Total Revenue</p>
                      <p className="text-sm text-gray-600">Sales from all farms</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-700">{formatCurrencyDollar(metrics.totalRevenue)}</p>
                </div>

                {/* Costs */}
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Funnel size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Total Costs</p>
                      <p className="text-sm text-gray-600">All operational expenses</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-red-700">{formatCurrencyDollar(metrics.totalCost)}</p>
                </div>

                {/* Gross Profit */}
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChartLine size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Gross Profit</p>
                      <p className="text-sm text-gray-600">Revenue - Direct Costs</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{formatCurrencyDollar(metrics.grossProfit)}</p>
                </div>

                {/* Net Profit */}
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendUp size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Net Profit</p>
                      <p className="text-sm text-gray-600">After all expenses</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-purple-700">{formatCurrencyDollar(metrics.netProfit)}</p>
                </div>

                {/* Profit Margin */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.profitMargin.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(metrics.profitMargin, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Cost Breakdown Tab */}
        <TabsContent value="costs" className="space-y-6">
          {costBreakdown && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown</h2>
              
              <div className="space-y-4">
                {/* Chick Cost */}
                <CostItem
                  icon={<Bird size={24} className="text-orange-600" />}
                  title="Chick Cost"
                  amount={costBreakdown.chickCost}
                  total={metrics?.totalCost || 0}
                  color="orange"
                />

                {/* Feed Cost */}
                <CostItem
                  icon={<Package size={24} className="text-yellow-600" />}
                  title="Feed Cost"
                  amount={costBreakdown.feedCost}
                  total={metrics?.totalCost || 0}
                  color="yellow"
                />

                {/* Medicine Cost */}
                <CostItem
                  icon={<Pill size={24} className="text-red-600" />}
                  title="Medicine Cost"
                  amount={costBreakdown.medicineCost}
                  total={metrics?.totalCost || 0}
                  color="red"
                />

                {/* Vaccine Cost */}
                <CostItem
                  icon={<Package size={24} className="text-blue-600" />}
                  title="Vaccine Cost"
                  amount={costBreakdown.vaccineCost}
                  total={metrics?.totalCost || 0}
                  color="blue"
                />

                {/* Labour Cost */}
                <CostItem
                  icon={<Users size={24} className="text-purple-600" />}
                  title="Labour Cost"
                  amount={costBreakdown.labourCost}
                  total={metrics?.totalCost || 0}
                  color="purple"
                />

                {/* Overhead Cost */}
                <CostItem
                  icon={<Building size={24} className="text-gray-600" />}
                  title="Overhead Cost"
                  amount={costBreakdown.overheadCost}
                  total={metrics?.totalCost || 0}
                  color="gray"
                />

                {/* Other Cost */}
                <CostItem
                  icon={<Funnel size={24} className="text-pink-600" />}
                  title="Other Costs"
                  amount={costBreakdown.otherCost}
                  total={metrics?.totalCost || 0}
                  color="pink"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Farm-wise P&L Tab */}
        <TabsContent value="farms" className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Farm-wise Profit & Loss</h2>
              <p className="text-sm text-gray-600 mt-1">
                Performance breakdown by farm
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Farm Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Birds Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Active Batches
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {farmPnL.map((farm) => (
                    <tr key={farm.farmId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Building size={16} className="text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{farm.farmName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrencyDollar(farm.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrencyDollar(farm.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          farm.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrencyDollar(farm.profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          farm.profitMargin >= 15 ? 'bg-green-100 text-green-800' :
                          farm.profitMargin >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {farm.profitMargin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(farm.birdsSold)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {farm.activeBatches}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CostItemProps {
  icon: React.ReactNode;
  title: string;
  amount: number;
  total: number;
  color: string;
}

function CostItem({ icon, title, amount, total, color }: CostItemProps) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  const barColorClasses = {
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900">{formatCurrencyDollar(amount)}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${barColorClasses[color as keyof typeof barColorClasses]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function formatCurrencyDollar(amount: number) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else {
    return `₹${amount.toLocaleString()}`;
  }
}

function formatNumber(num: number) {
  if (num >= 100000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toLocaleString();
}
