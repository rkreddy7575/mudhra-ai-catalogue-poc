import { NextRequest, NextResponse } from 'next/server';
import * as productService from '@/services/product.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * List products with optional search, category filter, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await productService.getProducts({
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      active: searchParams.get('active') !== 'false',
      dataStatus: searchParams.get('dataStatus') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '24', 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
