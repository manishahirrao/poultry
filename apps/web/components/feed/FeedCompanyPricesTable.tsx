'use client';

import { useState } from 'react';
import { TrendUp, TrendDown, Minus, Info } from '@phosphor-icons/react';

interface FeedCompany {
  id: string;
  name: string;
  logo_url?: string;
}

interface FeedType {
  id: string;
  name: string;
  category: string;
}

interface FeedPrice {
  id: string;
  company_id: string;
  feed_type_id: string;
  price_per_ton: number;
  price_per_50kg_bag: number;
  effective_date: string;
  is_current: boolean;
}

interface FeedCompanyPricesTableProps {
  isLoading?: boolean;
}

export function FeedCompanyPricesTable({ isLoading }: FeedCompanyPricesTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - replace with actual API call
  const mockCompanies: FeedCompany[] = [
    { id: '1', name: 'Godrej Agrovet' },
    { id: '2', name: 'Venkateshwara Hatcheries (Venkys)' },
    { id: '3', name: 'Suguna Foods' },
    { id: '4', name: 'IB Group' },
    { id: '5', name: 'Amrit Feeds' },
    { id: '6', name: 'Kaveri Company' },
  ];

  const mockFeedTypes: FeedType[] = [
    { id: '1', name: 'Pre-Starter', category: 'pre_starter' },
    { id: '2', name: 'Starter', category: 'starter' },
    { id: '3', name: 'Grower', category: 'grower' },
    { id: '4', name: 'Finisher', category: 'finisher' },
    { id: '5', name: 'Layer Starter', category: 'layer' },
    { id: '6', name: 'Layer Grower', category: 'layer' },
    { id: '7', name: 'Layer Finisher', category: 'layer' },
  ];

  const mockPrices: FeedPrice[] = [
    // Godrej Agrovet
    { id: '1', company_id: '1', feed_type_id: '2', price_per_ton: 28500, price_per_50kg_bag: 1425, effective_date: '2024-01-15', is_current: true },
    { id: '2', company_id: '1', feed_type_id: '3', price_per_ton: 27500, price_per_50kg_bag: 1375, effective_date: '2024-01-15', is_current: true },
    { id: '3', company_id: '1', feed_type_id: '4', price_per_ton: 26500, price_per_50kg_bag: 1325, effective_date: '2024-01-15', is_current: true },
    { id: '4', company_id: '1', feed_type_id: '5', price_per_ton: 29500, price_per_50kg_bag: 1475, effective_date: '2024-01-15', is_current: true },
    { id: '5', company_id: '1', feed_type_id: '6', price_per_ton: 28500, price_per_50kg_bag: 1425, effective_date: '2024-01-15', is_current: true },
    { id: '6', company_id: '1', feed_type_id: '7', price_per_ton: 27500, price_per_50kg_bag: 1375, effective_date: '2024-01-15', is_current: true },
    
    // Venkys
    { id: '7', company_id: '2', feed_type_id: '2', price_per_ton: 29000, price_per_50kg_bag: 1450, effective_date: '2024-01-15', is_current: true },
    { id: '8', company_id: '2', feed_type_id: '3', price_per_ton: 28000, price_per_50kg_bag: 1400, effective_date: '2024-01-15', is_current: true },
    { id: '9', company_id: '2', feed_type_id: '4', price_per_ton: 27000, price_per_50kg_bag: 1350, effective_date: '2024-01-15', is_current: true },
    
    // Suguna Foods
    { id: '10', company_id: '3', feed_type_id: '2', price_per_ton: 27800, price_per_50kg_bag: 1390, effective_date: '2024-01-15', is_current: true },
    { id: '11', company_id: '3', feed_type_id: '3', price_per_ton: 26800, price_per_50kg_bag: 1340, effective_date: '2024-01-15', is_current: true },
    { id: '12', company_id: '3', feed_type_id: '4', price_per_ton: 25800, price_per_50kg_bag: 1290, effective_date: '2024-01-15', is_current: true },
    
    // IB Group
    { id: '13', company_id: '4', feed_type_id: '2', price_per_ton: 28200, price_per_50kg_bag: 1410, effective_date: '2024-01-15', is_current: true },
    { id: '14', company_id: '4', feed_type_id: '3', price_per_ton: 27200, price_per_50kg_bag: 1360, effective_date: '2024-01-15', is_current: true },
    { id: '15', company_id: '4', feed_type_id: '4', price_per_ton: 26200, price_per_50kg_bag: 1310, effective_date: '2024-01-15', is_current: true },
    
    // Amrit Feeds
    { id: '16', company_id: '5', feed_type_id: '2', price_per_ton: 28000, price_per_50kg_bag: 1400, effective_date: '2024-01-15', is_current: true },
    { id: '17', company_id: '5', feed_type_id: '3', price_per_ton: 27000, price_per_50kg_bag: 1350, effective_date: '2024-01-15', is_current: true },
    { id: '18', company_id: '5', feed_type_id: '4', price_per_ton: 26000, price_per_50kg_bag: 1300, effective_date: '2024-01-15', is_current: true },
    
    // Kaveri Company
    { id: '19', company_id: '6', feed_type_id: '2', price_per_ton: 28800, price_per_50kg_bag: 1440, effective_date: '2024-01-15', is_current: true },
    { id: '20', company_id: '6', feed_type_id: '3', price_per_ton: 27800, price_per_50kg_bag: 1390, effective_date: '2024-01-15', is_current: true },
    { id: '21', company_id: '6', feed_type_id: '4', price_per_ton: 26800, price_per_50kg_bag: 1340, effective_date: '2024-01-15', is_current: true },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="h-96 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // SlidersHorizontal feed types based on selected category
  const filteredFeedTypes = selectedCategory === 'all' 
    ? mockFeedTypes 
    : mockFeedTypes.filter(ft => ft.category === selectedCategory);

  // Get price for a company and feed type
  const getPrice = (companyId: string, feedTypeId: string) => {
    return mockPrices.find(
      p => p.company_id === companyId && p.feed_type_id === feedTypeId && p.is_current
    );
  };

  // Calculate price trend (mock implementation)
  const getPriceTrend = (price: number) => {
    // In real implementation, this would compare with previous price
    const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'flat';
    const delta = trend === 'up' ? Math.floor(Math.random() * 500) + 100 : 
                  trend === 'down' ? -(Math.floor(Math.random() * 500) + 100) : 0;
    return { trend, delta };
  };

  const categories = [
    { value: 'all', label: 'All Types' },
    { value: 'pre_starter', label: 'Pre-Starter' },
    { value: 'starter', label: 'Starter' },
    { value: 'grower', label: 'Grower' },
    { value: 'finisher', label: 'Finisher' },
    { value: 'layer', label: 'Layer' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Feed Company Price Comparison
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Current prices from major poultry feed companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-neutral-500">
        <Info size={14} />
        <span>Prices are per ton. 50kg bag price = ton price ÷ 20</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 sticky left-0 bg-white">
                Company
              </th>
              {filteredFeedTypes.map(feedType => (
                <th key={feedType.id} className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">
                  <div>{feedType.name}</div>
                  <div className="text-xs font-normal text-neutral-500">₹/ton</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCompanies.map(company => (
              <tr key={company.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-3 px-4 text-sm font-medium text-neutral-900 sticky left-0 bg-white">
                  {company.name}
                </td>
                {filteredFeedTypes.map(feedType => {
                  const price = getPrice(company.id, feedType.id);
                  const { trend, delta } = price ? getPriceTrend(price.price_per_ton) : { trend: 'flat', delta: 0 };
                  
                  if (!price) {
                    return (
                      <td key={feedType.id} className="py-3 px-4 text-center text-sm text-neutral-400">
                        -
                      </td>
                    );
                  }

                  const TrendIcon = trend === 'up' ? TrendUp : trend === 'down' ? TrendDown : Minus;
                  const trendColor = trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-neutral-400';

                  return (
                    <td key={feedType.id} className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-neutral-900">
                          ₹{price.price_per_ton.toLocaleString()}
                        </span>
                        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                          <TrendIcon size={12} />
                          <span>{delta > 0 ? '+' : ''}{delta}</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span>Price increased</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span>Price decreased</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-neutral-400" />
              <span>Price stable</span>
            </div>
          </div>
          <div>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
}
