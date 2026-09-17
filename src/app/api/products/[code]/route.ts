import { NextRequest, NextResponse } from 'next/server';
import * as productService from '@/services/product.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[code]
 * Get a single product by its product code.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const product = await productService.getProductByCode(params.code);

    if (!product) {
      return NextResponse.json(
        { error: 'Not Found', message: `Product ${params.code} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`GET /api/products/${params.code} error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
