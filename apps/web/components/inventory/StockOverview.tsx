'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { Plus, CheckCircle2, Package, QrCode, AlertTriangle as Warning } from 'lucide-react'
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InventoryItemForm from './InventoryItemForm';

interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'medicine' | 'vaccine' | 'consumable';
  current_stock: number;
  min_stock_alert_level: number;
  unit: string;
  avg_cost_per_unit: number | null;
  sku: string | null;
  description: string | null;
  is_active: boolean;
}

interface StockCategory {
  category: string;
  items: InventoryItem[];
  totalStock: number;
  minStock: number;
  daysRemaining: number;
  avgDailyConsumption: number;
}

interface MovementData {
  quantity: number;
  created_at: string;
}

// Mock data for development
const mockStockData: StockCategory[] = [
  {
    category: 'Feed',
    items: [
      {
        id: '1',
        name: 'Broiler Starter Feed',
        category: 'feed',
        current_stock: 2500,
        min_stock_alert_level: 1000,
        unit: 'kg',
        avg_cost_per_unit: 45.5,
        sku: 'FEED-001',
        description: 'High protein starter feed for broiler chicks',
        is_active: true,
      },
      {
        id: '2',
        name: 'Broiler Grower Feed',
        category: 'feed',
        current_stock: 5000,
        min_stock_alert_level: 2000,
        unit: 'kg',
        avg_cost_per_unit: 38.0,
        sku: 'FEED-002',
        description: 'Balanced grower feed for growing broilers',
        is_active: true,
      },
      {
        id: '3',
        name: 'Broiler Finisher Feed',
 category: 'feed',
        current_stock: 800,
        min_stock_alert_level: 1500,
        unit: 'kg',
        avg_cost_per_unit: 35.0,
        sku: 'FEED-003',
        description: 'High energy finisher feed',
        is_active: true,
      },
    ],
    totalStock: 8300,
    minStock: 4500,
    daysRemaining: 12,
    avgDailyConsumption: 691.67,
  },
  {
    category: 'Medicine',
    items: [
      {
        id: '4',
        name: 'Antibiotic A',
        category: 'medicine',
        current_stock: 50,
        min_stock_alert_level: 100,
        unit: 'bottles',
        avg_cost_per_unit: 250.0,
        sku: 'MED-001',
        description: 'Broad spectrum antibiotic',
        is_active: true,
      },
      {
        id: '5',
        name: 'Vitamin Supplement',
        category: 'medicine',
        current_stock: 200,
        min_stock_alert_level: 50,
        unit: 'packets',
        avg_cost_per_unit: 85.0,
        sku: 'MED-002',
        description: 'Multivitamin supplement',
        is_active: true,
      },
    ],
    totalStock: 250,
    minStock: 150,
    daysRemaining: 25,
    avgDailyConsumption: 10,
  },
  {
    category: 'Vaccine',
    items: [
      {
        id: '6',
        name: 'Newcastle Disease Vaccine',
        category: 'vaccine',
        current_stock: 100,
        min_stock_alert_level: 200,
        unit: 'doses',
        avg_cost_per_unit: 15.0,
        sku: 'VAC-001',
        description: 'NDV vaccine for poultry',
        is_active: true,
      },
      {
        id: '7',
        name: 'IB Vaccine',
        category: 'vaccine',
        current_stock: 150,
        min_stock_alert_level: 100,
        unit: 'doses',
        avg_cost_per_unit: 18.0,
        sku: 'VAC-002',
        description: 'Infectious Bronchitis vaccine',
        is_active: true,
      },
    ],
    totalStock: 250,
    minStock: 300,
    daysRemaining: 8,
    avgDailyConsumption: 31.25,
  },
  {
    category: 'Consumable',
    items: [
      {
        id: '8',
        name: 'Disinfectant',
        category: 'consumable',
        current_stock: 20,
        min_stock_alert_level: 10,
        unit: 'liters',
        avg_cost_per_unit: 450.0,
        sku: 'CON-001',
        description: 'Farm disinfectant solution',
        is_active: true,
      },
      {
        id: '9',
        name: 'Cleaning Supplies',
        category: 'consumable',
        current_stock: 5,
        min_stock_alert_level: 15,
        unit: 'kits',
        avg_cost_per_unit: 200.0,
        sku: 'CON-002',
        description: 'Complete cleaning kit',
        is_active: true,
      },
    ],
    totalStock: 25,
    minStock: 25,
    daysRemaining: 10,
    avgDailyConsumption: 2.5,
  },
];

