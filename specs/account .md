# FlockIQ — Integration Company ERP Modules
# Windsurf Cascade Full Implementation Prompt
# Version: v3.0 | June 2026 | CONFIDENTIAL
#
# INSTRUCTIONS FOR WINDSURF:
# Copy this ENTIRE document into Windsurf Cascade (Agent mode).
# Read every section fully before writing any code.
# Implement sections in the exact ORDER specified at the end.
# Reference documents: FlockIQ_Windsurf_Prompt.md (GC + Employee modules already built),
#   FlockIQ_Gap_Remediation_Tasks_v1.md (Gap 1–7 features already built or in progress),
#   iot_device.md (IoT sensor integration already built).
#
# ─────────────────────────────────────────────────────────────────────────────
# GAP ANALYSIS: WHAT IS MISSING FROM EXISTING FLOCKIQ vs. REQUESTED FEATURES
# ─────────────────────────────────────────────────────────────────────────────
#
# ALREADY BUILT (do NOT rebuild — only extend/wire):
#   ✅ Farm Management (farms, sheds, batches, daily logs)
#   ✅ GC / Growing Cost module (batch_gc_costs, GCSummaryCard)
#   ✅ Employee & Expense module (employees, salary_records)
#   ✅ P&L Tab — Gap 1 (batch_costs)
#   ✅ Sales Tab — Gap 2 (batch_sales, buyers)
#   ✅ Treatment Log — Gap 3 (batch_treatments, medicines_db, vets)
#   ✅ Environment Data — Gap 4 + IoT sensors
#   ✅ Benchmark Page — Gap 5
#   ✅ Risk Score — Gap 6
#   ✅ Document Library — Gap 7
#
# MISSING — this prompt builds ALL of the following:
#   ❌ Dashboard Overview KPIs: Live Stock by age, Supervisors, Not Visited, Sale Rate
#   ❌ Master: Company, Supplier, Farmer, Trader, User Privileges
#   ❌ Inventory: Product master, PO system, Stock tracking, Allocation to farmers
#   ❌ Broiler Integration workflow: Shed Ready → Allocation → Sale → Settlement
#   ❌ Supervisor Visit tracking + Travel Entry
#   ❌ Incentive Calculation for supervisors
#   ❌ Accounting: Vouchers, Ledger, GST (GSTR1/GSTR3B), Trial Balance, Balance Sheet
#   ❌ Payroll: Leave, Payroll Setup, Financial Year
#   ❌ Setup/More: Line, Profit Center, Tax, Financial Year, GC Rate Setup, Broker
#   ❌ User Management: User Privileges, Access Control

---

## ROLE & PROJECT CONTEXT

You are a senior full-stack engineer extending **FlockIQ** — a poultry farm management and integration business ERP. The existing codebase handles individual farm tracking. You are now building the **Integration Company Operations Layer** — the management tools used by the integration company owner and their office staff.

**Think from this persona:** I am Rajesh Singh, owner of RS Poultry Integrations, Gorakhpur. I have 47 contract farmers, 6 supervisors, a feed godown, and a chick procurement team. Every day I need to know: which farmers have chicks, how old are the flocks, did my supervisors visit everyone, what is sitting in my godown, what did I sell this week, and am I making money. FlockIQ must give me all of this in one place.

**Tech Stack (DO NOT CHANGE):**
```
Next.js 15 App Router, TypeScript strict (noImplicitAny: true)
Tailwind CSS v3 (utility classes only — no CSS files)
Recharts (ALL charts — no other chart library)
Supabase (SSR auth + RLS + Postgres + Storage + Realtime)
SWR for data fetching, react-hook-form + Zod for forms
next-i18next (Hindi hi + English en)
Framer Motion, Phosphor Icons
```

**Brand colours (ONLY these):**
```typescript
const colours = {
  brand700: '#1A5C34',   // primary dark green
  brand400: '#3DAE72',   // accent green
  brand50:  '#EDF7F1',   // light green tint
  signal:   '#E8611A',   // saffron/orange — actual prices, alerts
  amber:    '#D97706',   // warning
  red:      '#DC2626',   // danger
  sidebar:  '#0D1F16',   // near-black sidebar
  pageBg:   '#F4F7F5',
  cardBg:   '#FFFFFF',
  border:   '#E3EDE7',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  whatsapp: '#25D366',
}
```

**Currency formatting (ALWAYS):**
```typescript
// Indian format: ₹1,25,000 not ₹125,000
const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
```

---

# ═══════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════

**Create file:** `supabase/migrations/[timestamp]_integration_erp_v3.sql`

