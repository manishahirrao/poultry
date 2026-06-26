'use client';

import { useState } from 'react';
import { User, Phone, MapPin, Globe } from '@phosphor-icons/react';

interface ProfileTabProps {
  customer: any;
}

export function ProfileTab({ customer }: ProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    district: customer?.district || '',
    language: customer?.language || 'hi',
  });

  const handleSave = async () => {
    try {
      await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-neutral-900">Profile Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brandGreen700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {formData.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen500"
                />
              ) : (
                <div className="text-lg font-semibold text-neutral-900">{formData.name}</div>
              )}
              <div className="text-sm text-neutral-500">{customer?.plan} Plan</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-neutral-400" />
              <div>
                <div className="text-xs text-neutral-500">Phone</div>
                <div className="text-sm font-semibold text-neutral-900">{formData.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-neutral-400" />
              <div>
                <div className="text-xs text-neutral-500">District</div>
                <div className="text-sm font-semibold text-neutral-900 capitalize">{formData.district}</div>
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Language Preference */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Language Preference</h3>
        
        <div className="flex gap-3">
          <button
            onClick={() => handleLanguageChange('hi')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
              formData.language === 'hi'
                ? 'border-brandGreen700 bg-brandGreen50 text-brandGreen800'
                : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
              formData.language === 'en'
                ? 'border-brandGreen700 bg-brandGreen50 text-brandGreen800'
                : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
            }`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
}
