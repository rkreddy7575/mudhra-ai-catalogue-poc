// ============================================================
// API request/response types
// ============================================================

import type { Product, Enquiry, EnquiryStatus, Channel } from './database';

// ---- Pagination ----
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ---- Products ----
export interface ProductSearchParams extends PaginationParams {
  query?: string;
  category?: string;
  active?: boolean;
  dataStatus?: string;
}

export interface ProductListResponse extends PaginatedResponse<Product> {}

// ---- Categories (derived from products table) ----
export interface CategoryInfo {
  name: string;
  slug: string;
  productCount: number;
  description?: string;
}

// ---- Enquiries ----
export interface EnquiryCreateRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCompany?: string;
  customerCity?: string;
  productCode?: string;
  productId?: string;
  quantity?: number;
  brandingRequired?: boolean;
  brandingNotes?: string;
  deliveryLocation?: string;
  notes?: string;
  channel?: Channel;
}

export interface EnquiryUpdateRequest {
  status?: EnquiryStatus;
  notes?: string;
}

export interface EnquiryListParams extends PaginationParams {
  status?: EnquiryStatus;
}

// ---- Chat ----
export interface ChatRequest {
  conversationId?: string;
  message: string;
  channel?: string;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  products?: Product[];
  suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
  type: 'view_product' | 'enquire' | 'browse_category' | 'contact_sales';
  label: string;
  data?: Record<string, string>;
}

// ---- Import ----
export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  code?: string;
  message: string;
}

// ---- API Error ----
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
