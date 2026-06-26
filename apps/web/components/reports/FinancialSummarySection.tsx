interface FinancialSummarySectionProps {
  estimatedRevenue: number;
  totalFeedCost: number;
  docCost: number;
  totalCost: number;
  grossProfit: number;
  pricePrediction: number | null;
  totalBirdsHarvested: number;
  avgWeight: number;
  isDataLocked: boolean;
}

export function FinancialSummarySection({
  estimatedRevenue,
  totalFeedCost,
  docCost,
  totalCost,
  grossProfit,
  pricePrediction,
  totalBirdsHarvested,
  avgWeight,
  isDataLocked,
}: FinancialSummarySectionProps) {
  const profitMargin = estimatedRevenue > 0 ? (grossProfit / estimatedRevenue) * 100 : 0;
  const costPerBird = totalBirdsHarvested > 0 ? totalCost / totalBirdsHarvested : 0;

  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">6. Financial Summary</h2>
      
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>⚠️ Disclaimer:</strong> Revenue estimated using FlockIQ P50 price (₹{pricePrediction?.toFixed(2) || 'N/A'}/kg). 
          Actual realised price may vary based on market conditions, quality, and buyer negotiations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Revenue</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Birds Harvested:</span>
              <span className="font-semibold">{totalBirdsHarvested.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Weight:</span>
              <span className="font-semibold">{avgWeight.toFixed(0)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Weight:</span>
              <span className="font-semibold">{(totalBirdsHarvested * (avgWeight / 1000)).toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">P50 Price:</span>
              <span className="font-semibold">₹{pricePrediction?.toFixed(2) || 'N/A'}/kg</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gray-900">Estimated Revenue:</span>
                <span className="text-green-700">₹{estimatedRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Costs */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Costs</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Feed Cost:</span>
              <span className="font-semibold">₹{totalFeedCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DOC Cost:</span>
              <span className="font-semibold">₹{docCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Other Costs:</span>
              <span className="font-semibold">₹0</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gray-900">Total Cost:</span>
                <span className="text-red-700">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profitability */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Profitability Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Gross Profit</div>
              <div className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₹{grossProfit.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Profit Margin</div>
              <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profitMargin.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">Cost Per Bird</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{costPerBird.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Feed as % of Cost:</span>
              <span className="font-semibold">
                {totalCost > 0 ? ((totalFeedCost / totalCost) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">DOC as % of Cost:</span>
              <span className="font-semibold">
                {totalCost > 0 ? ((docCost / totalCost) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue Per Bird:</span>
              <span className="font-semibold">
                ₹{totalBirdsHarvested > 0 ? (estimatedRevenue / totalBirdsHarvested).toFixed(2) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">Financial Insights</h3>
          <div className="text-sm text-gray-700 space-y-2">
            {grossProfit >= 0 && profitMargin >= 15 && (
              <p>✅ Excellent profitability. Profit margin of {profitMargin.toFixed(1)}% is above industry standard.</p>
            )}
            {grossProfit >= 0 && profitMargin >= 5 && profitMargin < 15 && (
              <p>🟡 Good profitability. Profit margin of {profitMargin.toFixed(1)}% is within acceptable range.</p>
            )}
            {grossProfit >= 0 && profitMargin < 5 && (
              <p>🟠 Low profitability. Profit margin of {profitMargin.toFixed(1)}% needs improvement. Review costs and pricing.</p>
            )}
            {grossProfit < 0 && (
              <p>🔴 Loss incurred. Review all cost factors and consider operational improvements for next batch.</p>
            )}
            {totalCost > 0 && (totalFeedCost / totalCost) > 70 && (
              <p>⚠️ Feed cost represents {(totalFeedCost / totalCost * 100).toFixed(1)}% of total costs. Consider feed optimization strategies.</p>
            )}
            {costPerBird > 0 && (
              <p>💡 Cost per bird is ₹{costPerBird.toFixed(2)}. Benchmark against industry average of ₹180-220 per bird for broilers.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
