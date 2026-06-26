'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Bird, Truck, Users, FileText, X, ChevronRight } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface ShedReadinessRecord {
  id: string;
  farm_id: string;
  shed_id: string;
  readiness_date: string;
  expected_chick_date: string;
  supervisor_id: string;
  status: 'approved' | 'chicks_placed';
  farm_name: string;
  shed_name: string;
  supervisor_name: string;
  farmer_name: string;
}

interface Supplier {
  id: string;
  supplier_code: string;
  supplier_name: string;
  contact_person: string;
  phone: string;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity_kg: number;
  owner_name: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
}

interface GCRateSetup {
  id: string;
  rate_name: string;
  breed: string;
  season: string;
  chick_rate: number;
  target_gc: number;
  effective_from: string;
}

interface ChickAllocationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ChickAllocationForm({ onSuccess, onCancel }: ChickAllocationFormProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [approvedRecords, setApprovedRecords] = useState<ShedReadinessRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [gcRateSetups, setGCRateSetups] = useState<GCRateSetup[]>([]);
  
  const [selectedRecord, setSelectedRecord] = useState<ShedReadinessRecord | null>(null);
  const [allocNumber, setAllocNumber] = useState('');
  
  const [formData, setFormData] = useState({
    alloc_date: format(new Date(), 'yyyy-MM-dd'),
    supplier_id: '',
    breed: '',
    chick_rate: 0,
    chicks_allotted: 0,
    chicks_received: 0,
    transport_cost: 0,
    vehicle_id: '',
    driver_id: '',
    invoice_number: '',
    remarks: ''
  });

  const [totalChickCost, setTotalChickCost] = useState(0);

  useEffect(() => {
    fetchApprovedRecords();
    fetchSuppliers();
    fetchVehicles();
    fetchDrivers();
    fetchGCRateSetups();
    generateAllocNumber();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      setFormData(prev => ({
        ...prev,
        alloc_date: format(new Date(), 'yyyy-MM-dd')
      }));
    }
  }, [selectedRecord]);

  useEffect(() => {
    const cost = formData.chicks_received * formData.chick_rate;
    setTotalChickCost(cost);
  }, [formData.chicks_received, formData.chick_rate]);

  const generateAllocNumber = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      
      const { data: allocData } = await supabase
        .from('chick_allocations')
        .select('alloc_number')
        .eq('integrator_id', user.id)
        .like('alloc_number', `CA/${yearSuffix}/%`)
        .order('alloc_number', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (allocData) {
        const lastSequence = parseInt(allocData.alloc_number.split('/').pop() || '0');
        sequence = lastSequence + 1;
      }

      const newAllocNumber = `CA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;
      setAllocNumber(newAllocNumber);
    } catch (error) {
      console.error('Error generating allocation number:', error);
      setAllocNumber(`CA/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    }
  };

  const fetchApprovedRecords = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shed_readiness')
        .select(`
          id,
          farm_id,
          shed_id,
          readiness_date,
          expected_chick_date,
          supervisor_id,
          status,
          farms!inner(farm_name, farmer_name),
          sheds!inner(shed_name),
          employees!inner(name)
        `)
        .eq('integrator_id', user.id)
        .eq('status', 'approved')
        .order('readiness_date', { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map((record: any) => ({
        id: record.id,
        farm_id: record.farm_id,
        shed_id: record.shed_id,
        readiness_date: record.readiness_date,
        expected_chick_date: record.expected_chick_date,
        supervisor_id: record.supervisor_id,
        status: record.status,
        farm_name: record.farms?.farm_name || '',
        shed_name: record.sheds?.shed_name || '',
        supervisor_name: record.employees?.name || '',
        farmer_name: record.farms?.farmer_name || ''
      }));
      
      setApprovedRecords(formattedData);
    } catch (error) {
      console.error('Error fetching approved records:', error);
    }
  };

  const fetchSuppliers = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('supplier_type', 'chick')
        .eq('is_active', true)
        .order('supplier_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchVehicles = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('vehicle_number');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchDrivers = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('id, name, phone')
        .eq('integrator_id', user.id)
        .eq('role', 'driver')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchGCRateSetups = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gc_rate_setup')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('effective_from', { ascending: false });

      if (error) throw error;
      setGCRateSetups(data || []);
    } catch (error) {
      console.error('Error fetching GC rate setups:', error);
    }
  };

  const handleSelectRecord = (record: ShedReadinessRecord) => {
    setSelectedRecord(record);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedRecord(null);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedRecord) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/broiler/chick-allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shed_readiness_id: selectedRecord.id,
          supplier_id: formData.supplier_id,
          breed: formData.breed,
          chick_rate: formData.chick_rate,
          chicks_allotted: formData.chicks_allotted,
          chicks_received: formData.chicks_received,
          transport_cost: formData.transport_cost,
          vehicle_id: formData.vehicle_id || null,
          driver_id: formData.driver_id || null,
          invoice_number: formData.invoice_number,
          remarks: formData.remarks,
          alloc_date: formData.alloc_date,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create chick allocation');
      }

      setStep(3);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating chick allocation:', error);
      alert(error instanceof Error ? error.message : 'Failed to create chick allocation / चिक एलोकेशन बनाने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const handleGCRateChange = (gcRateId: string) => {
    const gcRate = gcRateSetups.find(r => r.id === gcRateId);
    if (gcRate) {
      setFormData({
        ...formData,
        breed: gcRate.breed,
        chick_rate: gcRate.chick_rate
      });
    }
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-3 ${step >= 1 ? 'text-[#3DAE72]' : 'text-[#6B7280]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'bg-[#3DAE72] border-[#3DAE72] text-white' : 'border-[#E3EDE7]'
            }`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-semibold">Select Shed</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${step >= 2 ? 'text-[#3DAE72]' : 'text-[#E3EDE7]'}`} />
          <div className={`flex items-center gap-3 ${step >= 2 ? 'text-[#3DAE72]' : 'text-[#6B7280]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'bg-[#3DAE72] border-[#3DAE72] text-white' : 'border-[#E3EDE7]'
            }`}>
              {step > 2 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm font-semibold">Chick Details</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${step >= 3 ? 'text-[#3DAE72]' : 'text-[#E3EDE7]'}`} />
          <div className={`flex items-center gap-3 ${step >= 3 ? 'text-[#3DAE72]' : 'text-[#6B7280]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= 3 ? 'bg-[#3DAE72] border-[#3DAE72] text-white' : 'border-[#E3EDE7]'
            }`}>
              {step > 3 ? <Check className="w-5 h-5" /> : '3'}
            </div>
            <span className="text-sm font-semibold">Confirm</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Approved Shed Readiness */}
      {step === 1 && (
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50 px-6 py-5">
            <CardTitle className="text-[#111827] text-lg font-semibold">
              Select Approved Shed Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {approvedRecords.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <FileText className="h-14 w-14 mx-auto mb-4 text-[#3DAE72]/40" />
                <p className="text-base font-medium">No approved shed readiness records found</p>
                <p className="text-sm mt-2">Approve shed readiness records first</p>
              </div>
            ) : (
              <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#EDF7F1]">
                    <TableRow>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider">Farm</TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider">Shed</TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider">Farmer</TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider">Supervisor</TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider">Ready Date</TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider">Expected Chick Date</TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-[#EDF7F1]/30 cursor-pointer transition-colors" onClick={() => handleSelectRecord(record)}>
                        <TableCell className="py-4 text-sm text-[#111827] font-medium">
                          {record.farm_name}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-[#111827]">
                          {record.shed_name}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-[#111827]">
                          {record.farmer_name}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-[#111827]">
                          {record.supervisor_name}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-[#111827]">
                          {format(new Date(record.readiness_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-[#111827]">
                          {record.expected_chick_date ? format(new Date(record.expected_chick_date), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell className="py-4">
                          <Button size="sm" variant="ghost" className="text-[#3DAE72] hover:text-[#1A5C34] hover:bg-[#EDF7F1] h-8 w-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Enter Chick Details */}
      {step === 2 && selectedRecord && (
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#111827] text-lg font-semibold">
                Chick Allocation Details
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-[#6B7280] hover:text-[#111827] hover:bg-[#EDF7F1]/50 h-9 px-4">
                <X className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Selected Record Summary */}
              <div className="bg-[#EDF7F1] rounded-lg p-5 border border-[#E3EDE7]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="block text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Farm</span>
                    <p className="font-semibold text-[#111827]">{selectedRecord.farm_name}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Shed</span>
                    <p className="font-semibold text-[#111827]">{selectedRecord.shed_name}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Supervisor</span>
                    <p className="font-semibold text-[#111827]">{selectedRecord.supervisor_name}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Allocation #</span>
                    <p className="font-semibold text-[#111827] font-mono">{allocNumber}</p>
                  </div>
                </div>
              </div>

              {/* Chick Details */}
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Chick Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="allocDate" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Allocation Date</Label>
                    <Input
                      id="allocDate"
                      type="date"
                      value={formData.alloc_date}
                      onChange={(e) => setFormData({ ...formData, alloc_date: e.target.value })}
                      required
                      className="border-[#E3EDE7] text-[#111827] h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Supplier</Label>
                    <Select
                      value={formData.supplier_id}
                      onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                      required
                    >
                      <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-10">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id} className="text-[#111827]">
                            {supplier.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gcRate" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">GC Rate Setup</Label>
                    <Select
                      value={formData.breed}
                      onValueChange={handleGCRateChange}
                      required
                    >
                      <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-10">
                        <SelectValue placeholder="Select rate setup" />
                      </SelectTrigger>
                      <SelectContent>
                        {gcRateSetups.map((gcRate) => (
                          <SelectItem key={gcRate.id} value={gcRate.id} className="text-[#111827]">
                            {gcRate.rate_name} - {gcRate.breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chicksAllotted" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Chicks Allotted</Label>
                    <Input
                      id="chicksAllotted"
                      type="number"
                      value={formData.chicks_allotted || ''}
                      onChange={(e) => setFormData({ ...formData, chicks_allotted: parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                      className="border-[#E3EDE7] text-[#111827] h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chicksReceived" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Chicks Received</Label>
                    <Input
                      id="chicksReceived"
                      type="number"
                      value={formData.chicks_received || ''}
                      onChange={(e) => setFormData({ ...formData, chicks_received: parseInt(e.target.value) || 0 })}
                      min="0"
                      required
                      className="border-[#E3EDE7] text-[#111827] h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chickRate" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Chick Rate (₹/chick)</Label>
                    <Input
                      id="chickRate"
                      type="number"
                      value={formData.chick_rate || ''}
                      onChange={(e) => setFormData({ ...formData, chick_rate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      required
                      className="border-[#E3EDE7] text-[#111827] h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Transport Details */}
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Vehicle</Label>
                    <Select
                      value={formData.vehicle_id}
                      onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                    >
                      <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-10">
                        <SelectValue placeholder="Select vehicle (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id} className="text-[#111827]">
                            {vehicle.vehicle_number} ({vehicle.vehicle_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Driver</Label>
                    <Select
                      value={formData.driver_id}
                      onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                    >
                      <SelectTrigger className="border-[#E3EDE7] text-[#111827] h-10">
                        <SelectValue placeholder="Select driver (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id} className="text-[#111827]">
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transportCost" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Transport Cost (₹)</Label>
                    <Input
                      id="transportCost"
                      type="number"
                      value={formData.transport_cost || ''}
                      onChange={(e) => setFormData({ ...formData, transport_cost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="border-[#E3EDE7] text-[#111827] h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice & Remarks */}
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                      placeholder="Optional invoice number"
                      className="border-[#E3EDE7] text-[#111827] h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="border-[#E3EDE7] text-[#111827] placeholder:text-[#9CA3AF] resize-none"
                  />
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-[#EDF7F1] rounded-lg p-6 border border-[#E3EDE7]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6B7280] font-medium">Chicks Cost</span>
                    <span className="font-semibold text-[#111827]">{formatINR(totalChickCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6B7280] font-medium">Transport Cost</span>
                    <span className="font-semibold text-[#111827]">{formatINR(formData.transport_cost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-[#3DAE72]/30">
                    <span className="text-base font-bold text-[#111827]">Total Cost</span>
                    <span className="text-2xl font-bold text-[#1A5C34]">{formatINR(totalChickCost + formData.transport_cost)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-[#E3EDE7]">
                <Button
                  type="submit"
                  disabled={loading || !formData.supplier_id || !formData.chicks_allotted}
                  className="bg-[#1A5C34] hover:bg-[#3DAE72] text-white border-0 h-11 px-6 font-semibold transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Confirm Allocation'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="ml-auto text-[#6B7280] hover:text-[#111827] hover:bg-[#EDF7F1]/50 h-11 px-6 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-[#3DAE72] rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-3">Allocation Successful!</h3>
            <p className="text-[#6B7280] mb-8 text-base">
              Chick allocation {allocNumber} has been created successfully
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setStep(1);
                  setSelectedRecord(null);
                  setFormData({
                    alloc_date: format(new Date(), 'yyyy-MM-dd'),
                    supplier_id: '',
                    breed: '',
                    chick_rate: 0,
                    chicks_allotted: 0,
                    chicks_received: 0,
                    transport_cost: 0,
                    vehicle_id: '',
                    driver_id: '',
                    invoice_number: '',
                    remarks: ''
                  });
                  generateAllocNumber();
                }}
                className="bg-[#1A5C34] hover:bg-[#3DAE72] text-white border-0 h-11 px-6 font-semibold transition-colors"
              >
                <Bird className="h-4 w-4 mr-2" />
                New Allocation
              </Button>
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] h-11 px-6 font-semibold transition-colors"
                >
                  Done
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
