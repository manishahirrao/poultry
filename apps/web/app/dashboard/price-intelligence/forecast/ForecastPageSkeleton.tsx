export function ForecastPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)] p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-4">
        <div className="h-6 w-48 bg-[var(--color-background-secondary)] rounded animate-pulse" />
        <div className="h-4 w-64 mt-2 bg-[var(--color-background-secondary)] rounded animate-pulse" />
      </div>

      {/* Disclaimer Strip */}
      <div className="h-12 bg-[#FFFBEB] border border-[#D97706] rounded-lg mb-4 animate-pulse" />

      {/* Controls Row */}
      <div className="flex gap-4 mb-4">
        <div className="h-10 w-32 bg-[var(--color-background-secondary)] rounded animate-pulse" />
        <div className="h-10 w-24 bg-[var(--color-background-secondary)] rounded animate-pulse" />
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[var(--color-background-secondary)] rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Card */}
        <div className="lg:col-span-2 h-80 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg animate-pulse" />

        {/* Right Panel */}
        <div className="space-y-4">
          <div className="h-40 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg animate-pulse" />
          <div className="h-40 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
