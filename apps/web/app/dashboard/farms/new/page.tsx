'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Check, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import Step1FarmInfo from './components/Step1FarmInfo';
import Step3FirstBatch from './components/Step3FirstBatch';

type Step = 'farm-info' | 'shed-setup' | 'first-batch' | 'review';

interface Shed {
  id: string;
  name: string;
  capacity: number;
  shedType: 'open-sided' | 'environment-controlled' | 'semi-controlled';
  floorType: 'litter' | 'slat' | 'cage';
}

interface FarmFormData {
  // Step 1: Farm Info
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
  
  // Step 2: Shed Setup
  sheds: Shed[];
  
  // Step 3: First Batch (optional)
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
  
  // WhatsApp Daily Log Setup
  whatsappSetup?: 'yes' | 'no' | '';
  whatsappNumber?: string;
  whatsappReminderHour?: string;
  whatsappLanguage?: string;
}

const initialFormData: FarmFormData = {
  farmName: '',
  farmType: 'broiler',
  state: 'Uttar Pradesh',
  district: '',
  block: '',
  village: '',
  latitude: '',
  longitude: '',
  primaryMandi: '',
  managerName: '',
  managerPhone: '',
  photoUrl: '',
  sheds: [{ id: '1', name: 'Shed 1', capacity: 0, shedType: 'open-sided', floorType: 'litter' }],
  setupBatch: false,
  breed: '',
  docSupplier: '',
  placementDate: '',
  chicksPlaced: '',
  pricePerDoc: '',
  targetHarvestAge: '42',
  targetMarketWeight: '2100',
  feedSupplier: '',
  batchNotes: '',
  whatsappSetup: '',
  whatsappNumber: '',
  whatsappReminderHour: '18',
  whatsappLanguage: 'hindi',
};

const steps: { id: Step; label: string }[] = [
  { id: 'farm-info', label: 'Farm Info' },
  { id: 'shed-setup', label: 'Shed Setup' },
  { id: 'first-batch', label: 'First Batch' },
  { id: 'review', label: 'Review & FloppyDisk' },
];

