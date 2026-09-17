# WhatsApp Bot Integration Guide (Mudhra PoC)

This document explains how the **Mudhra AI WhatsApp Sales Agent** operates and how to connect it for free.

---

## 1. How It Works

1. A customer sends a message on WhatsApp.
2. The message arrives at our Next.js webhook endpoint: `POST /api/whatsapp`.
3. The server:
   - Identifies or creates a `Customer` record in Supabase based on the sender's phone number.
   - Finds or resumes the `Conversation` session on the `whatsapp` channel.
   - Invokes the **Gemini AI Sales Agent** (`src/services/ai.service.ts`).
   - The AI accesses the 299 catalogue products, answers questions, checks materials/capacities, and generates demo quotations.
4. The AI's response is formatted and dispatched back to the customer's WhatsApp.

---

## 2. Supported Free Tiers

### A. Meta WhatsApp Cloud API (Recommended)
- **Cost:** 1,000 free service conversations every month.
- **Setup in Meta Developer Portal:**
  1. Go to [developers.facebook.com](https://developers.facebook.com) and create a Business App.
  2. Add **WhatsApp** product.
  3. Under **API Setup**, you get a temporary access token and a Test Phone Number ID.
  4. Under **Configuration > Webhook**:
     - Callback URL: `https://your-public-url/api/whatsapp`
     - Verify Token: `mudhra_poc_whatsapp_verify_token` (matching `.env`)
     - Subscribe to the `messages` field.
  5. Add to `.env.local`:
     ```env
     WHATSAPP_CLOUD_API_TOKEN=your-token
     WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
     WHATSAPP_VERIFY_TOKEN=mudhra_poc_whatsapp_verify_token
     ```

### B. Twilio WhatsApp Sandbox
- **Cost:** Free developer sandbox.
- **Setup:**
  1. Create a free account at [twilio.com](https://www.twilio.com).
  2. Under **Messaging > Try WhatsApp**, join the sandbox (e.g. text `join <sandbox-code>` to `+1 415 523 8886`).
  3. Set the Sandbox Webhook URL to `https://your-public-url/api/whatsapp` (HTTP POST).
  4. Add to `.env.local`:
     ```env
     TWILIO_ACCOUNT_SID=your-account-sid
     TWILIO_AUTH_TOKEN=your-auth-token
     TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
     ```

### C. Local Simulation Mode (Already Active)
- You can test any message right now without any credentials by making a POST request:
  ```bash
  curl -X POST http://localhost:3000/api/whatsapp \
    -H "Content-Type: application/json" \
    -d '{"phone": "919876543210", "message": "Show me water bottles with logo printing"}'
  ```
