// FlockIQ — Case Study Timeline Component
// File: apps/web/components/case-studies/CaseStudyTimeline.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-03
// Design Reference: 11_industry_pages_components_master.md §2.2

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export type TimelineSignal = 'sell' | 'hold' | 'caution' | 'alert';

export interface TimelineEvent {
  day: number | string;
  title: string;
  description: string;
  signal?: TimelineSignal;
}

export interface CaseStudyTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const SIGNAL_COLOURS: Record<TimelineSignal, string> = {
  sell: 'bg-emerald-100 border-emerald-400',
  hold: 'bg-amber-100 border-amber-400',
  caution: 'bg-red-100 border-red-400',
  alert: 'bg-red-100 border-red-600',
};

export function CaseStudyTimeline({ events, className }: CaseStudyTimelineProps) {
  return (
    <div className={cn('relative my-8', className)}>
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200" />
      <div className="space-y-6">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4 relative">
            {/* Dot */}
            <div className="w-12 h-12 rounded-full bg-brandGreen700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 z-10">
              {typeof event.day === 'number' ? `D${event.day}` : event.day}
            </div>
            {/* Content */}
            <div
              className={cn(
                'flex-1 rounded-xl p-4 border',
                event.signal ? SIGNAL_COLOURS[event.signal] : 'bg-neutral-50 border-neutral-200'
              )}
            >
              <p className="font-semibold text-neutral-900 mb-1">{event.title}</p>
              <p className="text-sm text-neutral-600">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
