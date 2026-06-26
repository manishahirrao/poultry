'use client';

import { PulluCharacter } from './PulluCharacter';

interface PointingPulluProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function PointingPullu({ size, className, animate }: PointingPulluProps) {
  return (
    <PulluCharacter variant="celebrating" size={size} className={className} animate={animate} />
  );
}
