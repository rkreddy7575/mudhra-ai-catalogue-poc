/**
 * Quotation Service
 * 
 * Handles quotation request generation, pricing calculations, and preview.
 * Strictly adheres to Mudhra Branding Solutions catalogue rules:
 * - Real catalogue price_inr remains NULL in the database.
 * - Distinguishes clearly between:
 *   1. Commercial Quotation (official confirmed prices)
 *   2. PoC Demo Quotation (deterministic sample pricing for testing)
 *   3. Provisional Enquiry Acknowledgement (unpriced enquiry acknowledgement)
 * - Never presents demo/provisional figures as confirmed commercial facts.
 */

import { getServiceClient } from '../lib/supabase/server';
import type { Quotation } from '@/types/database';
import { DEMO_PRICING_CONFIG } from '../config/demo-pricing.config';
import {
  getDemoProductPrice,
  calculateDemoBrandingCost,
  getDemoGstRate,
} from './demo-pricing.service';

export type QuoteType = 'commercial' | 'demo_poc' | 'provisional_enquiry';

export interface QuotationCalculation {
  quotationNumber: string;
  quoteType: QuoteType;
  productCode: string;
  productName: string | null;
  category: string | null;
  quantity: number;
  unitPrice: number | null;
  subtotal: number | null;
  brandingType: string;
  brandingRatePerUnit: number;
  brandingCost: number | null;
  gstRate: number;
  gstAmount: number | null;
  total: number | null;
  isCommercialFinal: boolean;
  isDemo: boolean;
  validityDays: number;
  status: 'provisional' | 'confirmed' | 'demo';
  notes: string;
  disclaimer: string | null;
}

export interface CalculateQuotationParams {
  productCode?: string;
  productName?: string | null;
  category?: string | null;
  quantity: number;
  unitPrice?: number | null;
  brandingRequired?: boolean;
  brandingType?: string;
  confirmedBrandingCost?: number | null;
  gstRate?: number;
  useDemoPricing?: boolean;
  validityDays?: number;
}

/**
 * Generate a unique quotation reference number.
 * Format: MUD-YYYYMM-XXXX
 */
