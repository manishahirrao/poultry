'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Printer, Truck, User, Package, ArrowRight } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { colors, spacing, radius, motion } from '@poultrypulse/ui/src/tokens';
import TransferChallan from './TransferChallan';

interface Farm {
  id: string;
  name: string;
  district: string;
  village: string;
}

interface Batch {
  id: string;
  batch_number: number;
  birds_placed: number;
  placement_date: string;
}

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  city: string;
}

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  unit_of_measure: string;
  purchase_price: number;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity_kg: number;
  owner_name: string;
  is_owned: boolean;
}

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  role: string;
}

interface TransferItem {
  product_id: string;
  quantity_sent: number;
  unit_rate: number;
  line_value: number;
}

export default function StockTransferForm() {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [transferType, setTransferType] = useState<'F2F' | 'F2B'>('F2F');
  const [transferNumber, setTransferNumber] = useState('');
  const [showChallan, setShowChallan] = useState(false);
  
  // Data stores
  const [farms, setFarms] = useState<Farm[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Form state
  const [fromFarmId, setFromFarmId] = useState('');
  const [fromBatchId, setFromBatchId] = useState('');
  const [toFarmId, setToFarmId] = useState('');
  const [toBatchId, setToBatchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transferDate, setTransferDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

  useEffect(() => {
    fetchFarms();
    fetchBranches();
    fetchProducts();
    fetchVehicles();
    fetchDrivers();
    generateTransferNumber();
  }, []);

  useEffect(() => {
    if (fromFarmId) {
      fetchBatches(fromFarmId);
    }
  }, [fromFarmId]);

  const generateTransferNumber = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      
      // Generate transfer number: TRF/2526/001
      const { data: transferData } = await supabase
        .from('stock_transfers')
        .select('transfer_number')
        .eq('integrator_id', user.id)
        .like('transfer_number', `TRF/${yearSuffix}/%`)
        .order('transfer_number', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (transferData) {
        const lastSequence = parseInt(transferData.transfer_number.split('/').pop() || '0');
        sequence = lastSequence + 1;
      }

      const newTransferNumber = `TRF/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;
      setTransferNumber(newTransferNumber);
    } catch (error) {
      console.error('Error generating transfer number:', error);
      setTransferNumber(`TRF/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    }
  };

  const fetchFarms = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchBatches = async (farmId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('farm_id', farmId)
        .order('placement_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchBranches = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('branch_name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchProducts = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .in('role', ['driver', 'supervisor'])
        .order('full_name');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const addTransferItem = () => {
    if (products.length > 0) {
      setTransferItems([
        ...transferItems,
        {
          product_id: products[0].id,
          quantity_sent: 0,
          unit_rate: products[0].purchase_price || 0,
          line_value: 0
        }
      ]);
    }
  };

  const updateTransferItem = (index: number, field: keyof TransferItem, value: number | string) => {
    const updated = [...transferItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    // Recalculate line value
    if (field === 'quantity_sent' || field === 'unit_rate') {
      updated[index].line_value = updated[index].quantity_sent * updated[index].unit_rate;
    }
    
    setTransferItems(updated);
  };

  const removeTransferItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const handleSaveTransfer = async () => {
    if (transferItems.length === 0) {
      alert('Please add at least one product item');
      return;
    }

    if (transferType === 'F2F' && (!fromFarmId || !fromBatchId || !toFarmId || !toBatchId)) {
      alert('Please select from farm/batch and to farm/batch for F2F transfer');
      return;
    }

    if (transferType === 'F2B' && (!fromFarmId || !toBranchId)) {
      alert('Please select from farm and to branch for F2B transfer');
      return;
    }

    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Determine transfer type for database
      const dbTransferType = transferType === 'F2F' ? 'farmer_to_farmer' : 'farmer_to_branch';

      // Create stock transfer
      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers')
        .insert({
          integrator_id: user.id,
          transfer_number: transferNumber,
          transfer_date: transferDate,
          transfer_type: dbTransferType,
          from_farmer_id: fromFarmId,
          to_farmer_id: transferType === 'F2F' ? toFarmId : null,
          to_branch_id: transferType === 'F2B' ? toBranchId : null,
          batch_id: fromBatchId,
          farm_id: fromFarmId,
          vehicle_id: vehicleId || null,
          driver_id: driverId || null,
          status: 'pending',
          remarks: remarks || null,
          created_by: user.id
        })
        .select()
        .single();

      if (transferError) throw transferError;

      // Create transfer items
      const itemsToInsert = transferItems.map(item => ({
        transfer_id: transfer.id,
        product_id: item.product_id,
        quantity_sent: item.quantity_sent,
        unit_rate: item.unit_rate
      }));

      const { error: itemsError } = await supabase
        .from('stock_transfer_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      alert('Stock transfer created successfully!');
      
      // Reset form
      setTransferItems([]);
      setRemarks('');
      setFromFarmId('');
      setFromBatchId('');
      setToFarmId('');
      setToBatchId('');
      setToBranchId('');
      setVehicleId('');
      setDriverId('');
      generateTransferNumber();
    } catch (error) {
      console.error('Error creating stock transfer:', error);
      alert('Failed to create stock transfer');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintChallan = () => {
    if (transferItems.length === 0) {
      alert('Please add at least one product item before printing challan');
      return;
    }
    setShowChallan(true);
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.product_name} (${product.unit_of_measure})` : '';
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm ? farm.name : '';
  };

  const getBatchNumber = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? `Batch #${batch.batch_number}` : '';
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branch_name : '';
  };

  const getVehicleNumber = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.vehicle_number : '';
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.full_name : '';
  };

  const totalValue = transferItems.reduce((sum, item) => sum + item.line_value, 0);

  return (
    <div className="space-y-8">
      <Card className="border-[#D4C4BC] shadow-sm" style={{ borderRadius: `${radius.lg}px` }}>
        <CardHeader className="border-b border-[#D4C4BC] bg-[#FAF5F2]" style={{ padding: `${spacing.cardPadding}` }}>
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-[#2B1D15] text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '-0.01em' }}>
                Stock Transfer
              </CardTitle>
              <p className="text-base text-[#4A3528] mt-2" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", lineHeight: 1.5 }}>
                Transfer Number: <span className="font-mono font-semibold text-[#2B1D15]">{transferNumber}</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ padding: `${spacing.cardPadding}` }}>
          <Tabs value={transferType} onValueChange={(value) => setTransferType(value as 'F2F' | 'F2B')} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] p-1" style={{ backgroundColor: colors.neutral100 }}>
              <TabsTrigger value="F2F" className="data-[state=active]:bg-white data-[state=active]:text-[#2B1D15] data-[state=active]:shadow-sm" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", borderRadius: `${radius.md}px`, transition: 'all 200ms cubic-bezier(0.25, 1, 0.5, 1)' }}>Farm to Farm (F2F)</TabsTrigger>
              <TabsTrigger value="F2B" className="data-[state=active]:bg-white data-[state=active]:text-[#2B1D15] data-[state=active]:shadow-sm" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", borderRadius: `${radius.md}px`, transition: 'all 200ms cubic-bezier(0.25, 1, 0.5, 1)' }}>Farm to Branch (F2B)</TabsTrigger>
            </TabsList>

            <TabsContent value="F2F" className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Transfer Details (F2F)</h3>
                
                {/* Transfer Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="transferDate" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Transfer Date</Label>
                    <Input
                      id="transferDate"
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      required
                      className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200"
                      style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="transferNumber" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Transfer Number</Label>
                    <Input
                      id="transferNumber"
                      value={transferNumber}
                      disabled
                      className="bg-[#F4FAF6] border-[#D4C4BC] text-[#2B1D15] font-mono text-sm cursor-not-allowed"
                      style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}
                    />
                  </div>
                </div>

                {/* From Farm + Batch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="fromFarm" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>From Farm</Label>
                    <Select
                      value={fromFarmId}
                      onValueChange={(value) => {
                        setFromFarmId(value);
                        setFromBatchId('');
                      }}
                      required
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select source farm" />
                      </SelectTrigger>
                      <SelectContent>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                            {farm.name} ({farm.district})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="fromBatch" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>From Batch</Label>
                    <Select
                      value={fromBatchId}
                      onValueChange={setFromBatchId}
                      required
                      disabled={!fromFarmId}
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                            Batch #{batch.batch_number} - {batch.birds_placed} birds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center py-4">
                  <div className="rounded-full p-2" style={{ backgroundColor: colors.brandGreen25 }}>
                    <ArrowRight className="h-5 w-5" style={{ color: colors.brandGreen700 }} />
                  </div>
                </div>

                {/* To Farm + Batch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="toFarm" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>To Farm</Label>
                    <Select
                      value={toFarmId}
                      onValueChange={(value) => {
                        setToFarmId(value);
                        setToBatchId('');
                      }}
                      required
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select destination farm" />
                      </SelectTrigger>
                      <SelectContent>
                        {farms.filter(f => f.id !== fromFarmId).map((farm) => (
                          <SelectItem key={farm.id} value={farm.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                            {farm.name} ({farm.district})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="toBatch" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>To Batch</Label>
                    <Select
                      value={toBatchId}
                      onValueChange={setToBatchId}
                      required
                      disabled={!toFarmId}
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {toFarmId && (
                          <BatchOptions farmId={toFarmId} supabase={supabase} />
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="F2B" className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Transfer Details (F2B)</h3>
                
                {/* Transfer Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="transferDateF2B" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Transfer Date</Label>
                    <Input
                      id="transferDateF2B"
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      required
                      className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200"
                      style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="transferNumberF2B" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Transfer Number</Label>
                    <Input
                      id="transferNumberF2B"
                      value={transferNumber}
                      disabled
                      className="bg-[#F4FAF6] border-[#D4C4BC] text-[#2B1D15] font-mono text-sm cursor-not-allowed"
                      style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}
                    />
                  </div>
                </div>

                {/* From Farm + Batch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="fromFarmF2B" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>From Farm</Label>
                    <Select
                      value={fromFarmId}
                      onValueChange={(value) => {
                        setFromFarmId(value);
                        setFromBatchId('');
                      }}
                      required
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select source farm" />
                      </SelectTrigger>
                      <SelectContent>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                            {farm.name} ({farm.district})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="fromBatchF2B" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>From Batch</Label>
                    <Select
                      value={fromBatchId}
                      onValueChange={setFromBatchId}
                      required
                      disabled={!fromFarmId}
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                            Batch #{batch.batch_number} - {batch.birds_placed} birds
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center py-4">
                  <div className="rounded-full p-2" style={{ backgroundColor: colors.brandGreen25 }}>
                    <ArrowRight className="h-5 w-5" style={{ color: colors.brandGreen700 }} />
                  </div>
                </div>

                {/* To Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="toBranch" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>To Branch</Label>
                    <Select
                      value={toBranchId}
                      onValueChange={setToBranchId}
                      required
                    >
                      <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                        <SelectValue placeholder="Select destination branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                            {branch.branch_name} ({branch.branch_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Vehicle and Driver Selection - Common for both */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Transport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="vehicle" className="text-sm font-semibold text-[#2B1D15] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                    <Truck className="h-4 w-4" style={{ color: colors.brandOrange700 }} />
                    Vehicle
                  </Label>
                  <Select
                    value={vehicleId}
                    onValueChange={setVehicleId}
                  >
                    <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                      <SelectValue placeholder="Select vehicle (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                          {vehicle.vehicle_number} ({vehicle.vehicle_type}) - {vehicle.capacity_kg}kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="driver" className="text-sm font-semibold text-[#2B1D15] flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                    <User className="h-4 w-4" style={{ color: colors.brandOrange700 }} />
                    Driver
                  </Label>
                  <Select
                    value={driverId}
                    onValueChange={setDriverId}
                  >
                    <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                      <SelectValue placeholder="Select driver (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                          {driver.full_name} ({driver.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Transfer Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>
                  <Package className="h-4 w-4" style={{ color: colors.brandOrange700 }} />
                  Transfer Items
                </h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addTransferItem}
                  className="text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: colors.brandOrange700, 
                    borderRadius: `${radius.md}px`,
                    transitionTimingFunction: motion.easeOutQuart
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {transferItems.length === 0 ? (
                <div className="text-center py-16 text-[#4A3528] border-2 border-dashed border-[#D4C4BC] rounded-lg bg-[#F4FAF6]/40" style={{ borderRadius: `${radius.lg}px` }}>
                  <div className="rounded-full p-4 mx-auto mb-4 inline-block" style={{ backgroundColor: colors.brandGreen25 }}>
                    <Package className="h-8 w-8" style={{ color: colors.brandGreen700 }} />
                  </div>
                  <p className="text-base font-medium" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>No items added yet</p>
                  <p className="text-sm mt-2" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", color: colors.neutral500 }}>Click "Add Item" to add products to the transfer</p>
                </div>
              ) : (
                <div className="border border-[#D4C4BC] rounded-lg overflow-hidden" style={{ borderRadius: `${radius.lg}px` }}>
                  <Table>
                    <TableHeader className="bg-[#F4FAF6]">
                      <TableRow>
                        <TableHead className="w-[40%] text-[#2B1D15] font-bold text-xs uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Product</TableHead>
                        <TableHead className="w-[20%] text-[#2B1D15] font-bold text-xs uppercase tracking-wider text-right" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Quantity</TableHead>
                        <TableHead className="w-[20%] text-[#2B1D15] font-bold text-xs uppercase tracking-wider text-right" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Unit Rate</TableHead>
                        <TableHead className="w-[20%] text-[#2B1D15] font-bold text-xs uppercase tracking-wider text-right" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Value</TableHead>
                        <TableHead className="w-[10%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferItems.map((item, index) => (
                        <TableRow key={index} className="hover:bg-[#F4FAF6]/30">
                          <TableCell className="py-3">
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => {
                                const product = products.find(p => p.id === value);
                                updateTransferItem(index, 'product_id', value);
                                updateTransferItem(index, 'unit_rate', product?.purchase_price || 0);
                              }}
                            >
                              <SelectTrigger className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200" style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id} className="text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
                                    {product.product_name} ({product.unit_of_measure})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-3">
                            <Input
                              type="number"
                              value={item.quantity_sent || ''}
                              onChange={(e) => updateTransferItem(index, 'quantity_sent', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                              className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200"
                              style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight, fontVariantNumeric: 'tabular-nums' }}
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <Input
                              type="number"
                              value={item.unit_rate || ''}
                              onChange={(e) => updateTransferItem(index, 'unit_rate', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                              className="border-[#D4C4BC] text-[#2B1D15] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200"
                              style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight, fontVariantNumeric: 'tabular-nums' }}
                            />
                          </TableCell>
                          <TableCell className="py-3 font-bold text-right" style={{ color: colors.brandGreen700, fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                            {formatINR(item.line_value)}
                          </TableCell>
                          <TableCell className="py-3">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => removeTransferItem(index)}
                              className="text-[#C0392B] hover:text-[#C0392B] hover:bg-[#FDF0EF] h-8 w-8 p-0 transition-all duration-200 hover:scale-110 active:scale-95"
                              style={{ borderRadius: `${radius.md}px`, backgroundColor: 'transparent' }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Total Value */}
              {transferItems.length > 0 && (
                <div className="rounded-lg p-6 border-2" style={{ backgroundColor: colors.brandGreen25, borderColor: colors.brandGreen700, borderRadius: `${radius.lg}px` }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Total Transfer Value</span>
                    <span className="text-2xl font-bold" style={{ color: colors.brandGreen700, fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{formatINR(totalValue)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="space-y-3">
              <Label htmlFor="remarks" className="text-sm font-semibold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any additional notes or instructions..."
                rows={3}
                className="border-[#D4C4BC] text-[#2B1D15] placeholder:text-[#7A5A4A] focus:border-[#D4551A] focus:ring-2 focus:ring-[#D4551A]/20 transition-all duration-200 resize-none"
                style={{ borderRadius: `${radius.md}px`, fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-8 border-t border-[#D4C4BC]">
              <Button
                type="button"
                onClick={handleSaveTransfer}
                disabled={loading || transferItems.length === 0}
                className="text-white border-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ 
                  backgroundColor: colors.brandOrange700, 
                  borderRadius: `${radius.md}px`, 
                  height: spacing.buttonHeight, 
                  fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
                  transitionTimingFunction: motion.easeOutQuart,
                  opacity: (loading || transferItems.length === 0) ? 0.5 : 1
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Transfer'}
              </Button>
              <Button
                type="button"
                onClick={handlePrintChallan}
                disabled={transferItems.length === 0}
                className="border-[#D4C4BC] text-[#2B1D15] hover:bg-[#FAF5F2] hover:border-[#D4551A] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ 
                  backgroundColor: 'transparent',
                  borderRadius: `${radius.md}px`, 
                  height: spacing.buttonHeight, 
                  fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
                  transitionTimingFunction: motion.easeOutQuart,
                  opacity: transferItems.length === 0 ? 0.5 : 1
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Challan
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transfer Challan Modal */}
      {showChallan && (
        <TransferChallan
          transferNumber={transferNumber}
          transferDate={transferDate}
          transferType={transferType}
          fromFarmName={getFarmName(fromFarmId)}
          fromBatchNumber={getBatchNumber(fromBatchId)}
          toFarmName={transferType === 'F2F' ? getFarmName(toFarmId) : undefined}
          toBatchNumber={transferType === 'F2F' ? getBatchNumber(toBatchId) : undefined}
          toBranchName={transferType === 'F2B' ? getBranchName(toBranchId) : undefined}
          vehicleNumber={getVehicleNumber(vehicleId)}
          driverName={getDriverName(driverId)}
          remarks={remarks}
          transferItems={transferItems.map(item => ({
            ...item,
            product_name: getProductName(item.product_id),
            unit_of_measure: products.find(p => p.id === item.product_id)?.unit_of_measure || ''
          }))}
          onClose={() => setShowChallan(false)}
        />
      )}
    </div>
  );
}

// Helper component for batch options
function BatchOptions({ farmId, supabase }: { farmId: string; supabase: any }) {
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('batches')
          .select('*')
          .eq('farm_id', farmId)
          .order('placement_date', { ascending: false });

        if (error) throw error;
        setBatches(data || []);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    fetchBatches();
  }, [farmId, supabase]);

  return (
    <>
      {batches.map((batch) => (
        <SelectItem key={batch.id} value={batch.id} className="text-[#2B1D15] hover:bg-[#FAF5F2]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
          Batch #{batch.batch_number} - {batch.birds_placed} birds
        </SelectItem>
      ))}
    </>
  );
}
