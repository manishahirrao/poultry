'use client';

/**
 * Farmer Stock Opening Page
 * 
 * This page allows integrators to record opening stock balances at farmer locations.
 * Opening stock is the initial inventory balance at the farmer's end at the start of a financial year.
 * This is typically used when farmers already have stock on hand before the integration begins.
 * 
 * Features:
 * - Add/Edit/Delete farmer opening stock entries
 * - SlidersHorizontal by farmer, product, and financial year
 * - Calculate opening value automatically (qty × rate)
 * - CSV export and print functionality
 * - Bilingual support (English/Hindi)
 * 
 * @module Inventory
 * @route /dashboard/inventory/farmer-opening
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Plus, 
  Pencil, 
  Trash, 
  Download,
  Printer
} from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// Using inline colors instead of @poultrypulse/ui package
const erpColors = {
  primary: '#1A5C34',
  secondary: '#3DAE72',
  accent: '#F4F7F5',
  text: '#111827',
  muted: '#6B7280',
  border: '#E3EDE7',
  danger: '#C0392B',
  warning: '#F39C12',
  success: '#27AE60',
  red: '#C0392B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  brand700: '#1A5C34',
  brand500: '#3DAE72',
  brand400: '#5BAE6B',
  brand100: '#EDF7F1',
  brand50: '#F4F7F5',
  gray100: '#F4F7F5',
  gray200: '#E3EDE7',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  cardBg: '#FFFFFF',
  pageBg: '#F4F7F5',
};

/**
 * Zod schema for farmer opening stock form validation
 * Ensures all required fields are present and values are valid
 */
const farmerOpeningSchema = z.object({
  farmer_id: z.string().min(1, 'Farmer is required'),
  product_id: z.string().min(1, 'Product is required'),
  financial_year_id: z.string().min(1, 'Financial year is required'),
  opening_qty: z.number().min(0, 'Quantity must be positive'),
  opening_rate: z.number().min(0, 'Rate must be positive'),
  entered_date: z.string().min(1, 'Date is required'),
});

type FarmerOpeningFormData = z.infer<typeof farmerOpeningSchema>;

