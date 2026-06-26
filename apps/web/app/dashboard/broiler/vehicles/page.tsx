'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Trash, FloppyDisk, FileText, CheckCircle, X, MagnifyingGlass, 
  Download, Printer, Car, Spinner, PencilSimple, Warning
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';

const vehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  capacity_kg: z.number().min(0, 'Capacity must be positive'),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  rc_number: z.string().optional(),
  insurance_expiry: z.string().optional(),
  is_owned: z.boolean().default(false),
  remarks: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface Vehicle {
  id: string;
  vehicleCode: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity_kg: number;
  owner_name: string;
  owner_phone: string;
  rc_number: string | null;
  insurance_expiry: string | null;
  is_owned: boolean;
  remarks: string | null;
  is_active: boolean;
  created_at: string;
}

const VEHICLE_TYPES = [
  'Truck - 10 Ton',
  'Truck - 5 Ton',
  'Mini Truck',
  'Pickup',
  'Three Wheeler',
  'Two Wheeler',
  'Other',
];

export default function VehicleMasterPage() {
  const { language } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      is_owned: false,
    },
  });

  const isOwned = watch('is_owned');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('integrator_id', user.id)
        .order('vehicle_number');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            vehicle_number: data.vehicle_number.toUpperCase(),
            vehicle_type: data.vehicle_type,
            capacity_kg: data.capacity_kg,
            owner_name: data.owner_name,
            owner_phone: data.owner_phone,
            rc_number: data.rc_number || null,
            insurance_expiry: data.insurance_expiry || null,
            is_owned: data.is_owned,
            remarks: data.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingVehicle.id);

        if (error) throw error;

        setMessage({
          type: 'success',
          text: language === 'hi' 
            ? 'वाहन सफलतापूर्वक अपडेट किया गया' 
            : 'Vehicle updated successfully'
        });
      } else {
        // Generate vehicle code
        const { data: lastVehicle } = await supabase
          .from('vehicles')
          .select('vehicleCode')
          .eq('integrator_id', user.id)
          .order('vehicleCode', { ascending: false })
          .limit(1)
          .single();

        let sequence = 1;
        if (lastVehicle) {
          const lastSequence = parseInt(lastVehicle.vehicleCode.replace('VEH-', ''));
          sequence = lastSequence + 1;
        }

        const vehicleCode = `VEH-${sequence.toString().padStart(4, '0')}`;

        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert({
            integrator_id: user.id,
            vehicleCode,
            vehicle_number: data.vehicle_number.toUpperCase(),
            vehicle_type: data.vehicle_type,
            capacity_kg: data.capacity_kg,
            owner_name: data.owner_name,
            owner_phone: data.owner_phone,
            rc_number: data.rc_number || null,
            insurance_expiry: data.insurance_expiry || null,
            is_owned: data.is_owned,
            remarks: data.remarks || null,
            is_active: true,
            created_by: user.id,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: language === 'hi' 
            ? 'वाहन सफलतापूर्वक बनाया गया' 
            : 'Vehicle created successfully'
        });
      }

      reset();
      setShowForm(false);
      setEditingVehicle(null);
      await fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'वाहन सहेजने में विफल' 
          : 'Failed to save vehicle'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    reset({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      capacity_kg: vehicle.capacity_kg,
      owner_name: vehicle.owner_name,
      owner_phone: vehicle.owner_phone,
      rc_number: vehicle.rc_number || '',
      insurance_expiry: vehicle.insurance_expiry || '',
      is_owned: vehicle.is_owned,
      remarks: vehicle.remarks || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप वाकई इस वाहन को हटाना चाहते हैं?' : 'Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'वाहन सफलतापूर्वक हटाया गया' 
          : 'Vehicle deleted successfully'
      });

      await fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'वाहन हटाने में विफल' 
          : 'Failed to delete vehicle'
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
    reset();
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.vehicle_number.toLowerCase().includes(query) ||
      v.vehicle_type.toLowerCase().includes(query) ||
      v.owner_name.toLowerCase().includes(query) ||
      v.vehicleCode.toLowerCase().includes(query)
    );
  });

  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-8 px-6 pt-8 pb-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Broiler
          </span>
          <h1 className="text-3xl font-bold text-[#111827] leading-tight tracking-tight">
            {isHindi ? 'वाहन मास्टर' : 'Vehicle Master'}
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
            {isHindi 
              ? 'अपने सभी वाहनों का प्रबंधन करें - ट्रक, पिकअप, और अन्य परिवहन' 
              : 'Manage all your vehicles - trucks, pickups, and other transportation'}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button 
            onClick={() => {
              setShowForm(true);
              setEditingVehicle(null);
              reset();
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            {isHindi ? 'वाहन जोड़ें' : 'Add Vehicle'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mb-6 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ease-out ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" className="flex-shrink-0" />
          ) : (
            <X size={20} weight="fill" className="flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
          >
            <X size={18} weight="regular" />
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#111827]">
                {editingVehicle 
                  ? (isHindi ? 'वाहन संपादित करें' : 'Edit Vehicle')
                  : (isHindi ? 'नया वाहन जोड़ें' : 'Add New Vehicle')
                }
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-[#EDF7F1] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Vehicle Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'वाहन नंबर' : 'Vehicle Number'} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('vehicle_number')}
                    placeholder={isHindi ? 'UP53AB1234' : 'UP53AB1234'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent uppercase"
                  />
                  {errors.vehicle_number && (
                    <p className="text-red-600 text-xs">{errors.vehicle_number.message}</p>
                  )}
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'वाहन प्रकार' : 'Vehicle Type'} <span className="text-red-500">*</span></label>
                  <select
                    {...register('vehicle_type')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
                  >
                    <option value="">{isHindi ? 'प्रकार चुनें' : 'Select Type'}</option>
                    {VEHICLE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.vehicle_type && (
                    <p className="text-red-600 text-xs">{errors.vehicle_type.message}</p>
                  )}
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'क्षमता (किग्रा)' : 'Capacity (kg)'} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    {...register('capacity_kg', { valueAsNumber: true })}
                    min="0"
                    step="100"
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                  {errors.capacity_kg && (
                    <p className="text-red-600 text-xs">{errors.capacity_kg.message}</p>
                  )}
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'मालिक का नाम' : 'Owner Name'} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('owner_name')}
                    placeholder={isHindi ? 'मालिक का नाम' : 'Owner Name'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                  {errors.owner_name && (
                    <p className="text-red-600 text-xs">{errors.owner_name.message}</p>
                  )}
                </div>

                {/* Owner Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'मालिक का फोन' : 'Owner Phone'} <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    {...register('owner_phone')}
                    placeholder={isHindi ? '9876543210' : '9876543210'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                  {errors.owner_phone && (
                    <p className="text-red-600 text-xs">{errors.owner_phone.message}</p>
                  )}
                </div>

                {/* RC Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'आरसी नंबर' : 'RC Number'}</label>
                  <input
                    type="text"
                    {...register('rc_number')}
                    placeholder={isHindi ? 'आरसी नंबर' : 'RC Number'}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Insurance Expiry */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">{isHindi ? 'बीमा समाप्ति' : 'Insurance Expiry'}</label>
                  <input
                    type="date"
                    {...register('insurance_expiry')}
                    className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                  />
                </div>

                {/* Is Owned */}
                <div className="space-y-2 flex items-center h-[42px]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_owned')}
                      className="w-5 h-5 rounded border-[#E3EDE7] text-[#1A5C34] focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-[#111827]">{isHindi ? 'स्वयं का वाहन' : 'Own Vehicle'}</span>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">{isHindi ? 'टिप्पणियां' : 'Remarks'}</label>
                <textarea
                  {...register('remarks')}
                  rows={3}
                  placeholder={isHindi ? 'कोई अतिरिक्त नोट्स...' : 'Any additional notes...'}
                  className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#E3EDE7]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size={18} className="animate-spin" />
                      {isHindi ? 'सहेज रहा है...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <FloppyDisk size={18} weight="bold" />
                      {isHindi ? 'सहेजें' : 'FloppyDisk'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-[#E3EDE7] bg-white hover:bg-[#EDF7F1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
          {/* SlidersHorizontals */}
          <div className="p-5 border-b border-[#E3EDE7]">
            <div className="relative group">
              <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1A5C34] transition-colors" />
              <input
                type="text"
                placeholder={isHindi ? 'वाहन नंबर, प्रकार, मालिक खोजें...' : 'MagnifyingGlass vehicle number, type, owner...'}
                value={searchQuery}
                onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कोड' : 'Code'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'नंबर' : 'Number'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'प्रकार' : 'Type'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'क्षमता' : 'Capacity'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'मालिक' : 'Owner'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'फोन' : 'Phone'}</th>
                  <th className="px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider">{isHindi ? 'स्वामित्व' : 'Owned'}</th>
                  <th className="px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider">{isHindi ? 'कार्य' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Spinner size={24} className="animate-spin text-[#1A5C34]" />
                        <span className="text-sm text-[#6B7280] font-medium">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Car size={36} className="text-[#3DAE72]/50" />
                        <span className="text-sm text-[#6B7280]">{isHindi ? 'कोई वाहन नहीं मिला' : 'No vehicles found'}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle, i) => (
                    <tr
                      key={vehicle.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150 border-b border-[#E3EDE7] last:border-b-0`}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-[#6B7280] tabular-nums">{vehicle.vehicleCode}</td>
                      <td className="px-5 py-4 font-semibold text-[#111827] uppercase">{vehicle.vehicle_number}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{vehicle.vehicle_type}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{vehicle.capacity_kg.toLocaleString()} kg</td>
                      <td className="px-5 py-4 text-[#111827]">{vehicle.owner_name}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{vehicle.owner_phone}</td>
                      <td className="px-5 py-4">
                        {vehicle.is_owned ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
                            {isHindi ? 'हाँ' : 'Yes'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#E3EDE7] text-[#6B7280]">
                            {isHindi ? 'नहीं' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="p-1.5 text-[#1A5C34] hover:bg-[#EDF7F1] rounded-lg transition-colors"
                            title={isHindi ? 'संपादित करें' : 'Edit'}
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={isHindi ? 'हटाएं' : 'Delete'}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