```sql
-- ════════════════════════════════════════════════════════════
-- MASTER TABLES
-- ════════════════════════════════════════════════════════════

-- Company / Branch setup (the integration company itself)
CREATE TABLE IF NOT EXISTS companies (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name      VARCHAR(200) NOT NULL,
  company_name_hi   VARCHAR(200),
  gst_number        VARCHAR(20) UNIQUE,
  pan_number        VARCHAR(10),
  address_line1     TEXT,
  address_line2     TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100) DEFAULT 'Uttar Pradesh',
  pincode           VARCHAR(6),
  phone             VARCHAR(15),
  email             VARCHAR(200),
  logo_url          TEXT,
  financial_year_start INTEGER DEFAULT 4,  -- month: 4 = April
  currency_code     VARCHAR(5) DEFAULT 'INR',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_owner ON companies FOR ALL USING (integrator_id = auth.uid());

-- Branches / Lines (godown, branch office, dispatch point)
CREATE TABLE IF NOT EXISTS branches (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_code       VARCHAR(20) NOT NULL,
  branch_name       VARCHAR(200) NOT NULL,
  branch_type       VARCHAR(30) DEFAULT 'godown'
                    CHECK (branch_type IN ('head_office','branch_office','godown','dispatch_center')),
  address           TEXT,
  city              VARCHAR(100),
  manager_name      VARCHAR(200),
  phone             VARCHAR(15),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branches_owner ON branches FOR ALL USING (integrator_id = auth.uid());

-- Farmers (contract farmers managed by the integrator)
CREATE TABLE IF NOT EXISTS farmers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_code       VARCHAR(20),           -- Auto: FMR-001
  full_name         VARCHAR(200) NOT NULL,
  name_hi           VARCHAR(200),
  phone             VARCHAR(15) NOT NULL,
  alternate_phone   VARCHAR(15),
  village           VARCHAR(100),
  tehsil            VARCHAR(100),
  district          VARCHAR(100),
  state             VARCHAR(100),
  bank_account      VARCHAR(20),
  bank_ifsc         VARCHAR(11),
  bank_name         VARCHAR(100),
  aadhar_number     VARCHAR(12),
  linked_farm_ids   UUID[],               -- references farms(id) array
  supervisor_id     UUID REFERENCES employees(id),
  line_id           UUID REFERENCES branches(id),  -- which line/route
  is_active         BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
CREATE POLICY farmers_owner ON farmers FOR ALL USING (integrator_id = auth.uid());
CREATE INDEX idx_farmers_supervisor ON farmers(supervisor_id);
CREATE INDEX idx_farmers_line ON farmers(line_id);

-- Suppliers (feed, medicine, chick suppliers)
CREATE TABLE IF NOT EXISTS suppliers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_code     VARCHAR(20),
  supplier_name     VARCHAR(200) NOT NULL,
  supplier_type     VARCHAR(30) CHECK (supplier_type IN ('chick','feed','medicine','equipment','other')),
  contact_person    VARCHAR(200),
  phone             VARCHAR(15),
  email             VARCHAR(200),
  gst_number        VARCHAR(20),
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  opening_balance   NUMERIC(14,2) DEFAULT 0,  -- amount owed at start
  balance_type      VARCHAR(10) DEFAULT 'payable' CHECK (balance_type IN ('payable','receivable')),
  credit_days       INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY suppliers_owner ON suppliers FOR ALL USING (integrator_id = auth.uid());

-- Traders / Buyers (who buys harvested birds)
CREATE TABLE IF NOT EXISTS traders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trader_code       VARCHAR(20),
  full_name         VARCHAR(200) NOT NULL,
  company_name      VARCHAR(200),
  phone             VARCHAR(15),
  gst_number        VARCHAR(20),
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  opening_balance   NUMERIC(14,2) DEFAULT 0,
  balance_type      VARCHAR(10) DEFAULT 'receivable',
  credit_days       INTEGER DEFAULT 0,
  rating            SMALLINT DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  is_active         BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;
CREATE POLICY traders_owner ON traders FOR ALL USING (integrator_id = auth.uid());

-- User Privileges (role-based access control for sub-users)
CREATE TABLE IF NOT EXISTS user_privileges (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name         VARCHAR(50) NOT NULL,
  -- Module access flags (true = can access)
  can_view_dashboard      BOOLEAN DEFAULT TRUE,
  can_view_farms          BOOLEAN DEFAULT TRUE,
  can_edit_farms          BOOLEAN DEFAULT FALSE,
  can_view_inventory      BOOLEAN DEFAULT FALSE,
  can_edit_inventory      BOOLEAN DEFAULT FALSE,
  can_view_accounts       BOOLEAN DEFAULT FALSE,
  can_edit_accounts       BOOLEAN DEFAULT FALSE,
  can_view_payroll        BOOLEAN DEFAULT FALSE,
  can_edit_payroll        BOOLEAN DEFAULT FALSE,
  can_view_reports        BOOLEAN DEFAULT TRUE,
  can_manage_users        BOOLEAN DEFAULT FALSE,
  can_approve_payments    BOOLEAN DEFAULT FALSE,
  allowed_farm_ids        UUID[],  -- NULL = all farms; array = specific farms only
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integrator_id, user_id)
);
ALTER TABLE user_privileges ENABLE ROW LEVEL SECURITY;
CREATE POLICY privileges_owner ON user_privileges FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- SETUP / CONFIGURATION TABLES
-- ════════════════════════════════════════════════════════════

-- Lines / Routes (supervisor route groupings)
CREATE TABLE IF NOT EXISTS lines (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_code         VARCHAR(20) NOT NULL,
  line_name         VARCHAR(100) NOT NULL,
  supervisor_id     UUID REFERENCES employees(id),
  district          VARCHAR(100),
  farm_count        INTEGER DEFAULT 0,  -- denormalized count
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY lines_owner ON lines FOR ALL USING (integrator_id = auth.uid());

-- Profit Centers
CREATE TABLE IF NOT EXISTS profit_centers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_code       VARCHAR(20) NOT NULL,
  center_name       VARCHAR(100) NOT NULL,
  center_type       VARCHAR(30) DEFAULT 'integration'
                    CHECK (center_type IN ('integration','trading','feed','other')),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profit_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY pc_owner ON profit_centers FOR ALL USING (integrator_id = auth.uid());

-- Financial Years
CREATE TABLE IF NOT EXISTS financial_years (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_label        VARCHAR(20) NOT NULL,   -- e.g. "2025-26"
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  is_current        BOOLEAN DEFAULT FALSE,
  is_closed         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE financial_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY fy_owner ON financial_years FOR ALL USING (integrator_id = auth.uid());

-- Tax Setup (GST rates)
CREATE TABLE IF NOT EXISTS tax_setup (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_name          VARCHAR(50) NOT NULL,   -- e.g. "GST 5%", "GST 12%"
  tax_rate          NUMERIC(5,2) NOT NULL,  -- percentage
  cgst_rate         NUMERIC(5,2),
  sgst_rate         NUMERIC(5,2),
  igst_rate         NUMERIC(5,2),
  hsn_code          VARCHAR(10),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tax_setup ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_owner ON tax_setup FOR ALL USING (integrator_id = auth.uid());

-- GC Rate Setup (target GC and rate cards per breed/season)
CREATE TABLE IF NOT EXISTS gc_rate_setup (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_name         VARCHAR(100) NOT NULL,   -- e.g. "Cobb 430 Summer 2026"
  breed             VARCHAR(50),
  season            VARCHAR(20),             -- 'summer'|'winter'|'monsoon'|'all'
  chick_rate        NUMERIC(8,2),            -- ₹/chick
  feed_rate         NUMERIC(8,2),            -- ₹/kg feed
  target_gc         NUMERIC(8,2),            -- target GC ₹/kg live weight
  incentive_above   NUMERIC(8,2),            -- GC above which incentive triggers
  effective_from    DATE NOT NULL,
  effective_to      DATE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE gc_rate_setup ENABLE ROW LEVEL SECURITY;
CREATE POLICY gcrate_owner ON gc_rate_setup FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- INVENTORY TABLES
-- ════════════════════════════════════════════════════════════

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_code     VARCHAR(20),
  category_name     VARCHAR(100) NOT NULL,
  category_type     VARCHAR(30) DEFAULT 'material'
                    CHECK (category_type IN ('chick','feed','medicine','vaccine','equipment','other')),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY prodcat_owner ON product_categories FOR ALL USING (integrator_id = auth.uid());

-- Product Master
CREATE TABLE IF NOT EXISTS products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_code      VARCHAR(30),
  product_name      VARCHAR(200) NOT NULL,
  product_name_hi   VARCHAR(200),
  category_id       UUID REFERENCES product_categories(id),
  unit_of_measure   VARCHAR(20) DEFAULT 'kg'
                    CHECK (unit_of_measure IN ('kg','g','mt','litre','ml','pcs','bag','crate','dozen','box')),
  purchase_price    NUMERIC(10,2),           -- default purchase price
  sale_price        NUMERIC(10,2),           -- default sale price to farmer
  margin_pct        NUMERIC(5,2),            -- margin % on purchase price
  reorder_level     NUMERIC(10,2),           -- minimum stock level trigger
  hsn_code          VARCHAR(10),
  tax_id            UUID REFERENCES tax_setup(id),
  withdrawal_days   INTEGER,                 -- for medicines: withdrawal period
  is_active         BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_owner ON products FOR ALL USING (integrator_id = auth.uid());
CREATE INDEX idx_products_category ON products(category_id);

-- Branch Opening Stock
CREATE TABLE IF NOT EXISTS branch_stock_opening (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id         UUID NOT NULL REFERENCES branches(id),
  product_id        UUID NOT NULL REFERENCES products(id),
  financial_year_id UUID REFERENCES financial_years(id),
  opening_qty       NUMERIC(12,2) DEFAULT 0,
  opening_rate      NUMERIC(10,2) DEFAULT 0,
  opening_value     NUMERIC(14,2) GENERATED ALWAYS AS (opening_qty * opening_rate) STORED,
  entered_date      DATE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (branch_id, product_id, financial_year_id)
);
ALTER TABLE branch_stock_opening ENABLE ROW LEVEL SECURITY;
CREATE POLICY bso_owner ON branch_stock_opening FOR ALL USING (integrator_id = auth.uid());

-- Farmer Opening Stock (medicines/feed balance at farmer end)
CREATE TABLE IF NOT EXISTS farmer_stock_opening (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id         UUID NOT NULL REFERENCES farmers(id),
  product_id        UUID NOT NULL REFERENCES products(id),
  financial_year_id UUID REFERENCES financial_years(id),
  opening_qty       NUMERIC(12,2) DEFAULT 0,
  opening_rate      NUMERIC(10,2) DEFAULT 0,
  entered_date      DATE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE farmer_stock_opening ENABLE ROW LEVEL SECURITY;
CREATE POLICY fso_owner ON farmer_stock_opening FOR ALL USING (integrator_id = auth.uid());

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  po_number         VARCHAR(30) NOT NULL UNIQUE,  -- Auto: PO/2526/001
  po_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id       UUID NOT NULL REFERENCES suppliers(id),
  branch_id         UUID REFERENCES branches(id),
  expected_delivery DATE,
  status            VARCHAR(20) DEFAULT 'open'
                    CHECK (status IN ('draft','open','partial','received','cancelled')),
  remarks           TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY po_owner ON purchase_orders FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id             UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  ordered_qty       NUMERIC(12,2) NOT NULL,
  received_qty      NUMERIC(12,2) DEFAULT 0,
  unit_rate         NUMERIC(10,2),
  tax_id            UUID REFERENCES tax_setup(id),
  tax_amount        NUMERIC(10,2) DEFAULT 0,
  line_total        NUMERIC(14,2),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Entries (Goods Receipt)
CREATE TABLE IF NOT EXISTS purchases (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_number   VARCHAR(30) NOT NULL,   -- Auto: PUR/2526/001
  purchase_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_type     VARCHAR(20) DEFAULT 'direct'
                    CHECK (purchase_type IN ('against_po','direct','chick','freight','return')),
  supplier_id       UUID NOT NULL REFERENCES suppliers(id),
  branch_id         UUID REFERENCES branches(id),
  po_id             UUID REFERENCES purchase_orders(id),  -- if against PO
  invoice_number    VARCHAR(50),
  invoice_date      DATE,
  subtotal          NUMERIC(14,2) DEFAULT 0,
  tax_total         NUMERIC(12,2) DEFAULT 0,
  freight_charges   NUMERIC(10,2) DEFAULT 0,
  other_charges     NUMERIC(10,2) DEFAULT 0,
  total_amount      NUMERIC(14,2) DEFAULT 0,
  paid_amount       NUMERIC(14,2) DEFAULT 0,
  balance_amount    NUMERIC(14,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  payment_status    VARCHAR(20) DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid','partial','paid')),
  notes             TEXT,
  financial_year_id UUID REFERENCES financial_years(id),
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY purchases_owner ON purchases FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS purchase_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id       UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  po_item_id        UUID REFERENCES purchase_order_items(id),
  quantity          NUMERIC(12,2) NOT NULL,
  unit_rate         NUMERIC(10,2) NOT NULL,
  tax_id            UUID REFERENCES tax_setup(id),
  cgst_amount       NUMERIC(10,2) DEFAULT 0,
  sgst_amount       NUMERIC(10,2) DEFAULT 0,
  igst_amount       NUMERIC(10,2) DEFAULT 0,
  line_total        NUMERIC(14,2),
  batch_number      VARCHAR(50),     -- for medicines — lot tracking
  expiry_date       DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);

-- Stock Transfers (Branch to Branch, Branch to Farmer)
CREATE TABLE IF NOT EXISTS stock_transfers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transfer_number   VARCHAR(30) NOT NULL,   -- Auto: TRF/2526/001
  transfer_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  transfer_type     VARCHAR(20) DEFAULT 'branch_to_branch'
                    CHECK (transfer_type IN ('branch_to_branch','branch_to_farmer','farmer_to_branch','farmer_to_farmer')),
  from_branch_id    UUID REFERENCES branches(id),
  from_farmer_id    UUID REFERENCES farmers(id),
  to_branch_id      UUID REFERENCES branches(id),
  to_farmer_id      UUID REFERENCES farmers(id),
  batch_id          UUID REFERENCES batches(id),  -- which flock batch this is for
  farm_id           UUID REFERENCES farms(id),
  vehicle_id        UUID REFERENCES vehicles(id),
  driver_id         UUID REFERENCES employees(id),
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('draft','in_transit','received','cancelled')),
  remarks           TEXT,
  financial_year_id UUID REFERENCES financial_years(id),
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY st_owner ON stock_transfers FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id       UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  quantity_sent     NUMERIC(12,2) NOT NULL,
  quantity_received NUMERIC(12,2),
  unit_rate         NUMERIC(10,2),
  shortage_qty      NUMERIC(12,2) GENERATED ALWAYS AS
                      (COALESCE(quantity_sent,0) - COALESCE(quantity_received,0)) STORED,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Adjustments
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adj_number        VARCHAR(30) NOT NULL,
  adj_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  adj_type          VARCHAR(20) DEFAULT 'write_off'
                    CHECK (adj_type IN ('write_off','write_in','damage','expired','transfer_correction')),
  branch_id         UUID REFERENCES branches(id),
  farmer_id         UUID REFERENCES farmers(id),
  product_id        UUID NOT NULL REFERENCES products(id),
  quantity          NUMERIC(12,2) NOT NULL,
  unit_rate         NUMERIC(10,2),
  reason            TEXT,
  financial_year_id UUID REFERENCES financial_years(id),
  approved_by       UUID REFERENCES auth.users(id),
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY sa_owner ON stock_adjustments FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- BROILER INTEGRATION WORKFLOW TABLES
-- ════════════════════════════════════════════════════════════

-- Vehicles (for bird transport, feed delivery)
CREATE TABLE IF NOT EXISTS vehicles (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_number    VARCHAR(20) NOT NULL,   -- e.g. UP53AB1234
  vehicle_type      VARCHAR(30) DEFAULT 'pickup'
                    CHECK (vehicle_type IN ('pickup','mini_truck','truck','tempo','bike','other')),
  capacity_kg       NUMERIC(8,2),
  capacity_crates   INTEGER,
  owner_name        VARCHAR(200),
  is_owned          BOOLEAN DEFAULT TRUE,  -- owned vs hired
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vehicles_owner ON vehicles FOR ALL USING (integrator_id = auth.uid());

-- Shed Readiness (marks a shed ready to receive chicks)
CREATE TABLE IF NOT EXISTS shed_readiness (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id),
  shed_id           UUID REFERENCES sheds(id),
  readiness_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_chick_date DATE,
  litter_laid       BOOLEAN DEFAULT FALSE,
  brooder_tested    BOOLEAN DEFAULT FALSE,
  feeders_placed    BOOLEAN DEFAULT FALSE,
  drinkers_placed   BOOLEAN DEFAULT FALSE,
  disinfection_done BOOLEAN DEFAULT FALSE,
  supervisor_id     UUID REFERENCES employees(id),
  remarks           TEXT,
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','chicks_placed')),
  approved_by       UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shed_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY sr_owner ON shed_readiness FOR ALL USING (integrator_id = auth.uid());

-- Chick Allocation (records chick placement to a farmer/farm)
CREATE TABLE IF NOT EXISTS chick_allocations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alloc_number      VARCHAR(30) NOT NULL,   -- Auto: CA/2526/001
  alloc_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  farm_id           UUID NOT NULL REFERENCES farms(id),
  farmer_id         UUID NOT NULL REFERENCES farmers(id),
  batch_id          UUID REFERENCES batches(id),   -- links to the batch created
  shed_readiness_id UUID REFERENCES shed_readiness(id),
  supplier_id       UUID REFERENCES suppliers(id),
  breed             VARCHAR(50),
  chicks_allotted   INTEGER NOT NULL,
  chicks_received   INTEGER,             -- may differ (dead-in-transit shorts)
  chick_rate        NUMERIC(8,2) NOT NULL,  -- ₹/chick (from GC Rate Setup)
  total_chick_cost  NUMERIC(12,2) GENERATED ALWAYS AS (chick_rate * COALESCE(chicks_received, chicks_allotted)) STORED,
  transport_cost    NUMERIC(10,2) DEFAULT 0,
  vehicle_id        UUID REFERENCES vehicles(id),
  driver_id         UUID REFERENCES employees(id),
  supervisor_id     UUID REFERENCES employees(id),
  invoice_number    VARCHAR(50),
  shorts_chicks     INTEGER GENERATED ALWAYS AS (chicks_allotted - COALESCE(chicks_received, chicks_allotted)) STORED,
  financial_year_id UUID REFERENCES financial_years(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE chick_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ca_owner ON chick_allocations FOR ALL USING (integrator_id = auth.uid());

-- Feed & Medicine Allocation (records what was dispatched to which farm)
CREATE TABLE IF NOT EXISTS feed_medicine_allocations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alloc_number      VARCHAR(30) NOT NULL,
  alloc_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  alloc_type        VARCHAR(20) DEFAULT 'feed'
                    CHECK (alloc_type IN ('feed','medicine','vaccine','other')),
  farm_id           UUID NOT NULL REFERENCES farms(id),
  farmer_id         UUID NOT NULL REFERENCES farmers(id),
  batch_id          UUID REFERENCES batches(id),
  from_branch_id    UUID REFERENCES branches(id),
  vehicle_id        UUID REFERENCES vehicles(id),
  driver_id         UUID REFERENCES employees(id),
  supervisor_id     UUID REFERENCES employees(id),
  total_quantity    NUMERIC(12,2),
  total_value       NUMERIC(14,2),
  financial_year_id UUID REFERENCES financial_years(id),
  remarks           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feed_medicine_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY fma_owner ON feed_medicine_allocations FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS feed_medicine_alloc_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id     UUID NOT NULL REFERENCES feed_medicine_allocations(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  quantity          NUMERIC(12,2) NOT NULL,
  unit_rate         NUMERIC(10,2),
  line_value        NUMERIC(14,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_rate, 0)) STORED,
  batch_no          VARCHAR(50),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Supervisor Visit Log (tracks field visits)
CREATE TABLE IF NOT EXISTS supervisor_visits (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supervisor_id     UUID NOT NULL REFERENCES employees(id),
  farm_id           UUID NOT NULL REFERENCES farms(id),
  batch_id          UUID REFERENCES batches(id),
  visit_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time        TIME,
  purpose           VARCHAR(50) DEFAULT 'routine'
                    CHECK (purpose IN ('routine','body_weight','vaccination','treatment','shed_ready','sales','other')),
  -- Body weight entry (if purpose=body_weight)
  sample_birds_weighed INTEGER,
  total_sample_weight_kg NUMERIC(8,2),
  avg_weight_g      NUMERIC(8,2) GENERATED ALWAYS AS
                      (CASE WHEN sample_birds_weighed > 0
                       THEN (total_sample_weight_kg / sample_birds_weighed * 1000)
                       ELSE NULL END) STORED,
  -- Visit observations
  flock_condition   VARCHAR(20) CHECK (flock_condition IN ('excellent','good','fair','poor','critical')),
  health_observation TEXT,
  mortality_today   INTEGER,
  feed_present_days NUMERIC(4,1),  -- estimated days of feed remaining
  water_ok          BOOLEAN,
  ventilation_ok    BOOLEAN,
  action_taken      TEXT,
  -- Travel
  km_travelled      NUMERIC(6,1),
  travel_allowance  NUMERIC(8,2),
  vehicle_id        UUID REFERENCES vehicles(id),
  -- GPS location
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  photos_count      INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE supervisor_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY sv_owner ON supervisor_visits FOR ALL USING (integrator_id = auth.uid());
CREATE INDEX idx_sv_supervisor_date ON supervisor_visits(supervisor_id, visit_date DESC);
CREATE INDEX idx_sv_farm_date ON supervisor_visits(farm_id, visit_date DESC);

-- Incentive Calculation (per batch, per supervisor)
CREATE TABLE IF NOT EXISTS supervisor_incentives (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supervisor_id     UUID NOT NULL REFERENCES employees(id),
  batch_id          UUID NOT NULL REFERENCES batches(id),
  farm_id           UUID NOT NULL REFERENCES farms(id),
  calculation_date  DATE NOT NULL,
  actual_gc         NUMERIC(8,2),    -- achieved GC for this batch
  target_gc         NUMERIC(8,2),    -- from GC rate setup
  gc_saving         NUMERIC(8,2),    -- target_gc - actual_gc (positive = saving)
  birds_sold        INTEGER,
  total_weight_kg   NUMERIC(10,2),
  incentive_rate    NUMERIC(8,2),    -- ₹/kg incentive for saving
  incentive_amount  NUMERIC(10,2),   -- gc_saving × total_weight_kg × rate (if positive)
  penalty_rate      NUMERIC(8,2),    -- ₹/kg penalty for exceeding target
  penalty_amount    NUMERIC(10,2),
  net_incentive     NUMERIC(10,2),   -- incentive_amount - penalty_amount
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','paid')),
  approved_by       UUID REFERENCES auth.users(id),
  paid_date         DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE supervisor_incentives ENABLE ROW LEVEL SECURITY;
CREATE POLICY inc_owner ON supervisor_incentives FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- ACCOUNTING TABLES
-- ════════════════════════════════════════════════════════════

-- Account Groups (for Chart of Accounts)
CREATE TABLE IF NOT EXISTS account_groups (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_code        VARCHAR(20) NOT NULL,
  group_name        VARCHAR(100) NOT NULL,
  parent_group_id   UUID REFERENCES account_groups(id),
  group_type        VARCHAR(20) NOT NULL
                    CHECK (group_type IN ('asset','liability','income','expense','equity')),
  affects_gross_profit BOOLEAN DEFAULT FALSE,
  is_system         BOOLEAN DEFAULT FALSE,  -- system groups cannot be deleted
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY ag_owner ON account_groups FOR ALL USING (integrator_id = auth.uid());

-- Ledger Accounts
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_code      VARCHAR(20),
  account_name      VARCHAR(200) NOT NULL,
  account_name_hi   VARCHAR(200),
  account_group_id  UUID NOT NULL REFERENCES account_groups(id),
  opening_balance   NUMERIC(14,2) DEFAULT 0,
  opening_balance_type VARCHAR(2) DEFAULT 'Dr' CHECK (opening_balance_type IN ('Dr','Cr')),
  -- Links to master entities (optional — for auto-posting)
  linked_supplier_id UUID REFERENCES suppliers(id),
  linked_trader_id  UUID REFERENCES traders(id),
  linked_employee_id UUID REFERENCES employees(id),
  linked_farmer_id  UUID REFERENCES farmers(id),
  gst_number        VARCHAR(20),
  phone             VARCHAR(15),
  address           TEXT,
  financial_year_id UUID REFERENCES financial_years(id),
  is_system         BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY la_owner ON ledger_accounts FOR ALL USING (integrator_id = auth.uid());
CREATE INDEX idx_ledger_group ON ledger_accounts(account_group_id);

-- Vouchers (accounting transactions)
CREATE TABLE IF NOT EXISTS vouchers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_number    VARCHAR(30) NOT NULL,   -- Auto: PV/2526/001, RV/2526/001 etc.
  voucher_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  voucher_type      VARCHAR(20) NOT NULL
                    CHECK (voucher_type IN ('payment','receipt','contra','journal','employee')),
  narration         TEXT,
  total_amount      NUMERIC(14,2) NOT NULL,
  cheque_number     VARCHAR(30),
  cheque_date       DATE,
  bank_account_id   UUID REFERENCES ledger_accounts(id),
  financial_year_id UUID REFERENCES financial_years(id),
  is_posted         BOOLEAN DEFAULT TRUE,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY vouchers_owner ON vouchers FOR ALL USING (integrator_id = auth.uid());
CREATE INDEX idx_vouchers_date ON vouchers(voucher_date DESC);
CREATE INDEX idx_vouchers_type ON vouchers(voucher_type);

-- Voucher Line Items (double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS voucher_entries (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id        UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  entry_type        VARCHAR(2) NOT NULL CHECK (entry_type IN ('Dr','Cr')),
  amount            NUMERIC(14,2) NOT NULL,
  narration         TEXT,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ve_ledger ON voucher_entries(ledger_account_id);
CREATE INDEX idx_ve_voucher ON voucher_entries(voucher_id);

-- Bank Reconciliation
CREATE TABLE IF NOT EXISTS bank_reconciliation (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id   UUID NOT NULL REFERENCES ledger_accounts(id),
  statement_date    DATE NOT NULL,
  statement_balance NUMERIC(14,2) NOT NULL,
  book_balance      NUMERIC(14,2) NOT NULL,
  difference        NUMERIC(14,2) GENERATED ALWAYS AS (statement_balance - book_balance) STORED,
  is_reconciled     BOOLEAN DEFAULT FALSE,
  reconciled_date   DATE,
  notes             TEXT,
  financial_year_id UUID REFERENCES financial_years(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bank_reconciliation ENABLE ROW LEVEL SECURITY;
CREATE POLICY br_owner ON bank_reconciliation FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- PAYROLL EXTENSION (adds to existing employees table)
-- ════════════════════════════════════════════════════════════

-- Leave Setup (per employee group)
CREATE TABLE IF NOT EXISTS leave_policies (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_name       VARCHAR(100) NOT NULL,
  casual_leave_days INTEGER DEFAULT 12,
  sick_leave_days   INTEGER DEFAULT 12,
  earned_leave_days INTEGER DEFAULT 15,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY lp_owner ON leave_policies FOR ALL USING (integrator_id = auth.uid());

-- Leave Entries
CREATE TABLE IF NOT EXISTS leave_entries (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id),
  leave_type        VARCHAR(20) DEFAULT 'casual'
                    CHECK (leave_type IN ('casual','sick','earned','unpaid','holiday')),
  from_date         DATE NOT NULL,
  to_date           DATE NOT NULL,
  days_count        NUMERIC(4,1) NOT NULL,
  reason            TEXT,
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by       UUID REFERENCES auth.users(id),
  approved_at       TIMESTAMPTZ,
  financial_year_id UUID REFERENCES financial_years(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leave_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY le_owner ON leave_entries FOR ALL USING (integrator_id = auth.uid());

-- Payroll Setup (salary components per employee)
CREATE TABLE IF NOT EXISTS payroll_components (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_name    VARCHAR(100) NOT NULL,
  component_type    VARCHAR(20) DEFAULT 'earning'
                    CHECK (component_type IN ('earning','deduction','statutory')),
  is_taxable        BOOLEAN DEFAULT TRUE,
  is_pf_applicable  BOOLEAN DEFAULT FALSE,
  display_order     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payroll_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY pc2_owner ON payroll_components FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- DASHBOARD COMPUTED VIEW — FAST READ
-- ════════════════════════════════════════════════════════════

-- Materialized view for dashboard overview KPIs
CREATE MATERIALIZED VIEW mv_dashboard_overview AS
SELECT
  f.integrator_id,
  -- Active farms (farms with active batch)
  COUNT(DISTINCT CASE WHEN b.status = 'active' THEN f.id END) AS active_farms,
  -- Total farmers
  COUNT(DISTINCT fr.id) AS total_farmers,
  -- Live birds by age group
  SUM(CASE WHEN (CURRENT_DATE - b.placement_date) <= 7
    THEN (b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)) END) AS birds_0_7d,
  SUM(CASE WHEN (CURRENT_DATE - b.placement_date) BETWEEN 8 AND 14
    THEN (b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)) END) AS birds_8_14d,
  SUM(CASE WHEN (CURRENT_DATE - b.placement_date) BETWEEN 15 AND 21
    THEN (b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)) END) AS birds_15_21d,
  SUM(CASE WHEN (CURRENT_DATE - b.placement_date) BETWEEN 22 AND 28
    THEN (b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)) END) AS birds_22_28d,
  SUM(CASE WHEN (CURRENT_DATE - b.placement_date) BETWEEN 29 AND 35
    THEN (b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)) END) AS birds_29_35d,
  SUM(CASE WHEN (CURRENT_DATE - b.placement_date) > 35
    THEN (b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)) END) AS birds_35plus,
  -- Today's mortality (from daily_logs for today)
  COALESCE(SUM(dl_today.deaths_today), 0) AS today_mortality,
  -- Chicks remaining (total live birds)
  COALESCE(SUM(b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)), 0) AS total_live_birds
FROM farms f
LEFT JOIN batches b ON b.farm_id = f.id AND b.status = 'active'
LEFT JOIN farmers fr ON fr.integrator_id = f.integrator_id AND fr.is_active = TRUE
LEFT JOIN LATERAL (
  SELECT SUM(deaths_today) AS cumulative_deaths
  FROM daily_logs dl WHERE dl.batch_id = b.id
) cumul ON TRUE
LEFT JOIN daily_logs dl_today ON dl_today.batch_id = b.id
  AND dl_today.log_date = CURRENT_DATE
GROUP BY f.integrator_id
WITH DATA;

CREATE UNIQUE INDEX ON mv_dashboard_overview(integrator_id);
-- Refresh every 30 minutes via pg_cron
SELECT cron.schedule('refresh-dashboard-overview', '*/30 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_overview');

-- ════════════════════════════════════════════════════════════
-- GST REPORTING VIEWS
-- ════════════════════════════════════════════════════════════

-- GSTR1 data view (outward supplies)
CREATE VIEW v_gstr1_data AS
SELECT
  pi2.integrator_id,
  p.purchase_date AS invoice_date,
  p.invoice_number,
  s.gst_number AS supplier_gstin,
  s.supplier_name,
  pi_item.quantity,
  pi_item.line_total AS taxable_value,
  ts.cgst_rate,
  ts.sgst_rate,
  ts.igst_rate,
  pi_item.cgst_amount,
  pi_item.sgst_amount,
  pi_item.igst_amount,
  (pi_item.cgst_amount + pi_item.sgst_amount + pi_item.igst_amount) AS total_tax,
  pr.product_name,
  pr.hsn_code
FROM purchases p
JOIN suppliers s ON p.supplier_id = s.id
JOIN purchase_items pi_item ON pi_item.purchase_id = p.id
JOIN products pr ON pi_item.product_id = pr.id
LEFT JOIN tax_setup ts ON pi_item.tax_id = ts.id
JOIN purchases pi2 ON pi2.id = p.id;  -- for integrator_id access
```

