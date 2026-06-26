interface BatchSummarySectionProps {
  farm: any;
  batch: any;
  totalBirdsPlaced: number;
  totalBirdsHarvested: number;
  totalDeaths: number;
  mortalityPct: number;
  durationDays: number;
  isDataLocked: boolean;
}

export function BatchSummarySection({
  farm,
  batch,
  totalBirdsPlaced,
  totalBirdsHarvested,
  totalDeaths,
  mortalityPct,
  durationDays,
  isDataLocked,
}: BatchSummarySectionProps) {
  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">1. Batch Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farm Information */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Farm Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Farm Name:</span>
              <span className="font-semibold">{farm?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{farm?.district}, {farm?.village}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Farm Type:</span>
              <span className="font-semibold capitalize">{farm?.farm_type || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Capacity:</span>
              <span className="font-semibold">{farm?.capacity?.toLocaleString('en-IN') || 0} birds</span>
            </div>
          </div>
        </div>

        {/* Batch Information */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Batch Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Batch Number:</span>
              <span className="font-semibold">#{batch.batch_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Breed:</span>
              <span className="font-semibold">{batch.breed || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DOC Supplier:</span>
              <span className="font-semibold">{batch.doc_supplier || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Placement Date:</span>
              <span className="font-semibold">
                {batch.placement_date ? new Date(batch.placement_date).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">{durationDays} days</span>
            </div>
          </div>
        </div>

        {/* Bird Performance */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Bird Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Birds Placed:</span>
              <span className="font-semibold">{totalBirdsPlaced.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Birds Harvested:</span>
              <span className="font-semibold">{totalBirdsHarvested.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Deaths:</span>
              <span className="font-semibold text-red-600">{totalDeaths.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mortality %:</span>
              <span className={`font-semibold ${mortalityPct > 5 ? 'text-red-600' : mortalityPct > 3 ? 'text-amber-600' : 'text-green-600'}`}>
                {mortalityPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Batch Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Batch Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold capitalize ${
                batch.status === 'active' ? 'text-green-600' :
                batch.status === 'closed' ? 'text-gray-600' :
                'text-amber-600'
              }`}>
                {batch.status}
              </span>
            </div>
            {batch.closed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Closed Date:</span>
                <span className="font-semibold">
                  {new Date(batch.closed_at).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {isDataLocked && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                ⚠️ This batch data is locked and cannot be edited.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
