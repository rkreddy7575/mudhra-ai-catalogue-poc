-- ============================================================
-- Migration 003: Update product data_status check constraint
-- Supports V2 catalogue enrichment statuses:
--   - VERIFIED_FROM_CATALOGUE
--   - NEEDS_MANUAL_REVIEW
--   - NOT_AVAILABLE
-- ============================================================

-- Phase 1: Expand constraint to allow new V2 statuses while preserving legacy values during import
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_data_status_check;

ALTER TABLE products ADD CONSTRAINT products_data_status_check
  CHECK (data_status IN (
    'VERIFIED_FROM_CATALOGUE',
    'NEEDS_MANUAL_REVIEW',
    'NOT_AVAILABLE',
    'needs_review',
    'verified',
    'archived'
  ));

-- Phase 2: Tighten constraint after V2 import completes (run after all 299 rows are updated)
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_data_status_check;
-- ALTER TABLE products ADD CONSTRAINT products_data_status_check
--   CHECK (data_status IN (
--     'VERIFIED_FROM_CATALOGUE',
--     'NEEDS_MANUAL_REVIEW',
--     'NOT_AVAILABLE'
--   ));
