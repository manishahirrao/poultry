-- PoultryPulse AI - Supervisor Role & Team Management Schema
-- Migration: 20260601_supervisor_role.sql
-- Description: Creates supervisor role, shed assignments, and submission tracking
-- Requirements: REQ-020 §20.1, §20.5, Design Addendum §15
-- Task: TASK-045

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum type for user roles
CREATE TYPE user_role AS ENUM ('owner', 'supervisor', 'admin');

-- Enum type for task types
CREATE TYPE task_type AS ENUM ('health_checklist', 'mortality_log', 'feed_log', 'water_reading');

-- Enum type for task status
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'missed');

-- Supervisors table - links supervisors to farm owners with shed assignments
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE, -- Farm owner/integrator
  supervisor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Supervisor auth user
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  assigned_sheds TEXT[] DEFAULT '{}', -- Array of shed IDs assigned to this supervisor
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_supervisor_per_customer UNIQUE (customer_id, supervisor_user_id)
);

-- Indexes for supervisors
CREATE INDEX idx_supervisors_customer_id ON supervisors(customer_id);
CREATE INDEX idx_supervisors_supervisor_user_id ON supervisors(supervisor_user_id);
CREATE INDEX idx_supervisors_is_active ON supervisors(is_active);

-- Supervisor daily tasks table - tracks task completion for supervisors
CREATE TABLE IF NOT EXISTS supervisor_daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id UUID NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  task_type task_type NOT NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  shed_id TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  synced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_supervisor_task UNIQUE (supervisor_id, task_date, task_type, batch_id)
);

-- Indexes for supervisor_daily_tasks
CREATE INDEX idx_supervisor_daily_tasks_supervisor_id ON supervisor_daily_tasks(supervisor_id);
CREATE INDEX idx_supervisor_daily_tasks_task_date ON supervisor_daily_tasks(task_date);
CREATE INDEX idx_supervisor_daily_tasks_status ON supervisor_daily_tasks(status);
CREATE INDEX idx_supervisor_daily_tasks_batch_id ON supervisor_daily_tasks(batch_id);

-- Function to check if user is a supervisor
CREATE OR REPLACE FUNCTION is_supervisor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM supervisors 
    WHERE supervisor_user_id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get supervisor's assigned sheds
CREATE OR REPLACE FUNCTION get_supervisor_sheds(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  sheds TEXT[];
BEGIN
  SELECT assigned_sheds INTO sheds
  FROM supervisors
  WHERE supervisor_user_id = user_id AND is_active = true;
  
  RETURN COALESCE(sheds, '{}');
END;
$$ LANGUAGE plpgsql;

-- Function to get supervisor's customer (farm owner)
CREATE OR REPLACE FUNCTION get_supervisor_customer(user_id UUID)
RETURNS UUID AS $$
DECLARE
  customer_id UUID;
BEGIN
  SELECT customer_id INTO customer_id
  FROM supervisors
  WHERE supervisor_user_id = user_id AND is_active = true;
  
  RETURN customer_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_supervisors_updated_at BEFORE UPDATE ON supervisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervisor_daily_tasks_updated_at BEFORE UPDATE ON supervisor_daily_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_daily_tasks ENABLE ROW LEVEL SECURITY;

-- Supervisors RLS: Farm owners can view their own supervisors
CREATE POLICY "Farm owners can view their supervisors"
ON supervisors FOR SELECT
USING (
  customer_id = auth.uid() OR
  supervisor_user_id = auth.uid()
);

CREATE POLICY "Farm owners can insert supervisors"
ON supervisors FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Farm owners can update their supervisors"
ON supervisors FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Farm owners can delete their supervisors"
ON supervisors FOR DELETE
USING (customer_id = auth.uid());

-- Supervisor daily tasks RLS: Supervisors can view their own tasks, farm owners can view their supervisors' tasks
CREATE POLICY "Supervisors can view their own tasks"
ON supervisor_daily_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervisors
    WHERE supervisors.id = supervisor_daily_tasks.supervisor_id
    AND supervisors.supervisor_user_id = auth.uid()
  )
);

CREATE POLICY "Farm owners can view their supervisors' tasks"
ON supervisor_daily_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervisors
    WHERE supervisors.id = supervisor_daily_tasks.supervisor_id
    AND supervisors.customer_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can insert their own tasks"
ON supervisor_daily_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM supervisors
    WHERE supervisors.id = supervisor_daily_tasks.supervisor_id
    AND supervisors.supervisor_user_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can update their own tasks"
ON supervisor_daily_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM supervisors
    WHERE supervisors.id = supervisor_daily_tasks.supervisor_id
    AND supervisors.supervisor_user_id = auth.uid()
  )
);

-- Function to automatically mark missed tasks at 10:00 AM IST
CREATE OR REPLACE FUNCTION mark_missed_supervisor_tasks()
RETURNS VOID AS $$
BEGIN
  -- Mark pending tasks as missed if it's past 10:00 AM IST for that date
  UPDATE supervisor_daily_tasks
  SET status = 'missed'
  WHERE status = 'pending'
  AND task_date = CURRENT_DATE
  AND (
    -- Convert current time to IST and check if past 10:00 AM
    EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Kolkata') >= 10
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to check for missing checklists and create alerts
CREATE OR REPLACE FUNCTION check_missing_supervisor_checklists()
RETURNS VOID AS $$
DECLARE
  supervisor_record RECORD;
  alert_text_hi TEXT;
  alert_text_en TEXT;
BEGIN
  -- For each supervisor with no completed health checklist today
  FOR supervisor_record IN
    SELECT 
      s.id,
      s.customer_id,
      s.name,
      s.phone
    FROM supervisors s
    WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM supervisor_daily_tasks t
      WHERE t.supervisor_id = s.id
      AND t.task_date = CURRENT_DATE
      AND t.task_type = 'health_checklist'
      AND t.status = 'completed'
    )
  LOOP
    -- Create alert for farm owner
    alert_text_hi := '⚠ सुपरवाइज़र ' || supervisor_record.name || ' ने आज की हेल्थ चेकलिस्ट नहीं भरी';
    alert_text_en := '⚠ Supervisor ' || supervisor_record.name || ' has not submitted today''s health checklist';
    
    INSERT INTO alerts (type, severity, title_hi, body_hi, district, issued_at, expires_at, is_active)
    VALUES (
      'supervisor_checklist_missing'::alert_type,
      'MEDIUM'::alert_severity,
      alert_text_hi,
      alert_text_en,
      'all', -- This will be filtered by customer_id in application logic
      NOW(),
      NOW() + INTERVAL '24 hours',
      true
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