export default function NewFarmWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('farm-info');
  const [formData, setFormData] = useState<FarmFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load draft from sessionStorage on mount
  useEffect(() => {
    const savedDraft = sessionStorage.getItem('farm-wizard-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        // Restore step if saved
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // FloppyDisk draft to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem('farm-wizard-draft', JSON.stringify({ ...formData, currentStep }));
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep === 'farm-info') {
      setCurrentStep('shed-setup');
    } else if (currentStep === 'shed-setup') {
      setCurrentStep('first-batch');
    } else if (currentStep === 'first-batch') {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'shed-setup') {
      setCurrentStep('farm-info');
    } else if (currentStep === 'first-batch') {
      setCurrentStep('shed-setup');
    } else if (currentStep === 'review') {
      setCurrentStep('first-batch');
    }
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addShed = () => {
    const newShed: Shed = {
      id: Date.now().toString(),
      name: `Shed ${formData.sheds.length + 1}`,
      capacity: 0,
      shedType: 'open-sided',
      floorType: 'litter',
    };
    setFormData({ ...formData, sheds: [...formData.sheds, newShed] });
  };

  const removeShed = (id: string) => {
    if (formData.sheds.length > 1) {
      setFormData({ ...formData, sheds: formData.sheds.filter(s => s.id !== id) });
    }
  };

  const updateShed = (id: string, field: keyof Shed, value: any) => {
    setFormData({
      ...formData,
      sheds: formData.sheds.map(shed =>
        shed.id === id ? { ...shed, [field]: value } : shed
      ),
    });
  };

  const getTotalCapacity = () => {
    return formData.sheds.reduce((sum, shed) => sum + (shed.capacity || 0), 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare data for API
      const payload = {
        name: formData.farmName,
        farm_type: formData.farmType,
        district: formData.district,
        state: formData.state,
        block: formData.block || undefined,
        village: formData.village || undefined,
        lat: formData.latitude ? parseFloat(formData.latitude) : undefined,
        lng: formData.longitude ? parseFloat(formData.longitude) : undefined,
        manager_name: formData.managerName || undefined,
        manager_phone: formData.managerPhone || undefined,
        sheds: formData.sheds.map(shed => ({
          name: shed.name,
          capacity: shed.capacity,
          shed_type: shed.shedType === 'open-sided' ? 'open_sided' : 
                     shed.shedType === 'environment-controlled' ? 'env_controlled' : 
                     shed.shedType === 'semi-controlled' ? 'semi_controlled' : undefined,
          floor_type: shed.floorType,
        })),
        batch: formData.setupBatch ? {
          breed: formData.breed,
          doc_supplier: formData.docSupplier,
          placement_date: formData.placementDate,
          birds_placed: parseInt(formData.chicksPlaced),
          price_per_doc: formData.pricePerDoc ? parseFloat(formData.pricePerDoc) : undefined,
          target_harvest_age: parseInt(formData.targetHarvestAge),
          target_market_weight: parseInt(formData.targetMarketWeight),
          feed_supplier: formData.feedSupplier || undefined,
          notes: formData.batchNotes || undefined,
        } : undefined,
      };

      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create farm');
      }

      const data = await response.json();
      
      // Clear draft
      sessionStorage.removeItem('farm-wizard-draft');
      
      // Show confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
      setShowConfetti(true);
      
      // Redirect to new farm detail page after confetti
      setTimeout(() => {
        router.push(`/dashboard/farms/${data.farmId}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to create farm:', error);
      alert(error instanceof Error ? error.message : 'Failed to create farm. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'farm-info':
        return formData.farmName && formData.district;
      case 'shed-setup':
        return formData.sheds.length > 0 && formData.sheds.every(s => s.capacity > 0);
      case 'first-batch':
        if (!formData.setupBatch) return true;
        return formData.breed && formData.placementDate && formData.chicksPlaced;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">नया Farm जोड़ें</h1>
        <p className="text-sm text-gray-600 mt-1">Add a new farm to your portfolio</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-700 border-green-700 text-white'
                        : isCurrent
                        ? 'bg-white border-green-700 text-green-700'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check size={20} weight="bold" /> : index + 1}
                  </div>
                  <span className={`text-xs mt-2 ${isCurrent ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-700' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {currentStep === 'farm-info' && (
          <Step1FarmInfo formData={formData} onFormDataChange={handleFormDataChange} />
        )}

        {currentStep === 'shed-setup' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Shed Setup</h2>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Total Capacity: <span className="font-semibold text-green-700">{getTotalCapacity().toLocaleString()} birds</span>
              </p>
              <button
                type="button"
                onClick={addShed}
                disabled={formData.sheds.length >= 20}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add Shed
              </button>
            </div>

            {/* Capacity Visualization */}
            {getTotalCapacity() > 0 && (
              <div className="bg-[#F4F7F5] border border-[#E3EDE7] rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3">Capacity Density Visualization</p>
                <div className="space-y-2">
                  {formData.sheds.map((shed, index) => {
                    const totalCapacity = getTotalCapacity();
                    const shedPercentage = totalCapacity > 0 ? (shed.capacity / totalCapacity) * 100 : 0;
                    return (
                      <div key={shed.id} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-20 truncate">{shed.name}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-green-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${shedPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-16 text-right">
                          {shedPercentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                  <span>Density: {formData.sheds.length > 0 ? (getTotalCapacity() / formData.sheds.length).toFixed(0) : 0} birds/shed</span>
                  <span>{formData.sheds.length} shed{formData.sheds.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {formData.sheds.map((shed, index) => (
              <div key={shed.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">Shed {index + 1}</h3>
                  {formData.sheds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeShed(shed.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shed Name
                    </label>
                    <input
                      type="text"
                      value={shed.name}
                      onChange={(e) => updateShed(shed.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capacity (birds) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={shed.capacity}
                      onChange={(e) => updateShed(shed.id, 'capacity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shed Type
                  </label>
                  <div className="flex gap-4">
                    {(['open-sided', 'environment-controlled', 'semi-controlled'] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`shed-type-${shed.id}`}
                          value={type}
                          checked={shed.shedType === type}
                          onChange={(e) => updateShed(shed.id, 'shedType', e.target.value)}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Floor Type
                  </label>
                  <div className="flex gap-4">
                    {(['litter', 'slat', 'cage'] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`floor-type-${shed.id}`}
                          value={type}
                          checked={shed.floorType === type}
                          onChange={(e) => updateShed(shed.id, 'floorType', e.target.value)}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 'first-batch' && (
          <Step3FirstBatch formData={formData} onFormDataChange={handleFormDataChange} />
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review & FloppyDisk</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Farm Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Name:</div>
                  <div className="font-semibold">{formData.farmName}</div>
                  <div className="text-gray-600">Type:</div>
                  <div className="font-semibold capitalize">{formData.farmType}</div>
                  <div className="text-gray-600">Location:</div>
                  <div className="font-semibold">{formData.district}, {formData.state}</div>
                  <div className="text-gray-600">Village:</div>
                  <div className="font-semibold">{formData.village || '—'}</div>
                  <div className="text-gray-600">Primary Mandi:</div>
                  <div className="font-semibold">{formData.primaryMandi || '—'}</div>
                  {formData.photoUrl && (
                    <>
                      <div className="text-gray-600">Farm Photo:</div>
                      <div className="font-semibold">
                        <Image
                          src={formData.photoUrl}
                          alt={`Farm photo for ${formData.farmName}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Shed Setup</h3>
                <div className="text-sm">
                  <div className="text-gray-600">Number of Sheds: <span className="font-semibold">{formData.sheds.length}</span></div>
                  <div className="text-gray-600">Total Capacity: <span className="font-semibold">{getTotalCapacity().toLocaleString()} birds</span></div>
                </div>
              </div>

              {formData.setupBatch && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">First Batch</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Breed:</div>
                    <div className="font-semibold">{formData.breed}</div>
                    <div className="text-gray-600">Placement Date:</div>
                    <div className="font-semibold">{formData.placementDate}</div>
                    <div className="text-gray-600">Chicks Placed:</div>
                    <div className="font-semibold">{formData.chicksPlaced}</div>
                  </div>
                  
                  {formData.whatsappSetup === 'yes' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">WhatsApp Daily Log:</div>
                        <div className="font-semibold text-green-700">✓ WhatsApp set up</div>
                        <div className="text-gray-600">Phone:</div>
                        <div className="font-semibold">+91-{formData.whatsappNumber}</div>
                        <div className="text-gray-600">Reminder Time:</div>
                        <div className="font-semibold">
                          {formData.whatsappReminderHour === '17' && '5:00 PM'}
                          {formData.whatsappReminderHour === '18' && '6:00 PM'}
                          {formData.whatsappReminderHour === '19' && '7:00 PM'}
                          {formData.whatsappReminderHour === '20' && '8:00 PM'}
                        </div>
                        <div className="text-gray-600">Language:</div>
                        <div className="font-semibold capitalize">{formData.whatsappLanguage}</div>
                      </div>
                    </div>
                  )}
                  
                  {formData.whatsappSetup === 'no' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <div className="text-gray-600">WhatsApp Daily Log:</div>
                        <div className="font-semibold text-gray-500">○ Not set up</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {currentStep !== 'farm-info' ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        ) : (
          <div />
        )}

        {currentStep !== 'review' ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Farm...' : 'FloppyDisk Farm & Start Tracking'}
          </button>
        )}
      </div>

      {/* Confetti placeholder */}
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Successfully Onboarded!</h2>
            <p className="text-gray-600">Redirecting to your farms...</p>
          </div>
        </div>
      )}
    </div>
  );
}
