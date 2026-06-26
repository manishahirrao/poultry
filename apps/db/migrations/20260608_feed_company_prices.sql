-- PoultryPulse AI - Feed Company Prices
-- Migration: 20260608_feed_company_prices.sql
-- Description: Creates tables for tracking feed prices from major poultry feed companies
-- Requirements: Feed Intelligence section enhancement

-- Enum type for feed categories
CREATE TYPE feed_category AS ENUM ('starter', 'grower', 'finisher', 'pre_starter', 'layer', 'broiler', 'custom');

-- Feed companies table
CREATE TABLE feed_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website_url TEXT,
    contact_phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for feed companies
CREATE INDEX idx_feed_companies_active ON feed_companies(is_active);

-- Feed types table
CREATE TABLE feed_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category feed_category NOT NULL,
    description TEXT,
    typical_bird_stage TEXT, -- e.g., '0-10 days', '11-24 days', etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for feed types
CREATE INDEX idx_feed_types_active ON feed_types(is_active);
CREATE INDEX idx_feed_types_category ON feed_types(category);

-- Feed prices table
CREATE TABLE feed_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES feed_companies(id) ON DELETE CASCADE,
    feed_type_id UUID NOT NULL REFERENCES feed_types(id) ON DELETE CASCADE,
    price_per_ton NUMERIC NOT NULL CHECK (price_per_ton > 0),
    price_per_50kg_bag NUMERIC GENERATED ALWAYS AS (price_per_ton / 20) STORED, -- Auto-calculate 50kg bag price
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    region TEXT, -- Optional: can specify region-specific pricing
    currency TEXT NOT NULL DEFAULT 'INR',
    is_current BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure only one current price per company/feed type/region
    CONSTRAINT unique_current_price EXCLUDE (
        company_id WITH =,
        feed_type_id WITH =,
        region WITH =,
        is_current WITH =
    ) WHERE (is_current = true)
);

-- Indexes for feed prices
CREATE INDEX idx_feed_prices_company ON feed_prices(company_id);
CREATE INDEX idx_feed_prices_feed_type ON feed_prices(feed_type_id);
CREATE INDEX idx_feed_prices_effective_date ON feed_prices(effective_date DESC);
CREATE INDEX idx_feed_prices_is_current ON feed_prices(is_current);
CREATE INDEX idx_feed_prices_region ON feed_prices(region);

-- Function to expire old prices when setting new current price
CREATE OR REPLACE FUNCTION expire_old_feed_prices()
RETURNS TRIGGER AS $$
BEGIN
    -- When inserting a new current price, expire previous current prices for same company/feed type/region
    IF NEW.is_current = true THEN
        UPDATE feed_prices
        SET is_current = false,
            expiry_date = NEW.effective_date - INTERVAL '1 day',
            updated_at = NOW()
        WHERE company_id = NEW.company_id
          AND feed_type_id = NEW.feed_type_id
          AND (region = NEW.region OR (region IS NULL AND NEW.region IS NULL))
          AND is_current = true
          AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire old prices
CREATE TRIGGER trigger_expire_old_feed_prices
    BEFORE INSERT ON feed_prices
    FOR EACH ROW
    EXECUTE FUNCTION expire_old_feed_prices();

-- Insert sample feed companies
INSERT INTO feed_companies (name, logo_url, website_url, contact_phone, is_active) VALUES
    ('Godrej Agrovet', NULL, 'https://www.godrejagrovet.com', NULL, true),
    ('Venkateshwara Hatcheries (Venkys)', NULL, 'https://www.venkys.com', NULL, true),
    ('Suguna Foods', NULL, 'https://www.suguna.com', NULL, true),
    ('IB Group', NULL, 'https://www.ibgroup.in', NULL, true),
    ('Amrit Feeds', NULL, NULL, NULL, true),
    ('Kaveri Company', NULL, 'https://www.kaveri.co.in', NULL, true),
    ('Srinivasa Hatcheries', NULL, 'https://www.srinivasahatcheries.com', NULL, true),
    ('Bayer CropScience', NULL, 'https://www.cropscience.bayer.com', NULL, true),
    ('Alltech', NULL, 'https://www.alltech.com', NULL, true),
    ('Cargill Animal Nutrition', NULL, 'https://www.cargill.com/animal-nutrition', NULL, true);

-- Insert sample feed types
INSERT INTO feed_types (name, category, description, typical_bird_stage, is_active) VALUES
    ('Pre-Starter', 'pre_starter', 'High-nutrition feed for day-old chicks', '0-7 days', true),
    ('Starter', 'starter', 'Growth-focused feed for young birds', '8-21 days', true),
    ('Grower', 'grower', 'Development feed for growing birds', '22-35 days', true),
    ('Finisher', 'finisher', 'Final growth stage feed', '36-42 days', true),
    ('Layer Starter', 'layer', 'Feed for young laying hens', '0-8 weeks', true),
    ('Layer Grower', 'layer', 'Feed for developing laying hens', '9-18 weeks', true),
    ('Layer Finisher', 'layer', 'Feed for active laying hens', '19+ weeks', true),
    ('Broiler Starter', 'broiler', 'Feed for broiler chicks', '0-14 days', true),
    ('Broiler Grower', 'broiler', 'Feed for growing broilers', '15-28 days', true),
    ('Broiler Finisher', 'broiler', 'Feed for finishing broilers', '29-42 days', true);

