'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Camera, Send, X, Check, TrendingUp } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface Farm {
  id: string;
  farm_name: string;
  farmer_name: string;
  village: string;
}

interface Batch {
  id: string;
  batch_number: string;
  placement_date: string;
  birds_placed: number;
  breed: string;
  target_gc: number;
}

interface SupervisorReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SupervisorReportForm({ onSuccess, onCancel }: SupervisorReportFormProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [showBodyWeightForm, setShowBodyWeightForm] = useState(false);
  
  const [formData, setFormData] = useState({
    farm_id: '',
    batch_id: '',
    visit_date: format(new Date(), 'yyyy-MM-dd'),
    visit_time: format(new Date(), 'HH:mm'),
    purpose: 'routine',
    flock_condition: 'fair',
    mortality_today: 0,
    water_ok: true,
    ventilation_ok: true,
    feed_present_days: 0,
    health_observation: '',
    action_taken: '',
    // Body weight fields
    sample_birds_weighed: 0,
    total_sample_weight_kg: 0
  });

  const [avgWeight, setAvgWeight] = useState(0);
  const [weightDelta, setWeightDelta] = useState(0);
  const [targetWeight, setTargetWeight] = useState(0);

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (formData.farm_id) {
      fetchBatches(formData.farm_id);
    }
  }, [formData.farm_id]);

  useEffect(() => {
    if (formData.sample_birds_weighed > 0 && formData.total_sample_weight_kg > 0) {
      const avg = (formData.total_sample_weight_kg * 1000) / formData.sample_birds_weighed;
      setAvgWeight(avg);
    }
  }, [formData.sample_birds_weighed, formData.total_sample_weight_kg]);

  useEffect(() => {
    if (formData.batch_id && batches.length > 0) {
      const batch = batches.find(b => b.id === formData.batch_id);
      if (batch) {
        setTargetWeight(batch.target_gc);
        const delta = avgWeight - batch.target_gc;
        setWeightDelta(delta);
      }
    }
  }, [formData.batch_id, avgWeight, batches]);

  const fetchFarms = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farms')
        .select('id, farm_name, farmer_name, village')
        .eq('integrator_id', user.id)
        .eq('status', 'active')
        .order('farm_name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      // Silently handle error - farms will remain empty
    }
  };

  const fetchBatches = async (farmId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, batch_number, placement_date, birds_placed, breed, target_gc')
        .eq('farm_id', farmId)
        .eq('status', 'active')
        .order('placement_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      // Silently handle error - batches will remain empty
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          alert('Unable to get location. Please enable GPS.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 3) {
      alert('Maximum 3 photos allowed');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload photos to Supabase Storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${Date.now()}_${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('supervisor-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;
        photoUrls.push(uploadData.path);
      }

      // Create supervisor visit record via API
      const response = await fetch('/api/broiler/supervisor-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farm_id: formData.farm_id,
          batch_id: formData.batch_id,
          visit_date: formData.visit_date,
          visit_time: formData.visit_time,
          purpose: formData.purpose,
          flock_condition: formData.flock_condition,
          mortality_today: formData.mortality_today,
          water_ok: formData.water_ok,
          ventilation_ok: formData.ventilation_ok,
          feed_present_days: formData.feed_present_days,
          health_observation: formData.health_observation,
          action_taken: formData.action_taken,
          sample_birds_weighed: showBodyWeightForm ? formData.sample_birds_weighed : null,
          total_sample_weight_kg: showBodyWeightForm ? formData.total_sample_weight_kg : null,
          lat: gpsLocation?.lat,
          lng: gpsLocation?.lng,
          photos_count: photoUrls.length
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      // Reset form
      setFormData({
        farm_id: '',
        batch_id: '',
        visit_date: format(new Date(), 'yyyy-MM-dd'),
        visit_time: format(new Date(), 'HH:mm'),
        purpose: 'routine',
        flock_condition: 'fair',
        mortality_today: 0,
        water_ok: true,
        ventilation_ok: true,
        feed_present_days: 0,
        health_observation: '',
        action_taken: '',
        sample_birds_weighed: 0,
        total_sample_weight_kg: 0
      });
      setPhotos([]);
      setGpsLocation(null);
      setShowBodyWeightForm(false);
      
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    if (condition === 'excellent' || condition === 'good') return 'bg-[#3DAE72] text-white';
    if (condition === 'fair') return 'bg-[#D97706] text-white';
    return 'bg-[#DC2626] text-white';
  };

  const getWeightDeltaColor = () => {
    if (weightDelta > 0) return 'text-[#3DAE72]';
    if (weightDelta < 0) return 'text-[#DC2626]';
    return 'text-[#6B7280]';
  };

  return (
    <div className="space-y-8">
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50 px-5 py-5 sm:px-8 sm:py-6">
          <CardTitle className="text-[#111827] text-xl sm:text-2xl font-bold tracking-tight">
            New Supervisor Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Farm & Batch Selection */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest">Farm & Batch</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="farm" className="text-sm font-semibold text-[#111827]">Farm</Label>
                  <Select
                    value={formData.farm_id}
                    onValueChange={(value) => setFormData({ ...formData, farm_id: value, batch_id: '' })}
                    required
                  >
                    <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-12">
                      <SelectValue placeholder="Select farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id} className="text-[#111827]">
                          {farm.farm_name} ({farm.farmer_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="batch" className="text-sm font-semibold text-[#111827]">Batch</Label>
                  <Select
                    value={formData.batch_id}
                    onValueChange={(value) => setFormData({ ...formData, batch_id: value })}
                    required
                    disabled={!formData.farm_id}
                  >
                    <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-12">
                      <SelectValue placeholder={formData.farm_id ? "Select batch" : "Select farm first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id} className="text-[#111827]">
                          {batch.batch_number} - {batch.breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visit Details */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest">Visit Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="visitDate" className="text-sm font-semibold text-[#111827]">Visit Date</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    required
                    className="border-[#E3EDE7] text-[#111827] h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="visitTime" className="text-sm font-semibold text-[#111827]">Visit Time</Label>
                  <Input
                    id="visitTime"
                    type="time"
                    value={formData.visit_time}
                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    required
                    className="border-[#E3EDE7] text-[#111827] h-12"
                  />
                </div>

                <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="purpose" className="text-sm font-semibold text-[#111827]">Purpose</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => {
                      setFormData({ ...formData, purpose: value });
                      setShowBodyWeightForm(value === 'body_weight');
                    }}
                    required
                  >
                    <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-12">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine" className="text-[#111827]">Routine Visit</SelectItem>
                      <SelectItem value="body_weight" className="text-[#111827]">Body Weight Check</SelectItem>
                      <SelectItem value="vaccination" className="text-[#111827]">Vaccination</SelectItem>
                      <SelectItem value="treatment" className="text-[#111827]">Treatment</SelectItem>
                      <SelectItem value="other" className="text-[#111827]">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Flock Condition */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest">Flock Condition</h3>
              <div className="bg-[#EDF7F1] rounded-xl p-6 border border-[#E3EDE7]">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-[#111827]">Condition Rating</Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'critical', label: '1' },
                        { value: 'poor', label: '2' },
                        { value: 'fair', label: '3' },
                        { value: 'good', label: '4' },
                        { value: 'excellent', label: '5' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData({ ...formData, flock_condition: value })}
                          className={`flex-1 py-4 min-h-[56px] rounded-lg font-semibold transition-all duration-200 text-base ${
                            formData.flock_condition === value
                              ? getConditionColor(value)
                              : 'bg-white border-2 border-[#E3EDE7] text-[#6B7280] hover:border-[#3DAE72] hover:bg-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">
                      1 = Critical, 2 = Poor, 3 = Fair, 4 = Good, 5 = Excellent
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-3">
                      <Label htmlFor="deathsToday" className="text-sm font-semibold text-[#111827]">Deaths Today</Label>
                      <Input
                        id="deathsToday"
                        type="number"
                        value={formData.mortality_today || ''}
                        onChange={(e) => setFormData({ ...formData, mortality_today: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="border-[#E3EDE7] text-[#111827] h-12"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-[#111827]">Water Supply</Label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, water_ok: !formData.water_ok })}
                        className={`w-full py-4 min-h-[56px] rounded-lg font-semibold transition-all duration-200 text-base ${
                          formData.water_ok
                            ? 'bg-[#3DAE72] text-white hover:bg-[#2E8B57]'
                            : 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                        }`}
                      >
                        {formData.water_ok ? 'OK' : 'Issue'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-[#111827]">Ventilation</Label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ventilation_ok: !formData.ventilation_ok })}
                        className={`w-full py-4 min-h-[56px] rounded-lg font-semibold transition-all duration-200 text-base ${
                          formData.ventilation_ok
                            ? 'bg-[#3DAE72] text-white hover:bg-[#2E8B57]'
                            : 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                        }`}
                      >
                        {formData.ventilation_ok ? 'OK' : 'Issue'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="feedRemaining" className="text-sm font-semibold text-[#111827]">Feed Remaining (Days)</Label>
                    <Input
                      id="feedRemaining"
                      type="number"
                      value={formData.feed_present_days || ''}
                      onChange={(e) => setFormData({ ...formData, feed_present_days: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="border-[#E3EDE7] text-[#111827] h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Body Weight Sub-form */}
            {showBodyWeightForm && (
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Body Weight Entry
                </h3>
                <div className="bg-[#EDF7F1] rounded-xl p-6 border border-[#E3EDE7]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="birdsWeighed" className="text-sm font-semibold text-[#111827]">Birds Weighed</Label>
                      <Input
                        id="birdsWeighed"
                        type="number"
                        value={formData.sample_birds_weighed || ''}
                        onChange={(e) => setFormData({ ...formData, sample_birds_weighed: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="border-[#E3EDE7] text-[#111827] h-12"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="totalWeight" className="text-sm font-semibold text-[#111827]">Total Weight (kg)</Label>
                      <Input
                        id="totalWeight"
                        type="number"
                        value={formData.total_sample_weight_kg || ''}
                        onChange={(e) => setFormData({ ...formData, total_sample_weight_kg: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="border-[#E3EDE7] text-[#111827] h-12"
                      />
                    </div>
                  </div>

                  {avgWeight > 0 && (
                    <div className="mt-6 pt-6 border-t border-[#3DAE72]/30">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                        <div>
                          <span className="text-[#6B7280] block mb-1">Average Weight</span>
                          <p className="font-semibold text-[#111827] text-lg">{avgWeight.toFixed(0)}g</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block mb-1">Target Weight</span>
                          <p className="font-semibold text-[#111827] text-lg">{targetWeight}g</p>
                        </div>
                        <div>
                          <span className="text-[#6B7280] block mb-1">Delta</span>
                          <p className={`font-semibold text-lg ${getWeightDeltaColor()}`}>
                            {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(0)}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observations */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest">Observations</h3>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="healthObservation" className="text-sm font-semibold text-[#111827]">Health Observations</Label>
                  <Textarea
                    id="healthObservation"
                    value={formData.health_observation}
                    onChange={(e) => setFormData({ ...formData, health_observation: e.target.value })}
                    placeholder="Describe flock condition, any issues, recommendations..."
                    rows={4}
                    className="border-[#E3EDE7] text-[#111827] placeholder:text-[#9CA3AF] resize-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="actionTaken" className="text-sm font-semibold text-[#111827]">Action Taken</Label>
                  <Textarea
                    id="actionTaken"
                    value={formData.action_taken}
                    onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                    placeholder="Describe any actions taken during the visit..."
                    rows={3}
                    className="border-[#E3EDE7] text-[#111827] placeholder:text-[#9CA3AF] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* GPS Location */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                GPS Location
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  className="border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] h-12 font-medium"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
                {gpsLocation && (
                  <div className="flex-1 flex items-center gap-3 text-sm text-[#111827] bg-[#EDF7F1] px-5 py-3 rounded-lg">
                    <Check className="w-5 h-5 text-[#3DAE72]" />
                    <span className="font-mono">
                      {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo Attachments
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={photos.length >= 3}
                    className="border-[#E3EDE7] text-[#111827] flex-1"
                  />
                  <span className="text-xs text-[#6B7280] font-medium">Max 3 photos</span>
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-4 flex-wrap">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-[#E3EDE7]"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-[#DC2626] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#B91C1C] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-[#E3EDE7]">
              <Button
                type="submit"
                disabled={loading || !formData.farm_id || !formData.batch_id}
                className="bg-[#1A5C34] hover:bg-[#2E8B57] text-white border-0 h-12 text-base font-semibold"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="text-[#6B7280] hover:text-[#111827] hover:bg-[#EDF7F1]/50 h-12 text-base font-medium sm:ml-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
