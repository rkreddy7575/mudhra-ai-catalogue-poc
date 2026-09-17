import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const systemPrompt = `You are the Mudhra Branding Solutions corporate gifting sales executive assistant.

ROLE & TONE:
- Be a helpful, consultative corporate gifting sales executive.
- Keep responses concise, warm, professional, and natural, perfectly suited for WhatsApp conversations.
- Avoid repetitive generic disclaimers in every message. Only mention provisional pricing confirmation when commercially relevant (e.g. when discussing quotes or pricing).

CORE BUSINESS RULES — NEVER VIOLATE:
1. NEVER invent, estimate, or guess prices, stock availability, MOQs, discounts, delivery dates, or specifications.
2. NEVER claim a product is 'premium', 'budget', 'best', 'under ₹500', etc. unless the database explicitly provides and verifies that data.
3. BUDGET INQUIRIES WHEN PRICES ARE NULL:
   If a customer gives a target budget (e.g., 'under ₹500') but product prices are null/unavailable in the database, clearly and honestly explain that prices are not currently in the system so you cannot confirm which items fall under that budget. Offer to shortlist relevant products from the catalogue and raise an enquiry for their quantity so the sales team can confirm pricing.
4. PRODUCT COMPARISON:
   When comparing products, list ALL available verified fields from the database (Product Code, Category, Source Page, Status). For any missing field (Material, Capacity, Colors, Price), explicitly state that it is not yet extracted in the catalogue database, rather than making vague statements.
5. CONTEXT RETENTION & PROGRESSIVE QUALIFICATION:
   - Maintain conversation context across turns: category, products discussed, quantity, budget, branding needs, company name, delivery location, contact details.
   - When quantity is provided, retain it for the rest of the conversation. Never re-ask for quantity unless the customer updates it.
   - If the customer says 'this', 'that one', 'the first one', resolve it from the products listed in previous messages.
   - Do NOT ask for company name, delivery location, or contact details during initial product discovery. First help the customer explore and shortlist products.
   - Qualify progressively: Category/use case -> Approximate quantity -> Budget -> Preferred product -> Branding requirements.
   - Only ask for company name, delivery location, and contact details when the customer indicates they want to proceed with an enquiry, quote, or order.
   - When a customer says 'I need gifts for employees', don't ask for a product code! Ask a helpful qualifying question (e.g. headcount, budget, or preferred gift type) and recommend popular categories.`;

async function testDialogue() {
  const chat = ai.chats.create({
    model: 'gemini-3.5-flash-lite',
    config: {
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: [
          {
            name: 'search_products',
            description: 'Search catalogue products',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: { type: Type.STRING },
                category: { type: Type.STRING },
                limit: { type: Type.NUMBER }
              },
              required: ['query']
            }
          }
        ]
      }]
    }
  });

  // Turn 1
  console.log('Customer: I need gifts for employees.');
  const r1 = await chat.sendMessage({ message: 'I need gifts for employees.' });
  console.log('Assistant:\n', r1.text);

  // Turn 2
  console.log('\nCustomer: I need 100 gift sets under ₹500.');
  let r2 = await chat.sendMessage({ message: 'I need 100 gift sets under ₹500.' });
  if (r2.functionCalls && r2.functionCalls.length > 0) {
    console.log('Tool call:', r2.functionCalls[0].name, r2.functionCalls[0].args);
    r2 = await chat.sendMessage({
      message: [{
        functionResponse: {
          name: r2.functionCalls[0].name,
          response: {
            result: 'Found 3 products in Gift Sets:\n1. Code: XG-GS-037 | Category: Gift Sets | Page: 40 | Price: Price not available\n2. Code: XG-GS-059 | Category: Gift Sets | Page: 41 | Price: Price not available\n3. Code: XG-GS-061 | Category: Gift Sets | Page: 41 | Price: Price not available'
          }
        }
      }]
    });
  }
  console.log('Assistant:\n', r2.text);

  // Turn 3
  console.log('\nCustomer: I like the first one. Send an enquiry for 200.');
  let r3 = await chat.sendMessage({ message: 'I like the first one. Send an enquiry for 200.' });
  if (r3.functionCalls && r3.functionCalls.length > 0) {
    console.log('Turn 3 Tool call:', r3.functionCalls[0].name, r3.functionCalls[0].args);
    r3 = await chat.sendMessage({
      message: [{
        functionResponse: {
          name: r3.functionCalls[0].name,
          response: {
            result: 'Product Code: XG-GS-037 | Category: Gift Sets | Page: 40 | Price: Price not available'
          }
        }
      }]
    });
  }
  console.log('Assistant:\n', r3.text);
}

testDialogue().catch(console.error);
