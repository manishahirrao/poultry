'use client';

import { PulluCharacter } from './PulluCharacter';

interface HappyPulluProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function HappyPullu({ size, className, animate }: HappyPulluProps) {
  return (
    <PulluCharacter variant="happy" size={size} className={className} animate={animate} />
  );
}