export function generateQuotationNumber(): string {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUD-${yearMonth}-${randomSuffix}`;
}

/**
 * Calculate quotation breakdown with strict business logic & validation.
 */
export function calculateQuotation(params: CalculateQuotationParams): QuotationCalculation {
  const quotationNumber = generateQuotationNumber();
  const productCode = (params.productCode || 'PROD-PENDING').trim().toUpperCase();
  const productName = params.productName ?? null;
  const category = params.category ?? null;
  const validityDays = params.validityDays ?? DEMO_PRICING_CONFIG.validityDays;

  // 1. Validation: Quantity must be positive integer
  if (
    params.quantity === undefined ||
    params.quantity === null ||
    !Number.isFinite(params.quantity) ||
    params.quantity <= 0
  ) {
    throw new Error(
      `Invalid quantity: ${params.quantity}. Quantity must be a positive number greater than 0.`
    );
  }
  const quantity = Math.floor(params.quantity);

  // 2. Validation: Unit Price cannot be negative or NaN if provided
  if (
    params.unitPrice !== undefined &&
    params.unitPrice !== null &&
    (!Number.isFinite(params.unitPrice) || params.unitPrice < 0)
  ) {
    throw new Error(
      `Invalid unit price: ${params.unitPrice}. Unit price must be a non-negative number or null.`
    );
  }

  // 3. Validation: Confirmed branding cost cannot be negative or NaN if provided
  if (
    params.confirmedBrandingCost !== undefined &&
    params.confirmedBrandingCost !== null &&
    (!Number.isFinite(params.confirmedBrandingCost) || params.confirmedBrandingCost < 0)
  ) {
    throw new Error(
      `Invalid branding cost: ${params.confirmedBrandingCost}. Branding cost must be non-negative or null.`
    );
  }

  // 4. Configurable GST rate
  const configuredGstRate =
    params.gstRate !== undefined && Number.isFinite(params.gstRate) && params.gstRate >= 0
      ? params.gstRate
      : getDemoGstRate();

  const brandingType = params.brandingType || (params.brandingRequired ? 'logo_printing' : 'none');

  // ============================================================
  // CASE A: Confirmed Commercial Price available (Admin entered)
  // ============================================================
  if (params.unitPrice && params.unitPrice > 0) {
    const subtotal = Math.round(params.unitPrice * quantity * 100) / 100;
    const brandingCost = params.confirmedBrandingCost ?? null;

    // If branding is required but not yet priced by sales team
    if (params.brandingRequired && brandingCost === null) {
      return {
        quotationNumber,
        quoteType: 'provisional_enquiry',
        productCode,
        productName,
        category,
        quantity,
        unitPrice: params.unitPrice,
        subtotal,
        brandingType,
        brandingRatePerUnit: 0,
        brandingCost: null,
        gstRate: configuredGstRate,
        gstAmount: null,
        total: null,
        isCommercialFinal: false,
        isDemo: false,
        validityDays,
        status: 'provisional',
        notes:
          'Base product rate confirmed. Final quotation pending branding technique review (screen printing / laser engraving / embossing).',
        disclaimer: null,
      };
    }

    // Fully confirmed commercial quotation
    const actualBranding = brandingCost ?? 0;
    const brandingRatePerUnit = quantity > 0 ? Math.round((actualBranding / quantity) * 100) / 100 : 0;
    const taxableAmount = subtotal + actualBranding;
    const gstAmount = Math.round(taxableAmount * configuredGstRate * 100) / 100;
    const total = Math.round((taxableAmount + gstAmount) * 100) / 100;

    return {
      quotationNumber,
      quoteType: 'commercial',
      productCode,
      productName,
      category,
      quantity,
      unitPrice: params.unitPrice,
      subtotal,
      brandingType,
      brandingRatePerUnit,
      brandingCost: actualBranding,
      gstRate: configuredGstRate,
      gstAmount,
      total,
      isCommercialFinal: true,
      isDemo: false,
      validityDays,
      status: 'confirmed',
      notes: `Commercial quotation confirmed by Mudhra sales team. Valid for ${validityDays} days.`,
      disclaimer: null,
    };
  }

  // ============================================================
  // CASE B: Demo / PoC Quotation Mode (Deterministic Mock Pricing)
  // ============================================================
  if (params.useDemoPricing) {
    const demoProductResult = getDemoProductPrice(productCode, category);
    const demoUnitPrice = demoProductResult.demoUnitPrice;
    const demoBrandingResult = calculateDemoBrandingCost(brandingType, quantity);

    const subtotal = Math.round(demoUnitPrice * quantity * 100) / 100;
    const brandingCost = demoBrandingResult.totalCost;
    const taxableAmount = subtotal + brandingCost;
    const gstAmount = Math.round(taxableAmount * configuredGstRate * 100) / 100;
    const total = Math.round((taxableAmount + gstAmount) * 100) / 100;

    return {
      quotationNumber,
      quoteType: 'demo_poc',
      productCode,
      productName,
      category: demoProductResult.category,
      quantity,
      unitPrice: demoUnitPrice,
      subtotal,
      brandingType,
      brandingRatePerUnit: demoBrandingResult.ratePerUnit,
      brandingCost,
      gstRate: configuredGstRate,
      gstAmount,
      total,
      isCommercialFinal: false,
      isDemo: true,
      validityDays,
      status: 'demo',
      notes: `${DEMO_PRICING_CONFIG.disclaimers.title}. ${DEMO_PRICING_CONFIG.disclaimers.notice}`,
      disclaimer: DEMO_PRICING_CONFIG.disclaimers.notice,
    };
  }

  // ============================================================
  // CASE C: Provisional Enquiry Acknowledgement (No price available)
  // ============================================================
  return {
    quotationNumber,
    quoteType: 'provisional_enquiry',
    productCode,
    productName,
    category,
    quantity,
    unitPrice: null,
    subtotal: null,
    brandingType,
    brandingRatePerUnit: 0,
    brandingCost: null,
    gstRate: configuredGstRate,
    gstAmount: null,
    total: null,
    isCommercialFinal: false,
    isDemo: false,
    validityDays,
    status: 'provisional',
    notes:
      'Provisional enquiry acknowledgement. Official commercial quotation will be confirmed by Mudhra sales team based on order volume and custom branding requirements.',
    disclaimer: null,
  };
}

/**
 * Save quotation record linked to an enquiry in Supabase.
 * Gracefully handles both standard schema and extended migration 004 schema.
 */
export async function saveQuotation(
  enquiryId: string,
  calculation: QuotationCalculation
): Promise<Quotation | null> {
  const supabase = getServiceClient();

  const fullPayload: Record<string, unknown> = {
    enquiry_id: enquiryId,
    quotation_number: calculation.quotationNumber,
    subtotal_inr: calculation.subtotal,
    branding_inr: calculation.brandingCost,
    gst_inr: calculation.gstAmount,
    total_inr: calculation.total,
    quote_type: calculation.quoteType,
    product_code: calculation.productCode,
    product_name: calculation.productName,
    quantity: calculation.quantity,
    unit_price_inr: calculation.unitPrice,
    branding_type: calculation.brandingType,
    gst_rate: calculation.gstRate,
    validity_days: calculation.validityDays,
    is_demo: calculation.isDemo,
    notes: calculation.notes,
    disclaimer: calculation.disclaimer,
  };

  // Attempt insert with extended fields
  const { data, error } = await supabase
    .from('quotations')
    .insert(fullPayload)
    .select()
    .single();

  if (!error) {
    return data as Quotation;
  }

  // Fallback to basic columns if migration 004 has not yet been applied
  console.warn('Extended quotation insert failed, retrying with base columns:', error.message);
  const basePayload = {
    enquiry_id: enquiryId,
    quotation_number: calculation.quotationNumber,
    subtotal_inr: calculation.subtotal,
    branding_inr: calculation.brandingCost,
    gst_inr: calculation.gstAmount,
    total_inr: calculation.total,
  };

  const { data: baseData, error: baseErr } = await supabase
    .from('quotations')
    .insert(basePayload)
    .select()
    .single();

  if (baseErr) {
    console.error('Failed to save quotation with base columns:', baseErr);
    return null;
  }

  return baseData as Quotation;
}

/**
 * Retrieve quotation by enquiry ID.
 */
export async function getQuotationByEnquiryId(enquiryId: string): Promise<Quotation | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('enquiry_id', enquiryId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch quotation: ${error.message}`);
  }

  return data as Quotation;
}
