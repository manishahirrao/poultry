'use client';

import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

interface CommodityPrice {
  price: number;
  delta: number;
  trend: 'up' | 'down' | 'flat';
}

interface CommodityData {
  maize: CommodityPrice;
  soya: CommodityPrice;
  palmOil: CommodityPrice;
  composite: CommodityPrice;
}

interface CommodityTickerProps {
  commodities: CommodityData;
  isLoading?: boolean;
}

export function CommodityTicker({ commodities, isLoading }: CommodityTickerProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const commodityItems = [
    { key: 'maize', name: 'Maize (Corn)', unit: 'Per quintal', data: commodities.maize },
    { key: 'soya', name: 'Soya Meal', unit: 'Per quintal', data: commodities.soya },
    { key: 'palmOil', name: 'Palm Oil', unit: 'Per 10kg', data: commodities.palmOil },
    {
      key: 'composite',
      name: 'Composite Feed Cost Index',
      unit: 'Weighted index',
      data: commodities.composite,
      highlight: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="text-base font-semibold text-neutral-900 mb-4">
        Commodity Prices (7-Day Delta)
      </h3>
      <div className="space-y-3">
        {commodityItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-4 rounded-xl ${
              item.highlight
                ? 'bg-brand-green-50 border border-brand-green-200'
                : 'bg-neutral-50'
            }`}
          >
            <div className="flex-1">
              <div
                className={`text-sm font-semibold ${
                  item.highlight ? 'text-brand-green-800' : 'text-neutral-900'
                }`}
              >
                {item.name}
              </div>
              <div
                className={`text-xs ${
                  item.highlight ? 'text-brand-green-600' : 'text-neutral-500'
                }`}
              >
                {item.unit}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  item.highlight ? 'text-brand-green-800' : 'text-neutral-900'
                }`}
                style={{ fontFamily: "'Sora', system-ui" }}
              >
                ₹{item.data.price}
              </div>
              <div
                className={`text-xs flex items-center justify-end gap-1 ${
                  item.data.delta > 0
                    ? 'text-green-600'
                    : item.data.delta < 0
                    ? 'text-red-600'
                    : 'text-neutral-600'
                }`}
              >
                {item.data.delta > 0 ? (
                  <TrendUp size={12} />
                ) : item.data.delta < 0 ? (
                  <TrendDown size={12} />
                ) : (
                  <Minus size={12} />
                )}
                {item.data.delta > 0 ? '+' : ''}
                {item.data.delta}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