export default function StockOverview() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null;
  const [stockData, setStockData] = useState<StockCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleItemFormSuccess = () => {
    setItemFormOpen(false);
    setEditingItem(null);
    fetchStockData();
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setItemFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemFormOpen(true);
  };

  const fetchStockData = async () => {
    try {
      if (!supabase) {
        // Use mock data when Supabase is not configured
        setStockData(mockStockData);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('customer_id', user.id)
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;

      // Group by category
      const categories: Record<string, InventoryItem[]> = {
        feed: [],
        medicine: [],
        vaccine: [],
        consumable: []
      };

      items?.forEach(item => {
        if (categories[item.category]) {
          categories[item.category].push(item);
        }
      });

      // Calculate totals and days remaining for each category
      const stockCategories: StockCategory[] = await Promise.all(
        Object.entries(categories).map(async ([category, items]) => {
          if (items.length === 0) return null;

          const totalStock = items.reduce((sum, item) => sum + item.current_stock, 0);
          const minStock = items.reduce((sum, item) => sum + item.min_stock_alert_level, 0);
          
          // Calculate 7-day average consumption from inventory movements
          const itemIds = items.map(item => item.id);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { data: movements } = await supabase
            .from('inventory_movements')
            .select('quantity, created_at')
            .in('inventory_item_id', itemIds)
            .eq('movement_type', 'consumption')
            .gte('created_at', sevenDaysAgo.toISOString());

          const totalConsumption = movements?.reduce((sum, m: MovementData) => sum + Math.abs(m.quantity), 0) || 0;
          const avgDailyConsumption = totalConsumption / 7;
          const daysRemaining = avgDailyConsumption > 0 ? Math.round(totalStock / avgDailyConsumption) : 0;

          return {
            category: category.charAt(0).toUpperCase() + category.slice(1),
            items,
            totalStock,
            minStock,
            daysRemaining,
            avgDailyConsumption
          };
        })
      ).then(results => results.filter((cat): cat is StockCategory => cat !== null));

      setStockData(stockCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= min * 0.5) return { status: 'critical', color: 'bg-red-500', icon: Warning };
    if (current <= min) return { status: 'low', color: 'bg-amber-500', icon: Warning };
    return { status: 'ok', color: 'bg-green-500', icon: CheckCircle2 };
  };

  const getCategoryIcon = (category: string) => {
    return Package;
  };

  const generateQRCode = async (item: InventoryItem) => {
    try {
      const qrData = JSON.stringify({
        id: item.id,
        name: item.name,
        category: item.category,
        sku: item.sku
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const handleQRCodeGeneration = async (item: InventoryItem) => {
    const qrCodeUrl = await generateQRCode(item);
    if (qrCodeUrl) {
      // Create a temporary link to download the QR code
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-${item.name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // PDF Document for QR Codes
  const QRCodePDF = ({ items }: { items: InventoryItem[] }) => {
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        padding: 30,
      },
      title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
      },
      item: {
        marginBottom: 20,
        padding: 10,
        border: '1 solid #000',
      },
      itemName: {
        fontSize: 14,
      },
      qrPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#f0f0f0',
        marginTop: 10,
      },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Inventory QR Codes</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text>Category: {item.category}</Text>
              <Text>SKU: {item.sku || 'N/A'}</Text>
              <View style={styles.qrPlaceholder}>
                <Text>QR Code for {item.name}</Text>
              </View>
            </View>
          ))}
        </Page>
      </Document>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>स्टॉक सारांश · Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>स्टॉक सारांश · Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>स्टॉक सारांश · Inventory Summary</CardTitle>
        <div className="flex gap-2">
          <PDFDownloadLink 
            document={<QRCodePDF items={stockData.flatMap(cat => cat.items)} />} 
            fileName="inventory-qr-codes.pdf"
          >
            {({ loading }) => (
              <Button size="sm" disabled={stockData.length === 0}>
                <QrCode className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Download QR PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <Dialog open={itemFormOpen} onOpenChange={setItemFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
              </DialogHeader>
              <InventoryItemForm 
                editMode={!!editingItem} 
                existingItem={editingItem as any || undefined} 
                onSuccess={handleItemFormSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {stockData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>कोई स्टॉक आइटम नहीं है</p>
            <p className="text-sm">No inventory items yet</p>
          </div>
        ) : (
          stockData.map((category) => {
            const Icon = getCategoryIcon(category.category);
            const stockStatus = getStockStatus(category.totalStock, category.minStock);
            const progressPercentage = category.minStock > 0 
              ? Math.min((category.totalStock / category.minStock) * 100, 100)
              : 100;

            return (
              <div key={category.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stockStatus.status !== 'ok' && (
                      <stockStatus.icon className={`h-4 w-4 ${stockStatus.status === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                    )}
                  </div>
                </div>
                
                <Progress value={progressPercentage} className="h-3" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {category.totalStock.toLocaleString()} {category.items[0]?.unit || 'units'}
                  </span>
                  <span className={stockStatus.status === 'critical' ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                    Min: {category.minStock.toLocaleString()} {category.items[0]?.unit || 'units'} · 
                    Lasts: ~{category.daysRemaining} days {stockStatus.status === 'ok' ? '✅' : ''}
                  </span>
                </div>

                {/* Individual items with QR code buttons */}
                <div className="space-y-2 mt-3">
                  {category.items.map((item) => {
                    const itemStatus = getStockStatus(item.current_stock, item.min_stock_alert_level);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-600">
                            Stock: {item.current_stock.toLocaleString()} {item.unit} · 
                            Min: {item.min_stock_alert_level.toLocaleString()} {item.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {itemStatus.status !== 'ok' && (
                            <itemStatus.icon className={`h-4 w-4 ${itemStatus.status === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQRCodeGeneration(item)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {stockStatus.status !== 'ok' && category.items.some(item => item.current_stock <= item.min_stock_alert_level) && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Warning className="h-4 w-4" />
                      <span className="font-medium">
                        {category.items.filter(item => item.current_stock <= item.min_stock_alert_level).map(item => item.name).join(', ')} — 
                        only {category.items.filter(item => item.current_stock <= item.min_stock_alert_level)[0]?.current_stock} left
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
