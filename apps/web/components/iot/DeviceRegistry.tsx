'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Plus, Pencil, Trash, CheckCircle, WarningCircle, WifiHigh, WifiSlash, Gear } from '@phosphor-icons/react';
import { Toast } from '@/components/ui/Toast';

interface IoTDevice {
  id: string;
  device_name: string;
  device_type: 'environment_sensor' | 'auto_weighing_scale' | 'water_meter' | 'feed_silo_sensor';
  manufacturer: string;
  model: string;
  serial_number: string;
  shed_id: string;
  api_key: string;
  reporting_interval_minutes: number;
  last_reading_at: string | null;
  status: 'online' | 'offline' | 'error';
  settings: Record<string, any>;
}

interface DeviceFormData {
  device_name: string;
  device_type: IoTDevice['device_type'];
  manufacturer: string;
  model: string;
  serial_number: string;
  shed_id: string;
  reporting_interval_minutes: number;
}

interface DeviceRegistryProps {
  shedId?: string;
  onDeviceSelect?: (device: IoTDevice) => void;
}

export default function DeviceRegistry({ shedId, onDeviceSelect }: DeviceRegistryProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  // State
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<IoTDevice | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Form state
  const [formData, setFormData] = useState<DeviceFormData>({
    device_name: '',
    device_type: 'environment_sensor',
    manufacturer: '',
    model: '',
    serial_number: '',
    shed_id: shedId || 'Shed 1',
    reporting_interval_minutes: 15,
  });

  // Load devices on mount
  useEffect(() => {
    loadDevices();
  }, [shedId]);

  const loadDevices = async () => {
    if (!supabase) {
      console.warn('[DeviceRegistry] Supabase not configured, skipping device load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('iot_devices')
        .select('*')
        .eq('customer_id', user.id);

      if (shedId) {
        query = query.eq('shed_id', shedId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
      setError('Failed to load IoT devices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!supabase) {
      showToastMessage('Supabase not configured. Cannot add device.', 'error');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('iot_devices')
        .insert({
          customer_id: user.id,
          device_name: formData.device_name,
          device_type: formData.device_type,
          manufacturer: formData.manufacturer,
          model: formData.model,
          serial_number: formData.serial_number,
          shed_id: formData.shed_id,
          reporting_interval_minutes: formData.reporting_interval_minutes,
          api_key: `pp_iot_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        })
        .select()
        .single();

      if (error) throw error;

      setDevices(prev => [data, ...prev]);
      setShowAddForm(false);
      resetForm();
      showToastMessage('Device added successfully', 'success');
    } catch (err) {
      console.error('Failed to add device:', err);
      showToastMessage('Failed to add device', 'error');
    }
  };

  const handleUpdateDevice = async () => {
    if (!editingDevice) return;

    if (!supabase) {
      showToastMessage('Supabase not configured. Cannot update device.', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .update({
          device_name: formData.device_name,
          device_type: formData.device_type,
          manufacturer: formData.manufacturer,
          model: formData.model,
          serial_number: formData.serial_number,
          shed_id: formData.shed_id,
          reporting_interval_minutes: formData.reporting_interval_minutes,
        })
        .eq('id', editingDevice.id)
        .select()
        .single();

      if (error) throw error;

      setDevices(prev => prev.map(d => d.id === data.id ? data : d));
      setEditingDevice(null);
      setShowAddForm(false);
      resetForm();
      showToastMessage('Device updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update device:', err);
      showToastMessage('Failed to update device', 'error');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    if (!supabase) {
      showToastMessage('Supabase not configured. Cannot delete device.', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('iot_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(prev => prev.filter(d => d.id !== deviceId));
      showToastMessage('Device deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete device:', err);
      showToastMessage('Failed to delete device', 'error');
    }
  };

  const handleEditClick = (device: IoTDevice) => {
    setEditingDevice(device);
    setFormData({
      device_name: device.device_name,
      device_type: device.device_type,
      manufacturer: device.manufacturer,
      model: device.model,
      serial_number: device.serial_number,
      shed_id: device.shed_id,
      reporting_interval_minutes: device.reporting_interval_minutes,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      device_name: '',
      device_type: 'environment_sensor',
      manufacturer: '',
      model: '',
      serial_number: '',
      shed_id: shedId || 'Shed 1',
      reporting_interval_minutes: 15,
    });
    setEditingDevice(null);
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getDeviceTypeLabel = (type: IoTDevice['device_type']) => {
    const labels = {
      environment_sensor: 'Environment Sensor',
      auto_weighing_scale: 'Auto-Weighing Scale',
      water_meter: 'Water Meter',
      feed_silo_sensor: 'Feed Silo Sensor',
    };
    return labels[type];
  };

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatLastReading = (date: string | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const readingDate = new Date(date);
    const diffMs = now.getTime() - readingDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IoT Devices</h2>
          <p className="text-gray-600 mt-1">Manage your connected sensors and devices</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Add Device
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <WarningCircle className="text-red-600" size={20} />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Device list */}
      <div className="grid gap-4">
        {devices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Gear size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No IoT devices registered</p>
            <p className="text-sm mt-1">Add your first device to start monitoring</p>
          </div>
        ) : (
          devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{device.device_name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(device.status)}`}>
                      {device.status === 'online' ? (
                        <span className="flex items-center gap-1">
                          <WifiHigh size={12} />
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <WifiSlash size={12} />
                          Offline
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {getDeviceTypeLabel(device.device_type)}
                    </div>
                    <div>
                      <span className="font-medium">Shed:</span> {device.shed_id}
                    </div>
                    <div>
                      <span className="font-medium">Manufacturer:</span> {device.manufacturer || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Model:</span> {device.model || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Last Reading:</span> {formatLastReading(device.last_reading_at)}
                    </div>
                    <div>
                      <span className="font-medium">API Key:</span> {device.api_key.substring(0, 12)}...
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      if (onDeviceSelect) onDeviceSelect(device);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Gear size={20} />
                  </button>
                  <button
                    onClick={() => handleEditClick(device)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingDevice ? 'Edit Device' : 'Add New Device'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value={formData.device_name}
                  onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Shed 3 Environment Sensor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <select
                  value={formData.device_type}
                  onChange={(e) => setFormData({ ...formData, device_type: e.target.value as IoTDevice['device_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="environment_sensor">Environment Sensor</option>
                  <option value="auto_weighing_scale">Auto-Weighing Scale</option>
                  <option value="water_meter">Water Meter</option>
                  <option value="feed_silo_sensor">Feed Silo Sensor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shed ID</label>
                <input
                  type="text"
                  value={formData.shed_id}
                  onChange={(e) => setFormData({ ...formData, shed_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Shed 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., SenseTech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., EnvMonitor Pro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., ST-ENV-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Interval (minutes)</label>
                <input
                  type="number"
                  value={formData.reporting_interval_minutes}
                  onChange={(e) => setFormData({ ...formData, reporting_interval_minutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  min="1"
                  max="1440"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingDevice ? handleUpdateDevice : handleAddDevice}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {editingDevice ? 'Update' : 'Add Device'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
