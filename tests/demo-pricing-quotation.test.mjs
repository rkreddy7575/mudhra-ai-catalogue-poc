/**
 * Comprehensive Quotation Engine & Demo Pricing Test Suite
 * 
 * Verifies:
 * 1. Same product twice -> same demo price (deterministic)
 * 2. Different products -> deterministic prices across all categories
 * 3. Range bounds per category
 * 4. Sensible price rounding (9s and 49/99s)
 * 5. Quantities: correct multiplication & totals
 * 6. Branding rates (none: ₹0, logo_printing: ₹10, engraving: ₹15, premium: ₹20)
 * 7. Input validation (positive quantity, non-negative rates, NaN prevention)
 * 8. Provisional enquiry fallback when demo mode disabled
 * 9. Production database integrity: all 299 products remain price_inr = NULL
 * 10. Demo prices never written to products table
 * 11. Existing enquiries remain intact
 * 12. AI calculate_demo_quotation tool returns proper format and PoC disclaimer
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

// Import configuration and service logic
import { DEMO_PRICING_CONFIG } from '../src/config/demo-pricing.config.ts';
import {
  getDemoProductPrice,
  calculateDemoBrandingCost,
  getDemoGstRate,
} from '../src/services/demo-pricing.service.ts';
import {
  calculateQuotation,
  generateQuotationNumber,
} from '../src/services/quotation.service.ts';

// Supabase client for production integrity validation
const supabase = createClient(
  'https://fxeagojjsxmnyxmbicmp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ------------------------------------------------------------
// Test 1: Deterministic Pricing for Same Product
// ------------------------------------------------------------
test('Demo Pricing: Same product code produces identical price across multiple calls', () => {
  const run1 = getDemoProductPrice('XG-BT-001', 'Water Bottles');
  const run2 = getDemoProductPrice('XG-BT-001', 'Water Bottles');
  const run3 = getDemoProductPrice('xg-bt-001', 'Water Bottles'); // Case-insensitive

  assert.equal(run1.demoUnitPrice, run2.demoUnitPrice);
  assert.equal(run1.demoUnitPrice, run3.demoUnitPrice);
  assert.equal(run1.isDemo, true);
  assert.match(run1.disclaimer, /sample\/demo prices/i);
});

// ------------------------------------------------------------
// Test 2: Category Ranges & Slabs
// ------------------------------------------------------------
test('Demo Pricing: Products across all categories stay within configured bounds', () => {
  const categorySamples = [
    { code: 'XG-BT-001', category: 'Water Bottles', min: 150, max: 900 },
    { code: 'XG-MG-004', category: 'Mugs', min: 100, max: 600 },
    { code: 'XG-EL-013', category: 'Electronics', min: 300, max: 2500 },
    { code: 'XG-PN-002', category: 'Pens', min: 20, max: 300 },
    { code: 'XG-NB-005', category: 'Notebooks', min: 80, max: 500 },
    { code: 'XG-ID-033', category: 'ID Card Holders', min: 30, max: 250 },
    { code: 'XG-GS-059', category: 'Gift Sets', min: 250, max: 2000 },
  ];

  for (const sample of categorySamples) {
    const result = getDemoProductPrice(sample.code, sample.category);
    assert.ok(
      result.demoUnitPrice >= sample.min,
      `${sample.code} (${result.demoUnitPrice}) below min ${sample.min}`
    );
    assert.ok(
      result.demoUnitPrice <= sample.max,
      `${sample.code} (${result.demoUnitPrice}) above max ${sample.max}`
    );
    // Verify sensible rounding (e.g. ends in 9 or 49/99)
    assert.equal(
      result.demoUnitPrice % 10 === 9,
      true,
      `${sample.code} price ${result.demoUnitPrice} should end in 9 for sensible pricing`
    );
  }
});

// ------------------------------------------------------------
// Test 3: Branding Cost Calculations
// ------------------------------------------------------------
test('Demo Branding: Charges match configured options for different quantities', () => {
  const qty = 100;

  // 1. None
  const none = calculateDemoBrandingCost('none', qty);
  assert.equal(none.ratePerUnit, 0);
  assert.equal(none.totalCost, 0);

  // 2. Logo Printing (₹10/unit)
  const logo = calculateDemoBrandingCost('logo_printing', qty);
  assert.equal(logo.ratePerUnit, 10);
  assert.equal(logo.totalCost, 1000);

  // 3. Laser Engraving (₹15/unit)
  const engraving = calculateDemoBrandingCost('engraving', qty);
  assert.equal(engraving.ratePerUnit, 15);
  assert.equal(engraving.totalCost, 1500);

  // 4. Premium (₹20/unit)
  const premium = calculateDemoBrandingCost('premium', qty);
  assert.equal(premium.ratePerUnit, 20);
  assert.equal(premium.totalCost, 2000);
});

// ------------------------------------------------------------
// Test 4: PoC Demo Quotation Breakdown & Math
// ------------------------------------------------------------
test('Quotation Engine: PoC demo quotation calculates subtotal, branding, GST, and total accurately', () => {
  const quote = calculateQuotation({
    productCode: 'XG-BT-001',
    productName: 'Stainless Steel Water Bottle 750ml',
    category: 'Water Bottles',
    quantity: 100,
    brandingType: 'logo_printing',
    useDemoPricing: true,
  });

  assert.equal(quote.quoteType, 'demo_poc');
  assert.equal(quote.isDemo, true);
  assert.equal(quote.isCommercialFinal, false);
  assert.equal(quote.status, 'demo');
  assert.equal(quote.quantity, 100);
  assert.ok(quote.unitPrice > 0);

  const expectedSubtotal = Math.round(quote.unitPrice * 100 * 100) / 100;
  assert.equal(quote.subtotal, expectedSubtotal);

  const expectedBrandingCost = 10 * 100; // ₹1000
  assert.equal(quote.brandingCost, expectedBrandingCost);

  const taxableAmount = expectedSubtotal + expectedBrandingCost;
  const expectedGst = Math.round(taxableAmount * 0.18 * 100) / 100;
  assert.equal(quote.gstAmount, expectedGst);

  const expectedTotal = Math.round((taxableAmount + expectedGst) * 100) / 100;
  assert.equal(quote.total, expectedTotal);

  assert.match(quote.notes, /POC DEMO QUOTATION/i);
  assert.match(quote.disclaimer, /sample\/demo prices/i);
});

// ------------------------------------------------------------
// Test 5: Multiple Quantities
// ------------------------------------------------------------
test('Quotation Engine: Calculates proportional totals for varying order volumes', () => {
  const quantities = [50, 100, 250, 500, 1000];

  for (const qty of quantities) {
    const quote = calculateQuotation({
      productCode: 'XG-GS-059',
      category: 'Gift Sets',
      quantity: qty,
      brandingType: 'engraving',
      useDemoPricing: true,
    });

    assert.equal(quote.quantity, qty);
    assert.equal(quote.brandingCost, 15 * qty);
    assert.equal(quote.subtotal, Math.round(quote.unitPrice * qty * 100) / 100);
    const taxable = quote.subtotal + quote.brandingCost;
    assert.equal(quote.gstAmount, Math.round(taxable * 0.18 * 100) / 100);
    assert.equal(quote.total, Math.round((taxable + quote.gstAmount) * 100) / 100);
  }
});

// ------------------------------------------------------------
// Test 6: Input Validation (Invalid Quantity & Rates)
// ------------------------------------------------------------
test('Quotation Engine: Strict input validation rejects invalid inputs', () => {
  // Negative quantity
  assert.throws(
    () => calculateQuotation({ productCode: 'XG-BT-001', quantity: -5 }),
    /Invalid quantity/i
  );

  // Zero quantity
  assert.throws(
    () => calculateQuotation({ productCode: 'XG-BT-001', quantity: 0 }),
    /Invalid quantity/i
  );

  // NaN quantity
  assert.throws(
    () => calculateQuotation({ productCode: 'XG-BT-001', quantity: NaN }),
    /Invalid quantity/i
  );

  // Negative unit price
  assert.throws(
    () => calculateQuotation({ productCode: 'XG-BT-001', quantity: 100, unitPrice: -50 }),
    /Invalid unit price/i
  );

  // Negative branding cost
  assert.throws(
    () =>
      calculateQuotation({
        productCode: 'XG-BT-001',
        quantity: 100,
        unitPrice: 200,
        confirmedBrandingCost: -10,
      }),
    /Invalid branding cost/i
  );
});

// ------------------------------------------------------------
// Test 7: Provisional Enquiry Acknowledgement (when demo pricing is disabled)
// ------------------------------------------------------------
test('Quotation Engine: Falls back to provisional enquiry when price is null and demo mode off', () => {
  const quote = calculateQuotation({
    productCode: 'XG-BT-001',
    quantity: 100,
    unitPrice: null,
    useDemoPricing: false,
  });

  assert.equal(quote.quoteType, 'provisional_enquiry');
  assert.equal(quote.status, 'provisional');
  assert.equal(quote.isCommercialFinal, false);
  assert.equal(quote.isDemo, false);
  assert.equal(quote.unitPrice, null);
  assert.equal(quote.subtotal, null);
  assert.equal(quote.brandingCost, null);
  assert.equal(quote.gstAmount, null);
  assert.equal(quote.total, null);
  assert.match(quote.notes, /Provisional enquiry acknowledgement/i);
});

// ------------------------------------------------------------
// Test 8: AI Chat Service (Live Gemini with Demo Quotation)
// ------------------------------------------------------------
test('AI Service: Chat endpoint returns formatted demo quote with required PoC disclaimer', async () => {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Can you provide a demo quote for 100 units of XG-BT-001 with logo printing?',
      channel: 'web_poc',
    }),
  });

  assert.equal(res.status, 200, 'Chat API should respond with 200 OK');
  const data = await res.json();
  assert.ok(data.reply, 'Response should contain reply');

  // Verify it contains demo pricing indicators and PoC disclaimer
  assert.match(data.reply, /demo/i, 'AI response must explicitly mention demo pricing');
  assert.match(
    data.reply,
    /not a commercial quote|sample\/demo prices|testing only|demo price/i,
    'AI response must contain PoC demo disclaimer and not present price as official commercial fact'
  );
});

// ------------------------------------------------------------
// Test 9: Production Database Integrity Check (Supabase Live)
// ------------------------------------------------------------
test('Database Integrity: All 299 products have price_inr = NULL; no demo prices in DB', async () => {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, code, price_inr');

  assert.equal(error, null, 'Error querying products from Supabase');
  assert.equal(products.length, 299, 'Total product count must remain exactly 299');

  const unpricedCount = products.filter((p) => p.price_inr === null).length;
  assert.equal(
    unpricedCount,
    299,
    `All 299 products must have price_inr = NULL (found ${unpricedCount})`
  );
});

// ------------------------------------------------------------
// Test 10: Enquiries and Quotations Table Intact
// ------------------------------------------------------------
test('Database Integrity: Existing enquiries and quotations records remain intact', async () => {
  const { data: enquiries, error: eErr } = await supabase
    .from('enquiries')
    .select('id');

  assert.equal(eErr, null);
  assert.ok(enquiries.length >= 4, `Expected at least 4 enquiries intact, found ${enquiries.length}`);

  const { data: quotations, error: qErr } = await supabase
    .from('quotations')
    .select('id, quotation_number');

  assert.equal(qErr, null);
  assert.ok(quotations.length >= 1, `Expected existing quotations intact, found ${quotations.length}`);
});
