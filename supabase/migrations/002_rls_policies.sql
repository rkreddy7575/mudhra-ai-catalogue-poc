-- Mudhra AI Catalogue PoC — Row Level Security Policies
-- Run after 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Products: public read for active products
-- ============================================================
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products are manageable by service role"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Customers: service role only
-- ============================================================
CREATE POLICY "Customers are manageable by service role"
  ON customers FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Enquiries: anyone can insert, service role manages
-- ============================================================
CREATE POLICY "Anyone can create enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enquiries are viewable by service role"
  ON enquiries FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Enquiries are manageable by service role"
  ON enquiries FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================================
-- Conversations: service role only
-- ============================================================
CREATE POLICY "Conversations are manageable by service role"
  ON conversations FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Messages: service role only
-- ============================================================
CREATE POLICY "Messages are manageable by service role"
  ON messages FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Quotations: service role only
-- ============================================================
CREATE POLICY "Quotations are manageable by service role"
  ON quotations FOR ALL
  USING (auth.role() = 'service_role');
