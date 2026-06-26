'use client';

import { CheckCircle, XCircle, ArrowUUpLeft, Calendar } from '@phosphor-icons/react';

interface ModelTimelineData {
  version: string;
  mape: number;
  directionalAccuracy: number;
  date: string;
  status: 'promoted' | 'rejected' | 'rollback';
}

interface ModelTimelineProps {
  data: ModelTimelineData[];
  isLoading?: boolean;
}

export function ModelTimeline({ data, isLoading }: ModelTimelineProps) {
  if (isLoading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'promoted':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Promoted',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          label: 'Rejected',
        };
      case 'rollback':
        return {
          icon: ArrowUUpLeft,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Rollback',
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-neutral-600',
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          label: 'Unknown',
        };
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const config = getStatusConfig(item.status);
        const StatusIcon = config.icon;

        return (
          <div
            key={item.version}
            className={`flex items-start gap-4 p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
              <StatusIcon size={20} weight="bold" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-neutral-900">{item.version}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(item.date)}</span>
                </div>
                <span>MAPE: {item.mape.toFixed(2)}%</span>
                <span>Dir. Acc: {item.directionalAccuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
