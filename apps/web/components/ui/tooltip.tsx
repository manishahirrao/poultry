'use client';

import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, side = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-gray-700 bg-white border border-[#E3EDE7] rounded-lg shadow-lg max-w-xs
            ${side === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : ''}
            ${side === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : ''}
            ${side === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : ''}
            ${side === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : ''}
          `}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-white border border-[#E3EDE7] transform rotate-45
              ${side === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0' : ''}
              ${side === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0' : ''}
              ${side === 'left' ? '-right-1 top-1/2 -translate-y-1/2 border-t-0 border-r-0' : ''}
              ${side === 'right' ? '-left-1 top-1/2 -translate-y-1/2 border-t-0 border-l-0' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

export function TooltipContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
