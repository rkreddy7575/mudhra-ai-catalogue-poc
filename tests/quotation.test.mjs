/**
 * Unit Tests: Quotation Calculations
 * Verifies strict quotation rules:
 * - Unpriced products return provisional enquiry status with null totals ("Price not available").
 * - Does not invent prices, branding charges, or fake commercial totals.
 * - Quotations are NOT presented as final commercial quotations until all pricing is confirmed.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

export function generateQuotationNumber() {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUD-${yearMonth}-${randomSuffix}`;
}

export function calculateQuotation(params) {
  const quotationNumber = generateQuotationNumber();
  const quantity = Math.max(1, params.quantity || 100);

  if (!params.unitPrice || params.unitPrice <= 0) {
    return {
      quotationNumber,
      unitPrice: null,
      quantity,
      subtotal: null,
      brandingCost: null,
      gstAmount: null,
      total: null,
      isCommercialFinal: false,
      status: 'provisional',
      notes: 'Provisional enquiry acknowledgement. Official commercial quotation will be confirmed by Mudhra sales team.',
    };
  }

  const subtotal = Math.round(params.unitPrice * quantity * 100) / 100;
  const brandingCost = params.confirmedBrandingCost ?? null;

  if (params.brandingRequired && brandingCost === null) {
    return {
      quotationNumber,
      unitPrice: params.unitPrice,
      quantity,
      subtotal,
      brandingCost: null,
      gstAmount: null,
      total: null,
      isCommercialFinal: false,
      status: 'provisional',
      notes: 'Base product rate confirmed. Final quotation pending branding technique review.',
    };
  }

  const actualBranding = brandingCost || 0;
  const taxableAmount = subtotal + actualBranding;
  const gstAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
  const total = Math.round((taxableAmount + gstAmount) * 100) / 100;

  return {
    quotationNumber,
    unitPrice: params.unitPrice,
    quantity,
    subtotal,
    brandingCost: actualBranding,
    gstAmount,
    total,
    isCommercialFinal: true,
    status: 'confirmed',
    notes: 'Commercial quotation confirmed by Mudhra sales team. Valid for 15 days.',
  };
}

test('Quotation Calculation: Unpriced product returns provisional status with null totals', () => {
  const quote = calculateQuotation({
    unitPrice: null,
    quantity: 150,
    brandingRequired: true,
  });

  assert.equal(quote.isCommercialFinal, false);
  assert.equal(quote.status, 'provisional');
  assert.equal(quote.unitPrice, null);
  assert.equal(quote.subtotal, null);
  assert.equal(quote.brandingCost, null);
  assert.equal(quote.gstAmount, null);
  assert.equal(quote.total, null);
  assert.equal(quote.quantity, 150);
  assert.match(quote.quotationNumber, /^MUD-\d{6}-[A-Z0-9]{4}$/);
});

test('Quotation Calculation: Priced product with unconfirmed branding remains provisional', () => {
  const quote = calculateQuotation({
    unitPrice: 250,
    quantity: 100,
    brandingRequired: true,
    confirmedBrandingCost: null,
  });

  assert.equal(quote.isCommercialFinal, false);
  assert.equal(quote.status, 'provisional');
  assert.equal(quote.subtotal, 25000);
  assert.equal(quote.brandingCost, null);
  assert.equal(quote.total, null); // Cannot be final commercial total without confirmed branding
});

test('Quotation Calculation: Fully confirmed pricing generates confirmed commercial quotation', () => {
  const quote = calculateQuotation({
    unitPrice: 500,
    quantity: 50,
    brandingRequired: false,
  });

  assert.equal(quote.isCommercialFinal, true);
  assert.equal(quote.status, 'confirmed');
  assert.equal(quote.brandingCost, 0);
  assert.equal(quote.subtotal, 25000);
  assert.equal(quote.gstAmount, 4500);
  assert.equal(quote.total, 29500);
});
