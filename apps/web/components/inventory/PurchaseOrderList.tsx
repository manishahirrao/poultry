'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Plus } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface Vendor {
  id: string;
  name: string;
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
  created_at: string;
  vendor?: Vendor;
}

export default function PurchaseOrderList() {
  const supabase = createClient() as any;
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusSlidersHorizontal, setStatusSlidersHorizontal] = useState<string>('all');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusSlidersHorizontal]);

  const fetchPurchaseOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          vendor:vendor_id(name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (statusSlidersHorizontal !== 'all') {
        query = query.eq('status', statusSlidersHorizontal);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      created: { label: 'Created', variant: 'default' },
      sent: { label: 'Sent', variant: 'secondary' },
      delivered: { label: 'Delivered', variant: 'default' },
      invoiced: { label: 'Invoiced', variant: 'secondary' },
      paid: { label: 'Paid', variant: 'default' }
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportTallyXML = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all paid invoices for the current month
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      const { data: paidPOs, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          vendor:vendor_id(name, phone, address),
          items:purchase_order_items(
            *,
            inventory_item:inventory_item_id(name, sku)
          )
        `)
        .eq('customer_id', user.id)
        .eq('status', 'paid')
        .gte('created_at', currentMonthStart)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!paidPOs || paidPOs.length === 0) {
        alert('No paid invoices found for the current month');
        return;
      }

      // Generate Tally XML
      const xml = generateTallyXML(paidPOs);

      // Download the XML file
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tally_export_${format(new Date(), 'yyyy-MM')}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Tally XML:', error);
      alert('Failed to export Tally XML');
    }
  };

  const generateTallyXML = (pos: any[]) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUESTNAME>Export Data</TALLYREQUESTNAME>
    <VERSION>2.0</VERSION>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

    pos.forEach(po => {
      xml += `
        <VOUCHER>
          <VOUCHERTYPE>Purchase</VOUCHERTYPE>
          <DATE>${format(new Date(po.created_at), 'dd-MM-yyyy')}</DATE>
          <NARRATION>${po.notes || 'Purchase Order ' + po.po_number}</NARRATION>
          <LEDGERENTRIES.LIST>
            <LEDGERNAME>${po.vendor?.name || 'Unknown Vendor'}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${-po.total}</AMOUNT>
          </LEDGERENTRIES.LIST>
`;

      if (po.items && po.items.length > 0) {
        po.items.forEach((item: any) => {
          xml += `
          <ALLINVENTORYENTRIES.LIST>
            <ITEMNAME>${item.inventory_item?.name || 'Unknown Item'}</ITEMNAME>
            <RATE>${item.negotiated_price}</RATE>
            <QUANTITY>${item.received_quantity || item.quantity}</QUANTITY>
            <AMOUNT>${(item.negotiated_price * (item.received_quantity || item.quantity)).toFixed(2)}</AMOUNT>
          </ALLINVENTORYENTRIES.LIST>
`;
        });
      }

      xml += `        </VOUCHER>`;
    });

    xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    return xml;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Purchase Orders</CardTitle>
          <div className="flex gap-2">
            <Select value={statusSlidersHorizontal} onValueChange={setStatusSlidersHorizontal}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="SlidersHorizontal by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="invoiced">Invoiced</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Button className="border border-gray-300" onClick={exportTallyXML}>
              <Download className="h-4 w-4 mr-2" />
              Export Tally XML
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {purchaseOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No purchase orders found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.po_number}</TableCell>
                  <TableCell>{po.vendor?.name || 'Unknown'}</TableCell>
                  <TableCell>{format(new Date(po.created_at), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(po.status)}</TableCell>
                  <TableCell>₹{po.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedPO(po)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
