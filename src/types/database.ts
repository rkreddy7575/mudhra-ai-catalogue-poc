// ============================================================
// Database types — mirrors Supabase schema exactly
// ============================================================

export type DataStatus =
  | 'VERIFIED_FROM_CATALOGUE'
  | 'NEEDS_MANUAL_REVIEW'
  | 'NOT_AVAILABLE'
  | 'needs_review'
  | 'verified'
  | 'archived';
export type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'closed' | 'cancelled';
export type Channel = 'web' | 'whatsapp' | 'email';
export type ConversationStatus = 'active' | 'closed' | 'escalated';
export type MessageDirection = 'inbound' | 'outbound';

// ---- Products ----
export interface Product {
  id: string;
  code: string;
  category: string;
  name: string | null;
  description: string | null;
  material: string | null;
  capacity: string | null;
  colors: string[];
  price_inr: number | null;
  image_path: string | null;
  active: boolean;
  source_page: number | null;
  data_status: DataStatus;
  created_at: string;
  updated_at: string;
}

// ---- Customers ----
export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  company: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Enquiries ----
export interface Enquiry {
  id: string;
  customer_id: string | null;
  product_id: string | null;
  product_code: string | null;
  quantity: number | null;
  branding_required: boolean | null;
  branding_notes: string | null;
  delivery_location: string | null;
  status: EnquiryStatus;
  channel: Channel;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (optional)
  customer?: Customer;
  product?: Product;
  quotation?: Quotation;
}

// ---- Conversations ----
export interface Conversation {
  id: string;
  customer_id: string | null;
  channel: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  // Joined
  messages?: Message[];
  customer?: Customer;
}

// ---- Messages ----
export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  message_type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---- Quotations ----
export interface Quotation {
  id: string;
  enquiry_id: string | null;
  quotation_number: string;
  subtotal_inr: number | null;
  branding_inr: number | null;
  gst_inr: number | null;
  total_inr: number | null;
  pdf_path: string | null;
  created_at: string;
  // Extended Quotation Architecture fields (Migration 004)
  quote_type?: 'commercial' | 'demo_poc' | 'provisional';
  product_code?: string | null;
  product_name?: string | null;
  quantity?: number | null;
  unit_price_inr?: number | null;
  branding_type?: string | null;
  gst_rate?: number | null;
  validity_days?: number | null;
  is_demo?: boolean | null;
  notes?: string | null;
  disclaimer?: string | null;
}

