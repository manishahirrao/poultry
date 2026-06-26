'use client';

/**
 * FlockIQ - Record Sale Drawer
 * TASK-GAP2-UI-002: Record Sale Drawer form
 * Requirements: REQ-GAP2-SALES-003
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §2.2
 * 
 * This component implements the sale/lifting event recording form with:
 * - Desktop: right-side drawer (600px wide)
 * - Mobile: full-screen bottom sheet
 * - 5 sections: Sale Details, Buyer Details, Transport, Actual Weight, Notes
 * - Buyer dropdown with New Buyer option
 * - Rate deviation warning logic
 * - Withdrawal period blocking
 * - Close batch checkbox logic
 */

import React, { useState, useEffect } from 'react';
import { X, Truck, Calculator, Plus, Minus, Warning, CheckCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BatchCloseWizard } from './BatchCloseWizard';

interface Buyer {
  buyer_id: string;
  name: string;
  phone?: string;
  location?: string;
  buyer_type?: string;
}

interface BatchData {
  id: string;
  batch_number: string;
  current_day: number;
  birds_alive: number;
  birds_placed: number;
  avg_weight_g: number;
  breed: string;
  farm_name: string;
}

interface PriceData {
  p50_price: number;
  region: string;
}

interface WithdrawalStatus {
  has_active_withdrawal: boolean;
  latest_clearance_date: string | null;
  active_medicines?: Array<{
    medicine_name: string;
    clearance_date: string;
  }>;
}

interface RecordSaleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  batchId: string;
  batch: BatchData;
  withdrawalStatus: WithdrawalStatus;
  priceData?: PriceData;
  onSuccess: () => void;
}

