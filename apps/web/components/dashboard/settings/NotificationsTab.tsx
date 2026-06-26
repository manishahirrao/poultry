'use client';

import { useState } from 'react';

interface NotificationsTabProps {
  customer: any;
}

export function NotificationsTab({ customer }: NotificationsTabProps) {
  const [settings, setSettings] = useState({
    whatsapp_hpai: true,
    whatsapp_weather: true,
    whatsapp_price: true,
    whatsapp_policy: false,
    whatsapp_feed: true,
    whatsapp_subscription: true,
    email_hpai: true,
    email_weather: false,
    email_price: false,
    email_policy: true,
    email_feed: false,
    email_subscription: true,
    inapp_hpai: true,
    inapp_weather: true,
    inapp_price: true,
    inapp_policy: true,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/customers/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const alertTypes = [
    {
      category: 'Disease Alerts',
      icon: '🦠',
      items: [
        { key: 'whatsapp_hpai', label: 'HPAI Alerts', type: 'WhatsApp' },
        { key: 'email_hpai', label: 'HPAI Alerts', type: 'Email' },
        { key: 'inapp_hpai', label: 'HPAI Alerts', type: 'In-App' },
      ],
    },
    {
      category: 'Weather Alerts',
      icon: '🌡️',
      items: [
        { key: 'whatsapp_weather', label: 'Weather Warnings', type: 'WhatsApp' },
        { key: 'email_weather', label: 'Weather Warnings', type: 'Email' },
        { key: 'inapp_weather', label: 'Weather Warnings', type: 'In-App' },
      ],
    },
    {
      category: 'Price Alerts',
      icon: '📉',
      items: [
        { key: 'whatsapp_price', label: 'Price Drop/Spike', type: 'WhatsApp' },
        { key: 'email_price', label: 'Price Drop/Spike', type: 'Email' },
        { key: 'inapp_price', label: 'Price Drop/Spike', type: 'In-App' },
      ],
    },
    {
      category: 'Other',
      icon: '📋',
      items: [
        { key: 'whatsapp_policy', label: 'Policy Updates', type: 'WhatsApp' },
        { key: 'email_policy', label: 'Policy Updates', type: 'Email' },
        { key: 'inapp_policy', label: 'Policy Updates', type: 'In-App' },
        { key: 'whatsapp_feed', label: 'Feed Cost Alerts', type: 'WhatsApp' },
        { key: 'email_feed', label: 'Feed Cost Alerts', type: 'Email' },
        { key: 'whatsapp_subscription', label: 'Subscription Reminders', type: 'WhatsApp' },
        { key: 'email_subscription', label: 'Subscription Reminders', type: 'Email' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">Notification Preferences</h3>

        <div className="space-y-6">
          {alertTypes.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl" aria-hidden="true">{category.icon}</span>
                <h4 className="text-sm font-semibold text-neutral-900">{category.category}</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4 ml-8">
                {category.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">{item.type}</span>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        settings[item.key as keyof typeof settings]
                          ? 'bg-brandGreen700'
                          : 'bg-neutral-200'
                      }`}
                      aria-pressed={settings[item.key as keyof typeof settings]}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          settings[item.key as keyof typeof settings]
                            ? 'translate-x-5'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
