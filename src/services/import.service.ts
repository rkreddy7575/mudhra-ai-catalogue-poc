/**
 * Import Service
 * 
 * Handles bulk import of product data from CSV.
 * Adapted from mudhra-poc-kit/scripts/import-products.ts
 * with validation via Zod.
 */

import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/server';
import type { ImportResult, ImportError } from '@/types';

// ============================================================
// CSV row validation schema
// ============================================================
const ProductRowSchema = z.object({
  code: z
    .string()
    .min(1, 'Product code is required')
    .regex(/^XG-[A-Z]{2,3}-\d{3}$/, 'Invalid product code format (expected XG-XX-000)'),
  category: z.string().min(1, 'Category is required'),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  capacity: z.string().nullable().optional(),
  colors: z.array(z.string()).optional().default([]),
  price_inr: z.number().nullable().optional(),
  image_path: z.string().nullable().optional(),
  source_page: z.number().nullable().optional(),
  data_status: z
    .enum(['needs_review', 'verified', 'archived'])
    .optional()
    .default('needs_review'),
});

type ProductRow = z.infer<typeof ProductRowSchema>;

// ============================================================
// CSV parser (adapted from kit)
// ============================================================
function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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

// ============================================================
// CSV to product row converter
// ============================================================
function csvToProducts(csvContent: string): {
  products: ProductRow[];
  errors: ImportError[];
} {
  const rows = parseCsv(csvContent);
  if (rows.length < 2) {
    return { products: [], errors: [{ row: 0, message: 'CSV is empty or has no data rows' }] };
  }

  const [header, ...data] = rows;
  const ix: Record<string, number> = {};
  header.forEach((h, i) => (ix[h.trim()] = i));

  const products: ProductRow[] = [];
  const errors: ImportError[] = [];

  data.forEach((r, rowIndex) => {
    try {
      const raw = {
        code: r[ix.code]?.trim() || '',
        category: r[ix.category]?.trim() || '',
        name: r[ix.name]?.trim() || null,
        description: r[ix.description]?.trim() || null,
        material: r[ix.material]?.trim() || null,
        capacity: r[ix.capacity]?.trim() || null,
        colors: (r[ix.colors] || '')
          .split('|')
          .map((s: string) => s.trim())
          .filter(Boolean),
        price_inr: r[ix.price_inr] ? Number(r[ix.price_inr]) : null,
        image_path: r[ix.image_path]?.trim() || null,
        source_page: r[ix.source_page] ? Number(r[ix.source_page]) : null,
        data_status:
          r[ix.data_status]?.trim() === 'catalogue_ocr'
            ? 'needs_review'
            : (r[ix.data_status]?.trim() as 'needs_review' | 'verified' | 'archived') || 'needs_review',
      };

      const validated = ProductRowSchema.parse(raw);
      products.push(validated);
    } catch (err) {
      const code = r[ix.code]?.trim();
      if (err instanceof z.ZodError) {
        errors.push({
          row: rowIndex + 2, // 1-indexed, skip header
          code,
          message: err.errors.map((e) => e.message).join('; '),
        });
      } else {
        errors.push({
          row: rowIndex + 2,
          code,
          message: String(err),
        });
      }
    }
  });

  return { products, errors };
}

// ============================================================
// Import into Supabase
// ============================================================
export async function importFromCsv(csvContent: string): Promise<ImportResult> {
  const { products, errors } = csvToProducts(csvContent);

  if (products.length === 0) {
    return {
      total: 0,
      imported: 0,
      skipped: errors.length,
      errors,
    };
  }

  const supabase = getServiceClient();

  // Upsert in batches of 100
  const BATCH_SIZE = 100;
  let imported = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('products')
      .upsert(
        batch.map((p) => ({
          code: p.code,
          category: p.category,
          name: p.name || null,
          description: p.description || null,
          material: p.material || null,
          capacity: p.capacity || null,
          colors: p.colors || [],
          price_inr: p.price_inr ?? null,
          image_path: p.image_path || null,
          source_page: p.source_page ?? null,
          data_status: p.data_status || 'needs_review',
        })),
        { onConflict: 'code' }
      );

    if (error) {
      errors.push({
        row: i + 2,
        message: `Batch insert failed: ${error.message}`,
      });
    } else {
      imported += batch.length;
    }
  }

  return {
    total: products.length + errors.length,
    imported,
    skipped: errors.length,
    errors,
  };
}

/**
 * Validate a single product row (for preview before import).
 */
export function validateRow(
  row: Record<string, unknown>
): { valid: boolean; errors?: string[] } {
  const result = ProductRowSchema.safeParse(row);
  if (result.success) return { valid: true };
  return {
    valid: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
}
