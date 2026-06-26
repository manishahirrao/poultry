'use client';

import { PulluCharacter } from './PulluCharacter';

interface ConfusedPulluProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function ConfusedPullu({ size, className, animate }: ConfusedPulluProps) {
  return (
    <PulluCharacter variant="thinking" size={size} className={className} animate={animate} />
  );
}