---

# ═══════════════════════════════════════════════════════════════
# SECTION 2: DASHBOARD OVERVIEW — ENHANCED KPI PAGE
# ═══════════════════════════════════════════════════════════════

**Update file:** `apps/web/app/dashboard/page.tsx`

The existing overview page must show a new **"Status As On [date + time]"** header and the following KPI grid:

```
STATUS AS ON: 09-06-2026 13:22    [🔄 Refresh]

Row 1 — Quick Numbers (6 cards)
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 🏠 Active Farms │ │ 📒 Closed (Mo.) │ │ 👨‍🌾 Total Farmers│
│      47         │ │       12        │ │       54        │
│ ↑3 this month   │ │ ₹14.2L revenue  │ │  6 supervisors  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 💀 Today Mort.  │ │ 🐣 Chicks Left  │ │ 🐔 Bird Sale    │
│     2,340       │ │   8,42,000      │ │ 34,500 birds    │
│ 2.3% rate       │ │ live in 47 farms│ │ this month      │
└─────────────────┘ └─────────────────┘ └─────────────────┘

Row 2 — Live Stock by Age (Recharts BarChart — REQUIRED)
Title: "Live Stock Distribution by Age"
X-axis: ≤7 days | 8-14 days | 15-21 days | 22-28 days | 29-35 days | 35+ days
Y-axis: Number of birds (in lakhs, formatted as "1.2L")
Bar colours: brand50 → brand700 gradient (youngest lightest, oldest darkest)
Each bar shows: bird count on top, avg weight below
Tooltip: farms count, birds count, avg weight, avg FCR for that age group

Row 3 — Supervisor Status (2 cards)
┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐
│ 👔 Supervisor Activity               │ │ ⚠️ Not Visited Farms                │
│ 6 total supervisors                  │ │ Last 1 day:   3 farms ⬆️            │
│ ●●●●●● Active today: 4              │ │ Last 3 days:  7 farms 🟡             │
│ Visits today: 12                     │ │ Last 7 days: 12 farms 🔴             │
│ [View All →]                         │ │ [View Farms →]                       │
└──────────────────────────────────────┘ └──────────────────────────────────────┘

Row 4 — Financial Snapshot
┌─────────────────┐ ┌─────────────────┐
│ 📈 Avg Sale Rate │ │ 💰 Closed P&L   │
│  ₹168/kg        │ │ This Month:     │
│ Today's market  │ │ Revenue: ₹28.4L │
│ ₹171/kg (P50)   │ │ Cost: ₹21.2L    │
│                 │ │ Profit: ₹7.2L   │
└─────────────────┘ └─────────────────┘
```

