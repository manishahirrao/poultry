'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Calculator, Check } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import useSWR from 'swr';

interface Batch {
  id: string;
  batch_number: string;
  farm_id: string;
  farm_name: string;
  shed_id: string;
  shed_name: string;
  birds_placed: number;
  birds_alive: number;
  avg_weight_g: number;
  placement_date: string;
  status: string;
}

interface Trader {
  id: string;
  trader_name: string;
  phone: string;
  address: string;
}

interface BirdSaleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  const result = await response.json();
  return result.data;
};

export default function BirdSaleForm({ onSuccess, onCancel }: BirdSaleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    batch_id: '',
    trader_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    birds_sold: 0,
    avg_weight_kg: 0,
    rate_per_kg: 0,
    transport_cost: 0,
    commission_rate: 0,
    remarks: '',
  });

  const { data: batches } = useSWR<Batch[]>('/api/broiler/batches?status=active', fetcher);
  const { data: traders } = useSWR<Trader[]>('/api/broiler/traders', fetcher);

  const selectedBatch = batches?.find(b => b.id === formData.batch_id);
  const selectedTrader = traders?.find(t => t.id === formData.trader_id);

  // Calculate totals
  const totalWeightKg = formData.birds_sold * formData.avg_weight_kg;
  const saleAmount = totalWeightKg * formData.rate_per_kg;
  const commissionAmount = saleAmount * (formData.commission_rate / 100);
  const netAmount = saleAmount - commissionAmount - formData.transport_cost;

  // Calculate GC (Feed Conversion Ratio)
  const feedConsumed = selectedBatch?.birds_placed ? selectedBatch.birds_placed * 5 : 0; // Approximate
  const gc = totalWeightKg > 0 ? feedConsumed / totalWeightKg : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/broiler/bird-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_weight_kg: totalWeightKg,
          sale_amount: saleAmount,
          commission_amount: commissionAmount,
          net_amount: netAmount,
          gc,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record sale');
      }

      // Reset form
      setFormData({
        batch_id: '',
        trader_id: '',
        sale_date: new Date().toISOString().split('T')[0],
        birds_sold: 0,
        avg_weight_kg: 0,
        rate_per_kg: 0,
        transport_cost: 0,
        commission_rate: 0,
        remarks: '',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error recording bird sale:', error);
      alert(error instanceof Error ? error.message : 'Failed to record bird sale / पक्षी बिक्री दर्ज करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Bird Sale / Harvest / पक्षी बिक्री</h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Record bird sales and generate payment vouchers / पक्षी बिक्री दर्ज करें और भुगतान वाउचर बनाएं
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sale Entry Form */}
        <div className="lg:col-span-2">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="border-b border-neutral-200 bg-neutral-50">
              <CardTitle className="text-neutral-900 text-xl font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-brandGreen700" />
                Sale Entry / बिक्री प्रविष्टि
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Batch Selection */}
                <div className="space-y-2">
                  <Label htmlFor="batch_id" className="text-neutral-900 font-medium">Batch / बैच *</Label>
                  <Select
                    value={formData.batch_id}
                    onValueChange={(value) => setFormData({ ...formData, batch_id: value })}
                  >
                    <SelectTrigger className="border-neutral-200">
                      <SelectValue placeholder="Select batch / बैच चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_number} - {batch.farm_name} ({batch.shed_name}) - {batch.birds_alive} birds
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trader Selection */}
                <div className="space-y-2">
                  <Label htmlFor="trader_id" className="text-neutral-900 font-medium">Trader / व्यापारी *</Label>
                  <Select
                    value={formData.trader_id}
                    onValueChange={(value) => setFormData({ ...formData, trader_id: value })}
                  >
                    <SelectTrigger className="border-neutral-200">
                      <SelectValue placeholder="Select trader / व्यापारी चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {traders?.map((trader) => (
                        <SelectItem key={trader.id} value={trader.id}>
                          {trader.trader_name} - {trader.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sale Date */}
                <div className="space-y-2">
                  <Label htmlFor="sale_date" className="text-neutral-900 font-medium">Sale Date / बिक्री तिथि *</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    className="border-neutral-200"
                    required
                  />
                </div>

                {/* Birds Sold */}
                <div className="space-y-2">
                  <Label htmlFor="birds_sold" className="text-neutral-900 font-medium">Birds Sold / बेचे गए पक्षी *</Label>
                  <Input
                    id="birds_sold"
                    type="number"
                    value={formData.birds_sold || ''}
                    onChange={(e) => setFormData({ ...formData, birds_sold: parseFloat(e.target.value) || 0 })}
                    className="border-neutral-200"
                    placeholder="Enter number of birds sold"
                    required
                    min="1"
                    max={selectedBatch?.birds_alive || 0}
                  />
                  {selectedBatch && (
                    <p className="text-xs text-neutral-600">
                      Available: {selectedBatch.birds_alive} birds / उपलब्ध: {selectedBatch.birds_alive} पक्षी
                    </p>
                  )}
                </div>

                {/* Average Weight */}
                <div className="space-y-2">
                  <Label htmlFor="avg_weight_kg" className="text-neutral-900 font-medium">Avg Weight (kg) / औसत वजन *</Label>
                  <Input
                    id="avg_weight_kg"
                    type="number"
                    step="0.01"
                    value={formData.avg_weight_kg || ''}
                    onChange={(e) => setFormData({ ...formData, avg_weight_kg: parseFloat(e.target.value) || 0 })}
                    className="border-neutral-200"
                    placeholder="Enter average weight per bird"
                    required
                    min="0.5"
                    max="5"
                  />
                </div>

                {/* Rate per kg */}
                <div className="space-y-2">
                  <Label htmlFor="rate_per_kg" className="text-neutral-900 font-medium">Rate per kg (₹) / प्रति किग्रा दर *</Label>
                  <Input
                    id="rate_per_kg"
                    type="number"
                    step="0.5"
                    value={formData.rate_per_kg || ''}
                    onChange={(e) => setFormData({ ...formData, rate_per_kg: parseFloat(e.target.value) || 0 })}
                    className="border-neutral-200"
                    placeholder="Enter rate per kg"
                    required
                    min="100"
                    max="300"
                  />
                </div>

                {/* Transport Cost */}
                <div className="space-y-2">
                  <Label htmlFor="transport_cost" className="text-neutral-900 font-medium">Transport Cost (₹) / परिवहन लागत</Label>
                  <Input
                    id="transport_cost"
                    type="number"
                    step="0.5"
                    value={formData.transport_cost || ''}
                    onChange={(e) => setFormData({ ...formData, transport_cost: parseFloat(e.target.value) || 0 })}
                    className="border-neutral-200"
                    placeholder="Enter transport cost"
                    min="0"
                  />
                </div>

                {/* Commission Rate */}
                <div className="space-y-2">
                  <Label htmlFor="commission_rate" className="text-neutral-900 font-medium">Commission Rate (%) / कमीशन दर</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.1"
                    value={formData.commission_rate || ''}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    className="border-neutral-200"
                    placeholder="Enter commission percentage"
                    min="0"
                    max="10"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-neutral-900 font-medium">Remarks / टिप्पणियाँ</Label>
                  <textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full border-neutral-200 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brandGreen700"
                    placeholder="Enter any additional notes"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !formData.batch_id || !formData.trader_id}
                    className="bg-brandOrange700 hover:bg-brandOrange600 text-white border-0 transition-colors duration-200 flex-1"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Record Sale & Generate Voucher / बिक्री दर्ज करें और वाउचर बनाएं
                      </span>
                    )}
                  </Button>
                  {onCancel && (
                    <Button
                      type="button"
                      onClick={onCancel}
                      className="border border-neutral-200 text-neutral-900 hover:bg-neutral-50 bg-white"
                    >
                      Cancel / रद्द करें
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Summary */}
        <div className="space-y-6">
          {/* Sale Summary */}
          <Card className="border-neutral-200 shadow-sm bg-neutral-50">
            <CardHeader className="border-b border-neutral-200 bg-neutral-50">
              <CardTitle className="text-neutral-900 text-lg font-semibold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brandGreen700" />
                Sale Summary / बिक्री सारांश
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Total Weight / कुल वजन</span>
                <span className="text-lg font-bold text-neutral-900">{totalWeightKg.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Sale Amount / बिक्री राशि</span>
                <span className="text-lg font-bold text-brandGreen700">{formatINR(saleAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Commission / कमीशन</span>
                <span className="text-lg font-bold text-red-600">-{formatINR(commissionAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Transport / परिवहन</span>
                <span className="text-lg font-bold text-red-600">-{formatINR(formData.transport_cost)}</span>
              </div>
              <div className="pt-3 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-neutral-900">Net Amount / शुद्ध राशि</span>
                  <span className="text-2xl font-bold text-brandGreen700">{formatINR(netAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GC Calculation */}
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="border-b border-neutral-200 bg-neutral-50">
              <CardTitle className="text-neutral-900 text-lg font-semibold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brandGreen700" />
                GC (Feed Conversion) / फीड रूपांतरण
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">GC Ratio</span>
                <span className={`text-2xl font-bold ${gc <= 1.8 ? 'text-brandGreen700' : gc <= 2.0 ? 'text-amber-500' : 'text-red-600'}`}>
                  {gc.toFixed(2)}
                </span>
              </div>
              <div className={`p-3 rounded-lg text-sm ${gc <= 1.8 ? 'bg-green-50 text-green-800' : gc <= 2.0 ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'}`}>
                {gc <= 1.8 ? '✅ Excellent GC / उत्कृष्ट फीड रूपांतरण' : gc <= 2.0 ? '⚠️ Good GC / अच्छा फीड रूपांतरण' : '🔴 High GC / उच्च फीड रूपांतरण'}
              </div>
            </CardContent>
          </Card>

          {/* Trader Info */}
          {selectedTrader && (
            <Card className="border-neutral-200 shadow-sm">
              <CardHeader className="border-b border-neutral-200 bg-neutral-50">
                <CardTitle className="text-neutral-900 text-lg font-semibold">Trader Details / व्यापारी विवरण</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Name / नाम</p>
                  <p className="font-semibold text-neutral-900">{selectedTrader.trader_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Phone / फोन</p>
                  <p className="font-semibold text-neutral-900">{selectedTrader.phone}</p>
                </div>
                {selectedTrader.address && (
                  <div>
                    <p className="text-sm text-neutral-600">Address / पता</p>
                    <p className="text-sm text-neutral-900">{selectedTrader.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
