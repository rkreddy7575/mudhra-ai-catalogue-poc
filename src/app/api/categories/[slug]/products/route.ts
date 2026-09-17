import { NextRequest, NextResponse } from 'next/server';
import * as productService from '@/services/product.service';
import { unslugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/categories/[slug]/products
 * List products in a specific category.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryName = unslugify(params.slug);

    const result = await productService.getProductsByCategory(categoryName, {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '24', 10),
      query: searchParams.get('query') || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`GET /api/categories/${params.slug}/products error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
