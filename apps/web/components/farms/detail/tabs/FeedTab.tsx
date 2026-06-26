'use client';

import { useState } from 'react';
import { TrendDown, Paperclip } from '@phosphor-icons/react';
import { UploadDocumentModal } from '@/components/farms/docs/UploadDocumentModal';

interface FeedTabProps {
  farmId: string;
  batchId: string;
}

// Mock feed inventory data
const mockFeedInventory = {
  openingStock: 50000, // kg
  consumedToDate: 35000, // kg
  remaining: 15000, // kg
  dailyConsumption: 1250, // kg/day avg
  daysRemaining: 12,
};

// Mock feed purchase log
const mockFeedPurchases = [
  { date: '2026-05-01', supplier: 'ABC Feeds', type: 'Starter', qty: 10, rate: 45, totalCost: 450000, invoice: 'INV-001', marketRate: 48 },
  { date: '2026-05-15', supplier: 'ABC Feeds', type: 'Grower', qty: 15, rate: 42, totalCost: 630000, invoice: 'INV-002', marketRate: 44 },
  { date: '2026-05-20', supplier: 'XYZ Feeds', type: 'Finisher', qty: 10, rate: 40, totalCost: 400000, invoice: 'INV-003', marketRate: 42 },
];

export function FeedTab({ farmId, batchId }: FeedTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  const totalPurchased = mockFeedPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalQty = mockFeedPurchases.reduce((sum, p) => sum + p.qty, 0);
  const avgRate = totalQty > 0 ? totalPurchased / totalQty : 0;

  return (
    <div className="space-y-6">
      {/* Feed Inventory Tracker */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feed Inventory</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Stock Level</span>
            <span className="font-semibold text-gray-900">{mockFeedInventory.remaining.toLocaleString()} kg remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${mockFeedInventory.daysRemaining < 7 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(mockFeedInventory.remaining / mockFeedInventory.openingStock) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ~{mockFeedInventory.daysRemaining} days of feed remaining
            {mockFeedInventory.daysRemaining < 7 && (
              <span className="text-red-600 font-semibold ml-2">⚠ Low stock warning</span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Opening Stock</p>
            <p className="font-semibold text-gray-900">{mockFeedInventory.openingStock.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-gray-600">Consumed to Date</p>
            <p className="font-semibold text-gray-900">{mockFeedInventory.consumedToDate.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-gray-600">Daily Avg</p>
            <p className="font-semibold text-gray-900">{mockFeedInventory.dailyConsumption.toLocaleString()} kg/day</p>
          </div>
          <div>
            <p className="text-gray-600">Days Remaining</p>
            <p className={`font-semibold ${mockFeedInventory.daysRemaining < 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {mockFeedInventory.daysRemaining} days
            </p>
          </div>
        </div>
      </div>

      {/* Feed Purchase Log */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feed Purchase Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Supplier</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Qty (MT)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Rate (₹/kg)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">vs Market Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Total Cost</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Invoice #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockFeedPurchases.map((purchase, index) => {
                const savings = (purchase.marketRate - purchase.rate) * purchase.qty * 1000; // Convert MT to kg
                const savingsPercent = ((purchase.marketRate - purchase.rate) / purchase.marketRate) * 100;
                
                // Colour coding based on audit specification: red >5%, amber 1-5%, green ≤0%
                const getVsMarketColor = (percent: number) => {
                  if (percent > 5) return 'text-red-600 bg-red-50';
                  if (percent > 0) return 'text-amber-600 bg-amber-50';
                  return 'text-green-600 bg-green-50';
                };
                
                const vsMarketColor = getVsMarketColor(Math.abs(savingsPercent));
                
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{purchase.date}</td>
                    <td className="px-4 py-3 text-gray-900">{purchase.supplier}</td>
                    <td className="px-4 py-3 text-gray-900">{purchase.type}</td>
                    <td className="px-4 py-3 text-gray-900">{purchase.qty}</td>
                    <td className="px-4 py-3 text-gray-900">₹{purchase.rate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">₹{purchase.marketRate}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${vsMarketColor}`}>
                          {savings > 0 ? `↓ ₹${savings.toFixed(0)} (${savingsPercent.toFixed(1)}%)` : `↑ ₹${Math.abs(savings).toFixed(0)} (${Math.abs(savingsPercent).toFixed(1)}%)`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">₹{(purchase.totalCost / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-gray-900">{purchase.invoice}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setShowUploadModal(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-600"
                        title="Attach invoice"
                      >
                        <Paperclip size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-gray-900">Total</td>
                <td className="px-4 py-3 text-gray-900">{totalQty} MT</td>
                <td className="px-4 py-3 text-gray-900">₹{avgRate.toFixed(0)}/kg avg</td>
                <td className="px-4 py-3 text-gray-900">-</td>
                <td className="px-4 py-3 text-gray-900">₹{(totalPurchased / 1000).toFixed(0)}K</td>
                <td className="px-4 py-3 text-gray-900">-</td>
                <td className="px-4 py-3 text-gray-900">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feed Cost Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feed Cost Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Feed Cost This Batch</p>
            <p className="text-2xl font-bold text-gray-900">₹{(totalPurchased / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Cost per kg Produced (est.)</p>
            <p className="text-2xl font-bold text-gray-900">₹{avgRate.toFixed(0)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Feed as % of Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">~65%</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <TrendDown size={18} className="text-green-600" />
          <span className="text-gray-600">Feed cost ₹15K lower vs last batch</span>
        </div>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedPurchase(null);
        }}
        farmId={farmId}
        batchId={batchId}
        initialDocType="feed_invoice"
        onUploadSuccess={() => {
          setShowUploadModal(false);
          setSelectedPurchase(null);
        }}
      />
    </div>
  );
}
