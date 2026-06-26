// KPISkeleton — for KPI strip cards
export function KPISkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#E3EDE7] bg-white p-5">
      <div className="h-3 w-24 bg-[#F4F7F5] rounded mb-3" />
      <div className="h-8 w-20 bg-[#F4F7F5] rounded mb-2" />
      <div className="h-2 w-16 bg-[#F4F7F5] rounded" />
    </div>
  );
}
