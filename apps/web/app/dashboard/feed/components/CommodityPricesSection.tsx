'use client'

import { CommodityPriceRow } from './CommodityPriceRow'

interface CommodityPricesSectionProps {
  commodities: {
    maize: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
    soya: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
    palmOil: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
    composite: { price: number; delta: number; trend: 'up' | 'down' | 'flat' };
  };
  isLoading?: boolean;
}

export function CommodityPricesSection({ commodities, isLoading }: CommodityPricesSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E3EDE7] p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Commodity Prices (7-Day Delta)
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#F4F7F5] rounded-xl">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const commodityItems = [
    {
      id: 'maize',
      name: 'Maize (Corn)',
      nameHindi: 'मक्का',
      unit: 'Per quintal',
      currentPrice: commodities.maize.price,
      sevenDayDelta: commodities.maize.delta,
    },
    {
      id: 'soya_meal',
      name: 'Soya Meal',
      nameHindi: 'सोयाबीन खली',
      unit: 'Per quintal',
      currentPrice: commodities.soya.price,
      sevenDayDelta: commodities.soya.delta,
    },
    {
      id: 'palm_oil',
      name: 'Palm Oil',
      nameHindi: 'पाम ऑयल',
      unit: 'Per 10kg',
      currentPrice: commodities.palmOil.price,
      sevenDayDelta: commodities.palmOil.delta,
    },
    {
      id: 'composite',
      name: 'Composite Feed Cost Index',
      nameHindi: 'समग्र फीड लागत सूचकांक',
      unit: 'Weighted index',
      currentPrice: commodities.composite.price,
      sevenDayDelta: commodities.composite.delta,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E3EDE7] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Commodity Prices (7-Day Delta)
      </h3>
      <div className="space-y-1">
        {commodityItems.map((item) => (
          <CommodityPriceRow key={item.id} commodity={item} />
        ))}
      </div>
    </div>
  );
}
