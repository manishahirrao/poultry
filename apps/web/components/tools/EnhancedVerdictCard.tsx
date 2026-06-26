'use client';

interface EnhancedVerdictCardProps {
  offeredPrice: number;
  benchmarkPrice: number;
  district: string;
  poultryType: 'broiler' | 'layer';
}

export function EnhancedVerdictCard({ offeredPrice, benchmarkPrice, district, poultryType }: EnhancedVerdictCardProps) {
  const ratio = (offeredPrice / benchmarkPrice) * 100;
  const spread = offeredPrice - benchmarkPrice;
  const spreadPct = (spread / benchmarkPrice) * 100;

  const getVerdict = () => {
    if (ratio < 90) {
      return {
        status: 'LOW',
        color: '#C0392B',
        bgColor: '#FEE2E2',
        icon: '⚠️',
        title: 'Below Market Rate',
        description: 'This price is significantly below the mandi benchmark. Consider negotiating or getting quotes from other traders.',
        recommendation: 'Ask for ₹' + (benchmarkPrice * 0.95).toFixed(2) + ' or higher',
        confidence: 'High'
      };
    } else if (ratio <= 110) {
      return {
        status: 'FAIR',
        color: '#1A6B3C',
        bgColor: '#ECFDF5',
        icon: '✅',
        title: 'Fair Market Rate',
        description: 'This price is within the acceptable market range. It aligns with current mandi prices.',
        recommendation: 'Accept if terms are favorable',
        confidence: 'Medium'
      };
    } else {
      return {
        status: 'HIGH',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        icon: '🎯',
        title: 'Premium Price',
        description: 'This price is above the mandi benchmark. Verify quality and terms before accepting.',
        recommendation: 'Confirm quality standards match premium',
        confidence: 'High'
      };
    }
  };

  const verdict = getVerdict();

  return (
    <div className="rounded-xl p-6 border-2" style={{ backgroundColor: verdict.bgColor, borderColor: verdict.color }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{verdict.icon}</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: verdict.color }}>
              {verdict.title}
            </h3>
            <p className="text-sm text-gray-600">
              Confidence: {verdict.confidence}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: verdict.color }}>
            {ratio.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">of Benchmark</div>
        </div>
      </div>

      {/* Price Comparison */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Offered</div>
          <div className="text-lg font-bold text-gray-900">
            ₹{offeredPrice.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Benchmark</div>
          <div className="text-lg font-bold text-gray-900">
            ₹{benchmarkPrice.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Spread</div>
          <div className={`text-lg font-bold ${spread >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {spread >= 0 ? '+' : ''}₹{spread.toFixed(2)}
          </div>
          <div className={`text-xs ${spreadPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({spreadPct >= 0 ? '+' : ''}{spreadPct.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        {verdict.description}
      </p>

      {/* Recommendation */}
      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: verdict.color }}>
        <div className="text-xs font-semibold text-gray-600 mb-1">RECOMMENDATION</div>
        <div className="text-sm font-medium text-gray-900">
          {verdict.recommendation}
        </div>
      </div>

      {/* District Info */}
      <div className="mt-4 text-xs text-gray-500">
        District: {district.charAt(0).toUpperCase() + district.slice(1)} | 
        Type: {poultryType === 'broiler' ? 'Broiler (₹/kg)' : 'Layer (₹/egg)'}
      </div>
    </div>
  );
}
