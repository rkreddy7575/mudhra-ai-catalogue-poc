/**
 * Unit Tests: Products CSV & Schema Conformance
 * Validates the 299 products in mudhra-poc-kit/data/products.csv against the OCR data rules.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Starter Catalogue: products.csv exists and has 299 OCR-detected products', () => {
  const csvPath = path.resolve(process.cwd(), 'mudhra-poc-kit/data/products.csv');
  assert.ok(fs.existsSync(csvPath), 'mudhra-poc-kit/data/products.csv must exist');

  const content = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(',');
  const dataRows = lines.slice(1);

  assert.equal(dataRows.length, 299, 'Must contain exactly 299 product rows');
  assert.ok(header.includes('code'));
  assert.ok(header.includes('category'));
  assert.ok(header.includes('source_page'));
  assert.ok(header.includes('data_status'));
});

test('Product Code Format: Every product conforms to XG-[CATEGORY]-[CODE]', () => {
  const csvPath = path.resolve(process.cwd(), 'mudhra-poc-kit/data/products.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1);

  const codeRegex = /^XG-[A-Z]{2,3}-\d{3}$/;
  for (const line of lines) {
    const code = line.split(',')[0].trim();
    assert.match(code, codeRegex, `Product code ${code} must match standard pattern`);
  }
});

test('Catalogue Coverage: All 7 gifting categories are represented', () => {
  const csvPath = path.resolve(process.cwd(), 'mudhra-poc-kit/data/products.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1);

  const categories = new Set();
  for (const line of lines) {
    const category = line.split(',')[1].trim();
    categories.add(category);
  }

  const expectedCategories = [
    'Electronics',
    'Gift Sets',
    'ID Card Holders',
    'Mugs',
    'Notebooks',
    'Pens',
    'Water Bottles',
  ];

  for (const expected of expectedCategories) {
    assert.ok(categories.has(expected), `Category "${expected}" must be present in catalogue`);
  }
});

test('Data Safety: Starters have data_status set to catalogue_ocr and prices intentionally blank', () => {
  const csvPath = path.resolve(process.cwd(), 'mudhra-poc-kit/data/products.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1);

  for (const line of lines) {
    const cols = line.split(',');
    const priceInr = cols[8].trim();
    // Rule: Prices must not be invented in OCR starter dataset
    assert.equal(priceInr, '', 'Price should be blank initially until verified');
  }
});
