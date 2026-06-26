-- FlockIQ - Integration Company ERP v3 Database Schema
-- Migration: 20260621_integration_erp_v3.sql
-- Description: Creates complete ERP schema for integration company operations
-- Requirements: specs/account .md SECTION 1: DATABASE MIGRATION
-- Dependencies: 001_initial_schema.sql, 20260503_batches.sql, 20260504_inventory_management.sql, 
--               20260523_farm_management.sql, 20260606_gc_employee_module.sql

-- ════════════════════════════════════════════════════════════
-- MASTER TABLES
-- ════════════════════════════════════════════════════════════

-- Company / Branch setup (the integration company itself)
CREATE TABLE IF NOT EXISTS companies (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS erp_suppliers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
ALTER TABLE erp_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_suppliers_owner ON erp_suppliers FOR ALL USING (integrator_id = auth.uid());

-- Traders / Buyers (who buys harvested birds)
CREATE TABLE IF NOT EXISTS traders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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

-- Vehicles (for bird transport, feed delivery) - moved here as it's referenced by other tables
CREATE TABLE IF NOT EXISTS vehicles (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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

-- ════════════════════════════════════════════════════════════
-- INVENTORY TABLES
-- ════════════════════════════════════════════════════════════

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS erp_products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
ALTER TABLE erp_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_products_owner ON erp_products FOR ALL USING (integrator_id = auth.uid());
CREATE INDEX idx_erp_products_category ON erp_products(category_id);

-- Branch Opening Stock
CREATE TABLE IF NOT EXISTS branch_stock_opening (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  branch_id         UUID NOT NULL REFERENCES branches(id),
  product_id        UUID NOT NULL REFERENCES erp_products(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  farmer_id         UUID NOT NULL REFERENCES farmers(id),
  product_id        UUID NOT NULL REFERENCES erp_products(id),
  financial_year_id UUID REFERENCES financial_years(id),
  opening_qty       NUMERIC(12,2) DEFAULT 0,
  opening_rate      NUMERIC(10,2) DEFAULT 0,
  entered_date      DATE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE farmer_stock_opening ENABLE ROW LEVEL SECURITY;
CREATE POLICY fso_owner ON farmer_stock_opening FOR ALL USING (integrator_id = auth.uid());

-- Purchase Orders (ERP-specific, separate from inventory management)
CREATE TABLE IF NOT EXISTS erp_purchase_orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  po_number         VARCHAR(30) NOT NULL UNIQUE,  -- Auto: PO/2526/001
  po_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id       UUID NOT NULL REFERENCES erp_suppliers(id),
  branch_id         UUID REFERENCES branches(id),
  expected_delivery DATE,
  status            VARCHAR(20) DEFAULT 'open'
                    CHECK (status IN ('draft','open','partial','received','cancelled')),
  remarks           TEXT,
  created_by        UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE erp_purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_po_owner ON erp_purchase_orders FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS erp_purchase_order_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id             UUID NOT NULL REFERENCES erp_purchase_orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES erp_products(id),
  ordered_qty       NUMERIC(12,2) NOT NULL,
  received_qty      NUMERIC(12,2) DEFAULT 0,
  unit_rate         NUMERIC(10,2),
  tax_id            UUID REFERENCES tax_setup(id),
  tax_amount        NUMERIC(10,2) DEFAULT 0,
  line_total        NUMERIC(14,2),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Entries (Goods Receipt - ERP-specific)
CREATE TABLE IF NOT EXISTS erp_purchases (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  purchase_number   VARCHAR(30) NOT NULL,   -- Auto: PUR/2526/001
  purchase_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_type     VARCHAR(20) DEFAULT 'direct'
                    CHECK (purchase_type IN ('against_po','direct','chick','freight','return')),
  supplier_id       UUID NOT NULL REFERENCES erp_suppliers(id),
  branch_id         UUID REFERENCES branches(id),
  po_id             UUID REFERENCES erp_purchase_orders(id),  -- if against PO
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
  created_by        UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE erp_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_purchases_owner ON erp_purchases FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS erp_purchase_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id       UUID NOT NULL REFERENCES erp_purchases(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES erp_products(id),
  po_item_id        UUID REFERENCES erp_purchase_order_items(id),
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
CREATE INDEX idx_erp_purchase_items_product ON erp_purchase_items(product_id);

-- Stock Transfers (Branch to Branch, Branch to Farmer)
CREATE TABLE IF NOT EXISTS stock_transfers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  created_by        UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY st_owner ON stock_transfers FOR ALL USING (integrator_id = auth.uid());

CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id       UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES erp_products(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  adj_number        VARCHAR(30) NOT NULL,
  adj_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  adj_type          VARCHAR(20) DEFAULT 'write_off'
                    CHECK (adj_type IN ('write_off','write_in','damage','expired','transfer_correction')),
  branch_id         UUID REFERENCES branches(id),
  farmer_id         UUID REFERENCES farmers(id),
  product_id        UUID NOT NULL REFERENCES erp_products(id),
  quantity          NUMERIC(12,2) NOT NULL,
  unit_rate         NUMERIC(10,2),
  reason            TEXT,
  financial_year_id UUID REFERENCES financial_years(id),
  approved_by       UUID REFERENCES customers(id),
  created_by        UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY sa_owner ON stock_adjustments FOR ALL USING (integrator_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- BROILER INTEGRATION WORKFLOW TABLES
-- ════════════════════════════════════════════════════════════

-- Shed Readiness (marks a shed ready to receive chicks)
CREATE TABLE IF NOT EXISTS shed_readiness (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  approved_by       UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shed_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY sr_owner ON shed_readiness FOR ALL USING (integrator_id = auth.uid());

-- Chick Allocation (records chick placement to a farmer/farm)
CREATE TABLE IF NOT EXISTS chick_allocations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  alloc_number      VARCHAR(30) NOT NULL,   -- Auto: CA/2526/001
  alloc_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  farm_id           UUID NOT NULL REFERENCES farms(id),
  farmer_id         UUID NOT NULL REFERENCES farmers(id),
  batch_id          UUID REFERENCES batches(id),   -- links to the batch created
  shed_readiness_id UUID REFERENCES shed_readiness(id),
  supplier_id       UUID REFERENCES erp_suppliers(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  product_id        UUID NOT NULL REFERENCES erp_products(id),
  quantity          NUMERIC(12,2) NOT NULL,
  unit_rate         NUMERIC(10,2),
  line_value        NUMERIC(14,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_rate, 0)) STORED,
  batch_no          VARCHAR(50),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Supervisor Visit Log (tracks field visits)
CREATE TABLE IF NOT EXISTS supervisor_visits (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  approved_by       UUID REFERENCES customers(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  account_code      VARCHAR(20),
  account_name      VARCHAR(200) NOT NULL,
  account_name_hi   VARCHAR(200),
  account_group_id  UUID NOT NULL REFERENCES account_groups(id),
  opening_balance   NUMERIC(14,2) DEFAULT 0,
  opening_balance_type VARCHAR(2) DEFAULT 'Dr' CHECK (opening_balance_type IN ('Dr','Cr')),
  -- Links to master entities (optional — for auto-posting)
  linked_supplier_id UUID REFERENCES erp_suppliers(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  created_by        UUID REFERENCES customers(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id),
  leave_type        VARCHAR(20) DEFAULT 'casual'
                    CHECK (leave_type IN ('casual','sick','earned','unpaid','holiday')),
  from_date         DATE NOT NULL,
  to_date           DATE NOT NULL,
  days_count        NUMERIC(4,1) NOT NULL,
  reason            TEXT,
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by       UUID REFERENCES customers(id),
  approved_at       TIMESTAMPTZ,
  financial_year_id UUID REFERENCES financial_years(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leave_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY le_owner ON leave_entries FOR ALL USING (integrator_id = auth.uid());

-- Payroll Setup (salary components per employee)
CREATE TABLE IF NOT EXISTS payroll_components (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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

-- Drop first because PostgreSQL does not support CREATE OR REPLACE for materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_overview;

CREATE MATERIALIZED VIEW mv_dashboard_overview AS
SELECT
  f.integrator_id,
  -- Active farms (farms with at least one batch that is NOT closed/sold)
  COUNT(DISTINCT CASE WHEN b.id IS NOT NULL THEN f.id END) AS active_farms,
  -- Total active farmers for this integrator
  COUNT(DISTINCT fr.id) AS total_farmers,
  -- Live birds by age group (summed across all active batches for the farm)
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
  -- Today's mortality (summed across active batches)
  COALESCE(SUM(dl_today.deaths_today), 0) AS today_mortality,
  -- Total live birds across all active batches
  COALESCE(SUM(b.birds_placed - COALESCE(cumul.cumulative_deaths, 0)), 0) AS total_live_birds
FROM farms f
-- Link farms to batches via chick_allocations
LEFT JOIN chick_allocations ca ON ca.farm_id = f.id
-- FIXED: Use valid batch_status ENUM values: 'placement', 'growing', 'pre_harvest', 'harvest_ready', 'harvested'
LEFT JOIN batches b ON b.id = ca.batch_id 
                    AND b.status IN ('placement', 'growing', 'pre_harvest', 'harvest_ready', 'harvested')
LEFT JOIN farmers fr ON fr.integrator_id = f.integrator_id AND fr.is_active = TRUE
LEFT JOIN LATERAL (
  SELECT SUM(deaths_today) AS cumulative_deaths
  FROM daily_logs dl WHERE dl.batch_id = b.id
) cumul ON TRUE
LEFT JOIN daily_logs dl_today ON dl_today.batch_id = b.id
  AND dl_today.log_date = CURRENT_DATE
GROUP BY f.integrator_id
WITH DATA;

-- Use IF NOT EXISTS to prevent errors on re-runs
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_overview_integrator ON mv_dashboard_overview(integrator_id);

-- Refresh every 30 minutes via pg_cron (ensure pg_cron is enabled in your DB)
-- SELECT cron.schedule('refresh-dashboard-overview', '*/30 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_overview');


-- ════════════════════════════════════════════════════════════
-- GST REPORTING VIEWS
-- ════════════════════════════════════════════════════════════

-- GSTR-1 / Purchase data view (Regular views DO support CREATE OR REPLACE)
CREATE OR REPLACE VIEW v_gstr1_data AS
SELECT
  p.integrator_id,               
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
  (COALESCE(pi_item.cgst_amount, 0) + COALESCE(pi_item.sgst_amount, 0) + COALESCE(pi_item.igst_amount, 0)) AS total_tax,
  pr.product_name,
  pr.hsn_code
FROM erp_purchases p
JOIN erp_suppliers s ON p.supplier_id = s.id
JOIN erp_purchase_items pi_item ON pi_item.purchase_id = p.id
JOIN erp_products pr ON pi_item.product_id = pr.id
LEFT JOIN tax_setup ts ON pi_item.tax_id = ts.id;