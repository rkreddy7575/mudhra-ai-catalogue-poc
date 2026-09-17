import { NextRequest, NextResponse } from 'next/server';
import * as aiService from '@/services/ai.service';

/**
 * POST /api/chat
 * Send a message to the AI sales assistant.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Message is required' },
        { status: 400 }
      );
    }

    const result = await aiService.chat(
      body.conversationId || undefined,
      body.message.trim(),
      body.channel || 'web_poc'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}
