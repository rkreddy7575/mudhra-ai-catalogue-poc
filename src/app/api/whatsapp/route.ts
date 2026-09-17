import { NextRequest, NextResponse } from 'next/server';
import { handleInboundWhatsAppMessage, type WhatsAppInboundMessage } from '@/services/whatsapp.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/whatsapp
 * Meta WhatsApp Cloud API Webhook Verification Endpoint.
 * Meta calls this when setting up the webhook in Facebook Developers console.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mudhra_poc_whatsapp_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WHATSAPP WEBHOOK] Verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { status: 'ok', service: 'Mudhra WhatsApp Webhook', configured: true },
    { status: 200 }
  );
}

/**
 * POST /api/whatsapp
 * Handles incoming WhatsApp messages from:
 * 1. Meta WhatsApp Cloud API
 * 2. Twilio WhatsApp Webhooks
 * 3. Direct JSON simulation / test payload
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // A. Twilio Webhook (application/x-www-form-urlencoded)
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const from = String(formData.get('From') || '').replace('whatsapp:', '');
      const body = String(formData.get('Body') || '').trim();
      const messageSid = String(formData.get('MessageSid') || `tw_${Date.now()}`);

      if (!body) {
        return new NextResponse(
          '<Response></Response>',
          { headers: { 'Content-Type': 'text/xml' } }
        );
      }

      const inboundMsg: WhatsAppInboundMessage = {
        from,
        senderName: String(formData.get('ProfileName') || 'WhatsApp Customer'),
        messageId: messageSid,
        text: body,
        provider: 'twilio',
      };

      const { reply } = await handleInboundWhatsAppMessage(inboundMsg);

      // Return TwiML response
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>
        <Body>${escapeXml(reply)}</Body>
    </Message>
</Response>`;

      return new NextResponse(twiml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
        status: 200,
      });
    }

    // B. Meta WhatsApp Cloud API or Direct JSON (application/json)
    const jsonBody = await request.json();

    // 1. Meta Cloud API Payload format
    if (jsonBody.object === 'whatsapp_business_account') {
      const entry = jsonBody.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (!message || message.type !== 'text') {
        // Acknowledge read receipts or status updates
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
      }

      const senderPhone = message.from;
      const text = message.text?.body || '';
      const senderName = change?.contacts?.[0]?.profile?.name || 'Customer';

      const inboundMsg: WhatsAppInboundMessage = {
        from: senderPhone,
        senderName,
        messageId: message.id,
        text,
        provider: 'meta',
      };

      await handleInboundWhatsAppMessage(inboundMsg);
      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    // 2. Direct Simulation / Test Endpoint format: { phone: "91...", message: "..." }
    const testPhone = jsonBody.phone || jsonBody.from || '919876543210';
    const testMessage = jsonBody.message || jsonBody.text;

    if (!testMessage || typeof testMessage !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing message or text field' },
        { status: 400 }
      );
    }

    const inboundMsg: WhatsAppInboundMessage = {
      from: String(testPhone),
      senderName: jsonBody.senderName || 'PoC Tester',
      messageId: `sim_${Date.now()}`,
      text: testMessage.trim(),
      provider: 'simulator',
    };

    const result = await handleInboundWhatsAppMessage(inboundMsg);

    return NextResponse.json({
      status: 'success',
      inbound: {
        from: inboundMsg.from,
        text: inboundMsg.text,
      },
      outbound: {
        reply: result.reply,
        conversationId: result.conversationId,
        sendResult: result.sendResult,
      },
    });
  } catch (error) {
    console.error('POST /api/whatsapp error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) },
      { status: 500 }
    );
  }
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
