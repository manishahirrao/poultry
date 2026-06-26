-- PoultryPulse AI - Referral System
-- Migration: 006_referral_system.sql
-- Description: Creates referral tracking system for WhatsApp-based viral growth
-- Marketing Initiative #1: WhatsApp Referral Program

-- Referrals table
-- Tracks referral relationships and rewards
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    referee_phone_hash TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, signed_up, converted
    reward_earned INTEGER DEFAULT 0, -- in rupees
    reward_given BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    
    CONSTRAINT referral_status_check CHECK (status IN ('pending', 'signed_up', 'converted'))
);

-- Indexes for referrals
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_phone_hash ON referrals(referee_phone_hash);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Referral rewards configuration
-- Stores reward tiers and amounts
CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_type TEXT NOT NULL, -- referrer_signup, referee_signup, conversion
    reward_amount INTEGER NOT NULL, -- in rupees
    reward_unit TEXT NOT NULL, -- months_free, rupees, extended_trial
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for referral_rewards
CREATE INDEX idx_referral_rewards_type ON referral_rewards(reward_type);
CREATE INDEX idx_referral_rewards_active ON referral_rewards(is_active) WHERE is_active = true;

-- Insert default reward configuration
INSERT INTO referral_rewards (reward_type, reward_amount, reward_unit) VALUES
('referrer_signup', 1, 'months_free'),
('referee_signup', 14, 'extended_trial_days'),
('conversion', 2000, 'rupees');

-- RLS Policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Referrals RLS: Users can view their own referrals
CREATE POLICY "Users can view own referrals" 
ON referrals FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Service role can insert referrals" 
ON referrals FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update referrals" 
ON referrals FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

-- Referral rewards RLS: Authenticated users can read
CREATE POLICY "Authenticated users can view referral rewards" 
ON referral_rewards FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage referral rewards" 
ON referral_rewards FOR ALL 
WITH CHECK (auth.role() = 'service_role');
