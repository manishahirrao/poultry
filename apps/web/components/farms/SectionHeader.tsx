import { clsx } from 'clsx';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { useState } from 'react';

interface SectionHeaderProps {
  title: string;
  titleHi?: string;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

export function SectionHeader({
  title,
  titleHi,
  isCollapsible = false,
  defaultCollapsed = false,
  onToggle,
  className,
}: SectionHeaderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggle?.(newState);
  };

  return (
    <div className={clsx('flex items-center justify-between py-3 border-b border-gray-200', className)}>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {titleHi && <p className="text-xs text-gray-500">{titleHi}</p>}
      </div>
      {isCollapsible && (
        <button
          type="button"
          onClick={handleToggle}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-expanded={!collapsed}
          aria-label={`Collapse ${title} section`}
        >
          {collapsed ? (
            <CaretRight size={20} weight="bold" className="text-gray-600" />
          ) : (
            <CaretDown size={20} weight="bold" className="text-gray-600" />
          )}
        </button>
      )}
    </div>
  );
}
