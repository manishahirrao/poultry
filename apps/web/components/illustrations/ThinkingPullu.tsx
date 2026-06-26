'use client';

import { PulluCharacter } from './PulluCharacter';

interface ThinkingPulluProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function ThinkingPullu({ size, className, animate }: ThinkingPulluProps) {
  return (
    <PulluCharacter variant="thinking" size={size} className={className} animate={animate} />
  );
}
