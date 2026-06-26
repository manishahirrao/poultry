// PageSkeleton — full page loading state
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-48 bg-[#F4F7F5] rounded" />
        <div className="h-4 w-96 bg-[#F4F7F5] rounded" />
      </div>
      
      {/* KPI strip skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-[#E3EDE7]">
            <div className="h-3 w-24 bg-[#F4F7F5] rounded mb-4" />
            <div className="h-8 w-32 bg-[#F4F7F5] rounded mb-2" />
            <div className="h-3 w-20 bg-[#F4F7F5] rounded" />
          </div>
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-[#E3EDE7]">
        <div className="h-4 w-40 bg-[#F4F7F5] rounded mb-4" />
        <div className="h-[300px] bg-[#F4F7F5] rounded" />
      </div>
    </div>
  );
}
