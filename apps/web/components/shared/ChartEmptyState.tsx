// ChartEmptyState — when API returns no data
interface Props {
  message?: string
  messageHindi?: string
  hint?: string
  showRetry?: boolean
  onRetry?: () => void
}

export function ChartEmptyState({
  message = 'No data available',
  messageHindi = 'डेटा उपलब्ध नहीं है',
  hint,
  showRetry = false,
  onRetry
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#E3EDE7]
                    bg-[#F4F7F5] py-12 text-center">
      <svg width="48" height="48" viewBox="0 0 48 48" className="mb-3 opacity-30">
        <path d="M8 40 L8 20 M16 40 L16 28 M24 40 L24 16 M32 40 L32 24 M40 40 L40 12"
              stroke="#1A5C34" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium text-gray-500">{messageHindi}</p>
      <p className="text-xs text-gray-400">{message}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-xs font-medium text-white bg-[#1A5C34] rounded-lg hover:bg-[#145a2d] transition-colors"
        >
          Retry →
        </button>
      )}
    </div>
  );
}
