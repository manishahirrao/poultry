import { ReactNode } from 'react';
import { Sparkle } from '@phosphor-icons/react/dist/ssr';

interface ComingSoonOverlayProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ComingSoonOverlay({ 
  children, 
  title = 'Coming in Phase 2', 
  description = 'Our AI models are currently training for your district to provide accurate forecasts and signals.' 
}: ComingSoonOverlayProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl h-full w-full border border-neutral-200">
      <div className="blur-md opacity-20 pointer-events-none select-none transition-all duration-300 h-full w-full">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-white/80 backdrop-blur-sm">
        <div className="bg-brand-100 text-brand-700 px-4 py-2 rounded-full font-semibold text-sm mb-3 shadow-sm border border-brand-200 flex items-center gap-2">
          <Sparkle size={16} weight="fill" />
          {title}
        </div>
        <p className="text-neutral-800 font-medium text-sm max-w-[280px] bg-white/90 px-4 py-2 rounded-lg shadow-sm border border-neutral-100">
          {description}
        </p>
      </div>
    </div>
  );
}
