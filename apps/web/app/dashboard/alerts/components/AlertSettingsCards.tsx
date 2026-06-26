'use client';

import { useState, useEffect } from 'react';
import { Check, Spinner, Plus, Lock } from '@phosphor-icons/react';
import { FlockIQTokens } from '@/lib/design-tokens';
import { FeatureGate } from '@/components/plans/FeatureGate';
import { FEATURES } from '@/lib/plans/featureGates';

interface AlertCategorySetting {
  category: 'disease' | 'weather' | 'price' | 'policy';
  label: string;
  emoji: string;
  thresholdLabel: string;
  thresholdValue: number;
  thresholdUnit: string;
  channels: {
    whatsapp: boolean;
    email: boolean;
    inApp: boolean;
  };
  severitySlidersHorizontal: 'high_only' | 'high_and_medium' | 'all';
}

interface AlertSettingsCardsProps {
  initialSettings?: AlertCategorySetting[];
  onFloppyDisk?: (settings: AlertCategorySetting[]) => Promise<void>;
}

const defaultSettings: AlertCategorySetting[] = [
  {
    category: 'disease',
    label: 'Disease Alerts',
    emoji: '🦠',
    thresholdLabel: 'HPAI within',
    thresholdValue: 100,
    thresholdUnit: 'km',
    channels: {
      whatsapp: true,
      email: true,
      inApp: true,
    },
    severitySlidersHorizontal: 'high_and_medium',
  },
  {
    category: 'weather',
    label: 'Weather Alerts',
    emoji: '🌩',
    thresholdLabel: 'Heat wave ≥',
    thresholdValue: 42,
    thresholdUnit: '°C',
    channels: {
      whatsapp: true,
      email: false,
      inApp: true,
    },
    severitySlidersHorizontal: 'high_only',
  },
  {
    category: 'price',
    label: 'Price Alerts',
    emoji: '📉',
    thresholdLabel: 'Price drop >',
    thresholdValue: 10,
    thresholdUnit: '%',
    channels: {
      whatsapp: true,
      email: false,
      inApp: true,
    },
    severitySlidersHorizontal: 'high_and_medium',
  },
  {
    category: 'policy',
    label: 'Policy Alerts',
    emoji: '📋',
    thresholdLabel: 'Price rise >',
    thresholdValue: 8,
    thresholdUnit: '%',
    channels: {
      whatsapp: false,
      email: true,
      inApp: true,
    },
    severitySlidersHorizontal: 'high_only',
  },
];

