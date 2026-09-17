import { NextRequest, NextResponse } from 'next/server';
import { importFromCsv } from '@/services/import.service';

/**
 * POST /api/import
 * Bulk import products from CSV.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'CSV file is required' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const result = await importFromCsv(csvContent);

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/import error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