export default function FarmerOpeningPage() {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [financialYears, setFinancialYears] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FarmerOpeningFormData>({
    resolver: zodResolver(farmerOpeningSchema),
  });

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/inventory/farmer-opening');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching farmer opening:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [farmersRes, productsRes, fyRes] = await Promise.all([
        fetch('/api/masters/farmers'),
        fetch('/api/inventory/products'),
        fetch('/api/setup/financial-years'),
      ]);
      setFarmers((await farmersRes.json()).data || []);
      setProducts((await productsRes.json()).data || []);
      setFinancialYears((await fyRes.json()).data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const onSubmit = async (formData: FarmerOpeningFormData) => {
    try {
      const url = '/api/inventory/farmer-opening';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...formData, id: editingItem.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchData();
        setPanelOpen(false);
        reset();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving farmer opening:', error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    reset(item);
    setPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isHindi ? 'क्या आप वाकई हटाना चाहते हैं?' : 'Are you sure you want to delete?')) return;
    
    try {
      const response = await fetch(`/api/inventory/farmer-opening?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting farmer opening:', error);
    }
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-xxxl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: erpColors.brand700 }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-xxl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: erpColors.textPrimary }}>
          {isHindi ? 'किसान स्टॉक ओपनिंग' : 'Farmer Stock Opening'}
        </h1>
        <p className="text-sm mt-sm" style={{ color: erpColors.textSecondary }}>
          {isHindi ? 'किसान के अंत में उद्घाटन स्टॉक दर्ज करें' : 'Record opening stock at farmer end'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => { setEditingItem(null); reset(); setPanelOpen(true); }}
          className="flex items-center gap-sm"
          style={{ backgroundColor: erpColors.brand700 }}
        >
          <Plus size={18} weight="bold" />
          {isHindi ? 'जोड़ें' : 'Add'}
        </Button>
        <div className="flex items-center gap-sm">
          <Button variant="secondary" className="flex items-center gap-sm">
            <Download size={16} />
            {isHindi ? 'CSV' : 'CSV'}
          </Button>
          <Button variant="secondary" className="flex items-center gap-sm">
            <Printer size={16} />
            {isHindi ? 'प्रिंट' : 'Print'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-xxxl">
              <User size={48} className="mb-lg" style={{ color: erpColors.brand400 }} />
              <p style={{ color: erpColors.textSecondary }}>
                {isHindi ? 'कोई ओपनिंग स्टॉक नहीं मिला' : 'No opening stock found'}
              </p>
              <Button
                onClick={() => { setEditingItem(null); reset(); setPanelOpen(true); }}
                variant="primary"
                className="mt-sm"
                style={{ color: erpColors.brand700 }}
              >
                {isHindi ? 'पहला रिकॉर्ड जोड़ें' : 'Add first record'}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: erpColors.brand50 }}>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'किसान' : 'Farmer'}
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'उत्पाद' : 'Product'}
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'वित्तीय वर्ष' : 'Financial Year'}
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'मात्रा' : 'Quantity'}
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'दर' : 'Rate'}
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'मूल्य' : 'Value'}
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'दिनांक' : 'Date'}
                  </TableHead>
                  <TableHead className="font-semibold text-right" style={{ color: erpColors.brand700 }}>
                    {isHindi ? 'कार्य' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow 
                    key={item.id} 
                    style={{ backgroundColor: index % 2 === 0 ? erpColors.cardBg : erpColors.pageBg }}
                  >
                    <TableCell>{item.farmers?.full_name || '-'}</TableCell>
                    <TableCell>{item.erp_products?.product_name || '-'}</TableCell>
                    <TableCell>{item.financial_years?.year_label || '-'}</TableCell>
                    <TableCell>{item.opening_qty}</TableCell>
                    <TableCell>{formatINR(item.opening_rate)}</TableCell>
                    <TableCell>{formatINR(item.opening_qty * item.opening_rate)}</TableCell>
                    <TableCell>{new Date(item.entered_date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-sm">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash size={16} style={{ color: erpColors.red }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Panel */}
      {panelOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingItem 
                  ? (isHindi ? 'ओपनिंग स्टॉक संपादित करें' : 'Edit Opening Stock')
                  : (isHindi ? 'ओपनिंग स्टॉक जोड़ें' : 'Add Opening Stock')
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
                <div>
                  <label className="block text-sm font-medium mb-sm" style={{ color: erpColors.textPrimary }}>
                    {isHindi ? 'किसान *' : 'Farmer *'}
                  </label>
                  <select
                    {...register('farmer_id')}
                    className="w-full px-md py-sm border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: erpColors.border }}
                  >
                    <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                    {farmers.map((f) => (
                      <option key={f.id} value={f.id}>{f.full_name}</option>
                    ))}
                  </select>
                  {errors.farmer_id && <p className="text-xs mt-1" style={{ color: erpColors.red }}>{errors.farmer_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-sm" style={{ color: erpColors.textPrimary }}>
                    {isHindi ? 'उत्पाद *' : 'Product *'}
                  </label>
                  <select
                    {...register('product_id')}
                    className="w-full px-md py-sm border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: erpColors.border }}
                  >
                    <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.product_name}</option>
                    ))}
                  </select>
                  {errors.product_id && <p className="text-xs mt-1" style={{ color: erpColors.red }}>{errors.product_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-sm" style={{ color: erpColors.textPrimary }}>
                    {isHindi ? 'वित्तीय वर्ष *' : 'Financial Year *'}
                  </label>
                  <select
                    {...register('financial_year_id')}
                    className="w-full px-md py-sm border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: erpColors.border }}
                  >
                    <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                    {financialYears.map((fy) => (
                      <option key={fy.id} value={fy.id}>{fy.year_label}</option>
                    ))}
                  </select>
                  {errors.financial_year_id && <p className="text-xs mt-1" style={{ color: erpColors.red }}>{errors.financial_year_id.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="block text-sm font-medium mb-sm" style={{ color: erpColors.textPrimary }}>
                      {isHindi ? 'मात्रा *' : 'Quantity *'}
                    </label>
                    <input
                      type="number"
                      {...register('opening_qty', { valueAsNumber: true })}
                      className="w-full px-md py-sm border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: erpColors.border }}
                    />
                    {errors.opening_qty && <p className="text-xs mt-1" style={{ color: erpColors.red }}>{errors.opening_qty.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-sm" style={{ color: erpColors.textPrimary }}>
                      {isHindi ? 'दर *' : 'Rate *'}
                    </label>
                    <input
                      type="number"
                      {...register('opening_rate', { valueAsNumber: true })}
                      className="w-full px-md py-sm border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: erpColors.border }}
                    />
                    {errors.opening_rate && <p className="text-xs mt-1" style={{ color: erpColors.red }}>{errors.opening_rate.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-sm" style={{ color: erpColors.textPrimary }}>
                    {isHindi ? 'दिनांक *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    {...register('entered_date')}
                    className="w-full px-md py-sm border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: erpColors.border }}
                  />
                  {errors.entered_date && <p className="text-xs mt-1" style={{ color: erpColors.red }}>{errors.entered_date.message}</p>}
                </div>

                <div className="flex gap-md pt-md">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPanelOpen(false)}
                    className="flex-1"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                    style={{ backgroundColor: erpColors.brand700 }}
                  >
                    {isSubmitting ? (isHindi ? 'सहेज रहा है...' : 'Saving...') : (isHindi ? 'सहेजें' : 'FloppyDisk')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
