// FlockIQ — Progress Component
// File: apps/web/components/ui/progress.tsx
// Version: v1.0 | May 2026

'use client';

import * as React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}
      {...props}
    >
      <div
        className="h-full bg-green-700 transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  )
);

Progress.displayName = 'Progress';

export { Progress };
