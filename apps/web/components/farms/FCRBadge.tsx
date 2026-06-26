import { clsx } from 'clsx';

// FCR status bands from design spec (14_integrator_farms_design_master.md)
// Using standard Tailwind classes
const FCRColors: Record<string, string> = {
  excellent: 'bg-green-100 text-green-800 border-green-200',
  good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface FCRBadgeProps {
  fcr: number | null;
  className?: string;
}

export function FCRBadge({ fcr, className }: FCRBadgeProps) {
  if (fcr === null || fcr === undefined) {
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          FCRColors.neutral,
          className
        )}
        role="status"
        aria-label="FCR: No data"
      >
        —
      </span>
    );
  }

  let colorClass = FCRColors.neutral;
  if (fcr < 1.7) {
    colorClass = FCRColors.excellent;
  } else if (fcr >= 1.7 && fcr < 1.9) {
    colorClass = FCRColors.good;
  } else if (fcr >= 1.9 && fcr < 2.1) {
    colorClass = FCRColors.warning;
  } else {
    colorClass = FCRColors.critical;
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        colorClass,
        className
      )}
      role="status"
      aria-label={`FCR: ${fcr.toFixed(3)}`}
    >
      {fcr.toFixed(3)}
    </span>
  );
}
