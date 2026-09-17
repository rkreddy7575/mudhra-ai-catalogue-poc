/**
 * Demo Pricing Service (PoC Only)
 * 
 * Provides deterministic, reproducible mock pricing for catalogue products.
 * Strictly decoupled from production catalogue data — price_inr remains NULL in database.
 */

import { DEMO_PRICING_CONFIG, type CategoryPriceRange, type BrandingChargeOption } from '../config/demo-pricing.config';

/**
 * Deterministic string hash function.
 * Always produces identical integer for the same string input.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Map product code prefix to default category if not explicitly provided.
 */
function getCategoryFromCode(code: string): string {
  const upper = code.toUpperCase();
  if (upper.includes('-BT-') || upper.startsWith('BT')) return 'Water Bottles';
  if (upper.includes('-MG-') || upper.startsWith('MG')) return 'Mugs';
  if (upper.includes('-EL-') || upper.startsWith('EL')) return 'Electronics';
  if (upper.includes('-PN-') || upper.includes('-PE-') || upper.startsWith('PN')) return 'Pens';
  if (upper.includes('-NB-') || upper.startsWith('NB')) return 'Notebooks';
  if (upper.includes('-ID-') || upper.startsWith('ID')) return 'ID Card Holders';
  if (upper.includes('-GS-') || upper.startsWith('GS')) return 'Gift Sets';
  return 'Default';
}

/**
 * Round a raw price to standard retail pricing ending in 9 or 49/99.
 * Examples: 29, 49, 99, 149, 199, 249, 299, 349, 399, 449, 499, 549, 799, 1299, 1999
 */
function roundToSensiblePrice(rawPrice: number, min: number, max: number): number {
  let price: number;

  if (rawPrice < 100) {
    // Round to nearest 10, minus 1 (e.g. 29, 49, 79, 99)
    price = Math.round(rawPrice / 10) * 10 - 1;
  } else if (rawPrice < 1000) {
    // Round to nearest 50, minus 1 (e.g. 149, 199, 249, 299, 349, 399, 449, 499)
    price = Math.round(rawPrice / 50) * 50 - 1;
  } else {
    // Round to nearest 100, minus 1 (e.g. 1099, 1199, 1499, 1999, 2499)
    price = Math.round(rawPrice / 100) * 100 - 1;
  }

  // Clamp within category bounds
  if (price < min) {
    price = min < 100 ? min : Math.ceil(min / 50) * 50 - 1;
  }
  if (price > max) {
    price = max < 100 ? max : Math.floor(max / 50) * 50 - 1;
  }

  return price;
}

export interface DemoProductPriceResult {
  productCode: string;
  category: string;
  demoUnitPrice: number;
  isDemo: true;
  disclaimer: string;
}

/**
 * Get deterministic demo price for a product code.
 * Guaranteed to return the exact same price for the same product code every time.
 */
export function getDemoProductPrice(
  productCode: string,
  category?: string | null
): DemoProductPriceResult {
  const normalizedCode = (productCode || '').trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error('Product code is required to compute demo price');
  }

  const resolvedCategory = category && DEMO_PRICING_CONFIG.categoryRanges[category]
    ? category
    : getCategoryFromCode(normalizedCode);

  const range: CategoryPriceRange =
    DEMO_PRICING_CONFIG.categoryRanges[resolvedCategory] ||
    DEMO_PRICING_CONFIG.categoryRanges['Default'];

  // Generate deterministic ratio [0, 1) using product code
  const hash = hashString(normalizedCode);
  const ratio = (hash % 1000) / 1000;

  const rawPrice = range.min + ratio * (range.max - range.min);
  const demoUnitPrice = roundToSensiblePrice(rawPrice, range.min, range.max);

  return {
    productCode: normalizedCode,
    category: resolvedCategory,
    demoUnitPrice,
    isDemo: true,
    disclaimer: DEMO_PRICING_CONFIG.disclaimers.notice,
  };
}

/**
 * Get demo branding charge option.
 */
export function getDemoBrandingOption(brandingType?: string | null): BrandingChargeOption {
  const type = (brandingType || 'none').toLowerCase();
  return (
    DEMO_PRICING_CONFIG.brandingCharges[type] ||
    DEMO_PRICING_CONFIG.brandingCharges['none']
  );
}

/**
 * Calculate demo branding total cost for a quantity.
 */
export function calculateDemoBrandingCost(
  brandingType: string | undefined | null,
  quantity: number
): { ratePerUnit: number; totalCost: number; brandingName: string } {
  const option = getDemoBrandingOption(brandingType);
  const safeQty = Math.max(0, quantity || 0);
  const totalCost = Math.round(option.ratePerUnit * safeQty * 100) / 100;

  return {
    ratePerUnit: option.ratePerUnit,
    totalCost,
    brandingName: option.name,
  };
}

/**
 * Get the current demo GST rate.
 */
export function getDemoGstRate(): number {
  return DEMO_PRICING_CONFIG.gstRate;
}
