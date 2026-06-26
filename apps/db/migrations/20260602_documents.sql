-- FlockIQ Gap Remediation - Document Library
-- Migration: 20260602_documents.sql
-- Description: Creates documents and document_audit_log tables for farm document management
-- Requirements: REQ-GAP7-DOC-001 through REQ-GAP7-DOC-005
-- Task: TASK-GAP7-DB-001

CREATE TABLE IF NOT EXISTS documents (
  doc_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id      UUID REFERENCES batches(id) ON DELETE SET NULL, -- NULL = farm-level doc
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  doc_name      TEXT NOT NULL,
  doc_type      TEXT NOT NULL CHECK (doc_type IN (
    'chick_invoice','feed_invoice','vaccination_cert','medicine_bill',
    'movement_permit','sale_invoice','lab_report','insurance','batch_closure_report','other'
  )),
  file_path     TEXT NOT NULL,  -- Supabase Storage path
  file_size_bytes BIGINT,
  file_ext      TEXT CHECK (file_ext IN ('pdf','jpg','jpeg','png','heif','heic')),
  document_date DATE,
  tags          TEXT[],
  notes         TEXT,
  uploaded_by   UUID REFERENCES customers(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ  -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_docs_farm_batch ON documents(farm_id, batch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_docs_integrator ON documents(integrator_id) WHERE deleted_at IS NULL;

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON documents FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_audit_log (
  log_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id        UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
  farm_id       UUID NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('upload','download','preview','rename','delete')),
  performed_by  UUID REFERENCES customers(id),
  performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS write block — inserts from service role via API
ALTER TABLE document_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own audit log" ON document_audit_log FOR SELECT
  USING (
    farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()::TEXT)
  );
