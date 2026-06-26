'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingCart, Users, FileText } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import PurchaseOrderList from './PurchaseOrderList';
import PurchaseOrderForm from './PurchaseOrderForm';
import PurchaseOrderDetail from './PurchaseOrderDetail';
import VendorManagement from './VendorManagement';
import InventoryItemForm from './InventoryItemForm';

type ViewMode = 'list' | 'create' | 'detail';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [poViewMode, setPoViewMode] = useState<ViewMode>('list');
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

  const handlePOSelect = (poId: string) => {
    setSelectedPOId(poId);
    setPoViewMode('detail');
  };

  const handlePOBack = () => {
    setSelectedPOId(null);
    setPoViewMode('list');
  };

  const handlePOUpdate = () => {
    // Refresh the list when PO is updated
    setPoViewMode('list');
  };

  const handleCreatePO = () => {
    setPoViewMode('create');
  };

  const handlePOCreated = () => {
    setPoViewMode('list');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Manage your stock, vendors, and purchase orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Package className="h-4 w-4 mr-2" />
            Stock Overview
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Users className="h-4 w-4 mr-2" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="items">
            <FileText className="h-4 w-4 mr-2" />
            Inventory Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Stock overview dashboard will be implemented in a separate task.
                <br />
                This shows current stock levels, low stock alerts, and consumption trends.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          {poViewMode === 'list' && (
            <>
              <div className="flex justify-end">
                <Button onClick={handleCreatePO}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </Button>
              </div>
              <PurchaseOrderList />
            </>
          )}

          {poViewMode === 'create' && (
            <div className="space-y-4">
              <Button className="border border-gray-300" onClick={() => setPoViewMode('list')}>
                Back to List
              </Button>
              <PurchaseOrderForm 
                onSuccess={handlePOCreated} 
                onCancel={() => setPoViewMode('list')}
              />
            </div>
          )}

          {poViewMode === 'detail' && selectedPOId && (
            <PurchaseOrderDetail
              poId={selectedPOId}
              onBack={handlePOBack}
              onUpdate={handlePOUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Inventory items management will be implemented in a separate task.
                <br />
                This allows you to add, edit, and manage feed, medicine, vaccine, and consumable items.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