**API for Dashboard Overview:**
Create `apps/web/app/api/dashboard/overview/route.ts`:
- GET: reads `mv_dashboard_overview` for this integrator
- Also computes:
  - `not_visited_1d`: farms WHERE no supervisor_visits in last 1 day
  - `not_visited_3d`: farms WHERE no supervisor_visits in last 3 days
  - `not_visited_7d`: farms WHERE no supervisor_visits in last 7 days
  - `avg_sale_rate`: AVG of batch_sales.rate_per_kg WHERE sold_date in last 30 days
  - `month_revenue`, `month_cost`, `month_profit` from closed batches this month
- SWR refresh interval: 5 minutes
- "Status As On" timestamp: always shows IST time of last mv refresh

---

# ═══════════════════════════════════════════════════════════════
# SECTION 3: MASTER PAGES
# ═══════════════════════════════════════════════════════════════

Create route group: `apps/web/app/dashboard/masters/`

### 3.1 Company Setup — `/dashboard/masters/company`
**Create:** `apps/web/app/dashboard/masters/company/page.tsx`

Single company record per integrator. Form fields:
- Company Name (required), GST Number, PAN, Address, Phone, Email
- Financial Year Start month (dropdown: April=4 default)
- Logo upload (to Supabase Storage bucket `company-assets`)
- Currency (INR default)
- [Save Company Details] button

