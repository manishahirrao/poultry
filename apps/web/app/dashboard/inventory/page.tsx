import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import StockOverview from '@/components/inventory/StockOverview';
import VendorManagement from '@/components/inventory/VendorManagement';
import PurchaseOrderForm from '@/components/inventory/PurchaseOrderForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Inventory Management — FlockIQ',
  description: 'Manage feed, medicine, and vaccine inventory with automated tracking and low stock alerts.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InventoryPage() {
  let customer;
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/inventory');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.phone) {
    redirect('/login?redirect=/dashboard/inventory');
  }

  // Fetch customer profile
  const { data: customerData } = await supabase
    .from('customers')
    .select('id, name, segment, role, plan, district')
    .eq('phone', user.phone)
    .single();

  customer = customerData;
  if (!customer) redirect('/login');

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">
            Manage feed, medicine, and vaccine stock with automated tracking and low stock alerts
          </p>
        </div>

        <Tabs defaultValue="stock" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="stock">Stock Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-6">
            <StockOverview />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <VendorManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <PurchaseOrderForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
