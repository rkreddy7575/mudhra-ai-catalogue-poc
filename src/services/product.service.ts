/**
 * Product Service
 * 
 * Channel-agnostic business logic for product operations.
 * Used by both web UI and future WhatsApp adapter.
 */

import { getServiceClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import type { Product, CategoryInfo, ProductSearchParams, PaginatedResponse } from '@/types';

const DEFAULT_PAGE_SIZE = 24;

/**
 * Get paginated products with optional filters.
 */
export async function getProducts(
  params: ProductSearchParams = {}
): Promise<PaginatedResponse<Product>> {
  const supabase = getServiceClient();
  const page = params.page || 1;
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Filters
  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.active !== undefined) {
    query = query.eq('active', params.active);
  }
  if (params.dataStatus) {
    query = query.eq('data_status', params.dataStatus);
  }

  // Full-text search
  if (params.query) {
    const searchTerms = params.query.trim().split(/\s+/).join(' & ');
    query = query.or(
      `code.ilike.%${params.query}%,name.ilike.%${params.query}%,category.ilike.%${params.query}%,description.ilike.%${params.query}%`
    );
  }

  // Pagination
  query = query
    .order('category', { ascending: true })
    .order('code', { ascending: true })
    .range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);

  const total = count || 0;
  return {
    data: (data as Product[]) || [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single product by its code (e.g., XG-BT-001).
 */
export async function getProductByCode(code: string): Promise<Product | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Get a single product by its UUID.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Search products by natural language query.
 * Uses ILIKE for flexibility since many products lack names/descriptions.
 */
export async function searchProducts(
  query: string,
  limit: number = 10
): Promise<Product[]> {
  const supabase = getServiceClient();
  const searchTerm = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .or(
      `code.ilike.${searchTerm},name.ilike.${searchTerm},category.ilike.${searchTerm},description.ilike.${searchTerm},material.ilike.${searchTerm}`
    )
    .order('category')
    .order('code')
    .limit(limit);

  if (error) throw new Error(`Search failed: ${error.message}`);

  return (data as Product[]) || [];
}

/**
 * Get all unique categories with product counts.
 * Derived from the products table (no separate categories table).
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('active', true);

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

  // Count products per category
  const counts: Record<string, number> = {};
  (data || []).forEach((row: { category: string }) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, productCount]) => ({
      name,
      slug: slugify(name),
      productCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get products in a specific category.
 */
export async function getProductsByCategory(
  category: string,
  params: ProductSearchParams = {}
): Promise<PaginatedResponse<Product>> {
  return getProducts({ ...params, category });
}

/**
 * Get related products (same category, different product).
 */
export async function getRelatedProducts(
  product: Product,
  limit: number = 6
): Promise<Product[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('active', true)
    .neq('id', product.id)
    .limit(limit);

  if (error) throw new Error(`Failed to fetch related products: ${error.message}`);

  return (data as Product[]) || [];
}
