'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Send, Package, FileText, CheckCircle, AlertTriangle as Warning } from 'lucide-react'
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import GRNForm from './GRNForm';

interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  address: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
}

interface PurchaseOrderItem {
  id: string;
  inventory_item_id: string;
  quantity: number;
  negotiated_price: number;
  line_total: number;
  received_quantity: number;
  notes: string | null;
  inventory_item?: InventoryItem;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  status: 'created' | 'sent' | 'delivered' | 'invoiced' | 'paid';
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | undefined;
  created_at: string;
  vendor?: Vendor;
  items?: PurchaseOrderItem[];
}

interface PurchaseOrderDetailProps {
  poId: string;
  onBack: () => void;
  onUpdate: () => void;
}

export default function PurchaseOrderDetail({ poId, onBack, onUpdate }: PurchaseOrderDetailProps) {
  const supabase = createClient();
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGRNForm, setShowGRNForm] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [poId]);

  const fetchPurchaseOrder = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          vendor:vendor_id(*),
          items:purchase_order_items(
            *,
            inventory_item:inventory_item_id(*)
          )
        `)
        .eq('id', poId)
        .single();

      if (error) throw error;
      setPO(data);
    } catch (error) {
      console.error('Error fetching purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!supabase) {
      setUpdating(false);
      return;
    }
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ 
          status: newStatus,
          actual_delivery_date: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', poId);

      if (error) throw error;
      
      await fetchPurchaseOrder();
      onUpdate();
      
      // If status changed to delivered, show GRN form
      if (newStatus === 'delivered') {
        setShowGRNForm(true);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
      created: { label: 'Created', variant: 'default', color: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Sent', variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Delivered', variant: 'default', color: 'bg-green-100 text-green-800' },
      invoiced: { label: 'Invoiced', variant: 'secondary', color: 'bg-purple-100 text-purple-800' },
      paid: { label: 'Paid', variant: 'default', color: 'bg-emerald-100 text-emerald-800' }
    };
    const config = statusConfig[status] || { label: status, variant: 'default', color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calculateVariance = (ordered: number, received: number) => {
    if (ordered === 0) return 0;
    const variance = ((received - ordered) / ordered) * 100;
    return variance;
  };

  const getVarianceBadge = (variance: number) => {
    if (Math.abs(variance) <= 5) {
      return <Badge className="bg-green-100 text-green-800">Within 5%</Badge>;
    } else if (variance > 5) {
      return <Badge className="bg-amber-100 text-amber-800">+{variance.toFixed(1)}%</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{variance.toFixed(1)}%</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!po) {
    return <div className="p-6">Purchase order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Purchase Order Details</h1>
      </div>

      {/* PO Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{po.po_number}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Created on {format(new Date(po.created_at), 'dd MMM yyyy, HH:mm')}
              </p>
            </div>
            {getStatusBadge(po.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vendor</p>
              <p className="font-medium">{po.vendor?.name || 'Unknown'}</p>
              {po.vendor?.contact_person && (
                <p className="text-sm text-gray-600">{po.vendor.contact_person}</p>
              )}
              {po.vendor?.phone && (
                <p className="text-sm text-gray-600">{po.vendor.phone}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Delivery</p>
              <p className="font-medium">
                {po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'dd MMM yyyy') : 'Not set'}
              </p>
              {po.actual_delivery_date && (
                <p className="text-sm text-green-600">
                  Delivered: {format(new Date(po.actual_delivery_date), 'dd MMM yyyy')}
                </p>
              )}
            </div>
          </div>

          {po.notes && (
            <div>
              <p className="text-sm text-gray-600">Notes</p>
              <p className="text-sm">{po.notes}</p>
            </div>
          )}

          {/* Status Workflow Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {po.status === 'created' && (
              <Button 
                size="sm" 
                onClick={() => updateStatus('sent')}
                disabled={updating}
              >
                <Send className="h-4 w-4 mr-2" />
                Mark as Sent
              </Button>
            )}
            {po.status === 'sent' && (
              <Button 
                size="sm" 
                onClick={() => updateStatus('delivered')}
                disabled={updating}
              >
                <Package className="h-4 w-4 mr-2" />
                Mark as Delivered
              </Button>
            )}
            {po.status === 'delivered' && (
              <Button 
                size="sm" 
                onClick={() => updateStatus('invoiced')}
                disabled={updating}
              >
                <FileText className="h-4 w-4 mr-2" />
                Mark as Invoiced
              </Button>
            )}
            {po.status === 'invoiced' && (
              <Button 
                size="sm" 
                onClick={() => updateStatus('paid')}
                disabled={updating}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Ordered Qty</TableHead>
                <TableHead>Received Qty</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items?.map((item) => {
                const variance = calculateVariance(item.quantity, item.received_quantity);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.inventory_item?.name || 'Unknown'}</TableCell>
                    <TableCell>{item.inventory_item?.sku || '-'}</TableCell>
                    <TableCell>{item.quantity} {item.inventory_item?.unit}</TableCell>
                    <TableCell>
                      {item.received_quantity > 0 ? (
                        <span className="font-medium">{item.received_quantity} {item.inventory_item?.unit}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.received_quantity > 0 ? getVarianceBadge(variance) : '-'}
                    </TableCell>
                    <TableCell>₹{item.negotiated_price.toFixed(2)}</TableCell>
                    <TableCell>₹{item.line_total.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{po.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{po.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{po.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GRN Form Dialog */}
      <Dialog open={showGRNForm} onOpenChange={setShowGRNForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goods Receipt Note (GRN) - {po.po_number}</DialogTitle>
          </DialogHeader>
          {po && (
            <GRNForm 
              purchaseOrder={po} 
              onSuccess={() => {
                setShowGRNForm(false);
                fetchPurchaseOrder();
                onUpdate();
              }}
              onCancel={() => setShowGRNForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
