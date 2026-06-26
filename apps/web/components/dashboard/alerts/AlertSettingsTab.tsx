'use client';

import { AlertSettingsCards } from '@/app/dashboard/alerts/components/AlertSettingsCards';

export function AlertSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Alert Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure how you want to receive alerts for each category
        </p>
      </div>
      
      <AlertSettingsCards />
    </div>
  );
}
