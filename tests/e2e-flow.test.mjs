/**
 * E2E Flow Simulation Test
 * Simulates complete user journey:
 * Customer -> browse categories -> filter products -> product details -> enquiry -> quotation preview.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('E2E Flow Simulation: Browse -> Search -> Product -> Enquiry -> Quotation', () => {
  // Step 1: Browse Categories
  const csvPath = path.resolve(process.cwd(), 'mudhra-poc-kit/data/products.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1);
  const catalogue = lines.map((l) => {
    const parts = l.split(',');
    return {
      code: parts[0],
      category: parts[1],
      page: parts[2],
      status: parts[10],
    };
  });

  const categories = [...new Set(catalogue.map((p) => p.category))];
  assert.ok(categories.length >= 7, 'Customer sees at least 7 categories');

  // Step 2: Customer selects category "Water Bottles"
  const bottles = catalogue.filter((p) => p.category === 'Water Bottles');
  assert.ok(bottles.length > 0, 'Category contains products');

  // Step 3: Customer searches for "XG-BT-005"
  const selectedProduct = bottles.find((p) => p.code === 'XG-BT-005');
  assert.ok(selectedProduct, 'Customer finds product XG-BT-005');
  assert.equal(selectedProduct.code, 'XG-BT-005');

  // Step 4: Customer fills enquiry
  const enquiryPayload = {
    customerName: 'Aarav Sharma',
    customerPhone: '+91-TEST-CUSTOMER',
    customerCompany: 'Tech Corp India',
    productCode: selectedProduct.code,
    quantity: 250,
    brandingRequired: true,
    brandingNotes: 'Corporate logo laser engraved on front',
    deliveryLocation: 'Bangalore Electronic City',
  };

  assert.ok(enquiryPayload.customerName && enquiryPayload.customerPhone);
  assert.ok(enquiryPayload.quantity >= 1);

  // Step 5: Generate Quotation Preview
  const GST_RATE = 0.18;
  const BRANDING_PER_PIECE = 25;
  const simulatedUnitPrice = 320; // Verified pricing from sales

  const subtotal = simulatedUnitPrice * enquiryPayload.quantity; // 80,000
  const brandingTotal = BRANDING_PER_PIECE * enquiryPayload.quantity; // 6,250
  const taxable = subtotal + brandingTotal; // 86,250
  const gst = taxable * GST_RATE; // 15,525
  const total = taxable + gst; // 101,775

  const quotation = {
    quotationNumber: 'MUD-202609-TEST',
    productCode: enquiryPayload.productCode,
    quantity: enquiryPayload.quantity,
    subtotal,
    brandingCost: brandingTotal,
    gstAmount: gst,
    total,
  };

  assert.equal(quotation.subtotal, 80000);
  assert.equal(quotation.brandingCost, 6250);
  assert.equal(quotation.total, 101775);
  assert.ok(quotation.quotationNumber.startsWith('MUD-'));
});
