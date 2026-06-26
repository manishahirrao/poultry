'use client';

import { useState } from 'react';

interface AlertTimelineProps {
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title_hindi: string;
    title_english: string;
    body_hindi: string;
    body_english: string;
    created_at: string;
  }>;
}

export function AlertTimeline({ alerts }: AlertTimelineProps) {
  const [hoveredAlert, setHoveredAlert] = useState<string | null>(null);

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Group alerts by date
  const alertsByDate = new Map<string, typeof alerts>();
  alerts.forEach(alert => {
    const date = new Date(alert.created_at).toDateString();
    if (!alertsByDate.has(date)) {
      alertsByDate.set(date, []);
    }
    alertsByDate.get(date)!.push(alert);
  });

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#D97706';
      case 'low':
        return '#2563EB';
      default:
        return '#5A7A68';
    }
  };

  const getAlertEmoji = (type: string) => {
    switch (type) {
      case 'hpai':
      case 'disease':
        return '🦠';
      case 'weather':
        return '🌡️';
      case 'price_crash':
        return '📉';
      case 'policy':
        return '📋';
      case 'feed_cost':
        return '🌾';
      default:
        return '🔔';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700">7-Day Alert Timeline</h3>
      </div>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200" />
        
        {/* Date Labels and Alert Dots */}
        <div className="flex justify-between relative">
          {last7Days.map((date) => {
            const dateStr = date.toDateString();
            const dayAlerts = alertsByDate.get(dateStr) || [];
            
            return (
              <div key={dateStr} className="flex flex-col items-center">
                {/* Date Label */}
                <div className="text-xs text-neutral-500 mb-2">
                  {formatDate(date)}
                </div>
                
                {/* Alert Dots Container */}
                <div className="relative flex flex-col items-center gap-1">
                  {/* Timeline Dot */}
                  <div className="w-3 h-3 rounded-full bg-neutral-300 relative z-10" />
                  
                  {/* Alert Dots */}
                  {dayAlerts.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2">
                      {dayAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="relative group">
                          <div
                            className="w-2 h-2 rounded-full cursor-pointer hover:scale-125 transition-transform"
                            style={{ backgroundColor: getAlertColor(alert.severity) }}
                            onMouseEnter={() => setHoveredAlert(alert.id)}
                            onMouseLeave={() => setHoveredAlert(null)}
                          />
                          {hoveredAlert === alert.id && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-neutral-900 text-white rounded-lg shadow-lg max-w-xs z-20">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getAlertEmoji(alert.type)}</span>
                                <span className="text-xs font-semibold uppercase">{alert.severity}</span>
                              </div>
                              <p className="text-sm font-medium mb-1">{alert.title_hindi}</p>
                              <p className="text-xs text-neutral-300">{alert.body_hindi}</p>
                              <p className="text-[10px] text-neutral-400 mt-2">
                                {new Date(alert.created_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      {dayAlerts.length > 3 && (
                        <div className="text-[10px] text-neutral-500 font-semibold">
                          +{dayAlerts.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-600" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-600" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-600" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}
