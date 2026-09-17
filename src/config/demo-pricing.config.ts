/**
 * Demo Pricing Configuration (PoC Only)
 * 
 * IMPORTANT:
 * - These are NOT real Mudhra Branding Solutions prices.
 * - These values exist solely for proof-of-concept testing and quotation simulations.
 * - Production catalogue price_inr remains NULL.
 */

export interface CategoryPriceRange {
  min: number;
  max: number;
}

export interface BrandingChargeOption {
  id: string;
  name: string;
  ratePerUnit: number;
  description: string;
}

export const DEMO_PRICING_CONFIG = {
  // Flag indicating demo pricing mode is active for PoC
  enabled: true,

  // Configurable GST rate (18% standard for corporate gifts in India)
  gstRate: 0.18,

  // Quotation validity in days
  validityDays: 15,

  // Standard category price ranges (INR)
  categoryRanges: {
    'Water Bottles': { min: 150, max: 900 },
    'Mugs': { min: 100, max: 600 },
    'Electronics': { min: 300, max: 2500 },
    'Pens': { min: 20, max: 300 },
    'Notebooks': { min: 80, max: 500 },
    'ID Card Holders': { min: 30, max: 250 },
    'Gift Sets': { min: 250, max: 2000 },
    'Default': { min: 100, max: 1000 },
  } as Record<string, CategoryPriceRange>,

  // Branding charge options (INR per unit)
  brandingCharges: {
    'none': {
      id: 'none',
      name: 'No Branding (Plain Stock)',
      ratePerUnit: 0,
      description: 'Standard product supplied without custom branding',
    },
    'logo_printing': {
      id: 'logo_printing',
      name: 'Logo Printing',
      ratePerUnit: 10,
      description: 'Standard single/multi-color screen printing or pad printing',
    },
    'engraving': {
      id: 'engraving',
      name: 'Laser Engraving',
      ratePerUnit: 15,
      description: 'Precision fiber laser engraving for metal and wood finishes',
    },
    'premium': {
      id: 'premium',
      name: 'Premium Branding',
      ratePerUnit: 20,
      description: 'UV 3D printing, foil stamping, or debossing',
    },
  } as Record<string, BrandingChargeOption>,

  // Mandatory disclaimers for all customer-facing views and AI quotes
  disclaimers: {
    title: 'POC DEMO QUOTATION — NOT A COMMERCIAL QUOTE',
    notice:
      'Prices shown are sample/demo prices for testing only and are not official Mudhra Branding Solutions prices.',
    aiNotice:
      '⚠️ This is a demo quotation for PoC testing only, not a commercial quote.',
  },
};
