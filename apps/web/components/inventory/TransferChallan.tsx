'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Printer, X, Truck, User, Package, ArrowRight, Calendar, MapPin } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { colors, spacing, radius, motion } from '@poultrypulse/ui/src/tokens';

interface TransferItem {
  product_id: string;
  product_name: string;
  unit_of_measure: string;
  quantity_sent: number;
  unit_rate: number;
  line_value: number;
}

interface TransferChallanProps {
  transferNumber: string;
  transferDate: string;
  transferType: 'F2F' | 'F2B';
  fromFarmName: string;
  fromBatchNumber: string;
  toFarmName?: string;
  toBatchNumber?: string;
  toBranchName?: string;
  vehicleNumber?: string;
  driverName?: string;
  remarks?: string;
  transferItems: TransferItem[];
  onClose: () => void;
}

export default function TransferChallan({
  transferNumber,
  transferDate,
  transferType,
  fromFarmName,
  fromBatchNumber,
  toFarmName,
  toBatchNumber,
  toBranchName,
  vehicleNumber,
  driverName,
  remarks,
  transferItems,
  onClose,
}: TransferChallanProps) {
  const totalValue = transferItems.reduce((sum, item) => sum + item.line_value, 0);

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: `${radius.xl}px` }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#D4C4BC] px-6 py-4 flex items-center justify-between" style={{ backgroundColor: colors.white }}>
          <h2 className="text-xl font-bold text-[#2B1D15]">Stock Transfer Challan</h2>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              className="text-white border-0 transition-all duration-200"
              style={{ 
                backgroundColor: colors.brandOrange700, 
                borderRadius: `${radius.md}px`,
                height: spacing.buttonHeight,
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-[#2B1D15] hover:bg-[#FAF5F2]"
              style={{ borderRadius: `${radius.md}px`, height: spacing.buttonHeight }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8" id="challan-content">
          {/* Company Header */}
          <div className="text-center mb-10 pb-8 border-b-2 border-[#D4C4BC]">
            <h1 className="text-4xl font-bold text-[#2B1D15] mb-3" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '-0.02em' }}>STOCK TRANSFER CHALLAN</h1>
            <p className="text-base text-[#4A3528]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.02em' }}>FlockIQ — Poultry Farm Management System</p>
          </div>

          {/* Transfer Details */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#4A3528]">
                <Calendar className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                <span className="text-sm font-semibold">Transfer Date:</span>
                <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{transferDate}</span>
              </div>
              <div className="flex items-center gap-3 text-[#4A3528]">
                <Package className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                <span className="text-sm font-semibold">Transfer Number:</span>
                <span className="font-bold text-[#2B1D15] font-mono" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{transferNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-[#4A3528]">
                <ArrowRight className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                <span className="text-sm font-semibold">Transfer Type:</span>
                <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{transferType === 'F2F' ? 'Farm to Farm' : 'Farm to Branch'}</span>
              </div>
            </div>
            <div className="space-y-4">
              {vehicleNumber && (
                <div className="flex items-center gap-3 text-[#4A3528]">
                  <Truck className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                  <span className="text-sm font-semibold">Vehicle:</span>
                  <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{vehicleNumber}</span>
                </div>
              )}
              {driverName && (
                <div className="flex items-center gap-3 text-[#4A3528]">
                  <User className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                  <span className="text-sm font-semibold">Driver:</span>
                  <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{driverName}</span>
                </div>
              )}
            </div>
          </div>

          {/* From/To Details */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <Card className="border-[#D4C4BC]" style={{ borderRadius: `${radius.lg}px`, backgroundColor: colors.brandOrange25 }}>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider mb-5" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>FROM</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                    <span className="text-sm font-semibold text-[#4A3528]">Farm:</span>
                    <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{fromFarmName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" style={{ color: colors.brandOrange700 }} />
                    <span className="text-sm font-semibold text-[#4A3528]">Batch:</span>
                    <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{fromBatchNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4C4BC]" style={{ borderRadius: `${radius.lg}px`, backgroundColor: colors.brandGreen25 }}>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider mb-5" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>TO</h3>
                <div className="space-y-3">
                  {transferType === 'F2F' ? (
                    <>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5" style={{ color: colors.brandGreen700 }} />
                        <span className="text-sm font-semibold text-[#4A3528]">Farm:</span>
                        <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{toFarmName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5" style={{ color: colors.brandGreen700 }} />
                        <span className="text-sm font-semibold text-[#4A3528]">Batch:</span>
                        <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{toBatchNumber}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" style={{ color: colors.brandGreen700 }} />
                      <span className="text-sm font-semibold text-[#4A3528]">Branch:</span>
                      <span className="font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{toBranchName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <div className="mb-10">
            <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider mb-5" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>TRANSFER ITEMS</h3>
            <div className="border border-[#D4C4BC] rounded-lg overflow-hidden" style={{ borderRadius: `${radius.lg}px` }}>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF5F2] border-b border-[#D4C4BC]">
                    <th className="px-5 py-4 text-left text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>S.No</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Product</th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Quantity</th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Unit Rate</th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-[#2B1D15] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {transferItems.map((item, index) => (
                    <tr key={index} className="border-b border-[#D4C4BC] last:border-b-0">
                      <td className="px-5 py-4 text-sm text-[#2B1D15] font-semibold" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{index + 1}</td>
                      <td className="px-5 py-4 text-sm text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{item.product_name} ({item.unit_of_measure})</td>
                      <td className="px-5 py-4 text-sm text-[#2B1D15] text-right font-variant-numeric tabular-nums" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{item.quantity_sent}</td>
                      <td className="px-5 py-4 text-sm text-[#2B1D15] text-right font-variant-numeric tabular-nums" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{formatINR(item.unit_rate)}</td>
                      <td className="px-5 py-4 text-sm text-[#2B1D15] text-right font-bold font-variant-numeric tabular-nums" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>{formatINR(item.line_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-10">
            <div className="w-96">
              <div className="rounded-lg p-6 border-2" style={{ backgroundColor: colors.brandGreen25, borderColor: colors.brandGreen700, borderRadius: `${radius.lg}px` }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Total Value</span>
                  <span className="text-3xl font-bold" style={{ color: colors.brandGreen700, fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{formatINR(totalValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {remarks && (
            <div className="mb-10">
              <h3 className="text-xs font-bold text-[#2B1D15] uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", letterSpacing: '0.1em' }}>REMARKS</h3>
              <div className="p-5 rounded-lg border border-[#D4C4BC]" style={{ backgroundColor: colors.neutral50, borderRadius: `${radius.lg}px` }}>
                <p className="text-sm text-[#2B1D15]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif", lineHeight: 1.6 }}>{remarks}</p>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="grid grid-cols-3 gap-12 mt-16 pt-10 border-t border-[#D4C4BC]">
            <div className="text-center">
              <div className="h-24 border-b border-[#D4C4BC] mb-3"></div>
              <p className="text-xs font-semibold text-[#4A3528]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Prepared By</p>
            </div>
            <div className="text-center">
              <div className="h-24 border-b border-[#D4C4BC] mb-3"></div>
              <p className="text-xs font-semibold text-[#4A3528]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Verified By</p>
            </div>
            <div className="text-center">
              <div className="h-24 border-b border-[#D4C4BC] mb-3"></div>
              <p className="text-xs font-semibold text-[#4A3528]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Received By</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-[#D4C4BC] text-center">
            <p className="text-xs text-[#7A5A4A]" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>This is a computer-generated document. No signature required.</p>
            <p className="text-xs text-[#7A5A4A] mt-2" style={{ fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>Generated by FlockIQ on {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
