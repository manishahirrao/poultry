'use client';

import { useState, useEffect } from 'react';
import { 
  Download, Printer, Calendar, SlidersHorizontal, Package, 
  Warehouse, Users, ShoppingCart, Truck, ArrowRight,
  Warning, CheckCircle, Spinner
} from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Types
interface Product {
  id: string;
  product_code: string;
  product_name: string;
  category_name: string;
  unit_of_measure: string;
  purchase_price: number;
  sale_price: number;
  current_stock: number;
  reorder_level: number;
  is_active: boolean;
}

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  city: string;
}

interface Farmer {
  id: string;
  farmer_code: string;
  full_name: string;
  village: string;
  supervisor_name?: string;
}

interface Purchase {
  id: string;
  purchase_number: string;
  purchase_date: string;
  supplier_name: string;
  product_name: string;
  quantity: number;
  unit_rate: number;
  total_amount: number;
  purchase_type: string;
}

interface Sale {
  id: string;
  sale_number: string;
  sale_date: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  rate: number;
  total_amount: number;
  sale_type: string;
}

interface StockTransfer {
  id: string;
  transfer_number: string;
  transfer_date: string;
  transfer_type: string;
  from_location: string;
  to_location: string;
  product_name: string;
  quantity: number;
  vehicle_number?: string;
  driver_name?: string;
}

interface StockLedger {
  id: string;
  transaction_date: string;
  transaction_type: string;
  product_name: string;
  location: string;
  quantity_in: number;
  quantity_out: number;
  balance: number;
  reference: string;
}

