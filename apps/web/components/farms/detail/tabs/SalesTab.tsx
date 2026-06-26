'use client';

/**
 * FlockIQ - Sales Tab
 * TASK-GAP2-UI-001: Sales Tab: page shell + harvest readiness panel
 * TASK-GAP2-UI-002: Record Sale Drawer form
 * TASK-GAP2-UI-003: Batch Close Wizard modal
 * TASK-INT-001: Withdrawal block integration: Treatment → Sales tab
 * TASK-GAP7-UI-002: Cross-tab document attachment buttons
 * Requirements: REQ-GAP2-SALES-001 through REQ-GAP2-SALES-005
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §2
 * 
 * This component implements the complete sales management with:
 * - Harvest readiness panel with withdrawal status check
 * - Sales summary bar with KPI tiles
 * - Sales log table with export functionality
 * - Record sale drawer with 5-section form
 * - Buyer directory management
 * - Document attachment for sales invoices
 * - Cross-tab integration with treatment withdrawal status
 * - CSV export functionality
 * 
 * Integration: Integrated into FarmDetailTabs.tsx as "Sales" tab
 */

import { useState, useEffect } from 'react';
import { HarvestReadinessPanel } from '@/components/farm/sales/HarvestReadinessPanel';
import { SalesSummaryBar } from '@/components/farm/sales/SalesSummaryBar';
import { RecordSaleDrawer } from '@/components/farm/sales/RecordSaleDrawer';
import { BuyerDirectory } from '@/components/farm/sales/BuyerDirectory';
import { BatchCloseWizard } from '@/components/farm/sales/BatchCloseWizard';
import { UploadDocumentModal } from '@/components/farms/docs/UploadDocumentModal';
import { Truck, Plus, FileText, Download, Paperclip } from '@phosphor-icons/react';

interface SalesTabProps {
  farmId: string;
  batchId: string;
}

interface Sale {
  sale_id: string;
  sale_date: string;
  sale_type: 'full' | 'partial';
  birds_sold: number;
  total_weight_kg: number;
  rate_per_kg: number;
  gross_revenue: number;
  net_revenue: number;
  buyer_name?: string;
  vehicle_number?: string;
  payment_status: 'pending' | 'confirmed' | 'paid';
  notes?: string;
  commission_amount?: number;
  weighment_deduction_kg?: number;
  destination?: string;
  crates_used?: number | string;
  dead_in_transit?: number;
  challan_number?: string;
}

interface WithdrawalStatus {
  has_active_withdrawal: boolean;
  latest_clearance_date: string | null;
  active_medicines?: Array<{
    medicine_name: string;
    clearance_date: string;
  }>;
}

