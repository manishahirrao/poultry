'use client';

import { useState, useRef } from 'react';
import { MapPin, Upload, X, Check } from '@phosphor-icons/react';
import Image from 'next/image';

interface Step1FarmInfoProps {
  formData: {
    farmName: string;
    farmType: 'broiler' | 'layer' | 'breeder';
    state: string;
    district: string;
    block: string;
    village: string;
    latitude: string;
    longitude: string;
    primaryMandi?: string;
    managerName: string;
    managerPhone: string;
    photoUrl?: string;
  };
  onFormDataChange: (field: string, value: any) => void;
}

interface NearestMandi {
  name: string;
  distanceKm: number;
}

export default function Step1FarmInfo({ formData, onFormDataChange }: Step1FarmInfoProps) {
  const [nearestMandi, setNearestMandi] = useState<NearestMandi | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(formData.photoUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGPS = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          onFormDataChange('latitude', lat.toString());
          onFormDataChange('longitude', lng.toString());

          // Find nearest mandi from our covered list
          try {
            const res = await fetch(`/api/mandis/nearest?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const data = await res.json();
              setNearestMandi(data); // { name: 'Gorakhpur', distanceKm: 12 }
            }
          } catch (error) {
            console.error('Failed to fetch nearest mandi:', error);
          }
        },
        (error) => {
          console.error('GPS error:', error);
          alert('Unable to get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleUseMandi = (mandiName: string) => {
    onFormDataChange('primaryMandi', mandiName);
  };

  const handlePhotoUpload = async (file: File | undefined) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large, max 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/farms/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await res.json();
      setPhotoPreview(data.photoUrl);
      onFormDataChange('photoUrl', data.photoUrl);
    } catch (error) {
      console.error('Photo upload error:', error);
      setUploadError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    onFormDataChange('photoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handlePhotoUpload(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Farm Information</h2>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Farm Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.farmName}
          onChange={(e) => onFormDataChange('farmName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter farm name"
          maxLength={60}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Farm Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {(['broiler', 'layer', 'breeder'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="farmType"
                value={type}
                checked={formData.farmType === type}
                onChange={(e) => onFormDataChange('farmType', e.target.value as any)}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.state}
            onChange={(e) => onFormDataChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => onFormDataChange('district', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter district"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Block / Tehsil
          </label>
          <input
            type="text"
            value={formData.block}
            onChange={(e) => onFormDataChange('block', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter block/tehsil"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Village
          </label>
          <input
            type="text"
            value={formData.village}
            onChange={(e) => onFormDataChange('village', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter village"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          GPS Coordinates
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGPS}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MapPin size={20} />
            Use My Location
          </button>
          <input
            type="text"
            value={formData.latitude || ''}
            onChange={(e) => onFormDataChange('latitude', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Latitude"
          />
          <input
            type="text"
            value={formData.longitude || ''}
            onChange={(e) => onFormDataChange('longitude', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Longitude"
          />
        </div>

        {/* Nearest Mandi Suggestion */}
        {nearestMandi && (
          <div className="mt-3 p-3 bg-[#EDF7F1] rounded-lg border border-[#3DAE72] flex items-center justify-between">
            <p className="text-sm">
              Nearest mandi: <strong>{nearestMandi.name}</strong> ({nearestMandi.distanceKm} km)
            </p>
            <button
              type="button"
              onClick={() => handleUseMandi(nearestMandi.name)}
              className="text-sm text-[#1A5C34] font-semibold hover:underline flex items-center gap-1"
            >
              Use {nearestMandi.name} <Check size={16} weight="bold" />
            </button>
          </div>
        )}

        {/* Primary Mandi Display */}
        {formData.primaryMandi && (
          <div className="mt-2 text-sm text-gray-600">
            Primary mandi: <span className="font-semibold text-[#1A5C34]">{formData.primaryMandi}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Farm Manager Name
          </label>
          <input
            type="text"
            value={formData.managerName}
            onChange={(e) => onFormDataChange('managerName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Manager name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Farm Manager Phone
          </label>
          <input
            type="tel"
            value={formData.managerPhone}
            onChange={(e) => onFormDataChange('managerPhone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* Farm Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Farm Photo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div
          className="border-2 border-dashed border-[#CBD5CE] rounded-xl p-6 text-center
                     hover:border-[#3DAE72] transition-colors cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt={`Farm photo preview for ${formData.farmName || 'new farm'}`} className="w-full max-h-40 object-cover rounded-lg" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="py-4">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-[#3DAE72] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
                </>
              )}
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
        />
        {uploadError && (
          <p className="text-xs text-red-600 mt-1">{uploadError}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Max 5MB · JPEG, PNG, or WebP</p>
      </div>
    </div>
  );
}
