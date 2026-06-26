interface Props {
  mandiId: string
  horizon: number
  onMandiChange: (mandiId: string) => void
  onHorizonChange: (horizon: number) => void
  viewMode: 'chart' | 'table'
  onViewModeChange: (viewMode: 'chart' | 'table') => void
  plan: string
  language?: string
}

export function ForecastControls({ mandiId, horizon, onMandiChange, onHorizonChange, viewMode, onViewModeChange, plan, language = 'en' }: Props) {
  const isHindi = language === 'hi'

  const mandis = [
    { id: 'gorakhpur', name: 'Gorakhpur APMC' },
    { id: 'deoria', name: 'Deoria Mandi' },
    { id: 'basti', name: 'Basti Mandi' },
    { id: 'kushinagar', name: 'Kushinagar' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-600">{isHindi ? 'मंडी' : 'Mandi'}</span>
        <select
          value={mandiId}
          onChange={(e) => onMandiChange(e.target.value)}
          className="text-[12px] px-3 py-1.5 border border-[var(--color-border-secondary)] rounded-lg bg-[var(--color-background-primary)] text-gray-700 focus:outline-none focus:border-[#1A5C34]"
        >
          {mandis.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-600">{isHindi ? 'अवधि' : 'Horizon'}</span>
        <div className="flex border border-[var(--color-border-secondary)] rounded-lg overflow-hidden">
          <button
            onClick={() => onHorizonChange(7)}
            className={`text-[11px] px-3 py-1.5 transition-colors ${
              horizon === 7 ? 'bg-[#1A5C34] text-white' : 'bg-[var(--color-background-primary)] text-gray-600 hover:bg-[var(--color-background-secondary)]'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => onHorizonChange(30)}
            className={`text-[11px] px-3 py-1.5 transition-colors ${
              horizon === 30 ? 'bg-[#1A5C34] text-white' : 'bg-[var(--color-background-primary)] text-gray-600 hover:bg-[var(--color-background-secondary)]'
            }`}
          >
            30D
          </button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[11px] text-gray-600">{isHindi ? 'दृश्य' : 'View'}</span>
        <div className="flex border border-[var(--color-border-secondary)] rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('chart')}
            className={`text-[11px] px-3 py-1.5 transition-colors ${
              viewMode === 'chart' ? 'bg-[#1A5C34] text-white' : 'bg-[var(--color-background-primary)] text-gray-600 hover:bg-[var(--color-background-secondary)]'
            }`}
          >
            {isHindi ? 'चार्ट' : 'Chart'}
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`text-[11px] px-3 py-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-[#1A5C34] text-white' : 'bg-[var(--color-background-primary)] text-gray-600 hover:bg-[var(--color-background-secondary)]'
            }`}
          >
            {isHindi ? 'तालिका' : 'Table'}
          </button>
        </div>
      </div>
    </div>
  )
}
