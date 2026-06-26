'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, FileText, CheckCircle, X } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface Supplier {
  id: string;
  supplier_code: string;
  supplier_name: string;
  supplier_type: string;
  contact_person: string;
  phone: string;
  city: string;
}

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  city: string;
}

interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category_id: string;
  unit_of_measure: string;
  purchase_price: number;
  sale_price: number;
  hsn_code: string;
}

interface TaxSetup {
  id: string;
  tax_name: string;
  tax_rate: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
}

interface LineItem {
  product_id: string;
  ordered_qty: number;
  unit_rate: number;
  tax_id: string;
  tax_amount: number;
  line_total: number;
}

interface POEntryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editMode?: boolean;
  existingPO?: any;
}

export default function POEntryForm({ onSuccess, onCancel, editMode = false, existingPO }: POEntryFormProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxSetups, setTaxSetups] = useState<TaxSetup[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [poNumber, setPONumber] = useState('');
  const [poStatus, setPoStatus] = useState<'draft' | 'open' | 'partial' | 'received' | 'cancelled'>('draft');
  
  const [formData, setFormData] = useState({
    po_date: format(new Date(), 'yyyy-MM-dd'),
    supplier_id: '',
    branch_id: '',
    expected_delivery: '',
    remarks: ''
  });

  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
    fetchProducts();
    fetchTaxSetups();
    generatePONumber();
    if (editMode && existingPO) {
      loadExistingPO(existingPO);
    }
  }, [editMode, existingPO]);

  useEffect(() => {
    calculateTotals();
  }, [lineItems]);

  const generatePONumber = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      
      // Generate PO number: PO/2526/001
      const { data: poData } = await supabase
        .from('purchase_orders')
        .select('po_number')
        .eq('integrator_id', user.id)
        .like('po_number', `PO/${yearSuffix}/%`)
        .order('po_number', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (poData) {
        const lastSequence = parseInt(poData.po_number.split('/').pop() || '0');
        sequence = lastSequence + 1;
      }

      const newPONumber = `PO/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;
      setPONumber(newPONumber);
    } catch (error) {
      console.error('Error generating PO number:', error);
      // Fallback to simple format
      setPONumber(`PO/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    }
  };

  const fetchSuppliers = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('supplier_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchBranches = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('branch_name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchProducts = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTaxSetups = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tax_setup')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('tax_name');

      if (error) throw error;
      setTaxSetups(data || []);
    } catch (error) {
      console.error('Error fetching tax setups:', error);
    }
  };

  const loadExistingPO = (po: any) => {
    setFormData({
      po_date: po.po_date || format(new Date(), 'yyyy-MM-dd'),
      supplier_id: po.supplier_id || '',
      branch_id: po.branch_id || '',
      expected_delivery: po.expected_delivery || '',
      remarks: po.remarks || ''
    });
    setPONumber(po.po_number || '');
    setPoStatus(po.status || 'draft');
    setLineItems(po.items || []);
  };

  const addLineItem = () => {
    if (products.length > 0 && taxSetups.length > 0) {
      setLineItems([
        ...lineItems,
        {
          product_id: products[0].id,
          ordered_qty: 0,
          unit_rate: products[0].purchase_price || 0,
          tax_id: taxSetups[0].id,
          tax_amount: 0,
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
    
    // Recalculate line total and tax
    if (field === 'ordered_qty' || field === 'unit_rate' || field === 'tax_id') {
      const product = products.find(p => p.id === updated[index].product_id);
      const tax = taxSetups.find(t => t.id === updated[index].tax_id);
      
      const lineSubtotal = updated[index].ordered_qty * updated[index].unit_rate;
      const taxRate = tax?.tax_rate || 0;
      updated[index].tax_amount = (lineSubtotal * taxRate) / 100;
      updated[index].line_total = lineSubtotal + updated[index].tax_amount;
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const newSubtotal = lineItems.reduce((sum, item) => sum + (item.ordered_qty * item.unit_rate), 0);
    const newTaxTotal = lineItems.reduce((sum, item) => sum + item.tax_amount, 0);
    const newGrandTotal = newSubtotal + newTaxTotal;
    
    setSubtotal(newSubtotal);
    setTaxTotal(newTaxTotal);
    setGrandTotal(newGrandTotal);
  };

  const handleSaveDraft = async () => {
    await handleSubmit('draft');
  };

  const handleSubmit = async (status: 'draft' | 'open' = 'open') => {
    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create purchase order
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          integrator_id: user.id,
          po_number: poNumber,
          po_date: formData.po_date,
          supplier_id: formData.supplier_id,
          branch_id: formData.branch_id || null,
          expected_delivery: formData.expected_delivery || null,
          status: status,
          subtotal,
          tax_total: taxTotal,
          total_amount: grandTotal,
          remarks: formData.remarks,
          created_by: user.id
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create line items
      const lineItemsToInsert = lineItems.map(item => ({
        po_id: po.id,
        product_id: item.product_id,
        ordered_qty: item.ordered_qty,
        unit_rate: item.unit_rate,
        tax_id: item.tax_id,
        tax_amount: item.tax_amount,
        line_total: item.line_total
      }));

      const { error: lineItemsError } = await supabase
        .from('purchase_order_items')
        .insert(lineItemsToInsert);

      if (lineItemsError) throw lineItemsError;

      setPoStatus(status);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.product_name} (${product.unit_of_measure})` : '';
  };

  const getTaxName = (taxId: string) => {
    const tax = taxSetups.find(t => t.id === taxId);
    return tax ? tax.tax_name : '';
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-blue-100 text-blue-800',
      partial: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* PO Status Banner */}
      {poStatus !== 'draft' && (
        <div className="bg-[#EDF7F1] border border-[#3DAE72] rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#3DAE72]" />
            <span className="text-sm font-medium text-[#1A5C34]">
              Purchase Order {poNumber}
            </span>
          </div>
          {getStatusBadge(poStatus)}
        </div>
      )}

      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#111827] text-xl">
                {editMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
              </CardTitle>
              <p className="text-sm text-[#6B7280] mt-1">
                {poNumber && `PO Number: ${poNumber}`}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-8">
            {/* PO Header */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wide">Purchase Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* PO Number */}
                <div className="space-y-2">
                  <Label htmlFor="poNumber" className="text-sm font-medium text-[#111827]">PO Number</Label>
                  <Input
                    id="poNumber"
                    value={poNumber}
                    disabled
                    className="bg-[#EDF7F1] border-[#E3EDE7] text-[#111827] font-mono text-sm"
                  />
                </div>

                {/* PO Date */}
                <div className="space-y-2">
                  <Label htmlFor="poDate" className="text-sm font-medium text-[#111827]">PO Date</Label>
                  <Input
                    id="poDate"
                    type="date"
                    value={formData.po_date}
                    onChange={(e) => setFormData({ ...formData, po_date: e.target.value })}
                    required
                    className="border-[#E3EDE7] text-[#111827]"
                  />
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm font-medium text-[#111827]">Supplier</Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                    required
                  >
                    <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id} className="text-[#111827]">
                          {supplier.supplier_name} {supplier.supplier_code && `(${supplier.supplier_code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-sm font-medium text-[#111827]">Branch</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                  >
                    <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                      <SelectValue placeholder="Select branch (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id} className="text-[#111827]">
                          {branch.branch_name} {branch.branch_code && `(${branch.branch_code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expected Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery" className="text-sm font-medium text-[#111827]">Expected Delivery</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={formData.expected_delivery}
                    onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                    min={formData.po_date}
                    className="border-[#E3EDE7] text-[#111827]"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wide">Line Items</h3>
                <Button
                  type="button"
                  size="sm"
                  onClick={addLineItem}
                  className="bg-[#3DAE72] hover:bg-[#1A5C34] text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>

              {lineItems.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] border-2 border-dashed border-[#E3EDE7] rounded-lg bg-[#EDF7F1]/30">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-[#3DAE72]/50" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs mt-1">Click "Add Row" to add products</p>
                </div>
              ) : (
                <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#EDF7F1]">
                      <TableRow>
                        <TableHead className="w-[30%] text-[#111827] font-semibold text-xs uppercase tracking-wide">Product</TableHead>
                        <TableHead className="w-[15%] text-[#111827] font-semibold text-xs uppercase tracking-wide">Qty</TableHead>
                        <TableHead className="w-[15%] text-[#111827] font-semibold text-xs uppercase tracking-wide">Unit Rate</TableHead>
                        <TableHead className="w-[15%] text-[#111827] font-semibold text-xs uppercase tracking-wide">Tax</TableHead>
                        <TableHead className="w-[15%] text-[#111827] font-semibold text-xs uppercase tracking-wide">Amount</TableHead>
                        <TableHead className="w-[10%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={index} className="hover:bg-[#EDF7F1]/30">
                          <TableCell className="py-3">
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => {
                                const product = products.find(p => p.id === value);
                                updateLineItem(index, 'product_id', value);
                                updateLineItem(index, 'unit_rate', product?.purchase_price || 0);
                              }}
                            >
                              <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id} className="text-[#111827]">
                                    {product.product_name} ({product.unit_of_measure})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-3">
                            <Input
                              type="number"
                              value={item.ordered_qty || ''}
                              onChange={(e) => updateLineItem(index, 'ordered_qty', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                              className="border-[#E3EDE7] text-[#111827]"
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <Input
                              type="number"
                              value={item.unit_rate || ''}
                              onChange={(e) => updateLineItem(index, 'unit_rate', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                              className="border-[#E3EDE7] text-[#111827]"
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <Select
                              value={item.tax_id}
                              onValueChange={(value) => updateLineItem(index, 'tax_id', value)}
                            >
                              <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {taxSetups.map((tax) => (
                                  <SelectItem key={tax.id} value={tax.id} className="text-[#111827]">
                                    {tax.tax_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-[#1A5C34]">
                            {formatINR(item.line_total)}
                          </TableCell>
                          <TableCell className="py-3">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLineItem(index)}
                              className="text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEE2E2] h-8 w-8 p-0"
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
            <div className="bg-[#EDF7F1] rounded-lg p-5 border border-[#E3EDE7]">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="font-medium text-[#111827]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B7280]">Tax Total</span>
                  <span className="font-medium text-[#111827]">{formatINR(taxTotal)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#3DAE72]/30">
                  <span className="text-base font-semibold text-[#111827]">Grand Total</span>
                  <span className="text-xl font-bold text-[#1A5C34]">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-sm font-medium text-[#111827]">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any additional notes or instructions..."
                rows={3}
                className="border-[#E3EDE7] text-[#111827] placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E3EDE7]">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading || lineItems.length === 0}
                className="border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit('open')}
                disabled={loading || lineItems.length === 0}
                className="bg-[#1A5C34] hover:bg-[#3DAE72] text-white border-0"
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit PO'}
              </Button>
              {poStatus === 'open' && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#3DAE72] text-[#1A5C34] hover:bg-[#EDF7F1]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Receive Against PO
                </Button>
              )}
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="ml-auto text-[#6B7280] hover:text-[#111827] hover:bg-[#EDF7F1]/50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
