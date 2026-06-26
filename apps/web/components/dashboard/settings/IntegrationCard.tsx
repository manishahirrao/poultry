'use client';

import React from 'react';
import { Link } from '@phosphor-icons/react';
import { FlockIQTokens } from '@/lib/design-tokens';

interface IntegrationAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'disabled';
  statusDetails?: string;
  actions: IntegrationAction[];
  locked?: boolean;
  lockedMessage?: string;
}

export default function IntegrationCard({
  icon,
  name,
  description,
  status,
  statusDetails,
  actions,
  locked = false,
  lockedMessage,
}: IntegrationCardProps) {
  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">Connected</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-600">Not connected</span>
          </div>
        );
      case 'disabled':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-sm font-medium text-gray-400">Disabled</span>
          </div>
        );
    }
  };

  const getCardStyle = () => {
    if (locked) {
      return 'opacity-60 bg-gray-50';
    }
    return 'bg-white';
  };

  return (
    <div className={`border border-[#E3EDE7] rounded-xl p-6 ${getCardStyle()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#EDF7F1] rounded-lg">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-[#1A5C34]">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {getStatusIndicator()}
      </div>

      {/* Status Details */}
      {statusDetails && !locked && (
        <div className="mb-4 p-3 bg-[#F4F7F5] rounded-lg">
          <p className="text-sm text-gray-700">{statusDetails}</p>
        </div>
      )}

      {/* Locked Message */}
      {locked && lockedMessage && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">{lockedMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((action, index) => {
          if (action.href) {
            return (
              <Link
                key={index}
                href={action.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  action.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-[#1A5C34] hover:bg-[#EDF7F1]'
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.label}
              </Link>
            );
          }
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled || locked}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                action.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-[#1A5C34] hover:bg-[#EDF7F1]'
              } ${action.disabled || locked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