function ChannelToggle({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
        checked
          ? 'border-[#3DAE72] bg-[#EDF7F1] text-[#1A5C34]'
          : 'border-[#E3EDE7] bg-white text-gray-400 hover:border-[#3DAE72] hover:text-[#1A5C34]'
      }`}
      aria-pressed={checked}
    >
      <div className={`w-4 h-4 rounded border transition-all ${
        checked ? 'bg-[#3DAE72] border-[#3DAE72]' : 'border-gray-300'
      }`}>
        {checked && <Check size={12} className="text-white" weight="bold" />}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function SeverityOption({ 
  value, 
  label, 
  selected, 
  onSelect 
}: { 
  value: string; 
  label: string; 
  selected: boolean; 
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        selected
          ? 'bg-[#1A5C34] text-white'
          : 'bg-white border border-[#E3EDE7] text-gray-600 hover:border-[#1A5C34]'
      }`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export function AlertSettingsCards({ 
  initialSettings = defaultSettings,
  onFloppyDisk 
}: AlertSettingsCardsProps) {
  const [settings, setSettings] = useState<AlertCategorySetting[]>(initialSettings);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const [summaryTime, setSummaryTime] = useState('8:00 AM');
  const [saving, setSaving] = useState(false);
  const [saved, setFloppyDiskd] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial settings from API on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/alerts/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setSettings(data.settings.categories);
            setDailySummaryEnabled(data.settings.dailySummary.enabled);
            setSummaryTime(data.settings.dailySummary.time);
          }
        }
      } catch (error) {
        console.error('Error fetching alert settings:', error);
        // Use default settings on error
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const updateCategory = (index: number, updates: Partial<AlertCategorySetting>) => {
    setSettings(prev => prev.map((s, i) => 
      i === index ? { ...s, ...updates } : s
    ));
  };

  const handleFloppyDisk = async () => {
    setSaving(true);
    setFloppyDiskd(false);

    try {
      // API call to save settings
      const response = await fetch('/api/alerts/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: settings,
          dailySummary: {
            enabled: dailySummaryEnabled,
            time: summaryTime,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      if (onFloppyDisk) {
        await onFloppyDisk(settings);
      }

      setFloppyDiskd(true);
      setTimeout(() => setFloppyDiskd(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error toast (would need toast library integration)
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-[#E3EDE7] rounded-xl p-5 space-y-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting, index) => (
          <div
            key={setting.category}
            className="border border-[#E3EDE7] rounded-xl p-5 space-y-4 bg-white"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{setting.emoji}</span>
              <h3 className="font-semibold text-gray-900">{setting.label}</h3>
            </div>

            {/* Threshold row */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Trigger when:</span>
              <span className="text-gray-900">{setting.thresholdLabel}</span>
              <input
                type="number"
                value={setting.thresholdValue}
                onChange={(e) => updateCategory(index, { 
                  thresholdValue: parseInt(e.target.value) || 0 
                })}
                className="w-16 px-2 py-1 border border-[#CBD5CE] rounded text-center focus:outline-none focus:border-[#1A5C34] focus:ring-1 focus:ring-[#1A5C34]"
                min="0"
              />
              <span className="text-gray-600">{setting.thresholdUnit}</span>
            </div>

            {/* Channel toggles */}
            <div className="flex flex-wrap gap-2">
              <ChannelToggle
                label="WhatsApp"
                checked={setting.channels.whatsapp}
                onChange={(checked) => updateCategory(index, {
                  channels: { ...setting.channels, whatsapp: checked }
                })}
              />
              <ChannelToggle
                label="Email"
                checked={setting.channels.email}
                onChange={(checked) => updateCategory(index, {
                  channels: { ...setting.channels, email: checked }
                })}
              />
              <ChannelToggle
                label="In-App"
                checked={setting.channels.inApp}
                onChange={(checked) => updateCategory(index, {
                  channels: { ...setting.channels, inApp: checked }
                })}
              />
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Severity:</span>
              <div className="flex gap-2">
                <SeverityOption
                  value="high_only"
                  label="HIGH only"
                  selected={setting.severitySlidersHorizontal === 'high_only'}
                  onSelect={() => updateCategory(index, { severitySlidersHorizontal: 'high_only' })}
                />
                <SeverityOption
                  value="high_and_medium"
                  label="HIGH + MEDIUM"
                  selected={setting.severitySlidersHorizontal === 'high_and_medium'}
                  onSelect={() => updateCategory(index, { severitySlidersHorizontal: 'high_and_medium' })}
                />
                <SeverityOption
                  value="all"
                  label="All"
                  selected={setting.severitySlidersHorizontal === 'all'}
                  onSelect={() => updateCategory(index, { severitySlidersHorizontal: 'all' })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Alert Rule (Pro feature) */}
      <FeatureGate feature={FEATURES.CUSTOM_ALERT_RULES} blurChildren>
        <button className="flex items-center gap-2 px-4 py-3 border border-dashed border-[#E3EDE7] rounded-xl text-gray-400 hover:border-[#1A5C34] hover:text-[#1A5C34] transition-all">
          <Plus size={16} />
          <span className="text-sm font-medium">Add Custom Alert Rule</span>
        </button>
      </FeatureGate>

      {/* Daily Summary Toggle */}
      <div className="border border-[#E3EDE7] rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Daily Summary</h3>
            <p className="text-sm text-gray-500">
              Single daily digest: today's price + farm status + pending actions
            </p>
          </div>
          <button
            onClick={() => setDailySummaryEnabled(!dailySummaryEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              dailySummaryEnabled ? 'bg-[#3DAE72]' : 'bg-gray-200'
            }`}
            aria-pressed={dailySummaryEnabled}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                dailySummaryEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {dailySummaryEnabled && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-600">Send at:</span>
            <select
              value={summaryTime}
              onChange={(e) => setSummaryTime(e.target.value)}
              className="px-3 py-2 border border-[#CBD5CE] rounded-lg focus:outline-none focus:border-[#1A5C34] focus:ring-1 focus:ring-[#1A5C34]"
            >
              <option value="6:00 AM">6:00 AM</option>
              <option value="7:00 AM">7:00 AM</option>
              <option value="8:00 AM">8:00 AM</option>
            </select>
          </div>
        )}
      </div>

      {/* FloppyDisk Button */}
      <div className="flex justify-end">
        <button
          onClick={handleFloppyDisk}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A5C34] text-white rounded-lg text-sm font-semibold hover:bg-[#1F7040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Spinner size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              FloppyDiskd
            </>
          ) : (
            'FloppyDisk Preferences'
          )}
        </button>
      </div>
    </div>
  );
}
