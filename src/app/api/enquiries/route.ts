import { NextRequest, NextResponse } from 'next/server';
import * as enquiryService from '@/services/enquiry.service';
import type { EnquiryCreateRequest } from '@/types';

/**
 * GET /api/enquiries
 * List enquiries (admin).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await enquiryService.getEnquiries({
      status: (searchParams.get('status') as 'new' | 'contacted' | 'quoted' | 'closed' | 'cancelled') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enquiries
 * Create a new enquiry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EnquiryCreateRequest;

    // Basic validation
    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    const enquiry = await enquiryService.createEnquiry(body);
    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    console.error('POST /api/enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