export function RecordSaleDrawer({
  isOpen,
  onClose,
  farmId,
  batchId,
  batch,
  withdrawalStatus,
  priceData,
  onSuccess,
}: RecordSaleDrawerProps) {
  // Form state
  const [saleType, setSaleType] = useState<'full' | 'partial'>('full');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [birdsSold, setBirdsSold] = useState(batch.birds_alive);
  const [liveWeightKg, setLiveWeightKg] = useState<number>(0);
  const [ratePerKg, setRatePerKg] = useState<number>(priceData?.p50_price || 0);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [commissionPct, setCommissionPct] = useState<number>(0);
  const [weighmentDeduction, setWeighmentDeduction] = useState<number>(0);
  const [actualAvgWeightG, setActualAvgWeightG] = useState<number>(0);
  
  // Buyer state
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [isNewBuyer, setIsNewBuyer] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newBuyerLocation, setNewBuyerLocation] = useState('');
  const [saveBuyerToDirectory, setSaveBuyerToDirectory] = useState(true);
  
  // Transport state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [destination, setDestination] = useState('');
  const [cratesUsed, setCratesUsed] = useState<number>(0);
  const [deadInTransit, setDeadInTransit] = useState<number>(0);
  
  // Payment and notes
  const [paymentTerms, setPaymentTerms] = useState<'cash' | 'credit' | 'cheque' | 'bank_transfer'>('cash');
  const [creditDays, setCreditDays] = useState<number>(0);
  const [challanNumber, setChallanNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [rateDeviationWarning, setRateDeviationWarning] = useState<string>('');
  const [closeBatchAfterSave, setCloseBatchAfterSave] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['transport', 'actualWeight', 'notes']));
  const [showBatchCloseWizard, setShowBatchCloseWizard] = useState(false);
  
  // Fetch buyers on mount
  useEffect(() => {
    if (isOpen) {
      fetchBuyers();
      // Initialize rate with P50 price
      if (priceData?.p50_price) {
        setRatePerKg(priceData.p50_price);
      }
    }
  }, [isOpen, priceData]);
  
  // Calculate birds remaining after this sale
  const birdsRemaining = batch.birds_alive - birdsSold - deadInTransit;
  
  // Show close batch checkbox only for full harvest or when no birds remaining
  const showCloseBatchCheckbox = saleType === 'full' || birdsRemaining === 0;
  
  // Auto-update close batch checkbox when conditions change
  useEffect(() => {
    if (!showCloseBatchCheckbox) {
      setCloseBatchAfterSave(false);
    }
  }, [showCloseBatchCheckbox]);
  
  // Calculate revenue
  const grossRevenue = liveWeightKg * ratePerKg;
  const commissionTotal = commissionPct > 0 ? grossRevenue * (commissionPct / 100) : commissionAmount;
  const netRevenue = grossRevenue - commissionTotal - weighmentDeduction;
  
  // Rate deviation warning
  useEffect(() => {
    if (priceData?.p50_price && ratePerKg > 0) {
      const deviation = ((ratePerKg - priceData.p50_price) / priceData.p50_price) * 100;
      if (deviation < -15) {
        setRateDeviationWarning(`⚠ Rate is ${Math.abs(deviation).toFixed(1)}% below today's mandi price (₹${priceData.p50_price}/kg). Confirm?`);
      } else {
        setRateDeviationWarning('');
      }
    }
  }, [ratePerKg, priceData]);
  
  // Toggle section collapse
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };
  
  // Fetch buyers
  const fetchBuyers = async () => {
    try {
      const response = await fetch('/api/buyers');
      if (response.ok) {
        const data = await response.json();
        setBuyers(data.buyers || []);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
    }
  };
  
  // Calculate weight from avg weight
  const calculateWeightFromAvg = () => {
    const avgWeightKg = batch.avg_weight_g / 1000;
    const calculatedWeight = birdsSold * avgWeightKg;
    setLiveWeightKg(Math.round(calculatedWeight * 100) / 100);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (withdrawalStatus.has_active_withdrawal) {
      alert(`Cannot record sale. Active withdrawal period until ${withdrawalStatus.latest_clearance_date}`);
      return;
    }
    
    // Validation
    if (!liveWeightKg || liveWeightKg <= 0) {
      alert('Please enter live weight');
      return;
    }
    
    if (!ratePerKg || ratePerKg <= 0) {
      alert('Please enter rate per kg');
      return;
    }
    
    if (birdsSold <= 0 || birdsSold > batch.birds_alive) {
      alert(`Birds sold must be between 1 and ${batch.birds_alive}`);
      return;
    }
    
    if (rateDeviationWarning && !confirm(rateDeviationWarning)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create buyer if new
      let buyerId = selectedBuyerId;
      let buyerNameSnapshot = '';
      
      if (isNewBuyer) {
        if (!newBuyerName || !newBuyerPhone) {
          alert('Please enter buyer name and phone');
          setLoading(false);
          return;
        }
        
        if (saveBuyerToDirectory) {
          const buyerResponse = await fetch('/api/buyers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newBuyerName,
              phone: newBuyerPhone,
              location: newBuyerLocation,
            }),
          });
          
          if (buyerResponse.ok) {
            const buyerData = await buyerResponse.json();
            buyerId = buyerData.buyer_id;
          }
        }
        
        buyerNameSnapshot = newBuyerName;
      } else if (selectedBuyerId) {
        const buyer = buyers.find(b => b.buyer_id === selectedBuyerId);
        buyerNameSnapshot = buyer?.name || '';
      }
      
      // Create sale
      const saleData = {
        batch_id: batchId,
        sale_date: saleDate,
        sale_type: saleType,
        birds_sold: birdsSold,
        total_weight_kg: liveWeightKg,
        actual_avg_weight_g: actualAvgWeightG || Math.round((liveWeightKg / birdsSold) * 1000),
        rate_per_kg: ratePerKg,
        commission_amount: commissionPct > 0 ? 0 : commissionAmount,
        commission_pct: commissionPct > 0 ? commissionPct : null,
        weighment_deduction_kg: weighmentDeduction,
        buyer_id: buyerId || null,
        buyer_name_snapshot: buyerNameSnapshot || null,
        vehicle_number: vehicleNumber || null,
        driver_name: driverName || null,
        departure_time: departureTime || null,
        destination: destination || null,
        crates_used: cratesUsed || null,
        dead_in_transit: deadInTransit || 0,
        payment_status: 'pending' as const,
        challan_number: challanNumber || null,
        notes: notes || null,
      };
      
      const response = await fetch(`/api/farms/${farmId}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });
      
      if (response.ok) {
        onSuccess();
        onClose();
        
        // Show close batch wizard if checkbox is checked
        if (closeBatchAfterSave) {
          setShowBatchCloseWizard(true);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to record sale');
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Failed to record sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Record Sale / Lifting Event</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Batch #{batch.batch_number} — Day {batch.current_day} — {batch.farm_name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Withdrawal Warning */}
              {withdrawalStatus.has_active_withdrawal && (
                <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Warning size={20} className="text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">WITHDRAWAL PERIOD ACTIVE</p>
                      <p className="text-sm text-red-800 mt-1">
                        Cannot record sale until {withdrawalStatus.latest_clearance_date}
                      </p>
                      {withdrawalStatus.active_medicines && withdrawalStatus.active_medicines.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-red-700">Active medicines:</p>
                          <ul className="list-disc list-inside text-xs text-red-700">
                            {withdrawalStatus.active_medicines.map((med, idx) => (
                              <li key={idx}>{med.medicine_name} — Clear by {med.clearance_date}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECTION 1: SALE DETAILS */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Sale Details</h3>
                
                {/* Sale Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Sale Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="full"
                        checked={saleType === 'full'}
                        onChange={(e) => {
                          setSaleType(e.target.value as 'full' | 'partial');
                          setBirdsSold(batch.birds_alive);
                        }}
                        className="w-4 h-4 text-green-600"
                      />
                      <span>Full Harvest</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="partial"
                        checked={saleType === 'partial'}
                        onChange={(e) => setSaleType(e.target.value as 'full' | 'partial')}
                        className="w-4 h-4 text-green-600"
                      />
                      <span>Partial Harvest</span>
                    </label>
                  </div>
                </div>
                
                {/* Birds to Sell (for partial) */}
                {saleType === 'partial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birds to sell in this lift *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBirdsSold(Math.max(1, birdsSold - 100))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={birdsSold}
                        onChange={(e) => setBirdsSold(parseInt(e.target.value) || 0)}
                        min={1}
                        max={batch.birds_alive}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setBirdsSold(Math.min(batch.birds_alive, birdsSold + 100))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Remaining after this lift: {birdsRemaining.toLocaleString()} birds
                    </p>
                  </div>
                )}
                
                {/* Live Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Live Weight (total kg) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={liveWeightKg}
                      onChange={(e) => setLiveWeightKg(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Total live weight"
                      required
                    />
                    <button
                      type="button"
                      onClick={calculateWeightFromAvg}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    >
                      <Calculator size={16} />
                      Calc
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total live weight of birds being sold in this lift
                  </p>
                </div>
                
                {/* Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate (₹/kg) *
                  </label>
                  <input
                    type="number"
                    value={ratePerKg}
                    onChange={(e) => setRatePerKg(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Rate per kg"
                    required
                  />
                  {priceData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Today's mandi P50: ₹{priceData.p50_price}/kg ({priceData.region})
                    </p>
                  )}
                  {rateDeviationWarning && (
                    <p className="text-sm text-amber-600 mt-1">{rateDeviationWarning}</p>
                  )}
                </div>
                
                {/* Revenue Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Gross Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">₹{grossRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Revenue</p>
                      <p className="text-lg font-semibold text-green-700">₹{netRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Deductions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Deductions (Optional)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Commission (₹)</label>
                      <input
                        type="number"
                        value={commissionAmount}
                        onChange={(e) => {
                          setCommissionAmount(parseFloat(e.target.value) || 0);
                          setCommissionPct(0);
                        }}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Commission (%)</label>
                      <input
                        type="number"
                        value={commissionPct}
                        onChange={(e) => {
                          setCommissionPct(parseFloat(e.target.value) || 0);
                          setCommissionAmount(0);
                        }}
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weighment Deduction (kg)</label>
                    <input
                      type="number"
                      value={weighmentDeduction}
                      onChange={(e) => setWeighmentDeduction(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* SECTION 2: BUYER DETAILS */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Buyer Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buyer *
                  </label>
                  <select
                    value={isNewBuyer ? 'new' : selectedBuyerId}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setIsNewBuyer(true);
                        setSelectedBuyerId('');
                      } else {
                        setIsNewBuyer(false);
                        setSelectedBuyerId(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select buyer</option>
                    {buyers.map((buyer) => (
                      <option key={buyer.buyer_id} value={buyer.buyer_id}>
                        {buyer.name} {buyer.location ? `(${buyer.location})` : ''}
                      </option>
                    ))}
                    <option value="new">+ New Buyer</option>
                  </select>
                </div>
                
                {/* New Buyer Form */}
                {isNewBuyer && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buyer Name *
                      </label>
                      <input
                        type="text"
                        value={newBuyerName}
                        onChange={(e) => setNewBuyerName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={newBuyerPhone}
                        onChange={(e) => setNewBuyerPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newBuyerLocation}
                        onChange={(e) => setNewBuyerLocation(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveBuyerToDirectory}
                        onChange={(e) => setSaveBuyerToDirectory(e.target.checked)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">Save to buyer directory</span>
                    </label>
                  </div>
                )}
                
                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                
                {paymentTerms === 'credit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Days
                    </label>
                    <input
                      type="number"
                      value={creditDays}
                      onChange={(e) => setCreditDays(parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice / Challan Number
                  </label>
                  <input
                    type="text"
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* SECTION 3: TRANSPORT / LIFTING LOGISTICS */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleSection('transport')}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Transport / Logistics (Optional)</h3>
                  <span className="text-gray-400">
                    {collapsedSections.has('transport') ? '+' : '−'}
                  </span>
                </button>
                
                {!collapsedSections.has('transport') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Number
                        </label>
                        <input
                          type="text"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Driver Name
                        </label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Departure Time
                        </label>
                        <input
                          type="time"
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Crates Used
                        </label>
                        <input
                          type="number"
                          value={cratesUsed}
                          onChange={(e) => setCratesUsed(parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dead Birds in Transit
                        </label>
                        <input
                          type="number"
                          value={deadInTransit}
                          onChange={(e) => setDeadInTransit(parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* SECTION 4: ACTUAL WEIGHT AT HARVEST */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleSection('actualWeight')}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Actual Weight at Harvest *</h3>
                  <span className="text-gray-400">
                    {collapsedSections.has('actualWeight') ? '+' : '−'}
                  </span>
                </button>
                
                {!collapsedSections.has('actualWeight') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Average Weight at Sale (g/bird) *
                      </label>
                      <input
                        type="number"
                        value={actualAvgWeightG}
                        onChange={(e) => setActualAvgWeightG(parseFloat(e.target.value) || 0)}
                        step="1"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This is the confirmed weight at buyer's weighment
                      </p>
                      {actualAvgWeightG > 0 && batch.avg_weight_g > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Estimated was {batch.avg_weight_g}g — actual: {actualAvgWeightG}g — {((actualAvgWeightG - batch.avg_weight_g) / batch.avg_weight_g * 100).toFixed(1)}% {actualAvgWeightG < batch.avg_weight_g ? 'lower' : 'higher'}
                        </p>
                      )}
                    </div>
                    
                    {actualAvgWeightG > 0 && batch.avg_weight_g > 0 && actualAvgWeightG < batch.avg_weight_g * 0.95 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          ⚠ Weight is {((batch.avg_weight_g - actualAvgWeightG) / batch.avg_weight_g * 100).toFixed(1)}% below estimate. 
                          This will be reflected in batch performance analysis.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* SECTION 5: NOTES */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleSection('notes')}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Notes (Optional)</h3>
                  <span className="text-gray-400">
                    {collapsedSections.has('notes') ? '+' : '−'}
                  </span>
                </button>
                
                {!collapsedSections.has('notes') && (
                  <div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                      maxLength={300}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Add any additional notes about this sale..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {notes.length}/300 characters
                    </p>
                  </div>
                )}
              </div>
              
              {/* FOOTER */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-4">
                {/* Close Batch Checkbox */}
                {showCloseBatchCheckbox && (
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-green-50 border border-green-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={closeBatchAfterSave}
                      onChange={(e) => setCloseBatchAfterSave(e.target.checked)}
                      className="w-5 h-5 text-green-600"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Close batch after saving this sale</span>
                      <p className="text-xs text-gray-600 mt-1">
                        This will trigger the Batch Close Wizard
                      </p>
                    </div>
                  </label>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || withdrawalStatus.has_active_withdrawal}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      loading || withdrawalStatus.has_active_withdrawal
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-700 text-white hover:bg-green-800'
                    }`}
                  >
                    {loading ? (
                      'Saving...'
                    ) : (
                      <>
                        <Truck size={20} weight="bold" />
                        Save Lifting Event
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
      
      {/* Batch Close Wizard */}
      <BatchCloseWizard
        isOpen={showBatchCloseWizard}
        onClose={() => setShowBatchCloseWizard(false)}
        batch={{
          id: batchId,
          batch_number: batch.batch_number || 'N/A',
          breed: batch.breed || 'Unknown',
          birds_placed: batch.birds_placed || batch.birds_alive,
          birds_sold: batch.birds_alive - birdsRemaining,
          total_mortality: batch.birds_placed - batch.birds_alive,
          avg_weight_kg: batch.avg_weight_g / 1000,
          fcr: 1.8, // Would come from batch data
          duration_days: batch.current_day || 35,
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          total_revenue: netRevenue,
          total_cost: 0, // Would come from P&L API
          gross_profit: netRevenue * 0.8, // Estimate
          profit_per_bird: (netRevenue * 0.8) / batch.birds_alive,
          farm_name: batch.farm_name || 'Farm',
        }}
        farmId={farmId}
      />
    </AnimatePresence>
  );
}