export function SalesTab({ farmId, batchId }: SalesTabProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus>({
    has_active_withdrawal: false,
    latest_clearance_date: null,
  });
  const [batch, setBatch] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRecordSaleDrawer, setShowRecordSaleDrawer] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBatchCloseWizard, setShowBatchCloseWizard] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchData();
  }, [farmId, batchId]);

  // Listen for treatment changes to re-fetch withdrawal status
  useEffect(() => {
    const handleTreatmentChange = (event: CustomEvent) => {
      // Only re-fetch if the event is for this batch
      if (event.detail.batchId === batchId) {
        fetchData();
      }
    };

    // Type the event properly
    window.addEventListener('treatment:added', handleTreatmentChange as EventListener);

    return () => {
      window.removeEventListener('treatment:added', handleTreatmentChange as EventListener);
    };
  }, [batchId, farmId]);

  // Check withdrawal status every 6 hours to auto-lift block when clearance_date passes
  useEffect(() => {
    if (!withdrawalStatus.has_active_withdrawal || !withdrawalStatus.latest_clearance_date) {
      return;
    }

    const checkClearanceDate = () => {
      if (!withdrawalStatus.latest_clearance_date) return;
      const clearanceDate = new Date(withdrawalStatus.latest_clearance_date);
      const now = new Date();
      
      // If clearance date has passed, re-fetch to lift the block
      if (now >= clearanceDate) {
        fetchData();
      }
    };

    // Check immediately on mount
    checkClearanceDate();

    // Set up interval to check every 6 hours
    const interval = setInterval(checkClearanceDate, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [withdrawalStatus.has_active_withdrawal, withdrawalStatus.latest_clearance_date, farmId, batchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales data
      const salesResponse = await fetch(`/api/farms/${farmId}/sales?batchId=${batchId}`);
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSales(salesData.sales || []);
        setBatch(salesData.batch);
        setPriceData(salesData.priceData);
      }

      // Fetch withdrawal status
      const treatmentResponse = await fetch(`/api/farms/${farmId}/treatments?batchId=${batchId}`);
      if (treatmentResponse.ok) {
        const treatmentData = await treatmentResponse.json();
        setWithdrawalStatus(treatmentData.withdrawal_status || {
          has_active_withdrawal: false,
          latest_clearance_date: null,
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSale = () => {
    setShowRecordSaleDrawer(true);
  };

  const handleCloseBatch = () => {
    setShowBatchCloseWizard(true);
  };

  const handleExportCSV = () => {
    if (sales.length === 0) {
      alert('No sales data to export');
      return;
    }

    // Create CSV content
    const headers = ['Sale#', 'Date', 'Birds Sold', 'Live Weight (kg)', 'Rate (₹/kg)', 'Gross Revenue (₹)', 'Commission (₹)', 'Weighment Deduction (kg)', 'Net Revenue (₹)', 'Buyer', 'Vehicle Number', 'Driver Name', 'Destination', 'Crates Used', 'Dead in Transit', 'Payment Status', 'Challan Number', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...sales.map((sale, index) => [
        index + 1,
        new Date(sale.sale_date).toLocaleDateString('en-IN'),
        sale.birds_sold,
        sale.total_weight_kg.toFixed(2),
        sale.rate_per_kg.toFixed(2),
        sale.gross_revenue.toFixed(2),
        sale.commission_amount || 0,
        sale.weighment_deduction_kg || 0,
        sale.net_revenue.toFixed(2),
        sale.buyer_name || '',
        sale.vehicle_number || '',
        '',
        sale.destination || '',
        sale.crates_used || '',
        sale.dead_in_transit || 0,
        sale.payment_status,
        sale.challan_number || '',
        sale.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `batch_sales_${batchId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const totalBirdsSold = sales.reduce((sum, sale) => sum + sale.birds_sold, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.net_revenue, 0);
  const avgRate = sales.length > 0 ? totalRevenue / sales.reduce((sum, sale) => sum + sale.total_weight_kg, 0) : 0;
  const remainingBirds = batch ? batch.birds_alive - totalBirdsSold : 0;

  return (
    <div className="space-y-6">
      {/* Harvest Readiness Panel */}
      {batch && (
        <HarvestReadinessPanel
          batch={batch}
          withdrawalStatus={withdrawalStatus}
          priceData={priceData}
          onRecordSale={handleRecordSale}
          onCloseBatch={handleCloseBatch}
        />
      )}

      {/* Sales Summary Bar - shown when there are sales */}
      {sales.length > 0 && batch && (
        <SalesSummaryBar
          totalBirdsSold={totalBirdsSold}
          totalRevenue={totalRevenue}
          avgRate={avgRate}
          remainingBirds={remainingBirds}
          birdsPlaced={batch.birds_placed}
        />
      )}

      {/* Sales Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Sales & Lifting Events — Batch #{batch?.batch_number || 'N/A'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {sales.length === 0 
                ? 'No sales recorded yet for this batch'
                : `${sales.length} sale${sales.length > 1 ? 's' : ''} recorded`
              }
            </p>
          </div>
          <div className="flex gap-3">
            {sales.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
            <button
              onClick={handleRecordSale}
              disabled={withdrawalStatus.has_active_withdrawal}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                withdrawalStatus.has_active_withdrawal
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
              title={withdrawalStatus.has_active_withdrawal 
                ? `Withdrawal period active until ${withdrawalStatus.latest_clearance_date}` 
                : 'Record new sale'
              }
            >
              <Plus size={18} weight="bold" />
              {sales.length === 0 ? 'Record First Sale' : 'Record New Sale'}
            </button>
          </div>
        </div>

        {/* Empty State */}
        {sales.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Truck size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              अभी कोई बिक्री दर्ज नहीं
            </h3>
            <p className="text-gray-600 mb-6">
              No sales recorded yet for this batch
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Record your first lifting event when birds are ready for sale
            </p>
            <button
              onClick={handleRecordSale}
              disabled={withdrawalStatus.has_active_withdrawal}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                withdrawalStatus.has_active_withdrawal
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              <Plus size={20} weight="bold" />
              Record First Sale →
            </button>
          </div>
        ) : (
          /* Sales Table */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sale#
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Birds Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Live Weight (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rate (₹/kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Revenue (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale, index) => (
                  <tr key={sale.sale_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.sale_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.birds_sold.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.total_weight_kg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{sale.rate_per_kg.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{(sale.net_revenue / 1000).toFixed(1)}K
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.buyer_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.vehicle_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : sale.payment_status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.payment_status.charAt(0).toUpperCase() + sale.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowUploadModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-600"
                        title="Attach invoice"
                      >
                        <Paperclip size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buyers Directory Section */}
      <BuyerDirectory farmId={farmId} integratorId={batch.integrator_id || ''} />

      {/* Record Sale Drawer */}
      {batch && (
        <RecordSaleDrawer
          isOpen={showRecordSaleDrawer}
          onClose={() => setShowRecordSaleDrawer(false)}
          farmId={farmId}
          batchId={batchId}
          batch={batch}
          withdrawalStatus={withdrawalStatus}
          priceData={priceData}
          onSuccess={() => {
            fetchData();
            setShowRecordSaleDrawer(false);
          }}
        />
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedSale(null);
        }}
        farmId={farmId}
        batchId={batchId}
        initialDocType="sale_invoice"
        onUploadSuccess={() => {
          setShowUploadModal(false);
          setSelectedSale(null);
        }}
      />

      {/* Batch Close Wizard */}
      {batch && showBatchCloseWizard && (
        <BatchCloseWizard
          isOpen={showBatchCloseWizard}
          onClose={() => setShowBatchCloseWizard(false)}
          batch={{
            id: batch.id || batchId,
            batch_number: String(batch.batch_number || 'N/A'),
            breed: batch.breed || 'Unknown',
            birds_placed: batch.birds_placed || 0,
            birds_sold: totalBirdsSold,
            total_mortality: (batch.birds_placed || 0) - (batch.birds_alive || 0),
            avg_weight_kg: (batch.current_avg_weight || 0) / 1000,
            fcr: batch.current_fcr || 0,
            duration_days: batch.day_number || 0,
            start_date: batch.placement_date || new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            total_revenue: totalRevenue,
            total_cost: 0, // Will be fetched from P&L API in production
            gross_profit: totalRevenue, // Simplified - in production deduct costs
            profit_per_bird: totalBirdsSold > 0 ? totalRevenue / totalBirdsSold : 0,
            farm_name: batch.farm_name || 'Farm',
          }}
          farmId={farmId}
        />
      )}
    </div>
  );
}