### 3.2 Supplier Master — `/dashboard/masters/suppliers`
List + Add/Edit panel. Fields: supplier_code (auto), name, type (chick/feed/medicine/other), contact, phone, GST number, address, opening balance (payable/receivable), credit days.

### 3.3 Farmer Master — `/dashboard/masters/farmers`
**This is critical** — integrators manage 50–200 contract farmers. Features:
- List view: farmer code | name | phone | district | linked farm | supervisor | line | active/inactive
- Filter by: supervisor, line/route, district, active status
- Bulk import: CSV upload (template downloadable)
- Add/Edit farmer panel: all fields including bank details, Aadhar (optional)
- [Link Farm] button — links a farmer record to a farm record
- Export: PDF list, CSV

### 3.4 Trader Master — `/dashboard/masters/traders`
Similar to Supplier. Fields: trader_code, name, company, phone, GST, address, opening balance (receivable), credit days, rating (1–5 stars).

### 3.5 User Management — `/dashboard/masters/users`
- List all sub-users under this integrator account
- [Invite User] — sends OTP invite via phone
- Per user: edit privileges (each module can_view / can_edit toggles)
- `allowed_farm_ids`: restrict user to specific farms (empty = all farms)
- [Suspend User] with confirmation

---

# ═══════════════════════════════════════════════════════════════
# SECTION 4: INVENTORY MODULE
# ═══════════════════════════════════════════════════════════════

Create route group: `apps/web/app/dashboard/inventory/`

### 4.1 Sidebar structure (update Sidebar.tsx):
```
INVENTORY section (new, after MASTERS):
  📦 Product Category      /dashboard/inventory/categories
  📋 Product Master        /dashboard/inventory/products
  🏭 Branch Stock Opening  /dashboard/inventory/branch-opening
  🌾 Farmer Stock Opening  /dashboard/inventory/farmer-opening
  📊 Price List            /dashboard/inventory/price-list
  ─────────────────────────────────
  🔄 Stock Transfer        /dashboard/inventory/transfers
  ⚙️  Stock Adjustment     /dashboard/inventory/adjustments
  ─────────────────────────────────
  📥 PO Entry              /dashboard/inventory/po
  ✅ Received Against PO   /dashboard/inventory/po-receipt
  🐣 Chick Purchase        /dashboard/inventory/chick-purchase
  🧾 Direct Purchase       /dashboard/inventory/direct-purchase
  🚛 Freight Purchase      /dashboard/inventory/freight
  ↩️  Purchase Return       /dashboard/inventory/purchase-return
  ─────────────────────────────────
  🐔 Sale Entry (Chicks)   /dashboard/inventory/sale-chicks
  🛒 Sale Entry (Others)   /dashboard/inventory/sale-others
  ─────────────────────────────────
  📊 Stock Reports         /dashboard/inventory/reports
```

### 4.2 Product Category Page
Standard CRUD table. Columns: category_code, category_name, category_type, product_count, is_active. Inline add row form at bottom.

### 4.3 Product Master Page
Table with filters (by category, type, active status). Per row: code | name | category | unit | purchase price | sale price | margin% | reorder level | active.
[+ Add Product] opens right panel. All fields. [Duplicate] button.

### 4.4 PO Entry Page (`/dashboard/inventory/po`)
Full purchase order form:
- PO Number (auto-generated), PO Date, Supplier (searchable dropdown), Branch, Expected Delivery
- Line items table: Product | Qty | Unit Rate | Tax | Amount — [+ Add Row] button
- Totals: Subtotal | Tax | Grand Total
- [Save as Draft] | [Submit PO] buttons
- Submitted PO shows status badge and [Receive Against PO] button

### 4.5 Stock Transfer Page (Feed Transfer Farm-to-Farm + Farm-to-Branch)
Two transfer type options shown as tabs:
- **F2F (Farm to Farm):** From Farm + Batch → To Farm + Batch — product items
- **F2B (Farm to Branch):** From Farm → To Branch — product items
Transfer number auto-generated. Vehicle + Driver selection from masters. [Save Transfer] + [Print Challan] button.

### 4.6 Stock Reports — Key reports page (`/dashboard/inventory/reports`)
Tab-based reports:
- **Product List:** all products with current stock across all locations
- **Branch Stock Report:** stock at each branch (filter by branch, product, category)
- **Farmer Stock Report:** stock at each farmer's end (filter by farmer, supervisor)
- **Consolidated Stock Report:** merged view (branch + farmer) with reorder alerts
- **Purchase Register:** all purchases (filter by date range, supplier, product, type)
- **Category-wise Purchase:** purchase amounts grouped by product category
- **Sale Register:** all sales (chicks + others)
- **Item-wise Stock Ledger:** transaction history per product per location
- **Stock Transfer Report:** all transfers with vehicle/driver details
- **Min Order Stock:** products below reorder level — highlighted red

All reports: [Export CSV] + [Print] buttons. Date range picker (default: current month).

---

# ═══════════════════════════════════════════════════════════════
# SECTION 5: BROILER INTEGRATION WORKFLOW
# ═══════════════════════════════════════════════════════════════

Create route group: `apps/web/app/dashboard/broiler/`

### 5.1 Sidebar structure (update Sidebar.tsx):
```
BROILER section (new, after INVENTORY):
  ── TRADING ──
  🚗 Vehicle Master        /dashboard/broiler/vehicles
  🧑 Driver Master         /dashboard/broiler/drivers    (subset of employees)
  💱 Broiler Purchase      /dashboard/broiler/trading/purchase
  💱 Broiler Sale          /dashboard/broiler/trading/sale
  📈 Daily P&L (Trading)   /dashboard/broiler/trading/daily-pl
  ── INTEGRATION ──
  ✅ Shed Ready            /dashboard/broiler/integration/shed-ready
  🐣 Chick Allocation      /dashboard/broiler/integration/chick-alloc
  🌾 Feed & Med Allocation /dashboard/broiler/integration/feed-alloc
  📋 View Allocations      /dashboard/broiler/integration/alloc-view
  🔄 Feed Transfer (F2F)   /dashboard/broiler/integration/feed-f2f
  🔄 Feed Transfer (F2B)   /dashboard/broiler/integration/feed-f2b
  🏪 New Sale Entry        /dashboard/broiler/integration/sale-new
  👁️  Sale View/Edit        /dashboard/broiler/integration/sales
  🐥 Chick Shorts/Excess   /dashboard/broiler/integration/chick-shorts
  ── SUPERVISOR ──
  📝 Report Entry          /dashboard/broiler/supervisor/report-entry
  👁️  Report Entry View     /dashboard/broiler/supervisor/reports
  ⚖️  Body Weight Entry     /dashboard/broiler/supervisor/weight-entry
  🗺️  Travel Entry          /dashboard/broiler/supervisor/travel
  ── INCENTIVE ──
  🏆 Incentive Calc.       /dashboard/broiler/incentive
  ── REPORTS ──
  📊 Daily Report          /dashboard/broiler/reports/daily
  💰 Payroll Report        /dashboard/broiler/reports/payroll
  🏚️  Shed Report           /dashboard/broiler/reports/shed
  📦 Batch Report          /dashboard/broiler/reports/batch
  💉 Vaccine Schedule      /dashboard/broiler/reports/vaccine
  🏪 Farm Balance Stock    /dashboard/broiler/reports/farm-stock
  🗺️  Supervisor Travel     /dashboard/broiler/reports/travel
  🔄 Feed Transfer         /dashboard/broiler/reports/feed-transfer
  🐔 Farm Live Birds       /dashboard/broiler/reports/live-birds
  📅 Farm Weekly           /dashboard/broiler/reports/weekly
  🏆 Farm Performance      /dashboard/broiler/reports/performance
  👔 Supervisor Perf.      /dashboard/broiler/reports/supervisor-perf
  📈 Monthly P&L           /dashboard/broiler/reports/monthly-pl
  💊 Feed/Med Register     /dashboard/broiler/reports/feed-med-register
  💀 Mortality Report      /dashboard/broiler/reports/mortality
```

