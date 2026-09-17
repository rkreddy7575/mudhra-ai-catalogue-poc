create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  category text not null,
  name text,
  description text,
  material text,
  capacity text,
  colors text[] not null default '{}',
  price_inr numeric(12,2),
  image_path text,
  active boolean not null default true,
  source_page integer,
  source_code text,
  raw_excerpt text,
  data_status text not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category);
create index if not exists products_price_idx on products(price_inr);
create index if not exists products_active_idx on products(active);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  company text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  product_id uuid references products(id),
  quantity integer,
  branding_required boolean,
  branding_notes text,
  delivery_location text,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  channel text not null default 'web_poc',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  message_type text not null default 'text',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references enquiries(id),
  quotation_number text not null unique,
  subtotal_inr numeric(12,2),
  branding_inr numeric(12,2),
  gst_inr numeric(12,2),
  total_inr numeric(12,2),
  pdf_path text,
  created_at timestamptz not null default now()
);