export default function StockReportsPage() {
  const { language } = useLanguage();
  const supabase = createClient();
  const isHindi = language === 'hi';

  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('product-list');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // SlidersHorizontal states
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFarmer, setSelectedFarmer] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [stockLedger, setStockLedger] = useState<StockLedger[]>([]);
  const [categoryPurchases, setCategoryPurchases] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [dateRange, selectedBranch, selectedCategory, selectedFarmer, selectedSupplier, selectedProduct]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        // Use mock data for demo mode
        setMockData();
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch branches
      const { data: branchesData } = await supabase
        .from('branches')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true);
      setBranches(branchesData || []);

      // Fetch farmers
      const { data: farmersData } = await supabase
        .from('farmers')
        .select('*, employees(name)')
        .eq('integrator_id', user.id)
        .eq('is_active', true);
      setFarmers(farmersData?.map(f => ({
        ...f,
        supervisor_name: f.employees?.name
      })) || []);

      // Fetch products with stock
      const { data: productsData } = await supabase
        .from('products')
        .select('*, product_categories(category_name)')
        .eq('integrator_id', user.id)
        .eq('is_active', true);
      
      const productsWithStock = (productsData || []).map(p => ({
        ...p,
        category_name: p.product_categories?.category_name || 'Uncategorized',
        current_stock: Math.floor(Math.random() * 1000), // Mock stock for now
      }));
      setProducts(productsWithStock);

      // SlidersHorizontal low stock products
      setLowStockProducts(productsWithStock.filter(p => p.current_stock <= p.reorder_level));

      // Fetch purchases
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*, suppliers(supplier_name), purchase_items(*, products(product_name))')
        .eq('integrator_id', user.id)
        .gte('purchase_date', dateRange.from)
        .lte('purchase_date', dateRange.to);

      const formattedPurchases = (purchasesData || []).flatMap(p => 
        p.purchase_items?.map((item: any) => ({
          id: item.id,
          purchase_number: p.purchase_number,
          purchase_date: p.purchase_date,
          supplier_name: p.suppliers?.supplier_name || 'Unknown',
          product_name: item.products?.product_name || 'Unknown',
          quantity: item.quantity,
          unit_rate: item.unit_rate,
          total_amount: item.line_total,
          purchase_type: p.purchase_type,
        })) || []
      );
      setPurchases(formattedPurchases);

      // Fetch sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('integrator_id', user.id)
        .gte('sale_date', dateRange.from)
        .lte('sale_date', dateRange.to);
      setSales(salesData || []);

      // Fetch stock transfers
      const { data: transfersData } = await supabase
        .from('stock_transfers')
        .select('*, vehicles(vehicle_number), employees(name), stock_transfer_items(*, products(product_name))')
        .eq('integrator_id', user.id)
        .gte('transfer_date', dateRange.from)
        .lte('transfer_date', dateRange.to);

      const formattedTransfers = (transfersData || []).flatMap(t =>
        t.stock_transfer_items?.map((item: any) => ({
          id: item.id,
          transfer_number: t.transfer_number,
          transfer_date: t.transfer_date,
          transfer_type: t.transfer_type,
          from_location: t.from_branch_id || t.from_farmer_id || 'Unknown',
          to_location: t.to_branch_id || t.to_farmer_id || 'Unknown',
          product_name: item.products?.product_name || 'Unknown',
          quantity: item.quantity_sent,
          vehicle_number: t.vehicles?.vehicle_number,
          driver_name: t.employees?.name,
        })) || []
      );
      setStockTransfers(formattedTransfers);

      // Calculate category-wise purchases
      const categoryMap = new Map();
      formattedPurchases.forEach(p => {
        const category = productsWithStock.find(prod => prod.product_name === p.product_name)?.category_name || 'Other';
        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + p.total_amount);
      });
      setCategoryPurchases(Array.from(categoryMap.entries()).map(([category, amount]) => ({ category, amount })));

    } catch (error) {
      console.error('Error fetching data:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    // Mock data for demo mode
    setBranches([
      { id: '1', branch_code: 'BR-001', branch_name: 'Main Godown', branch_type: 'godown', city: 'Gorakhpur' },
      { id: '2', branch_code: 'BR-002', branch_name: 'Branch Office', branch_type: 'branch_office', city: 'Deoria' },
    ]);

    setFarmers([
      { id: '1', farmer_code: 'FMR-001', full_name: 'Ramesh Kumar', village: 'Pipraich', supervisor_name: 'Rajesh Singh' },
      { id: '2', farmer_code: 'FMR-002', full_name: 'Suresh Yadav', village: 'Chauri Chaura', supervisor_name: 'Amit Verma' },
    ]);

    setProducts([
      { id: '1', product_code: 'PRD-001', product_name: 'Broiler Starter Feed', category_name: 'Feed', unit_of_measure: 'kg', purchase_price: 45, sale_price: 50, current_stock: 2500, reorder_level: 1000, is_active: true },
      { id: '2', product_code: 'PRD-002', product_name: 'Broiler Grower Feed', category_name: 'Feed', unit_of_measure: 'kg', purchase_price: 38, sale_price: 42, current_stock: 5000, reorder_level: 2000, is_active: true },
      { id: '3', product_code: 'PRD-003', product_name: 'Antibiotic A', category_name: 'Medicine', unit_of_measure: 'bottles', purchase_price: 250, sale_price: 300, current_stock: 50, reorder_level: 100, is_active: true },
      { id: '4', product_code: 'PRD-004', product_name: 'Newcastle Vaccine', category_name: 'Vaccine', unit_of_measure: 'doses', purchase_price: 15, sale_price: 20, current_stock: 100, reorder_level: 200, is_active: true },
    ]);

    setLowStockProducts([
      { id: '3', product_code: 'PRD-003', product_name: 'Antibiotic A', category_name: 'Medicine', unit_of_measure: 'bottles', purchase_price: 250, sale_price: 300, current_stock: 50, reorder_level: 100, is_active: true },
      { id: '4', product_code: 'PRD-004', product_name: 'Newcastle Vaccine', category_name: 'Vaccine', unit_of_measure: 'doses', purchase_price: 15, sale_price: 20, current_stock: 100, reorder_level: 200, is_active: true },
    ]);

    setPurchases([
      { id: '1', purchase_number: 'PUR/2526/001', purchase_date: '2026-06-01', supplier_name: 'Feed Corp', product_name: 'Broiler Starter Feed', quantity: 1000, unit_rate: 45, total_amount: 45000, purchase_type: 'direct' },
      { id: '2', purchase_number: 'PUR/2526/002', purchase_date: '2026-06-05', supplier_name: 'Med Suppliers', product_name: 'Antibiotic A', quantity: 50, unit_rate: 250, total_amount: 12500, purchase_type: 'direct' },
    ]);

    setSales([
      { id: '1', sale_number: 'SAL/2526/001', sale_date: '2026-06-10', customer_name: 'Local Market', product_name: 'Broiler Starter Feed', quantity: 500, rate: 50, total_amount: 25000, sale_type: 'chick' },
    ]);

    setStockTransfers([
      { id: '1', transfer_number: 'TRF/2526/001', transfer_date: '2026-06-08', transfer_type: 'branch_to_branch', from_location: 'BR-001', to_location: 'BR-002', product_name: 'Broiler Starter Feed', quantity: 500, vehicle_number: 'UP53AB1234', driver_name: 'Driver A' },
    ]);

    setCategoryPurchases([
      { category: 'Feed', amount: 45000 },
      { category: 'Medicine', amount: 12500 },
    ]);

    setStockLedger([
      { id: '1', transaction_date: '2026-06-01', transaction_type: 'Purchase', product_name: 'Broiler Starter Feed', location: 'Main Godown', quantity_in: 1000, quantity_out: 0, balance: 1000, reference: 'PUR/2526/001' },
      { id: '2', transaction_date: '2026-06-08', transaction_type: 'Transfer Out', product_name: 'Broiler Starter Feed', location: 'Main Godown', quantity_in: 0, quantity_out: 500, balance: 500, reference: 'TRF/2526/001' },
    ]);
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center">
        <div className="text-center">
          <Spinner size={32} className="text-[#1A5C34] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header - varied spacing for visual hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 px-6 pt-8 pb-6">
        <div className="space-y-3">
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em] font-semibold bg-[#1A5C34]/10 text-[#1A5C34]">
            Inventory
          </span>
          <h1 className="text-[28px] font-bold text-[#111827] leading-[1.2] tracking-tight">
            {isHindi ? 'स्टॉक रिपोर्ट' : 'Stock Reports'}
          </h1>
          <p className="text-[15px] text-[#6B7280] leading-[1.6] max-w-lg">
            {isHindi 
              ? 'अपने स्टॉक की विस्तृत रिपोर्ट देखें' 
              : 'View detailed reports of your stock across all locations'}
          </p>
        </div>
        <div className="flex gap-3 sm:self-start">
          <button 
            onClick={() => handleExportCSV(
              activeTab === 'product-list' ? products :
              activeTab === 'branch-stock' ? products :
              activeTab === 'farmer-stock' ? products :
              activeTab === 'consolidated' ? products :
              activeTab === 'purchase-register' ? purchases :
              activeTab === 'category-purchase' ? categoryPurchases :
              activeTab === 'sale-register' ? sales :
              activeTab === 'stock-ledger' ? stockLedger :
              activeTab === 'transfer-report' ? stockTransfers :
              lowStockProducts,
              `stock-report-${activeTab}`
            )}
            className="border border-[#E3EDE7] px-4 py-2.5 rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-[#EDF7F1] hover:border-[#1A5C34]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
          >
            <Download size={18} weight="regular" />
            <span>CSV</span>
          </button>
          <button 
            onClick={handlePrint}
            className="border border-[#E3EDE7] px-4 py-2.5 rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-[#EDF7F1] hover:border-[#1A5C34]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98]"
          >
            <Printer size={18} weight="regular" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker - tighter grouping, better visual rhythm */}
      <div className="px-6 pb-6">
        <Card className="border-[#E3EDE7] bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Calendar size={20} weight="regular" className="text-[#1A5C34]" />
                <span className="text-[14px] font-semibold text-[#111827]">
                  {isHindi ? 'दिनांक सीमा' : 'Date Range'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all"
                />
                <ArrowRight size={18} weight="regular" className="text-[#6B7280] flex-shrink-0" />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-4 py-2.5 border border-[#E3EDE7] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs - improved visual hierarchy and spacing */}
      <div className="px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border border-[#E3EDE7] p-1.5 rounded-xl w-full overflow-x-auto">
            <TabsTrigger value="product-list" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'उत्पाद सूची' : 'Product List'}
            </TabsTrigger>
            <TabsTrigger value="branch-stock" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'शाखा स्टॉक' : 'Branch Stock'}
            </TabsTrigger>
            <TabsTrigger value="farmer-stock" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'किसान स्टॉक' : 'Farmer Stock'}
            </TabsTrigger>
            <TabsTrigger value="consolidated" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'समेकित' : 'Consolidated'}
            </TabsTrigger>
            <TabsTrigger value="purchase-register" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'खरीद रजिस्टर' : 'Purchase Register'}
            </TabsTrigger>
            <TabsTrigger value="category-purchase" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'श्रेणी खरीद' : 'Category Purchase'}
            </TabsTrigger>
            <TabsTrigger value="sale-register" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'बिक्री रजिस्टर' : 'Sale Register'}
            </TabsTrigger>
            <TabsTrigger value="stock-ledger" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'स्टॉक लेजर' : 'Stock Ledger'}
            </TabsTrigger>
            <TabsTrigger value="transfer-report" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'ट्रांसफर रिपोर्ट' : 'Transfer Report'}
            </TabsTrigger>
            <TabsTrigger value="min-order" className="data-[state=active]:bg-[#1A5C34] data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 text-[14px] font-medium transition-all">
              {isHindi ? 'न्यूनतम ऑर्डर' : 'Min Order'}
            </TabsTrigger>
          </TabsList>

          {/* Product List Report - improved table styling with hover states */}
          <TabsContent value="product-list">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Package size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'उत्पाद सूची' : 'Product List'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'कोड' : 'Code'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'नाम' : 'Name'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'श्रेणी' : 'Category'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'इकाई' : 'Unit'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'स्टॉक' : 'Stock'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'खरीद मूल्य' : 'Purchase'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'बिक्री मूल्य' : 'Sale'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, i) => (
                        <tr key={product.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-mono text-[12px] text-[#6B7280] tabular-nums">{product.product_code}</td>
                          <td className="px-5 py-3.5 font-medium text-[#111827]">{product.product_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{product.category_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{product.unit_of_measure}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{product.current_stock.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{formatINR(product.purchase_price)}</td>
                          <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{formatINR(product.sale_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branch Stock Report */}
          <TabsContent value="branch-stock">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Warehouse size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'शाखा स्टॉक रिपोर्ट' : 'Branch Stock Report'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'शाखा' : 'Branch'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'उत्पाद' : 'Product'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'स्टॉक' : 'Stock'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'मूल्य' : 'Value'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch, i) => (
                        <tr key={branch.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-medium text-[#111827]">{branch.branch_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{products[0]?.product_name || '-'}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{(products[0]?.current_stock || 0).toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{formatINR((products[0]?.current_stock || 0) * (products[0]?.purchase_price || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farmer Stock Report */}
          <TabsContent value="farmer-stock">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Users size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'किसान स्टॉक रिपोर्ट' : 'Farmer Stock Report'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'किसान' : 'Farmer'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'गांव' : 'Village'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'सुपरवाइजर' : 'Supervisor'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'स्टॉक' : 'Stock'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmers.map((farmer, i) => (
                        <tr key={farmer.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-medium text-[#111827]">{farmer.full_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{farmer.village}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{farmer.supervisor_name || '-'}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{Math.floor(Math.random() * 500).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consolidated Stock Report */}
          <TabsContent value="consolidated">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Package size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'समेकित स्टॉक रिपोर्ट' : 'Consolidated Stock Report'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'स्थान' : 'Location'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'प्रकार' : 'Type'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'कुल स्टॉक' : 'Total Stock'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'कुल मूल्य' : 'Total Value'}</th>
                        <th className="px-5 py-3.5 text-center font-semibold">{isHindi ? 'स्थिति' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch, i) => (
                        <tr key={branch.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-medium text-[#111827]">{branch.branch_name}</td>
                          <td className="px-5 py-3.5 text-[#374151] capitalize">{branch.branch_type}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{products.reduce((sum, p) => sum + p.current_stock, 0).toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{formatINR(products.reduce((sum, p) => sum + (p.current_stock * p.purchase_price), 0))}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#1A5C34]/10 text-[#1A5C34]">
                              {isHindi ? 'सामान्य' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Register */}
          <TabsContent value="purchase-register">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <ShoppingCart size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'खरीद रजिस्टर' : 'Purchase Register'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दस्तावेज़' : 'Document'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दिनांक' : 'Date'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'सप्लायर' : 'Supplier'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'उत्पाद' : 'Product'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'मात्रा' : 'Qty'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'दर' : 'Rate'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'राशि' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase, i) => (
                        <tr key={purchase.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-mono text-[12px] text-[#6B7280] tabular-nums">{purchase.purchase_number}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{purchase.purchase_date}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{purchase.supplier_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{purchase.product_name}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{purchase.quantity.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{formatINR(purchase.unit_rate)}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{formatINR(purchase.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category-wise Purchase */}
          <TabsContent value="category-purchase">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Package size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'श्रेणी-वार खरीद' : 'Category-wise Purchase'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'श्रेणी' : 'Category'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'कुल खरीद' : 'Total Purchase'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'प्रतिशत' : '%'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPurchases.map((item, i) => {
                        const total = categoryPurchases.reduce((sum, cat) => sum + cat.amount, 0);
                        const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
                        return (
                          <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                            <td className="px-5 py-3.5 font-medium text-[#111827]">{item.category}</td>
                            <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{formatINR(item.amount)}</td>
                            <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sale Register */}
          <TabsContent value="sale-register">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <ShoppingCart size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'बिक्री रजिस्टर' : 'Sale Register'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दस्तावेज़' : 'Document'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दिनांक' : 'Date'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'ग्राहक' : 'Customer'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'उत्पाद' : 'Product'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'मात्रा' : 'Qty'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'दर' : 'Rate'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'राशि' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, i) => (
                        <tr key={sale.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-mono text-[12px] text-[#6B7280] tabular-nums">{sale.sale_number}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{sale.sale_date}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{sale.customer_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{sale.product_name}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{sale.quantity.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{formatINR(sale.rate)}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{formatINR(sale.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Ledger */}
          <TabsContent value="stock-ledger">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Package size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'आइटम-वार स्टॉक लेजर' : 'Item-wise Stock Ledger'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दिनांक' : 'Date'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'प्रकार' : 'Type'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'उत्पाद' : 'Product'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'स्थान' : 'Location'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'इन' : 'In'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'आउट' : 'Out'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'शेष' : 'Balance'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'संदर्भ' : 'Reference'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockLedger.map((entry, i) => (
                        <tr key={entry.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 text-[#374151]">{entry.transaction_date}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{entry.transaction_type}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{entry.product_name}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{entry.location}</td>
                          <td className="px-5 py-3.5 text-right text-[#1A5C34] font-medium tabular-nums">{entry.quantity_in ? entry.quantity_in.toLocaleString() : '-'}</td>
                          <td className="px-5 py-3.5 text-right text-[#DC2626] font-medium tabular-nums">{entry.quantity_out ? entry.quantity_out.toLocaleString() : '-'}</td>
                          <td className="px-5 py-3.5 text-right font-semibold text-[#111827] tabular-nums">{entry.balance.toLocaleString()}</td>
                          <td className="px-5 py-3.5 font-mono text-[12px] text-[#6B7280] tabular-nums">{entry.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Transfer Report */}
          <TabsContent value="transfer-report">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Truck size={22} weight="regular" className="text-[#1A5C34]" />
                  {isHindi ? 'स्टॉक ट्रांसफर रिपोर्ट' : 'Stock Transfer Report'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34] font-semibold">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दस्तावेज़' : 'Document'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'दिनांक' : 'Date'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'प्रकार' : 'Type'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'से' : 'From'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'तक' : 'To'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'उत्पाद' : 'Product'}</th>
                        <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'मात्रा' : 'Qty'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'वाहन' : 'Vehicle'}</th>
                        <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'ड्राइवर' : 'Driver'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockTransfers.map((transfer, i) => (
                        <tr key={transfer.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors duration-150`}>
                          <td className="px-5 py-3.5 font-mono text-[12px] text-[#6B7280] tabular-nums">{transfer.transfer_number}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{transfer.transfer_date}</td>
                          <td className="px-5 py-3.5 text-[#374151] capitalize">{transfer.transfer_type}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{transfer.from_location}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{transfer.to_location}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{transfer.product_name}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#111827] tabular-nums">{transfer.quantity.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{transfer.vehicle_number || '-'}</td>
                          <td className="px-5 py-3.5 text-[#374151]">{transfer.driver_name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Min Order Stock */}
          <TabsContent value="min-order">
            <Card className="border-[#E3EDE7] bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-[18px] font-semibold">
                  <Warning size={22} weight="regular" className="text-[#DC2626]" />
                  {isHindi ? 'न्यूनतम ऑर्डर स्टॉक' : 'Min Order Stock'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#1A5C34]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} weight="regular" className="text-[#1A5C34]" />
                    </div>
                    <p className="text-[15px] font-medium text-[#111827] mb-1">
                      {isHindi ? 'सभी उत्पाद पर्याप्त स्टॉक में हैं' : 'All products are in sufficient stock'}
                    </p>
                    <p className="text-[13px] text-[#6B7280]">
                      {isHindi ? 'कोई भी रीऑर्डर आवश्यकता नहीं' : 'No reorder requirements at this time'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[14px]">
                      <thead className="bg-[#FEF2F2] text-[#DC2626] font-semibold">
                        <tr>
                          <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'कोड' : 'Code'}</th>
                          <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'नाम' : 'Name'}</th>
                          <th className="px-5 py-3.5 text-left font-semibold">{isHindi ? 'श्रेणी' : 'Category'}</th>
                          <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'वर्तमान' : 'Current'}</th>
                          <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'न्यूनतम' : 'Min Level'}</th>
                          <th className="px-5 py-3.5 text-right font-semibold">{isHindi ? 'कमी' : 'Shortage'}</th>
                          <th className="px-5 py-3.5 text-center font-semibold">{isHindi ? 'स्थिति' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product, i) => (
                          <tr key={product.id} className={`${i % 2 === 0 ? 'bg-[#FEF2F2]' : 'bg-white'} hover:bg-[#FEE2E2] transition-colors duration-150`}>
                            <td className="px-5 py-3.5 font-mono text-[12px] text-[#6B7280] tabular-nums">{product.product_code}</td>
                            <td className="px-5 py-3.5 font-medium text-[#111827]">{product.product_name}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{product.category_name}</td>
                            <td className="px-5 py-3.5 text-right font-semibold text-[#DC2626] tabular-nums">{product.current_stock.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-right text-[#374151] tabular-nums">{product.reorder_level.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-right font-semibold text-[#DC2626] tabular-nums">
                              {(product.reorder_level - product.current_stock).toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#DC2626] text-white">
                                {isHindi ? 'कम स्टॉक' : 'Low Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
