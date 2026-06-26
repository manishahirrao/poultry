// ChartSkeleton — loading skeleton for chart components
interface Props {
  height?: number
  className?: string
}

export function ChartSkeleton({ height = 300, className = '' }: Props) {
  return (
    <div className={`animate-pulse ${className}`} style={{ height }}>
      {/* Header skeleton */}
      <div className="h-4 w-48 bg-[#F4F7F5] rounded mb-3" />
      
      {/* Chart area skeleton */}
      <div className="h-full bg-[#F4F7F5] rounded-lg overflow-hidden">
        {/* Decorative bars to suggest chart shape */}
        <div className="flex items-end justify-between h-full px-4 pb-4 pt-8 gap-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-full bg-[#E3EDE7] rounded-t"
              style={{
                height: `${30 + Math.random() * 50}%`,
                opacity: 0.6 + Math.random() * 0.4
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
