/**
 * Enquiry Service
 * 
 * Channel-agnostic business logic for enquiries and customer management.
 * Handles the flow: product → quantity → branding → company → delivery → contact.
 */

import { getServiceClient } from '@/lib/supabase/server';
import { calculateQuotation, saveQuotation } from './quotation.service';
import type {
  Customer,
  Enquiry,
  EnquiryStatus,
  EnquiryCreateRequest,
  EnquiryListParams,
  PaginatedResponse,
} from '@/types';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Get or create a customer by phone number.
 */
export async function getOrCreateCustomer(
  phone: string,
  name?: string,
  email?: string,
  company?: string,
  city?: string
): Promise<Customer> {
  const supabase = getServiceClient();

  // Try to find existing customer
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (existing) {
    // Update if new info provided
    const updates: Record<string, string> = {};
    if (name && !existing.name) updates.name = name;
    if (email && !existing.email) updates.email = email;
    if (company && !existing.company) updates.company = company;
    if (city && !existing.city) updates.city = city;

    if (Object.keys(updates).length > 0) {
      const { data: updated, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update customer: ${error.message}`);
      return updated as Customer;
    }

    return existing as Customer;
  }

  // Create new customer
  const { data: created, error } = await supabase
    .from('customers')
    .insert({ phone, name, email, company, city })
    .select()
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);
  return created as Customer;
}

/**
 * Create a new enquiry.
 */
export async function createEnquiry(
  request: EnquiryCreateRequest
): Promise<Enquiry> {
  const supabase = getServiceClient();

  // Get or create customer
  const customer = await getOrCreateCustomer(
    request.customerPhone,
    request.customerName,
    request.customerEmail,
    request.customerCompany,
    request.customerCity
  );

  // Look up product by code if provided
  let productId = request.productId || null;
  if (!productId && request.productCode) {
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('code', request.productCode)
      .single();
    if (product) productId = product.id;
  }

  const { data, error } = await supabase
    .from('enquiries')
    .insert({
      customer_id: customer.id,
      product_id: productId,
      product_code: request.productCode || null,
      quantity: request.quantity || null,
      branding_required: request.brandingRequired || null,
      branding_notes: request.brandingNotes || null,
      delivery_location: request.deliveryLocation || null,
      channel: request.channel || 'web',
      notes: request.notes || null,
    })
    .select('*, customer:customers(*), product:products(*)')
    .single();

  if (error) throw new Error(`Failed to create enquiry: ${error.message}`);
  const enquiry = data as Enquiry;

  // Generate and save quotation breakdown linked to enquiry
  try {
    const productPrice = enquiry.product?.price_inr ?? null;
    const calc = calculateQuotation({
      productCode: enquiry.product_code || enquiry.product?.code || 'PROD',
      productName: enquiry.product?.name,
      category: enquiry.product?.category,
      unitPrice: productPrice,
      quantity: request.quantity || 100,
      brandingRequired: !!request.brandingRequired,
      brandingType: request.brandingNotes ? 'logo_printing' : 'none',
      useDemoPricing: true,
    });
    const savedQuote = await saveQuotation(enquiry.id, calc);
    if (savedQuote) {
      enquiry.quotation = savedQuote;
    }
  } catch (qErr) {
    console.warn('Could not auto-generate quotation record:', qErr);
  }

  return enquiry;
}

/**
 * Get paginated enquiries (admin).
 */
export async function getEnquiries(
  params: EnquiryListParams = {}
): Promise<PaginatedResponse<Enquiry>> {
  const supabase = getServiceClient();
  const page = params.page || 1;
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('enquiries')
    .select('*, customer:customers(*), product:products(*), quotation:quotations(*)', { count: 'exact' });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(`Failed to fetch enquiries: ${error.message}`);

  const total = count || 0;
  return {
    data: (data as Enquiry[]) || [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Update enquiry status.
 */
export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
  notes?: string
): Promise<Enquiry> {
  const supabase = getServiceClient();

  const updates: Record<string, unknown> = { status };
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('enquiries')
    .update(updates)
    .eq('id', id)
    .select('*, customer:customers(*), product:products(*)')
    .single();

  if (error) throw new Error(`Failed to update enquiry: ${error.message}`);
  return data as Enquiry;
}

/**
 * Get enquiry stats for admin dashboard.
 */
export async function getEnquiryStats(): Promise<Record<EnquiryStatus, number>> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('enquiries')
    .select('status');

  if (error) throw new Error(`Failed to fetch enquiry stats: ${error.message}`);

  const stats: Record<string, number> = {
    new: 0,
    contacted: 0,
    quoted: 0,
    closed: 0,
    cancelled: 0,
  };

  (data || []).forEach((row: { status: string }) => {
    stats[row.status] = (stats[row.status] || 0) + 1;
  });

  return stats as Record<EnquiryStatus, number>;
}
