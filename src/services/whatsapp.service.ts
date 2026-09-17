/**
 * WhatsApp Integration Service
 * 
 * Supports two free tiers for PoC:
 * 1. Meta WhatsApp Cloud API (Free tier: 1,000 free conversations/month)
 * 2. Twilio WhatsApp Sandbox (Free development sandbox)
 * 3. Local Mock Testing mode (for testing without external credentials)
 */

import * as conversationService from './conversation.service';
import * as aiService from './ai.service';

export interface WhatsAppInboundMessage {
  from: string; // e.g. "919876543210"
  senderName?: string;
  messageId: string;
  text: string;
  timestamp?: string;
  provider: 'meta' | 'twilio' | 'simulator';
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
}

/**
 * Handle incoming WhatsApp message:
 * 1. Resolves/creates customer by phone number
 * 2. Finds/creates active WhatsApp conversation
 * 3. Dispatches message to Gemini AI sales agent
 * 4. Sends reply back to customer via WhatsApp
 */
export async function handleInboundWhatsAppMessage(
  msg: WhatsAppInboundMessage
): Promise<{ reply: string; conversationId: string; sendResult: WhatsAppSendResult }> {
  // 1. Get or create customer by phone
  const customer = await conversationService.getOrCreateCustomerByPhone(
    msg.from,
    msg.senderName
  );

  // 2. Find active WhatsApp conversation or create new
  let conversation = await conversationService.findActiveWhatsAppConversation(customer.id);
  const conversationId = conversation ? conversation.id : undefined;

  // 3. Dispatch to AI Sales Agent
  const aiResponse = await aiService.chat(
    conversationId,
    msg.text,
    'whatsapp',
    customer.id
  );

  // 4. Send outbound reply via configured provider (skip for twilio inbound since it replies via TwiML XML)
  let sendResult: WhatsAppSendResult = { success: true, recipient: msg.from };
  if (msg.provider !== 'twilio') {
    sendResult = await sendWhatsAppMessage(msg.from, aiResponse.reply);
  }

  return {
    reply: aiResponse.reply,
    conversationId: aiResponse.conversationId,
    sendResult,
  };
}

/**
 * Outbound WhatsApp message dispatcher
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<WhatsAppSendResult> {
  const cleanTo = to.replace(/[^0-9]/g, '');

  // 1. Check if Meta WhatsApp Cloud API is configured
  const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${metaToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'text',
            text: { preview_url: false, body },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          recipient: cleanTo,
          error: data?.error?.message || 'Meta WhatsApp API request failed',
        };
      }

      return {
        success: true,
        recipient: cleanTo,
        messageId: data?.messages?.[0]?.id,
      };
    } catch (err) {
      return {
        success: false,
        recipient: cleanTo,
        error: String(err),
      };
    }
  }

  // 2. Check if Twilio WhatsApp Sandbox is configured
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (twilioSid && twilioAuthToken) {
    try {
      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      params.append('To', cleanTo.startsWith('whatsapp:') ? cleanTo : `whatsapp:+${cleanTo}`);
      params.append('Body', body);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          recipient: cleanTo,
          error: data?.message || 'Twilio WhatsApp API request failed',
        };
      }

      return {
        success: true,
        recipient: cleanTo,
        messageId: data?.sid,
      };
    } catch (err) {
      return {
        success: false,
        recipient: cleanTo,
        error: String(err),
      };
    }
  }

  // 3. Fallback: PoC Simulation Mode (Logged to console, completely free for testing)
  console.log(`[WHATSAPP SIMULATION] Outbound message to ${cleanTo}:\n${body}`);
  return {
    success: true,
    recipient: cleanTo,
    messageId: `sim_${Date.now()}`,
  };
}
