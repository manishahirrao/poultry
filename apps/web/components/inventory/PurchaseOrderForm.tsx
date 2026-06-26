'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  avg_cost_per_unit: number | null;
}

interface LineItem {
  inventory_item_id: string;
  quantity: number;
  negotiated_price: number;
  line_total: number;
}

interface PurchaseOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editMode?: boolean;
  existingPO?: any;
}

export default function PurchaseOrderForm({ onSuccess, onCancel, editMode = false, existingPO }: PurchaseOrderFormProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  const [formData, setFormData] = useState({
    vendor_id: '',
    expected_delivery_date: '',
    notes: ''
  });

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchVendors();
    fetchInventoryItems();
    if (editMode && existingPO) {
      // Load existing PO data
      setFormData({
        vendor_id: existingPO.vendor_id,
        expected_delivery_date: existingPO.expected_delivery_date || '',
        notes: existingPO.notes || ''
      });
      setLineItems(existingPO.items || []);
    }
  }, [editMode, existingPO]);

  useEffect(() => {
    // Calculate totals
    const newSubtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.negotiated_price), 0);
    const newTax = newSubtotal * 0.18; // 18% GST
    const newTotal = newSubtotal + newTax;
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [lineItems]);

  const fetchVendors = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('customer_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchInventoryItems = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('customer_id', user.id)
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const addLineItem = () => {
    if (inventoryItems.length > 0) {
      setLineItems([
        ...lineItems,
        {
          inventory_item_id: inventoryItems[0].id,
          quantity: 0,
          negotiated_price: inventoryItems[0].avg_cost_per_unit || 0,
          line_total: 0
        }
      ]);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: number | string) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    // Recalculate line total
    if (field === 'quantity' || field === 'negotiated_price') {
      updated[index].line_total = updated[index].quantity * updated[index].negotiated_price;
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
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

      // Generate PO number
      const { data: poData } = await supabase.rpc('generate_po_number', { customer_id: user.id });
      const poNumber = poData;

      // Create purchase order
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          customer_id: user.id,
          vendor_id: formData.vendor_id,
          po_number: poNumber,
          status: 'created',
          expected_delivery_date: formData.expected_delivery_date || null,
          subtotal,
          tax,
          total,
          notes: formData.notes,
          created_by: user.id
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create line items
      const lineItemsToInsert = lineItems.map(item => ({
        purchase_order_id: po.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        negotiated_price: item.negotiated_price
      }));

      const { error: lineItemsError } = await supabase
        .from('purchase_order_items')
        .insert(lineItemsToInsert);

      if (lineItemsError) throw lineItemsError;

      onSuccess?.();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    return item ? `${item.name} (${item.unit})` : '';
  };

  const getItemUnit = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    return item ? item.unit : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Purchase Order' : 'Create Purchase Order'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Selection */}
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Select
              value={formData.vendor_id}
              onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} {vendor.contact_person && `(${vendor.contact_person})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expected Delivery Date */}
          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.expected_delivery_date}
              onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded">
                No items added yet
              </div>
            ) : (
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price/Unit</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.inventory_item_id}
                            onValueChange={(value) => updateLineItem(index, 'inventory_item_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map((invItem) => (
                                <SelectItem key={invItem.id} value={invItem.id}>
                                  {invItem.name} ({invItem.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.negotiated_price || ''}
                            onChange={(e) => updateLineItem(index, 'negotiated_price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </TableCell>
                        <TableCell>₹{item.line_total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLineItem(index)}
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
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || lineItems.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Purchase Order'}
            </Button>
            {onCancel && (
              <Button type="button" className="border border-gray-300" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
