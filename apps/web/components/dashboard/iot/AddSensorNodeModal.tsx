'use client';

import { useState } from 'react';
import { X, Wifi, QrCode, CheckCircle, AlertCircle } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

interface AddSensorNodeModalProps {
  isOpen: boolean;
  farmId: string;
  farmName: string;
  sheds: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: (deviceUuid: string) => void;
}

type Step = 'enter_uuid' | 'assign_shed' | 'success' | 'error';

export function AddSensorNodeModal({
  isOpen,
  farmId,
  farmName,
  sheds,
  onClose,
  onSuccess,
}: AddSensorNodeModalProps) {
  const [step, setStep] = useState<Step>('enter_uuid');
  const [deviceUuid, setDeviceUuid] = useState('');
  const [label, setLabel] = useState('');
  const [selectedShedId, setSelectedShedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!deviceUuid.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_uuid: deviceUuid.trim(),
          farm_id: farmId,
          shed_id: selectedShedId || undefined,
          label: label.trim() || undefined,
        }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Registration failed');
      }

      setStep('success');
      onSuccess(deviceUuid.trim());

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setStep('enter_uuid');
    setDeviceUuid('');
    setLabel('');
    setSelectedShedId('');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-neutral-150">
          <div>
            <h2 id="modal-title" className="font-jakarta font-semibold text-neutral-900 text-[17px]">
              Add Sensor Node
            </h2>
            <p className="font-jakarta text-neutral-500 text-sm mt-0.5">{farmName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-500 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {(step === 'enter_uuid' || step === 'error') && (
            <div className="space-y-5">
              {/* Instructions */}
              <div className="bg-brand-50 rounded-xl p-4 text-sm font-jakarta text-brand-700">
                <p className="font-semibold mb-1">Find the Device ID on your sensor node:</p>
                <ul className="list-disc list-inside space-y-1 text-brand-600">
                  <li>Printed on the label on top of the device</li>
                  <li>Or scan the QR code on the device</li>
                  <li>Format: alphanumeric, e.g. <code className="font-mono bg-brand-100 px-1 rounded">node-9843-ax89</code></li>
                </ul>
              </div>

              {/* Device UUID input */}
              <div>
                <label className="block font-jakarta font-semibold text-neutral-700 text-sm mb-1.5">
                  Device ID *
                </label>
                <input
                  type="text"
                  value={deviceUuid}
                  onChange={(e) => setDeviceUuid(e.target.value.trim())}
                  placeholder="e.g. node-9843-ax89"
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                  autoFocus
                />
              </div>

              {/* Label */}
              <div>
                <label className="block font-jakarta font-semibold text-neutral-700 text-sm mb-1.5">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Shed A — Node 1"
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-jakarta text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>

              {/* Shed selector */}
              {sheds.length > 0 && (
                <div>
                  <label className="block font-jakarta font-semibold text-neutral-700 text-sm mb-1.5">
                    Assign to shed
                  </label>
                  <select
                    value={selectedShedId}
                    onChange={(e) => setSelectedShedId(e.target.value)}
                    className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-jakarta text-sm text-neutral-900 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                  >
                    <option value="">— Not assigned —</option>
                    {sheds.map((shed) => (
                      <option key={shed.id} value={shed.id}>{shed.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error message */}
              {step === 'error' && errorMessage && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-brand-400 mx-auto mb-4" />
              <h3 className="font-jakarta font-semibold text-neutral-900 text-lg mb-2">
                Device Registered
              </h3>
              <p className="font-jakarta text-neutral-600 text-sm mb-1">
                <code className="font-mono bg-neutral-100 px-2 py-0.5 rounded">{deviceUuid}</code>
              </p>
              <p className="font-jakarta text-neutral-500 text-sm mt-3">
                Power on the sensor node. It will connect automatically and start
                sending readings within 2 minutes.
              </p>
              <div className="mt-5 bg-brand-50 rounded-xl p-4 text-sm font-jakarta text-brand-700 flex items-start gap-2">
                <Wifi size={16} className="flex-shrink-0 mt-0.5" />
                <p>Status will change from <strong>Pending</strong> to <strong>Active</strong>
                when the first reading arrives.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-neutral-150 flex gap-3">
          {step !== 'success' ? (
            <>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl border border-neutral-200 font-jakarta font-semibold text-[15px] text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={isLoading || !deviceUuid.trim()}
                className="flex-1 h-11 rounded-xl bg-brand-700 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed font-jakarta font-semibold text-[15px] text-white transition-colors"
              >
                {isLoading ? 'Registering...' : 'Register Device'}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full h-11 rounded-xl bg-brand-700 font-jakarta font-semibold text-[15px] text-white hover:bg-brand-600 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
