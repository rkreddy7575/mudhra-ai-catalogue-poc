import { NextResponse } from 'next/server';
import * as productService from '@/services/product.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/categories
 * List all product categories with counts.
 */
export async function GET() {
  try {
    const categories = await productService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
