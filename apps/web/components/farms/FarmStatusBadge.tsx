import { clsx } from 'clsx';

// Farm status colour tokens from design spec (14_integrator_farms_design_master.md)
// Using standard Tailwind classes
const FarmStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  between_batches: 'bg-gray-100 text-gray-600 border-gray-200',
  onboarding: 'bg-blue-100 text-blue-800 border-blue-200',
  paused: 'bg-red-100 text-red-800 border-red-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

const FarmStatusLabels: Record<string, string> = {
  active: 'Active',
  between_batches: 'Between Batches',
  onboarding: 'Onboarding',
  paused: 'Paused',
  archived: 'Archived',
};

type FarmStatus = keyof typeof FarmStatusColors;

interface FarmStatusBadgeProps {
  status: FarmStatus;
  className?: string;
}

export function FarmStatusBadge({ status, className }: FarmStatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        FarmStatusColors[status],
        className
      )}
      role="status"
      aria-label={`Farm status: ${FarmStatusLabels[status]}`}
    >
      {FarmStatusLabels[status]}
    </span>
  );
}
