import { clsx } from 'clsx';

// Batch progress bar component using design tokens from 14_integrator_farms_design_master.md
// Tokens: batchPlacement, batchGrow, batchHarvest, batchClosed

interface BatchProgressBarProps {
  placementDate: string;
  targetHarvestAge: number;
  className?: string;
}

export function BatchProgressBar({ placementDate, targetHarvestAge, className }: BatchProgressBarProps) {
  const placement = new Date(placementDate);
  const today = new Date();
  const daysIntoBatch = Math.floor((today.getTime() - placement.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min((daysIntoBatch / targetHarvestAge) * 100, 100);
  const harvestWindowStart = Math.floor(targetHarvestAge * 0.83); // ~83% of target age

  const markers = [
    { day: 0, label: 'Day 0' },
    { day: 14, label: 'Day 14' },
    { day: 28, label: 'Day 28' },
    { day: harvestWindowStart, label: 'Harvest Window', isHarvest: true },
    { day: targetHarvestAge, label: `Day ${targetHarvestAge}+` },
  ];

  return (
    <div className={clsx('w-full', className)}>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress bar - uses batchGrow token for growing phase */}
        <div
          className="h-full bg-batchGrow transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={daysIntoBatch}
          aria-valuemin={0}
          aria-valuemax={targetHarvestAge}
          aria-label={`Batch progress: Day ${daysIntoBatch} of ${targetHarvestAge}`}
        />
        
        {/* Harvest window zone - uses batchHarvest token */}
        <div
          className="absolute top-0 h-full bg-batchHarvest opacity-30"
          style={{
            left: `${(harvestWindowStart / targetHarvestAge) * 100}%`,
            width: `${((targetHarvestAge - harvestWindowStart) / targetHarvestAge) * 100}%`,
          }}
        />
      </div>

      {/* Day markers */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {markers.map((marker) => {
          const markerProgress = (marker.day / targetHarvestAge) * 100;
          const isPast = daysIntoBatch >= marker.day;
          const isCurrent = Math.abs(daysIntoBatch - marker.day) <= 1;

          return (
            <div
              key={marker.day}
              className="flex flex-col items-center"
              style={{ position: 'absolute', left: `${markerProgress}%`, transform: 'translateX(-50%)' }}
            >
              <div
                className={clsx(
                  'w-2 h-2 rounded-full border-2',
                  isCurrent ? 'bg-batchGrow border-batchGrow' : isPast ? 'bg-batchGrow border-batchGrow' : 'bg-white border-gray-400',
                  marker.isHarvest && 'bg-batchHarvest border-batchHarvest'
                )}
              />
              <span className="mt-1 whitespace-nowrap">{marker.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
