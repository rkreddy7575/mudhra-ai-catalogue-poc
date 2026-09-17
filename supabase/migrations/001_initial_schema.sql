-- Mudhra AI Catalogue PoC — Initial Schema
-- Adapted from mudhra-poc-kit/database/schema.sql with enhancements

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  category      TEXT NOT NULL,
  name          TEXT,
  description   TEXT,
  material      TEXT,
  capacity      TEXT,
  colors        TEXT[] NOT NULL DEFAULT '{}',
  price_inr     NUMERIC(12,2),
  image_path    TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  source_page   INTEGER,
  data_status   TEXT NOT NULL DEFAULT 'needs_review'
                  CHECK (data_status IN ('needs_review', 'verified', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_price_idx    ON products(price_inr);
CREATE INDEX IF NOT EXISTS products_active_idx   ON products(active);
CREATE INDEX IF NOT EXISTS products_code_idx     ON products(code);
CREATE INDEX IF NOT EXISTS products_status_idx   ON products(data_status);

-- Full-text search index
CREATE INDEX IF NOT EXISTS products_fts_idx ON products
  USING GIN (
    to_tsvector('english',
      COALESCE(name, '') || ' ' ||
      COALESCE(description, '') || ' ' ||
      COALESCE(code, '') || ' ' ||
      COALESCE(category, '') || ' ' ||
      COALESCE(material, '')
    )
  );

-- ============================================================
-- Customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL UNIQUE,
  name        TEXT,
  email       TEXT,
  company     TEXT,
  city        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Enquiries
-- ============================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID REFERENCES customers(id),
  product_id        UUID REFERENCES products(id),
  product_code      TEXT,
  quantity          INTEGER,
  branding_required BOOLEAN,
  branding_notes    TEXT,
  delivery_location TEXT,
  status            TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'contacted', 'quoted', 'closed', 'cancelled')),
  channel           TEXT NOT NULL DEFAULT 'web'
                      CHECK (channel IN ('web', 'whatsapp', 'email')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiries_status_idx     ON enquiries(status);
CREATE INDEX IF NOT EXISTS enquiries_customer_idx    ON enquiries(customer_id);
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx  ON enquiries(created_at DESC);

-- ============================================================
-- Conversations (chat sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  channel     TEXT NOT NULL DEFAULT 'web_poc',
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'closed', 'escalated')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction        TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type     TEXT NOT NULL DEFAULT 'text',
  content          TEXT NOT NULL,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx   ON messages(created_at);

-- ============================================================
-- Quotations
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id        UUID REFERENCES enquiries(id),
  quotation_number  TEXT NOT NULL UNIQUE,
  subtotal_inr      NUMERIC(12,2),
  branding_inr      NUMERIC(12,2),
  gst_inr           NUMERIC(12,2),
  total_inr         NUMERIC(12,2),
  pdf_path          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Updated-at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_enquiries_updated_at
  BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
