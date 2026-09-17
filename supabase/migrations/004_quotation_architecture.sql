-- ============================================================
-- Migration 004: Quotation Architecture & Demo Pricing Support
-- ============================================================
-- Non-destructive update to the quotations table to support:
-- 1. Product code & name snapshot
-- 2. Quantity & unit price
-- 3. Branding type & cost
-- 4. Configurable GST rate & validity
-- 5. Distinction between commercial, demo_poc, and provisional enquiry
-- 6. Preserves all existing records and does NOT modify products table
-- ============================================================

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS quote_type TEXT DEFAULT 'provisional',
  ADD COLUMN IF NOT EXISTS product_code TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER,
  ADD COLUMN IF NOT EXISTS unit_price_inr NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS branding_type TEXT,
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS disclaimer TEXT;

-- Create index for quick lookup by quotation_number and quote_type
CREATE INDEX IF NOT EXISTS quotations_quote_type_idx ON quotations(quote_type);
CREATE INDEX IF NOT EXISTS quotations_is_demo_idx ON quotations(is_demo);
