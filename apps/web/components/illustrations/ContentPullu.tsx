'use client';

import { PulluCharacter } from './PulluCharacter';

interface ContentPulluProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function ContentPullu({ size, className, animate }: ContentPulluProps) {
  return (
    <PulluCharacter variant="default" size={size} className={className} animate={animate} />
  );
}
