'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, X, CheckCircle, AlertTriangle as Warning } from 'lucide-react'
import { createClient } from '@/utils/supabase/client';

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

interface Vendor {
  id: string;
  name: string;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  status: string;
  vendor?: Vendor;
  items?: PurchaseOrderItem[];
  notes?: string;
}

interface GRNFormProps {
  purchaseOrder: PurchaseOrder;
  onSuccess: () => void;
  onCancel: () => void;
}

interface GRNItem {
  po_item_id: string;
  ordered_quantity: number;
  received_quantity: number;
  variance_percentage: number;
  variance_flagged: boolean;
  notes: string;
}

export default function GRNForm({ purchaseOrder, onSuccess, onCancel }: GRNFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
  const [grnNotes, setGrnNotes] = useState('');
  const [hasVariance, setHasVariance] = useState(false);

  useEffect(() => {
    if (purchaseOrder.items) {
      const initialGrnItems: GRNItem[] = purchaseOrder.items.map(item => ({
        po_item_id: item.id,
        ordered_quantity: item.quantity,
        received_quantity: item.received_quantity || 0,
        variance_percentage: 0,
        variance_flagged: false,
        notes: ''
      }));
      setGrnItems(initialGrnItems);
      checkVariance(initialGrnItems);
    }
  }, [purchaseOrder]);

  const calculateVariance = (ordered: number, received: number) => {
    if (ordered === 0) return 0;
    const variance = ((received - ordered) / ordered) * 100;
    return variance;
  };

  const checkVariance = (items: GRNItem[]) => {
    const hasAnyVariance = items.some(item => Math.abs(item.variance_percentage) > 5);
    setHasVariance(hasAnyVariance);
  };

  const updateGrnItem = (index: number, field: keyof GRNItem, value: number | string) => {
    const updated = [...grnItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    } as GRNItem;

    // Recalculate variance if received quantity changed
    if (field === 'received_quantity') {
      const variance = calculateVariance(updated[index].ordered_quantity, value as number);
      updated[index].variance_percentage = variance;
      updated[index].variance_flagged = Math.abs(variance) > 5;
    }

    setGrnItems(updated);
    checkVariance(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update purchase order items with received quantities
      for (const grnItem of grnItems) {
        const { error } = await supabase
          .from('purchase_order_items')
          .update({
            received_quantity: grnItem.received_quantity,
            notes: grnItem.notes || null
          })
          .eq('id', grnItem.po_item_id);

        if (error) throw error;

        // Create inventory movement for received items
        if (grnItem.received_quantity > 0) {
          const poItem = purchaseOrder.items?.find(item => item.id === grnItem.po_item_id);
          if (poItem) {
            const { error: movementError } = await supabase
              .from('inventory_movements')
              .insert({
                inventory_item_id: poItem.inventory_item_id,
                movement_type: 'purchase',
                quantity: grnItem.received_quantity,
                unit_cost: poItem.negotiated_price,
                total_cost: grnItem.received_quantity * poItem.negotiated_price,
                reference_id: purchaseOrder.po_number,
                reason: `GRN for PO ${purchaseOrder.po_number}`,
                performed_by: user.id
              });

            if (movementError) throw movementError;
          }
        }
      }

      // Add GRN notes to purchase order
      if (grnNotes) {
        const { error } = await supabase
          .from('purchase_orders')
          .update({
            notes: (purchaseOrder.notes || '') + `\n\nGRN Notes: ${grnNotes}`
          })
          .eq('id', purchaseOrder.id);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting GRN:', error);
      alert('Failed to submit GRN');
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (poItemId: string) => {
    const item = purchaseOrder.items?.find(i => i.id === poItemId);
    return item?.inventory_item?.name || 'Unknown';
  };

  const getItemUnit = (poItemId: string) => {
    const item = purchaseOrder.items?.find(i => i.id === poItemId);
    return item?.inventory_item?.unit || '';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasVariance && (
        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertDescription>
            Some items have variance greater than 5%. Please review before submitting.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Confirm Received Quantities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Ordered Qty</TableHead>
                <TableHead>Received Qty</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnItems.map((grnItem, index) => (
                <TableRow key={grnItem.po_item_id}>
                  <TableCell className="font-medium">{getItemName(grnItem.po_item_id)}</TableCell>
                  <TableCell>{grnItem.ordered_quantity} {getItemUnit(grnItem.po_item_id)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={grnItem.received_quantity || ''}
                      onChange={(e) => updateGrnItem(index, 'received_quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-24"
                      required
                    />
                    <span className="text-sm text-gray-600 ml-1">{getItemUnit(grnItem.po_item_id)}</span>
                  </TableCell>
                  <TableCell>
                    {grnItem.received_quantity > 0 ? getVarianceBadge(grnItem.variance_percentage) : '-'}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={grnItem.notes}
                      onChange={(e) => updateGrnItem(index, 'notes', e.target.value)}
                      placeholder="Add notes if variance..."
                      className="w-40"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GRN Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="grnNotes">Additional Notes (Optional)</Label>
            <textarea
              id="grnNotes"
              value={grnNotes}
              onChange={(e) => setGrnNotes(e.target.value)}
              placeholder="Any additional notes about the delivery..."
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="button" className="border border-gray-300" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Submitting...' : 'Submit GRN'}
        </Button>
      </div>
    </form>
  );
}
