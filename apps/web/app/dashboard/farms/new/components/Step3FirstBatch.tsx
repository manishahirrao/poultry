'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WhatsappLogo as WhatsAppIcon } from '@phosphor-icons/react';

interface Step3FirstBatchProps {
  formData: {
    setupBatch: boolean;
    breed: string;
    docSupplier: string;
    placementDate: string;
    chicksPlaced: string;
    pricePerDoc: string;
    targetHarvestAge: string;
    targetMarketWeight: string;
    feedSupplier: string;
    batchNotes: string;
    whatsappSetup?: 'yes' | 'no' | '';
    whatsappNumber?: string;
    whatsappReminderHour?: string;
    whatsappLanguage?: string;
  };
  onFormDataChange: (field: string, value: any) => void;
}

const breedGrowthData: Record<string, number[]> = {
  'Ross 308': [0, 45, 125, 250, 400, 600, 850, 1100, 1350, 1600, 1850, 2100],
  'Cobb 430': [0, 42, 120, 245, 395, 590, 840, 1095, 1345, 1590, 1840, 2090],
  'Hubbard': [0, 40, 115, 235, 380, 570, 820, 1070, 1320, 1570, 1820, 2070],
  'Vencobb': [0, 48, 130, 260, 415, 620, 870, 1120, 1370, 1620, 1870, 2120],
};

export default function Step3FirstBatch({ formData, onFormDataChange }: Step3FirstBatchProps) {
  const [waSetup, setWaSetup] = useState<'yes' | 'no' | ''>(formData.whatsappSetup || '');

  const handleWaSetupChange = (value: 'yes' | 'no') => {
    setWaSetup(value);
    onFormDataChange('whatsappSetup', value);
  };

  const selectedBreed = formData.breed;
  const growthData = selectedBreed && breedGrowthData[selectedBreed] 
    ? breedGrowthData[selectedBreed].map((w, i) => ({ day: i * 4, weight: w }))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">First Batch Setup</h2>
      
      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.setupBatch}
            onChange={(e) => onFormDataChange('setupBatch', e.target.checked)}
            className="w-5 h-5 text-green-600 rounded"
          />
          <span className="text-sm font-semibold text-gray-700">पहला Batch अभी setup करें?</span>
        </label>
      </div>

      {formData.setupBatch && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Breed <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.breed}
              onChange={(e) => onFormDataChange('breed', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select breed</option>
              <option value="Cobb 430">Cobb 430</option>
              <option value="Ross 308">Ross 308</option>
              <option value="Hubbard">Hubbard</option>
              <option value="Vencobb">Vencobb</option>
              <option value="Srinivasa">Srinivasa</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Breed Growth Chart Preview */}
          {selectedBreed && breedGrowthData[selectedBreed] && (
            <div className="mt-4 p-4 bg-[#F4F7F5] rounded-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {selectedBreed} — Standard Growth Curve
              </p>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={growthData}>
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#1A5C34" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                    tickLine={false} 
                    axisLine={false} 
                    width={36}
                    tickFormatter={(v) => `${v}g`} 
                  />
                  <Tooltip formatter={(v) => [`${v}g`, 'Target weight']} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-1">
                Target harvest: {breedGrowthData[selectedBreed][10]}g at Day ~40 ({selectedBreed} standard)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              DOC Supplier
            </label>
            <input
              type="text"
              value={formData.docSupplier}
              onChange={(e) => onFormDataChange('docSupplier', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Placement Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.placementDate}
              onChange={(e) => onFormDataChange('placementDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chicks Placed <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={formData.chicksPlaced}
              onChange={(e) => onFormDataChange('chicksPlaced', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter number of chicks"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per DOC (₹)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="0.01"
                value={formData.pricePerDoc}
                onChange={(e) => onFormDataChange('pricePerDoc', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Harvest Age (days)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={formData.targetHarvestAge}
                onChange={(e) => onFormDataChange('targetHarvestAge', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Market Weight (grams)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={formData.targetMarketWeight}
                onChange={(e) => onFormDataChange('targetMarketWeight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feed Supplier
              </label>
              <input
                type="text"
                value={formData.feedSupplier}
                onChange={(e) => onFormDataChange('feedSupplier', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Batch Notes
            </label>
            <textarea
              value={formData.batchNotes}
              onChange={(e) => onFormDataChange('batchNotes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={3}
              placeholder="Any notes about this batch..."
            />
          </div>

          {/* WhatsApp Daily Log Setup */}
          <div className="mt-6 border border-[#E3EDE7] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#ECF8F1] flex items-center justify-center">
                <WhatsAppIcon size={18} color="#25D366" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">WhatsApp Daily Log</h3>
                <p className="text-xs text-gray-500">Automate data collection — farmer replies via WhatsApp</p>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleWaSetupChange('yes')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  waSetup === 'yes'
                    ? 'bg-[#EDF7F1] border-[#3DAE72] text-[#1A5C34]'
                    : 'border-[#E3EDE7] text-gray-600 hover:bg-gray-50'
                }`}
              >
                ✓ Yes, set up WhatsApp log
              </button>
              <button
                type="button"
                onClick={() => handleWaSetupChange('no')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  waSetup === 'no'
                    ? 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'border-[#E3EDE7] text-gray-600 hover:bg-gray-50'
                }`}
              >
                Enter logs manually
              </button>
            </div>

            {waSetup === 'yes' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Farmer's WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-[#F4F7F5] border border-[#CBD5CE] rounded-lg text-sm text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={formData.whatsappNumber || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 10) {
                          onFormDataChange('whatsappNumber', value);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-[#CBD5CE] rounded-lg text-sm focus:outline-none focus:border-[#1A5C34]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Reminder Time</label>
                    <select
                      className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg text-sm focus:outline-none focus:border-[#1A5C34]"
                      value={formData.whatsappReminderHour || '18'}
                      onChange={(e) => onFormDataChange('whatsappReminderHour', e.target.value)}
                    >
                      <option value="17">5:00 PM</option>
                      <option value="18">6:00 PM (Recommended)</option>
                      <option value="19">7:00 PM</option>
                      <option value="20">8:00 PM</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
                    <select
                      className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg text-sm focus:outline-none focus:border-[#1A5C34]"
                      value={formData.whatsappLanguage || 'hindi'}
                      onChange={(e) => onFormDataChange('whatsappLanguage', e.target.value)}
                    >
                      <option value="hindi">हिंदी (Hindi)</option>
                      <option value="english">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
