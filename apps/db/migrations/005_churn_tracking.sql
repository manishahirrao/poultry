-- PoultryPulse AI - Churn Tracking Schema
-- Migration: 005_churn_tracking.sql
-- Description: Adds tables for churn prevention, cancellation reasons, and retention analytics

-- Enum types for churn tracking
CREATE TYPE cancellation_reason AS ENUM (
    'TOO_EXPENSIVE',
    'NOT_USING_ENOUGH',
    'TECHNICAL_ISSUES',
    'MISSING_FEATURES',
    'COMPETITOR',
    'SEASONAL_PAUSE',
    'FARM_SOLD',
    'OTHER'
);

CREATE TYPE save_offer_status AS ENUM (
    'OFFERED',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED'
);

CREATE TYPE churn_risk_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- Cancellation reasons table
-- Stores exit survey responses when users cancel
CREATE TABLE cancellation_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    reason cancellation_reason NOT NULL,
    reason_text TEXT,
    feature_requests JSONB,
    competitor_mentioned TEXT,
    would_consider_returning BOOLEAN,
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cancellation_reasons
CREATE INDEX idx_cancellation_reasons_customer_id ON cancellation_reasons(customer_id);
CREATE INDEX idx_cancellation_reasons_reason ON cancellation_reasons(reason);
CREATE INDEX idx_cancellation_reasons_created_at ON cancellation_reasons(created_at);

-- Save offers table
-- Tracks retention offers presented during cancellation flow
CREATE TABLE save_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    offer_type TEXT NOT NULL, -- 'DISCOUNT', 'FREE_MONTH', 'DOWNGRADE', 'PAUSE'
    offer_value NUMERIC, -- Discount percentage or months free
    offer_description TEXT NOT NULL,
    status save_offer_status NOT NULL DEFAULT 'OFFERED',
    presented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Indexes for save_offers
CREATE INDEX idx_save_offers_customer_id ON save_offers(customer_id);
CREATE INDEX idx_save_offers_status ON save_offers(status);
CREATE INDEX idx_save_offers_presented_at ON save_offers(presented_at);

-- Customer health scores table
-- Tracks churn risk scores and engagement metrics
CREATE TABLE customer_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    risk_level churn_risk_level NOT NULL,
    login_frequency_7d INTEGER DEFAULT 0,
    login_frequency_30d INTEGER DEFAULT 0,
    feature_usage JSONB,
    days_since_last_login INTEGER,
    subscription_age_days INTEGER,
    support_tickets_count INTEGER DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT customer_health_unique UNIQUE (customer_id, calculated_at)
);

-- Indexes for customer_health_scores
CREATE INDEX idx_customer_health_scores_customer_id ON customer_health_scores(customer_id);
CREATE INDEX idx_customer_health_scores_risk_level ON customer_health_scores(risk_level);
CREATE INDEX idx_customer_health_scores_calculated_at ON customer_health_scores(calculated_at);

-- Churn events table
-- Records actual churn events for analytics
CREATE TABLE churn_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    subscription_tier subscription_tier NOT NULL,
    churn_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subscription_age_days INTEGER NOT NULL,
    mrr_lost NUMERIC,
    cancellation_reason_id UUID REFERENCES cancellation_reasons(id),
    save_offer_id UUID REFERENCES save_offers(id),
    retention_attempted BOOLEAN DEFAULT false,
    cohort_month DATE NOT NULL,
    predicted_risk_level churn_risk_level,
    actual_risk_level churn_risk_level
);

-- Indexes for churn_events
CREATE INDEX idx_churn_events_customer_id ON churn_events(customer_id);
CREATE INDEX idx_churn_events_churn_date ON churn_events(churn_date);
CREATE INDEX idx_churn_events_cohort_month ON churn_events(cohort_month);
CREATE INDEX idx_churn_events_predicted_risk ON churn_events(predicted_risk_level);

-- Feature usage tracking table
-- Tracks which features customers use for engagement analytics
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT customer_feature_unique UNIQUE (customer_id, feature_name)
);

-- Indexes for feature_usage
CREATE INDEX idx_feature_usage_customer_id ON feature_usage(customer_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_last_used_at ON feature_usage(last_used_at);

-- Engagement metrics table
-- Daily engagement metrics for churn prediction
CREATE TABLE engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    logins INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    predictions_viewed INTEGER DEFAULT 0,
    alerts_viewed INTEGER DEFAULT 0,
    calculator_used INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT customer_metric_date_unique UNIQUE (customer_id, metric_date)
);

-- Indexes for engagement_metrics
CREATE INDEX idx_engagement_metrics_customer_id ON engagement_metrics(customer_id);
CREATE INDEX idx_engagement_metrics_metric_date ON engagement_metrics(metric_date);
CREATE INDEX idx_engagement_metrics_created_at ON engagement_metrics(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE cancellation_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

-- cancellation_reasons RLS
CREATE POLICY "Users can view own cancellation reasons" 
ON cancellation_reasons FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can insert cancellation reasons" 
ON cancellation_reasons FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update cancellation reasons" 
ON cancellation_reasons FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

-- save_offers RLS
CREATE POLICY "Users can view own save offers" 
ON save_offers FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can insert save offers" 
ON save_offers FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update save offers" 
ON save_offers FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

-- customer_health_scores RLS
CREATE POLICY "Users can view own health scores" 
ON customer_health_scores FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can insert health scores" 
ON customer_health_scores FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update health scores" 
ON customer_health_scores FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

-- churn_events RLS (admin only)
CREATE POLICY "Service role can view churn events" 
ON churn_events FOR SELECT 
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert churn events" 
ON churn_events FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- feature_usage RLS
CREATE POLICY "Users can view own feature usage" 
ON feature_usage FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can insert feature usage" 
ON feature_usage FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update feature usage" 
ON feature_usage FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

-- engagement_metrics RLS
CREATE POLICY "Users can view own engagement metrics" 
ON engagement_metrics FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Service role can insert engagement metrics" 
ON engagement_metrics FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update engagement metrics" 
ON engagement_metrics FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

-- Updated_at trigger function (already exists, just apply to new tables)
CREATE TRIGGER update_cancellation_reasons_updated_at BEFORE UPDATE ON cancellation_reasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_save_offers_updated_at BEFORE UPDATE ON save_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_health_scores_updated_at BEFORE UPDATE ON customer_health_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON feature_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_metrics_updated_at BEFORE UPDATE ON engagement_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
