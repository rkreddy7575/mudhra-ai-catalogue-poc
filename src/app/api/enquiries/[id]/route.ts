import { NextRequest, NextResponse } from 'next/server';
import * as enquiryService from '@/services/enquiry.service';

/**
 * PATCH /api/enquiries/[id]
 * Update enquiry status (admin).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Status is required' },
        { status: 400 }
      );
    }

    const enquiry = await enquiryService.updateEnquiryStatus(
      params.id,
      body.status,
      body.notes
    );

    return NextResponse.json(enquiry);
  } catch (error) {
    console.error(`PATCH /api/enquiries/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
