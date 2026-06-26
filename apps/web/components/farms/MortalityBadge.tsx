import { clsx } from 'clsx';

// Mortality rate bands from design spec (14_integrator_farms_design_master.md)
// Using standard Tailwind classes
const MortalityColors: Record<string, string> = {
  normal: 'bg-green-100 text-green-800 border-green-200',
  elevated: 'bg-amber-100 text-amber-800 border-amber-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface MortalityBadgeProps {
  mortalityPct: number | null;
  className?: string;
}

export function MortalityBadge({ mortalityPct, className }: MortalityBadgeProps) {
  if (mortalityPct === null || mortalityPct === undefined) {
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          MortalityColors.neutral,
          className
        )}
        role="status"
        aria-label="Mortality: No data"
      >
        —
      </span>
    );
  }

  let colorClass = MortalityColors.neutral;
  if (mortalityPct < 3) {
    colorClass = MortalityColors.normal;
  } else if (mortalityPct >= 3 && mortalityPct < 5) {
    colorClass = MortalityColors.elevated;
  } else {
    colorClass = MortalityColors.critical;
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        colorClass,
        className
      )}
      role="status"
      aria-label={`Mortality: ${mortalityPct.toFixed(1)}%`}
    >
      {mortalityPct.toFixed(1)}%
    </span>
  );
}