-- Insert sample feed prices (current market rates - approximate)
INSERT INTO feed_prices (company_id, feed_type_id, price_per_ton, effective_date, is_current, notes) VALUES
    -- Godrej Agrovet prices
    ((SELECT id FROM feed_companies WHERE name = 'Godrej Agrovet'), 
     (SELECT id FROM feed_types WHERE name = 'Starter'), 28500, CURRENT_DATE, true, 'Standard broiler starter'),
    ((SELECT id FROM feed_companies WHERE name = 'Godrej Agrovet'), 
     (SELECT id FROM feed_types WHERE name = 'Grower'), 27500, CURRENT_DATE, true, 'Standard broiler grower'),
    ((SELECT id FROM feed_companies WHERE name = 'Godrej Agrovet'), 
     (SELECT id FROM feed_types WHERE name = 'Finisher'), 26500, CURRENT_DATE, true, 'Standard broiler finisher'),
    
    -- Venkys prices
    ((SELECT id FROM feed_companies WHERE name = 'Venkateshwara Hatcheries (Venkys)'), 
     (SELECT id FROM feed_types WHERE name = 'Starter'), 29000, CURRENT_DATE, true, 'Premium broiler starter'),
    ((SELECT id FROM feed_companies WHERE name = 'Venkateshwara Hatcheries (Venkys)'), 
     (SELECT id FROM feed_types WHERE name = 'Grower'), 28000, CURRENT_DATE, true, 'Premium broiler grower'),
    ((SELECT id FROM feed_companies WHERE name = 'Venkateshwara Hatcheries (Venkys)'), 
     (SELECT id FROM feed_types WHERE name = 'Finisher'), 27000, CURRENT_DATE, true, 'Premium broiler finisher'),
    
    -- Suguna Foods prices
    ((SELECT id FROM feed_companies WHERE name = 'Suguna Foods'), 
     (SELECT id FROM feed_types WHERE name = 'Starter'), 27800, CURRENT_DATE, true, 'Economy broiler starter'),
    ((SELECT id FROM feed_companies WHERE name = 'Suguna Foods'), 
     (SELECT id FROM feed_types WHERE name = 'Grower'), 26800, CURRENT_DATE, true, 'Economy broiler grower'),
    ((SELECT id FROM feed_companies WHERE name = 'Suguna Foods'), 
     (SELECT id FROM feed_types WHERE name = 'Finisher'), 25800, CURRENT_DATE, true, 'Economy broiler finisher'),
    
    -- IB Group prices
    ((SELECT id FROM feed_companies WHERE name = 'IB Group'), 
     (SELECT id FROM feed_types WHERE name = 'Starter'), 28200, CURRENT_DATE, true, 'Mid-range broiler starter'),
    ((SELECT id FROM feed_companies WHERE name = 'IB Group'), 
     (SELECT id FROM feed_types WHERE name = 'Grower'), 27200, CURRENT_DATE, true, 'Mid-range broiler grower'),
    ((SELECT id FROM feed_companies WHERE name = 'IB Group'), 
     (SELECT id FROM feed_types WHERE name = 'Finisher'), 26200, CURRENT_DATE, true, 'Mid-range broiler finisher'),
    
    -- Layer feed prices (Godrej)
    ((SELECT id FROM feed_companies WHERE name = 'Godrej Agrovet'), 
     (SELECT id FROM feed_types WHERE name = 'Layer Starter'), 29500, CURRENT_DATE, true, 'Layer starter feed'),
    ((SELECT id FROM feed_companies WHERE name = 'Godrej Agrovet'), 
     (SELECT id FROM feed_types WHERE name = 'Layer Grower'), 28500, CURRENT_DATE, true, 'Layer grower feed'),
    ((SELECT id FROM feed_companies WHERE name = 'Godrej Agrovet'), 
     (SELECT id FROM feed_types WHERE name = 'Layer Finisher'), 27500, CURRENT_DATE, true, 'Layer finisher feed');

-- Grant permissions
GRANT SELECT ON feed_companies TO authenticated;
GRANT SELECT ON feed_types TO authenticated;
GRANT SELECT ON feed_prices TO authenticated;
GRANT INSERT, UPDATE ON feed_prices TO service_role;
GRANT INSERT, UPDATE ON feed_companies TO service_role;
GRANT INSERT, UPDATE ON feed_types TO service_role;

-- Add comments
COMMENT ON TABLE feed_companies IS 'Major poultry feed companies in India';
COMMENT ON TABLE feed_types IS 'Different types of poultry feed (starter, grower, finisher, etc.)';
COMMENT ON TABLE feed_prices IS 'Current and historical feed prices by company and feed type';
COMMENT ON COLUMN feed_prices.price_per_50kg_bag IS 'Auto-calculated price for 50kg bag (price_per_ton / 20)';
COMMENT ON COLUMN feed_prices.is_current IS 'Flag indicating if this is the current active price';
