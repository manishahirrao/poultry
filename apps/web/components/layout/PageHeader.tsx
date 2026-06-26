interface PageHeaderProps {
  title: string
  subtitle: string
  actions: Array<{ label: string; variant: 'outline' | 'primary'; onClick: () => void }>
  breadcrumb: string[]
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 px-6 pt-2">
      <div>
        <nav className="text-xs text-[var(--color-text-secondary)] mb-1" aria-label="Breadcrumb">
          {breadcrumb.join(' › ')}
        </nav>
        <h1 className="text-lg font-medium text-[var(--color-text-primary)]">
          {title}
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {subtitle}
        </p>
      </div>
      <div className="flex gap-2 mt-3 md:mt-0">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`text-xs px-3 py-1.5 rounded ${
              action.variant === 'primary'
                ? 'border border-[#1A5C34] bg-[#1A5C34] text-white'
                : 'border border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] text-[var(--color-text-secondary)]'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
