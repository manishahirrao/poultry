// ERP Types for Integration Company Operations

// Master Types
export interface Company {
  id: string;
  integrator_id: string;
  company_name: string;
  company_name_hi?: string;
  gst_number?: string;
  pan_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  financial_year_start: number;
  currency_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  integrator_id: string;
  company_id: string;
  branch_code: string;
  branch_name: string;
  branch_type: 'head_office' | 'branch_office' | 'godown' | 'dispatch_center';
  address?: string;
  city?: string;
  manager_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Farmer {
  id: string;
  integrator_id: string;
  farmer_code?: string;
  full_name: string;
  name_hi?: string;
  phone: string;
  alternate_phone?: string;
  village?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  bank_account?: string;
  bank_ifsc?: string;
  bank_name?: string;
  aadhar_number?: string;
  linked_farm_ids?: string[];
  supervisor_id?: string;
  line_id?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  integrator_id: string;
  supplier_code?: string;
  supplier_name: string;
  supplier_type: 'chick' | 'feed' | 'medicine' | 'equipment' | 'other';
  contact_person?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  opening_balance: number;
  balance_type: 'payable' | 'receivable';
  credit_days: number;
  is_active: boolean;
  created_at: string;
}

export interface Trader {
  id: string;
  integrator_id: string;
  trader_code?: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  opening_balance: number;
  balance_type: 'payable' | 'receivable';
  credit_days: number;
  rating: 1 | 2 | 3 | 4 | 5;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface UserPrivileges {
  id: string;
  integrator_id: string;
  user_id: string;
  role_name: string;
  can_view_dashboard: boolean;
  can_view_farms: boolean;
  can_edit_farms: boolean;
  can_view_inventory: boolean;
  can_edit_inventory: boolean;
  can_view_accounts: boolean;
  can_edit_accounts: boolean;
  can_view_payroll: boolean;
  can_edit_payroll: boolean;
  can_view_reports: boolean;
  can_manage_users: boolean;
  can_approve_payments: boolean;
  allowed_farm_ids?: string[];
  created_at: string;
  updated_at: string;
}

// Inventory Types
export interface Product {
  id: string;
  integrator_id: string;
  product_code?: string;
  product_name: string;
  product_name_hi?: string;
  category_id?: string;
  unit_of_measure: 'kg' | 'g' | 'mt' | 'litre' | 'ml' | 'pcs' | 'bag' | 'crate' | 'dozen' | 'box';
  purchase_price?: number;
  sale_price?: number;
  margin_pct?: number;
  reorder_level?: number;
  hsn_code?: string;
  tax_id?: string;
  withdrawal_days?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  integrator_id: string;
  po_number: string;
  po_date: string;
  supplier_id: string;
  branch_id?: string;
  expected_delivery?: string;
  status: 'draft' | 'open' | 'partial' | 'received' | 'cancelled';
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  ordered_qty: number;
  received_qty: number;
  unit_rate?: number;
  tax_id?: string;
  tax_amount: number;
  line_total?: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  integrator_id: string;
  purchase_number: string;
  purchase_date: string;
  purchase_type: 'against_po' | 'direct' | 'chick' | 'freight' | 'return';
  supplier_id: string;
  branch_id?: string;
  po_id?: string;
  invoice_number?: string;
  invoice_date?: string;
  subtotal: number;
  tax_total: number;
  freight_charges: number;
  other_charges: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  financial_year_id?: string;
  created_by?: string;
  created_at: string;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  po_item_id?: string;
  quantity: number;
  unit_rate: number;
  tax_id?: string;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  line_total?: number;
  batch_number?: string;
  expiry_date?: string;
  created_at: string;
}

export interface StockTransfer {
  id: string;
  integrator_id: string;
  transfer_number: string;
  transfer_date: string;
  transfer_type: 'branch_to_branch' | 'branch_to_farmer' | 'farmer_to_branch' | 'farmer_to_farmer';
  from_branch_id?: string;
  from_farmer_id?: string;
  to_branch_id?: string;
  to_farmer_id?: string;
  batch_id?: string;
  farm_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  status: 'draft' | 'in_transit' | 'received' | 'cancelled';
  remarks?: string;
  financial_year_id?: string;
  created_by?: string;
  created_at: string;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity_sent: number;
  quantity_received?: number;
  unit_rate?: number;
  shortage_qty: number;
  created_at: string;
}

// Accounting Types
export interface AccountGroup {
  id: string;
  integrator_id: string;
  group_code: string;
  group_name: string;
  parent_group_id?: string;
  group_type: 'asset' | 'liability' | 'income' | 'expense' | 'equity';
  affects_gross_profit: boolean;
  is_system: boolean;
  created_at: string;
}

export interface LedgerAccount {
  id: string;
  integrator_id: string;
  account_code?: string;
  account_name: string;
  account_name_hi?: string;
  account_group_id: string;
  opening_balance: number;
  opening_balance_type: 'Dr' | 'Cr';
  linked_supplier_id?: string;
  linked_trader_id?: string;
  linked_employee_id?: string;
  linked_farmer_id?: string;
  gst_number?: string;
  phone?: string;
  address?: string;
  financial_year_id?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Voucher {
  id: string;
  integrator_id: string;
  voucher_number: string;
  voucher_date: string;
  voucher_type: 'payment' | 'receipt' | 'contra' | 'journal' | 'employee';
  narration?: string;
  total_amount: number;
  cheque_number?: string;
  cheque_date?: string;
  bank_account_id?: string;
  financial_year_id?: string;
  is_posted: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  entries?: VoucherEntry[];
}

export interface VoucherEntry {
  id: string;
  voucher_id: string;
  ledger_account_id: string;
  entry_type: 'Dr' | 'Cr';
  amount: number;
  narration?: string;
  sort_order: number;
  created_at: string;
}

export interface BankReconciliation {
  id: string;
  integrator_id: string;
  bank_account_id: string;
  statement_date: string;
  statement_balance: number;
  book_balance: number;
  difference: number;
  is_reconciled: boolean;
  reconciled_date?: string;
  notes?: string;
  financial_year_id?: string;
  created_at: string;
}

// Payroll Types
export interface LeavePolicy {
  id: string;
  integrator_id: string;
  policy_name: string;
  casual_leave_days: number;
  sick_leave_days: number;
  earned_leave_days: number;
  created_at: string;
}

export interface LeaveEntry {
  id: string;
  integrator_id: string;
  employee_id: string;
  leave_type: 'casual' | 'sick' | 'earned' | 'unpaid' | 'holiday';
  from_date: string;
  to_date: string;
  days_count: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  financial_year_id?: string;
  created_at: string;
}

export interface PayrollComponent {
  id: string;
  integrator_id: string;
  component_name: string;
  component_type: 'earning' | 'deduction' | 'statutory';
  is_taxable: boolean;
  is_pf_applicable: boolean;
  display_order: number;
  created_at: string;
}

// Setup Types
export interface Line {
  id: string;
  integrator_id: string;
  line_code: string;
  line_name: string;
  supervisor_id?: string;
  district?: string;
  farm_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ProfitCenter {
  id: string;
  integrator_id: string;
  center_code: string;
  center_name: string;
  center_type: 'integration' | 'trading' | 'feed' | 'other';
  is_active: boolean;
  created_at: string;
}

export interface FinancialYear {
  id: string;
  integrator_id: string;
  year_label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  created_at: string;
}

export interface TaxSetup {
  id: string;
  integrator_id: string;
  tax_name: string;
  tax_rate: number;
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
  hsn_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface GCRateSetup {
  id: string;
  integrator_id: string;
  rate_name: string;
  breed?: string;
  season?: 'summer' | 'winter' | 'monsoon' | 'all';
  chick_rate?: number;
  feed_rate?: number;
  target_gc?: number;
  incentive_above?: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
}

// Broiler Integration Types
export interface Vehicle {
  id: string;
  integrator_id: string;
  vehicle_number: string;
  vehicle_type: 'pickup' | 'mini_truck' | 'truck' | 'tempo' | 'bike' | 'other';
  capacity_kg?: number;
  capacity_crates?: number;
  owner_name?: string;
  is_owned: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ShedReadiness {
  id: string;
  integrator_id: string;
  farm_id: string;
  shed_id?: string;
  readiness_date: string;
  expected_chick_date?: string;
  litter_laid: boolean;
  brooder_tested: boolean;
  feeders_placed: boolean;
  drinkers_placed: boolean;
  disinfection_done: boolean;
  supervisor_id?: string;
  remarks?: string;
  status: 'pending' | 'approved' | 'chicks_placed';
  approved_by?: string;
  created_at: string;
}

export interface ChickAllocation {
  id: string;
  integrator_id: string;
  alloc_number: string;
  alloc_date: string;
  farm_id: string;
  farmer_id: string;
  batch_id?: string;
  shed_readiness_id?: string;
  supplier_id?: string;
  breed?: string;
  chicks_allotted: number;
  chicks_received?: number;
  chick_rate: number;
  total_chick_cost: number;
  transport_cost: number;
  vehicle_id?: string;
  driver_id?: string;
  supervisor_id?: string;
  invoice_number?: string;
  shorts_chicks: number;
  financial_year_id?: string;
  created_at: string;
}

export interface FeedMedicineAllocation {
  id: string;
  integrator_id: string;
  alloc_number: string;
  alloc_date: string;
  alloc_type: 'feed' | 'medicine' | 'vaccine' | 'other';
  farm_id: string;
  farmer_id: string;
  batch_id?: string;
  from_branch_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  supervisor_id?: string;
  total_quantity?: number;
  total_value?: number;
  financial_year_id?: string;
  remarks?: string;
  created_at: string;
  items?: FeedMedicineAllocItem[];
}

export interface FeedMedicineAllocItem {
  id: string;
  allocation_id: string;
  product_id: string;
  quantity: number;
  unit_rate?: number;
  line_value: number;
  batch_no?: string;
  created_at: string;
}

export interface SupervisorVisit {
  id: string;
  integrator_id: string;
  supervisor_id: string;
  farm_id: string;
  batch_id?: string;
  visit_date: string;
  visit_time?: string;
  purpose: 'routine' | 'body_weight' | 'vaccination' | 'treatment' | 'shed_ready' | 'sales' | 'other';
  sample_birds_weighed?: number;
  avg_body_weight?: number;
  mortality_observed?: number;
  feed_stock_observed?: number;
  medicine_stock_observed?: number;
  issues_observed?: string;
  recommendations?: string;
  travel_km?: number;
  travel_expense?: number;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface SupervisorIncentive {
  id: string;
  integrator_id: string;
  supervisor_id: string;
  batch_id?: string;
  calculation_date: string;
  actual_gc?: number;
  target_gc?: number;
  gc_saving?: number;
  birds_sold?: number;
  total_weight_kg?: number;
  incentive_rate?: number;
  incentive_amount: number;
  penalty_rate?: number;
  penalty_amount: number;
  net_incentive: number;
  status: 'pending' | 'approved' | 'paid';
  approved_by?: string;
  paid_date?: string;
  created_at: string;
}

// GST Report Types
export interface GSTR1Data {
  invoice_date: string;
  invoice_number: string;
  party_gstn: string;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_tax: number;
  hsn_code?: string;
  product_name?: string;
}

export interface HSNSummary {
  hsn_code: string;
  description?: string;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_tax: number;
}

export interface GSTR3BData {
  outward_supplies: {
    taxable_value: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_tax: number;
    total_value: number;
  };
  itc_available: {
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_itc: number;
    total_purchases: number;
  };
  net_tax_payable: {
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_tax: number;
  };
  summary: {
    month: number;
    year: number;
    start_date: string;
    end_date: string;
    period_label: string;
  };
}

// Dashboard Overview
export interface DashboardOverview {
  statusAsOn: string; // IST ISO string
  activeFarms: number;
  closedBooksMonth: number;
  totalFarmers: number;
  supervisorCount: number;
  todayMortality: number;
  totalLiveBirds: number;
  birdsSoldMonth: number;
  avgSaleRateMonth: number;
  notVisited1d: number;
  notVisited3d: number;
  notVisited7d: number;
  monthRevenue: number;
  monthCost: number;
  monthProfit: number;
  liveStockByAge: Array<{
    ageLabel: string;
    birds: number;
    avgWeight?: number;
    avgFcr?: number;
    farmsCount: number;
  }>;
}
