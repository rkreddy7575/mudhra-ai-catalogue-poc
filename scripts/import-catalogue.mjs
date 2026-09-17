/**
 * Catalogue Import CLI Script
 * Imports the 299 starter products from mudhra-poc-kit/data/products.csv into Supabase.
 * Loads environment variables from .env.local or .env.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local or .env if present
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !line.trim().startsWith('#')) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value.trim();
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\x1b[31mError:\x1b[0m Supabase credentials missing.');
  console.error('Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n');
  process.exit(1);
}

const csvRelativePath = process.argv[2] || 'mudhra-poc-kit/data/products.csv';
const csvPath = path.resolve(process.cwd(), csvRelativePath);

if (!fs.existsSync(csvPath)) {
  console.error(`\x1b[31mError:\x1b[0m CSV file not found at: ${csvPath}`);
  process.exit(1);
}

const text = fs.readFileSync(csvPath, 'utf8');

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (ch === '"' && quoted && next === '"') {
      cell += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === ',' && !quoted) {
      row.push(cell);
      cell = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(text);
const [header, ...data] = rows;
const ix = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

const products = data.map((r) => ({
  code: r[ix.code]?.trim(),
  category: r[ix.category]?.trim(),
  name: r[ix.name]?.trim() || null,
  description: r[ix.description]?.trim() || null,
  material: r[ix.material]?.trim() || null,
  capacity: r[ix.capacity]?.trim() || null,
  colors: (r[ix.colors] || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean),
  price_inr: r[ix.price_inr] ? Number(r[ix.price_inr]) : null,
  image_path: r[ix.image_path]?.trim() || null,
  source_page: r[ix.source_page] ? Number(r[ix.source_page]) : null,
  data_status: r[ix.data_status]?.trim() === 'catalogue_ocr' ? 'needs_review' : (r[ix.data_status]?.trim() || 'needs_review'),
  active: true,
}));

console.log(`\x1b[36mFound ${products.length} products in CSV.\x1b[0m Upserting into Supabase...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Upsert in batches of 50
const BATCH_SIZE = 50;
let importedCount = 0;

for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const batch = products.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from('products').upsert(batch, { onConflict: 'code' });

  if (error) {
    console.error(`\x1b[31mBatch error at index ${i}:\x1b[0m`, error.message);
    process.exit(1);
  }
  importedCount += batch.length;
  console.log(`  ✓ Imported ${importedCount} / ${products.length} products...`);
}

console.log(`\n\x1b[32mSuccessfully imported ${importedCount} catalogue products into Supabase!\x1b[0m`);
