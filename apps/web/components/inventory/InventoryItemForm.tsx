'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'medicine' | 'vaccine' | 'consumable';
  sku: string | null;
  description: string | null;
  unit: string;
  min_stock_alert_level: number;
  current_stock: number;
  avg_cost_per_unit: number | null;
  qr_code: string | null;
  is_active: boolean;
}

interface InventoryItemFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  existingItem?: InventoryItem;
}

export default function InventoryItemForm({ onSuccess, editMode = false, existingItem }: InventoryItemFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: existingItem?.name || '',
    category: existingItem?.category || 'feed',
    sku: existingItem?.sku || '',
    description: existingItem?.description || '',
    unit: existingItem?.unit || 'kg',
    min_stock_alert_level: existingItem?.min_stock_alert_level || 100,
    current_stock: existingItem?.current_stock || 0,
    avg_cost_per_unit: existingItem?.avg_cost_per_unit || 0
  });

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

      if (editMode && existingItem) {
        const { error } = await supabase
          .from('inventory_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('inventory_items')
          .insert({
            customer_id: user.id,
            ...formData
          });

        if (error) throw error;
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Godrej Starter Feed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="vaccine">Vaccine</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="liters">liters</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                  <SelectItem value="bags">bags</SelectItem>
                  <SelectItem value="bottles">bottles</SelectItem>
                  <SelectItem value="vials">vials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Optional)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., FEED-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgCost">Avg Cost per Unit (₹)</Label>
              <Input
                id="avgCost"
                type="number"
                value={formData.avg_cost_per_unit}
                onChange={(e) => setFormData({ ...formData, avg_cost_per_unit: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                placeholder="e.g., 24.50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Min Stock Alert Level *</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.min_stock_alert_level}
                onChange={(e) => setFormData({ ...formData, min_stock_alert_level: parseFloat(e.target.value) || 0 })}
                min="0"
                step="1"
                required
                placeholder="e.g., 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
                placeholder="e.g., 500"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Broiler starter feed for first 7 days"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (editMode ? 'Update' : 'Add') + ' Item'}
            </Button>
            {onSuccess && (
              <Button type="button" className="border border-gray-300" onClick={onSuccess}>
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