### 5.2 Shed Ready Page (`/dashboard/broiler/integration/shed-ready`)
Form: Select Farm → Select Shed → checklist (litter, brooder, feeders, drinkers, disinfection) → expected chick date → supervisor → [Submit for Approval]. List of all pending/approved shed readiness records with status badges.

### 5.3 Chick Allocation Page (`/dashboard/broiler/integration/chick-alloc`)
Step 1: Select approved shed readiness record (auto-fills farm, shed, supervisor).
Step 2: Enter chick details — supplier, breed, chick rate (from GC Rate Setup), chicks allotted, vehicle, driver.
Step 3: Confirm → creates chick_allocation record + triggers batch creation in farms module.
On save: stock decremented from chick inventory at branch.

### 5.4 Supervisor Report Entry (`/dashboard/broiler/supervisor/report-entry`)
**Mobile-optimised form** (supervisors use phones in the field):
- Select Farm → auto-loads batch info
- Visit date/time (default: now)
- Purpose: Routine | Body Weight | Vaccination | Treatment | Other
- Flock condition: 5-point scale
- Deaths today, water/ventilation ok toggles
- Feed remaining (days estimate)
- Observations text area
- GPS: [Use My Location] button
- Photo attachment (up to 3 photos → Supabase Storage)
- [Submit Report] — creates supervisor_visits record

Body Weight sub-form (shown when purpose = Body Weight):
- Number of birds weighed, total weight kg → auto-computes avg weight in grams
- vs target weight (from breed standards) → shows delta + colour
- [Save Weight Entry] → updates this as official weigh-in for the batch

### 5.5 Incentive Calculation Page (`/dashboard/broiler/incentive`)
Select batch (completed) → shows:
- Actual GC vs Target GC (from GC Rate Setup)
- GC Saving per kg = target_gc - actual_gc
- Incentive amount = GC saving × total_weight_kg × incentive_rate
- If negative (over target) → penalty applied
- Table: supervisor | batch | farm | target_gc | actual_gc | saving | incentive_amt | status
- [Approve] button (for integrator) → changes status to 'approved'
- [Pay] button (for accountant) → marks paid + creates payment voucher in accounts

### 5.6 Key Reports

**Daily Report (`/dashboard/broiler/reports/daily`):**
Table: Date | Farm | Supervisor | Birds Alive | Deaths | Feed Given | Avg Wt | FCR | Days in | Status
Filters: date (default: today), supervisor, line/route, district
Export: PDF (formatted report) + CSV

**Farm Live Birds Report (`/dashboard/broiler/reports/live-birds`):**
For each active farm: Farm | Farmer | Batch# | Placement Date | Days In | Birds Placed | Live Birds | Mortality% | Avg Wt | Target Wt | FCR | GC | Harvest Readiness
Sorted by "Days In" descending. Harvest-ready farms (>35 days) highlighted in amber.

**Monthly P&L Report (`/dashboard/broiler/reports/monthly-pl`):**
Integration business P&L:
- Revenue: sum of all batch_sales for the month
- Cost: sum of all allocations (chick + feed + medicine + other) for batches sold in month
- Gross Margin per farm, per supervisor line, per batch
- Variance: actual vs budget

**Mortality Report (`/dashboard/broiler/reports/mortality`):**
Farm | Batch | Placement Date | Days In | Birds Placed | Total Deaths | Mortality% | Today Deaths | Highest Day Deaths | Cause breakdown

---

# ═══════════════════════════════════════════════════════════════
# SECTION 6: ACCOUNTING MODULE
# ═══════════════════════════════════════════════════════════════

Create route group: `apps/web/app/dashboard/accounts/`

### 6.1 Sidebar structure:
```
ACCOUNTS section:
  ── MASTER ──
  📂 Account Groups        /dashboard/accounts/groups
  📒 Ledger Master         /dashboard/accounts/ledgers
  ── TRANSACTIONS ──
  💳 Payment Voucher       /dashboard/accounts/vouchers/payment
  💰 Receipt Voucher       /dashboard/accounts/vouchers/receipt
  👔 Employee Voucher      /dashboard/accounts/vouchers/employee
  🔄 Contra Voucher        /dashboard/accounts/vouchers/contra
  📔 Journal Voucher       /dashboard/accounts/vouchers/journal
  🏦 Bank Reconciliation   /dashboard/accounts/bank-recon
  ── REPORTS ──
  🧾 GSTR1 Report          /dashboard/accounts/gst/gstr1
  📊 GSTR3B Report         /dashboard/accounts/gst/gstr3b
  📅 Day Book              /dashboard/accounts/reports/daybook
  📒 Ledger Statement      /dashboard/accounts/reports/ledger
  👥 Group Statement       /dashboard/accounts/reports/group
  👔 Employee Ledger       /dashboard/accounts/reports/employee-ledger
  ⚖️  Trial Balance         /dashboard/accounts/reports/trial-balance
  📊 Balance Sheet         /dashboard/accounts/reports/balance-sheet
  💹 Profit & Loss         /dashboard/accounts/reports/pl
```

### 6.2 Voucher Entry (shared component for all voucher types)
**Create:** `apps/web/components/accounts/VoucherForm.tsx`

```typescript
// Voucher form — supports Payment, Receipt, Contra, Journal, Employee types
// Each type pre-configures the Dr/Cr sides:
//   Payment: Cr = bank/cash, Dr = expense/party
//   Receipt: Dr = bank/cash, Cr = income/party
//   Contra:  Cash ↔ Bank transfers
//   Journal: Free-form Dr/Cr lines
//   Employee: Dr = salary expense, Cr = bank/cash

interface VoucherFormProps {
  voucherType: 'payment' | 'receipt' | 'contra' | 'journal' | 'employee'
}
```

Form layout:
- Voucher No (auto), Date, Narration
- Line items table: Ledger Account (searchable) | Dr/Cr | Amount
- Running balance showing if voucher is balanced (Dr total = Cr total)
- [+ Add Line] button
- Cheque No (optional, for bank transactions)
- [Save Voucher] — validates balanced before saving

### 6.3 Day Book (`/dashboard/accounts/reports/daybook`)
Date filter (default: today). Shows all vouchers for the day in chronological order:
Voucher No | Type | Narration | Debit | Credit | Running Balance

### 6.4 Trial Balance (`/dashboard/accounts/reports/trial-balance`)
As-on date selector. Table: Account | Opening Dr | Opening Cr | Transactions Dr | Transactions Cr | Closing Dr | Closing Cr
Group hierarchy: indented by group structure. [Print] button generates formal trial balance PDF.

### 6.5 GSTR1 Report (`/dashboard/accounts/gst/gstr1`)
Month + Year selector.
Table: Invoice Date | Invoice No | Party GSTIN | Taxable Value | CGST | SGST | IGST | Total GST
HSN Summary section below.
[Download JSON] button (format ready for GSTN portal upload).
[Export Excel] button.

### 6.6 GSTR3B Report (`/dashboard/accounts/gst/gstr3b`)
Month summary: Outward Supplies | ITC Available | Net Tax Payable.
[Download JSON] for GSTN portal.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 7: PAYROLL EXTENSIONS
# ═══════════════════════════════════════════════════════════════

**Update existing:** `apps/web/app/dashboard/employees/page.tsx`

Add tabs to existing employee page:
- **Employees tab** (existing) — no changes
- **Leave tab** (NEW):
  - Leave balance summary per employee
  - [+ New Leave Entry] form
  - Leave register table: Employee | Type | From | To | Days | Status | Approved By
  - [Approve] / [Reject] buttons
- **Payroll Setup tab** (NEW):
  - Define salary components (earnings + deductions)
  - Link components to employee groups
- **Salary Creation tab** (existing, enhanced):
  - Month/Year selector
  - [Generate Payroll] button — auto-creates salary_records for all active employees
  - Table: Employee | Basic | Allowances | Deductions | Net | Status | [Edit] [Pay]
  - Leave deduction auto-applied from approved leave_entries
- **Reports tab** (NEW):
  - Salary Register (month-wise)
  - Employee Ledger (per employee, all payments)
  - Expense Register (all expense claims)
  - Department-wise payroll summary

---

# ═══════════════════════════════════════════════════════════════
# SECTION 8: SETUP / MORE MODULE
# ═══════════════════════════════════════════════════════════════

Create route: `apps/web/app/dashboard/setup/page.tsx`

