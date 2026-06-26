'use client';

import { PulluCharacter } from './PulluCharacter';

interface AlertPulluProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function AlertPullu({ size, className, animate }: AlertPulluProps) {
  return (
    <PulluCharacter variant="working" size={size} className={className} animate={animate} />
  );
}