Tab-based settings page with these tabs:
1. **Company** — links to /dashboard/masters/company
2. **Lines** — manage Lines/Routes (CRUD table: line_code, line_name, supervisor, district, farm count)
3. **Profit Centers** — CRUD table
4. **Tax Setup** — GST rates + HSN codes
5. **Packing Types** — crate types (20kg, 25kg, 30kg) used in bird sales
6. **Price List** — product price lists per farmer/line/season (overrides base product price)
7. **Financial Year** — list years, [Set as Current] button, [Close Year] (with confirmation)
8. **Employee Groups** — farm_manager, field_supervisor, office_staff, driver, other
9. **Broker** — broker/agent master (name, phone, commission %)
10. **GC Setup** — vaccine schedules (which vaccine on which day for which breed)
11. **GC Rate Setup** — rate cards per breed/season (target GC, chick rate, feed rate, incentive formula)

---

# ═══════════════════════════════════════════════════════════════
# SECTION 9: API ROUTES REQUIRED
# ═══════════════════════════════════════════════════════════════

Create the following API route files:

```
apps/web/app/api/
  dashboard/overview/route.ts          ← dashboard KPIs (Section 2)
  masters/
    companies/route.ts
    suppliers/route.ts
    suppliers/[id]/route.ts
    farmers/route.ts
    farmers/[id]/route.ts
    traders/route.ts
    traders/[id]/route.ts
    users/route.ts
    users/[id]/privileges/route.ts
  setup/
    lines/route.ts
    profit-centers/route.ts
    financial-years/route.ts
    tax-setup/route.ts
    gc-rate-setup/route.ts
  inventory/
    categories/route.ts
    products/route.ts
    products/[id]/route.ts
    po/route.ts
    po/[id]/route.ts
    po/[id]/receive/route.ts
    purchases/route.ts
    purchases/[id]/route.ts
    transfers/route.ts
    transfers/[id]/route.ts
    adjustments/route.ts
    stock/branch/[branchId]/route.ts
    stock/farmer/[farmerId]/route.ts
    stock/consolidated/route.ts
  broiler/
    shed-ready/route.ts
    shed-ready/[id]/approve/route.ts
    chick-allocations/route.ts
    feed-allocations/route.ts
    supervisor-visits/route.ts
    supervisor-visits/[id]/route.ts
    incentives/route.ts
    incentives/[id]/approve/route.ts
    reports/daily/route.ts
    reports/live-birds/route.ts
    reports/monthly-pl/route.ts
    reports/mortality/route.ts
    reports/batch/route.ts
  accounts/
    account-groups/route.ts
    ledgers/route.ts
    ledgers/[id]/route.ts
    ledgers/[id]/statement/route.ts
    vouchers/route.ts
    vouchers/[id]/route.ts
    reports/trial-balance/route.ts
    reports/balance-sheet/route.ts
    reports/pl/route.ts
    reports/daybook/route.ts
    gst/gstr1/route.ts
    gst/gstr3b/route.ts
  payroll/
    leave-entries/route.ts
    leave-entries/[id]/approve/route.ts
    payroll-components/route.ts
    salary/generate/route.ts
```

**Every API route must follow these rules:**
1. Import `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs`
2. Verify session — 401 if unauthenticated
3. Scope all queries: `WHERE integrator_id = session.user.id`
4. Validate request body with Zod before touching database
5. Return friendly Hindi+English error messages (never raw Postgres errors)
6. Response format: `{ data, error, meta: { total?, page? } }`

---

# ═══════════════════════════════════════════════════════════════
# SECTION 10: TYPES DEFINITION
# ═══════════════════════════════════════════════════════════════

**Create:** `apps/web/lib/types/erp.ts`

```typescript
// Master Types
export interface Company { id: string; companyName: string; gstNumber?: string; /* ... */ }
export interface Branch { id: string; branchCode: string; branchName: string; branchType: string; }
export interface Farmer { id: string; farmerCode: string; fullName: string; phone: string; district?: string; supervisorId?: string; lineId?: string; linkedFarmIds?: string[]; isActive: boolean; }
export interface Supplier { id: string; supplierCode: string; supplierName: string; supplierType: string; gstNumber?: string; openingBalance: number; balanceType: 'payable'|'receivable'; creditDays: number; }
export interface Trader { id: string; traderCode: string; fullName: string; gstNumber?: string; rating: 1|2|3|4|5; openingBalance: number; }
export interface UserPrivileges { userId: string; roleName: string; canViewDashboard: boolean; canEditInventory: boolean; /* all flags */ allowedFarmIds?: string[]; }

// Inventory Types
export interface Product { id: string; productCode: string; productName: string; categoryId: string; unitOfMeasure: string; purchasePrice?: number; salePrice?: number; marginPct?: number; reorderLevel?: number; hsnCode?: string; withdrawalDays?: number; }
export interface PurchaseOrder { id: string; poNumber: string; poDate: string; supplierId: string; status: 'draft'|'open'|'partial'|'received'|'cancelled'; items: PurchaseOrderItem[]; }
export interface Purchase { id: string; purchaseNumber: string; purchaseDate: string; purchaseType: string; supplierId: string; totalAmount: number; paidAmount: number; paymentStatus: string; items: PurchaseItem[]; }
export interface StockTransfer { id: string; transferNumber: string; transferType: string; fromBranchId?: string; toFarmerId?: string; batchId?: string; status: string; items: StockTransferItem[]; }

// Broiler Workflow Types
export interface ShedReadiness { id: string; farmId: string; readinessDate: string; expectedChickDate?: string; litterLaid: boolean; brooderTested: boolean; feedersPlaced: boolean; drinkersPlaced: boolean; disinfectionDone: boolean; status: 'pending'|'approved'|'chicks_placed'; }
export interface ChickAllocation { id: string; allocNumber: string; allocDate: string; farmId: string; farmerId: string; batchId?: string; breed: string; chicksAllotted: number; chicksReceived?: number; chickRate: number; totalChickCost: number; }
export interface SupervisorVisit { id: string; supervisorId: string; farmId: string; visitDate: string; purpose: string; flockCondition?: string; mortalityToday?: number; feedPresentDays?: number; avgWeightG?: number; actionTaken?: string; kmTravelled?: number; }
export interface SupervisorIncentive { id: string; supervisorId: string; batchId: string; farmId: string; actualGc: number; targetGc: number; gcSaving: number; incentiveAmount: number; netIncentive: number; status: 'pending'|'approved'|'paid'; }

// Accounting Types
export interface AccountGroup { id: string; groupCode: string; groupName: string; groupType: 'asset'|'liability'|'income'|'expense'|'equity'; parentGroupId?: string; }
export interface LedgerAccount { id: string; accountCode?: string; accountName: string; accountGroupId: string; openingBalance: number; openingBalanceType: 'Dr'|'Cr'; }
export interface Voucher { id: string; voucherNumber: string; voucherDate: string; voucherType: 'payment'|'receipt'|'contra'|'journal'|'employee'; narration?: string; totalAmount: number; entries: VoucherEntry[]; }
export interface VoucherEntry { id: string; voucherId: string; ledgerAccountId: string; entryType: 'Dr'|'Cr'; amount: number; }

// Dashboard Overview
export interface DashboardOverview {
  statusAsOn: string;           // IST ISO string
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
  liveStockByAge: Array<{ ageLabel: string; birds: number; avgWeight?: number; avgFcr?: number; farmsCount: number; }>;
}
```

---

# ═══════════════════════════════════════════════════════════════
# SECTION 11: SIDEBAR NAVIGATION — COMPLETE UPDATED STRUCTURE
# ═══════════════════════════════════════════════════════════════

**Update:** `apps/web/components/layout/Sidebar.tsx`

```
FLOCKIQ SIDEBAR (complete structure)

[🔍 Search]

OVERVIEW
  🏠 Dashboard          /dashboard

FARMS & FLOCKS
  🏠 My Farms           /dashboard/farms
  📋 Daily Metrics      /dashboard/metrics
  📈 Benchmark          /dashboard/metrics/benchmark
  📄 Reports            /dashboard/reports

MASTERS
  🏢 Company            /dashboard/masters/company
  🤝 Suppliers          /dashboard/masters/suppliers
  👨‍🌾 Farmers            /dashboard/masters/farmers
  🏪 Traders            /dashboard/masters/traders
  👥 Users & Privileges /dashboard/masters/users

INVENTORY
  📦 Products           /dashboard/inventory/products
  🏭 Stock Opening      /dashboard/inventory/branch-opening
  📥 Purchase Orders    /dashboard/inventory/po
  🧾 Purchases          /dashboard/inventory/direct-purchase
  🔄 Transfers          /dashboard/inventory/transfers
  📊 Stock Reports      /dashboard/inventory/reports

BROILER
  ✅ Shed Ready         /dashboard/broiler/integration/shed-ready
  🐣 Chick Allocation   /dashboard/broiler/integration/chick-alloc
  🌾 Feed Allocation    /dashboard/broiler/integration/feed-alloc
  🏪 Bird Sales         /dashboard/broiler/integration/sale-new
  👔 Supervisor Reports /dashboard/broiler/supervisor/report-entry
  🏆 Incentives         /dashboard/broiler/incentive
  📊 Broiler Reports    /dashboard/broiler/reports/daily

ANALYTICS
  💰 GC / Lागत         /dashboard/gc
  👥 Employees          /dashboard/employees
  📈 Price Intelligence /dashboard/price-intelligence
  ⚠️  Alerts             /dashboard/alerts

ACCOUNTS
  📒 Ledgers            /dashboard/accounts/ledgers
  💳 Vouchers           /dashboard/accounts/vouchers/payment
  🏦 Bank Recon         /dashboard/accounts/bank-recon
  🧾 GST Reports        /dashboard/accounts/gst/gstr1
  ⚖️  Trial Balance      /dashboard/accounts/reports/trial-balance
  💹 P & L              /dashboard/accounts/reports/pl

PAYROLL
  👔 Employees          /dashboard/employees
  🏖️  Leave              /dashboard/employees?tab=leave
  💵 Salary             /dashboard/employees?tab=salary

SETTINGS
  ⚙️  Setup              /dashboard/setup
  🔑 Password           /dashboard/settings/password
```

Access gates: render section only if user has permission from `user_privileges` table.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 12: INTEGRATION COMPANY OWNER'S CRITICAL WORKFLOWS
# ═══════════════════════════════════════════════════════════════

These are the 5 most important end-to-end workflows for an integrator.
Ensure all are completable without leaving FlockIQ:

### Workflow 1: New Flock Cycle (Placement)
```
Day -7: Shed Ready form submitted by supervisor
Day -5: Integrator approves shed readiness
Day 0:  Chick Allocation → chicks dispatched from supplier → recorded in ChickAllocation
        → batch auto-created in Farms module
        → chick cost auto-flows to P&L tab
Day 1+: Supervisor logs daily report entries
        → feed/medicine allocations dispatched from godown → stock decremented
```

### Workflow 2: Daily Operations Monitoring
```
6:00 AM: Dashboard overview loads with yesterday's mortality + not-visited farms
8:00 AM: Supervisors submit report entries from field (mobile-optimised)
10:00 AM: Integrator reviews "Not Visited" farms from dashboard
11:00 AM: Feed allocation orders issued for next delivery
```

### Workflow 3: Bird Sale / Harvest
```
Day 35+: Harvest Ready alert on dashboard
         Integrator contacts trader from Trader Master
         [New Sale Entry] → records trader, vehicle, crates, weight, rate
         → payment voucher auto-created in accounts
         → batch sales data flows to batch P&L
         → batch closure triggers P&L report PDF
         → document saved to Docs tab
```

### Workflow 4: Monthly Closing
```
Month end: Generate Payroll for all employees (Payroll tab)
           Process salary payments → Payment vouchers in accounts
           → GC labour cost auto-syncs to all active batches
           Review Monthly P&L report
           GSTR3B data available for filing
           [Close Month] marks financial year month as closed
```

### Workflow 5: Supervisor Incentive Settlement
```
Batch closed: System computes actual GC for batch
              Incentive Calculation page shows each supervisor's earning
              Integrator reviews and [Approves] incentives
              Accountant marks [Paid] → payment voucher created → salary ledger updated
```

---

# ═══════════════════════════════════════════════════════════════
# SECTION 13: COMMON COMPONENT PATTERNS
# ═══════════════════════════════════════════════════════════════

Use these exact patterns — no exceptions:

### Master List Page Pattern
```tsx
// Standard pattern for all CRUD list pages
export default function MasterListPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>
        </div>
        <button className="bg-[#1A5C34] text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add New
        </button>
      </div>
      {/* Filters bar */}
      <div className="p-6 pb-3 flex gap-3">
        <SearchInput /><FilterDropdowns /><ExportButtons />
      </div>
      {/* Data table */}
      <div className="px-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
```

### Right Panel / Drawer Pattern (for add/edit forms)
```tsx
// Always slide in from right, 480px wide on desktop, full-screen on mobile
<SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="Add Farmer">
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* form fields */}
    <div className="flex gap-3 mt-6">
      <button type="button" onClick={onClose} className="flex-1 border border-[#E3EDE7] ...">Cancel</button>
      <button type="submit" className="flex-1 bg-[#1A5C34] text-white ...">Save</button>
    </div>
  </form>
</SlidePanel>
```

### Table Component Pattern (Recharts not needed — use HTML table)
```tsx
// All data tables: sticky header, zebra stripes, sortable columns, row click to edit
<table className="w-full text-sm">
  <thead className="sticky top-0 bg-[#EDF7F1] text-[#1A5C34] font-semibold">
    <tr>{columns.map(col => <th key={col.key} className="px-4 py-3 text-left">{col.label}</th>)}</tr>
  </thead>
  <tbody>
    {rows.map((row, i) => (
      <tr key={row.id} className={`${i%2===0?'bg-white':'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] cursor-pointer`}>
        {/* cells */}
      </tr>
    ))}
  </tbody>
</table>
```

### Empty State Pattern
```tsx
// Every list page: illustrated empty state with CTA
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mb-4">
    <Icon size={28} className="text-[#1A5C34]" />
  </div>
  <h3 className="text-lg font-semibold text-[#111827] mb-2">No {entityName} found</h3>
  <p className="text-sm text-[#6B7280] mb-6 max-w-xs">
    {emptyHindiMessage} / {emptyEnglishMessage}
  </p>
  <button onClick={onAdd} className="bg-[#1A5C34] text-white px-6 py-2 rounded-lg text-sm">
    + Add First {entityName}
  </button>
</div>
```

### Report Export Button Pattern
```tsx
// All reports: CSV + PDF export buttons (top-right of every report page)
<div className="flex gap-2">
  <button onClick={exportCSV} className="border border-[#E3EDE7] px-3 py-1.5 rounded text-sm flex items-center gap-1.5">
    <DownloadSimple size={16} /> CSV
  </button>
  <button onClick={printReport} className="border border-[#E3EDE7] px-3 py-1.5 rounded text-sm flex items-center gap-1.5">
    <Printer size={16} /> Print
  </button>
</div>
```

---

# ═══════════════════════════════════════════════════════════════
# SECTION 14: IMPLEMENTATION ORDER
# ═══════════════════════════════════════════════════════════════

Work in this exact order. Do not skip steps.

**PHASE 1 — Foundation (do this first)**
1. Run database migration SQL from Section 1
2. Create types file `apps/web/lib/types/erp.ts` from Section 10
3. Update Sidebar.tsx with complete navigation from Section 11

**PHASE 2 — Dashboard**
4. Create `apps/web/app/api/dashboard/overview/route.ts`
5. Update `apps/web/app/dashboard/page.tsx` with enhanced KPIs from Section 2

**PHASE 3 — Masters**
6. Company master page
7. Supplier master page + API
8. Farmer master page + API (most complex — includes CSV import)
9. Trader master page + API
10. User Privileges page + API

**PHASE 4 — Setup Module**
11. Setup page with all tabs (Lines, Profit Centers, Tax, GC Rate Setup, Financial Year)

**PHASE 5 — Inventory**
12. Product Category + Product Master pages + APIs
13. PO Entry + PO Receipt pages + APIs
14. Direct Purchase + Chick Purchase pages + APIs
15. Stock Transfer pages + APIs (F2F and F2B)
16. Stock Adjustment page + API
17. Stock Reports page (all 10 sub-reports)

**PHASE 6 — Broiler Workflow**
18. Vehicle Master page + API
19. Shed Ready page + API
20. Chick Allocation page + API
21. Feed/Medicine Allocation page + API
22. Supervisor Report Entry page + API (mobile-first)
23. Body Weight Entry view
24. Travel Entry page
25. Incentive Calculation page + API
26. All Broiler Reports (10 reports)

**PHASE 7 — Accounts**
27. Account Groups + Ledger Master pages + APIs
28. Voucher Entry (Payment + Receipt + Contra + Journal + Employee) + API
29. Bank Reconciliation page + API
30. Day Book + Ledger Statement reports
31. Trial Balance report
32. Balance Sheet + P&L report
33. GSTR1 + GSTR3B reports

**PHASE 8 — Payroll Extension**
34. Leave Entry page + API (add to existing employees page)
35. Payroll Setup tab + API
36. Payroll report extensions

**PHASE 9 — Integration & Polish**
37. Ensure Chick Allocation → auto-creates batch in farms module
38. Ensure Feed Allocation → decrements branch inventory
39. Ensure Payment Voucher → updates ledger balance
40. Ensure Incentive Pay → creates employee payment voucher
41. Dashboard "Not Visited" farms → drill-down to farm detail
42. All reports: confirm CSV export and print functions work

---

## GLOBAL IMPLEMENTATION RULES (NON-NEGOTIABLE)

1. **No blank screens** — every loading state has a skeleton (`animate-pulse`), every empty state has an illustration + CTA.
2. **All money values** — formatted with `toLocaleString('en-IN')` for Indian notation. Never raw numbers.
3. **Auto-generated codes** — all entity codes (PO/2526/001, FMR-001 etc.) generated server-side in API route, never client-side.
4. **Bilingual** — every page title, label, button, error message has both Hindi and English. Format: `"किसान / Farmer"`.
5. **RLS on every API route** — never trust client-sent integrator_id; always read from `session.user.id`.
6. **Zod validation** — every API POST/PUT body validated. Return 400 with field-level errors if invalid.
7. **Preserve existing functionality** — never delete or modify existing farm/batch/daily log functionality. Extend only.
8. **Mobile-first supervisor screens** — Shed Ready, Report Entry, Travel Entry must work at 375px viewport.
9. **PDF reports** — use `@react-pdf/renderer` for all PDF generation (batch reports, trial balance, vouchers).
10. **Print CSS** — all HTML report pages have `@media print` CSS that hides sidebar/navbar and formats correctly.
11. **Confirm before delete** — all delete actions show a confirmation modal with entity name displayed.
12. **Audit trail** — all sensitive operations (vouchers, allocations, incentive payments) log `created_by` + `updated_by` with user IDs.

---

Begin with Phase 1 Step 1 (database migration). Confirm each file creation before proceeding. If any referenced table or file already exists, update it — never overwrite existing functionality.