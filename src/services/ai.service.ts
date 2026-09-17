/**
 * AI Service
 * 
 * Consultative corporate-gifting sales agent powered by Google Gemini (@google/genai).
 * Uses tool calling to query the Supabase product catalogue as single source of truth.
 * NEVER invents product codes, prices, specifications, availability, or MOQs.
 */

import { getAIProvider, type ToolDefinition } from '@/lib/ai-provider';
import { companySettings } from '@/config/company';
import * as productService from './product.service';
import * as conversationService from './conversation.service';
import { getDemoProductPrice } from './demo-pricing.service';
import { calculateQuotation } from './quotation.service';
import type { ChatResponse, SuggestedAction, Product } from '@/types';

// ============================================================
// System prompt generator — incorporates verified business rules
// ============================================================
function getSystemPrompt(): string {
  const contactLines = [
    `COMPANY: ${companySettings.name} — ${companySettings.tagline}`,
  ];
  if (companySettings.phone) {
    contactLines.push(`Contact: ${companySettings.phone}`);
  }
  if (companySettings.email) {
    contactLines.push(`Email: ${companySettings.email}`);
  }
  if (!companySettings.phone && !companySettings.email) {
    contactLines.push(`Contact: via our corporate enquiry desk`);
  }

  return `You are the ${companySettings.name} corporate gifting sales executive assistant.

ROLE & COMMUNICATION STYLE:
- Act like an experienced, consultative corporate gifting sales executive communicating on WhatsApp.
- Keep messages warm, conversational, concise, and structured.
- WHATSAPP FORMATTING RULES:
  * Do NOT clutter messages with dense walls of text or complex nested asterisks.
  * When presenting product options, present them clearly with spacing:
    * Product Name (Code)
    * Specs: Material | Capacity | Colors
    * Demo Price: ₹XXX/unit (PoC)
  * Keep disclaimers short and at the bottom.
- Avoid repetitive generic boilerplate disclaimers in every single response. Mention provisional pricing and branding confirmation only when commercially relevant (such as when discussing quotations, pricing estimates, or placing an enquiry).

CORE BUSINESS RULES — NEVER VIOLATE:

1. ABSOLUTE TRUTH IN PRICING & POC DEMO PRICING:
   - Official catalogue price (price_inr) is currently NULL for all products in the database.
   - For this Proof of Concept (PoC), deterministic DEMO/MOCK PRICING is active.
   - When communicating product prices or answering pricing/budget questions:
     * You MAY quote the demo price for the product, but you MUST explicitly label it as a demo/PoC price.
     * Example: "XG-BT-001 has a demo price of ₹299/unit for this PoC."
     * NEVER say: "The price is ₹299."
     * NEVER claim demo prices are official commercial quotes.
     * If the customer asks for official commercial pricing, explain that official catalogue pricing requires confirmation from our sales team.

2. DEMO QUOTATIONS:
   - When a customer requests a quote, pricing breakdown, or estimated budget, use the calculate_demo_quotation tool.
   - Format the quotation clearly:
     POC Demo Quote
     [Product Code] × [Quantity]
     Demo product price: ₹[UnitPrice] × [Quantity] = ₹[Subtotal]
     Demo branding ([Type]): ₹[BrandingRate] × [Quantity] = ₹[BrandingCost]
     Demo subtotal: ₹[Subtotal + BrandingCost]
     Demo GST (18%): ₹[GST]
     Demo total: ₹[Total]

     ⚠️ This is a demo quotation for PoC testing only, not a commercial quote. Prices shown are sample/demo prices for testing only and are not official Mudhra Branding Solutions prices.

3. NEW DATA STATUS GOVERNANCE:
   The catalogue contains enriched fields: code, name, category, material, capacity, colors, description, source_page, and data_status.

   - VERIFIED_FROM_CATALOGUE:
     * Fields can be presented as verified catalogue facts.
     * Still do NOT invent fields that are NULL/empty. If a field is missing, clearly indicate it is not available.

   - NEEDS_MANUAL_REVIEW:
     * Product may be shown/recommended.
     * Do NOT present questionable fields as confirmed facts.
     * If mentioning an uncertain field, explicitly say it needs confirmation by our sales team.
     * Prefer verified fields from the record.

   - NOT_AVAILABLE:
     * Product/code can still be searched and referenced.
     * Do NOT fabricate specifications.
     * If there are no reliable details, say details are currently unavailable and offer to help with an enquiry.

   - PRODUCT RECOMMENDATIONS:
     * Prefer VERIFIED_FROM_CATALOGUE products when otherwise equally suitable.
     * Never invent price, MOQ, availability, delivery time, discount, GST, branding cost, or stock.

4. PRODUCT DETAILS:
   - Give concise WhatsApp-style answers.
   - Use only verified/enriched fields.
   - Clearly distinguish unavailable information (e.g., "Capacity: Not available in catalogue", "Price: Not available").

5. PRODUCT COMPARISONS:
   - When asked to compare products, call compare_products or get_product_details.
   - Compare ONLY fields that actually exist.
   - Show "Not available" where a field is missing.
   - NEVER infer material, capacity, or specifications from product names or images.

6. PROGRESSIVE SALES QUALIFICATION (NO AGGRESSIVE DATA COLLECTION):
   - First help the customer discover and shortlist products based on their gifting needs.
   - Do NOT ask for company name, delivery location, phone number, or email during initial browsing or casual product discovery.
   - Suggest popular categories (Water Bottles, Mugs, Electronics, Gift Sets, Notebooks) and ask 1 helpful qualifying question.

7. CONTEXT RETENTION & PRONOUN RESOLUTION:
   - Continue resolving references like "this", "that", "the first one", "the second one", "second one" using conversation context.
   - Preserve selected product and quantity across turns. When a quantity is mentioned (e.g. 100 employees / 100 gifts), preserve that quantity across all turns. Never ask for quantity again unless the customer changes it.
   - Preserve branding requirements such as logo printing/engraving.
   - Do not repeatedly ask information already provided.

8. WHEN TO COLLECT ENQUIRY DETAILS:
   - Once product + quantity + clear enquiry intent exist, collect only the remaining information needed (e.g., customer name, company name, delivery location, contact email/phone).
   - Summarize what is already confirmed (product code/name, quantity, branding) before requesting remaining missing fields.

9. STRICT SPECIFICATION BOUNDARIES:
   - Never invent missing specifications.
   - Clearly distinguish unavailable information.

${contactLines.join('\n')}`;
}

// ============================================================
// Tool definitions for function calling
// ============================================================
export const TOOLS: ToolDefinition[] = [
  {
    name: 'search_products',
    description:
      'Search the product catalogue by keyword, category, or product code. Returns matching products with their details.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query — can be a product name, category, material, or product code like XG-EL-001',
        },
        category: {
          type: 'string',
          description: 'Filter by category name (e.g., "Water Bottles", "Mugs", "Electronics", "Gift Sets")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product_details',
    description:
      'Get full details of a specific product by its product code (e.g., XG-EL-001).',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The product code (e.g., XG-EL-001)',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'compare_products',
    description:
      'Compare two or more products side-by-side using verified catalogue fields from the database. Use this whenever the customer asks to compare specific products.',
    parameters: {
      type: 'object',
      properties: {
        codes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of product codes to compare (e.g. ["XG-EL-001", "XG-EL-002"])',
        },
      },
      required: ['codes'],
    },
  },
  {
    name: 'get_categories',
    description: 'List all available product categories with product counts.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'calculate_demo_quotation',
    description:
      'Calculate a PoC demo quotation for a product with quantity and branding type. Returns itemized demo calculation with mandatory PoC disclaimers. NOTE: Figures are mock/demo prices for testing only and NOT official prices.',
    parameters: {
      type: 'object',
      properties: {
        product_code: {
          type: 'string',
          description: 'The product code (e.g., XG-BT-001)',
        },
        quantity: {
          type: 'number',
          description: 'Quantity of items (must be a positive number, e.g. 100)',
        },
        branding_type: {
          type: 'string',
          enum: ['none', 'logo_printing', 'engraving', 'premium'],
          description:
            'Branding method: "none" (₹0/unit demo), "logo_printing" (₹10/unit demo), "engraving" (₹15/unit demo), or "premium" (₹20/unit demo)',
        },
      },
      required: ['product_code', 'quantity'],
    },
  },
];

// ============================================================
// Tool execution against Supabase Catalogue
// ============================================================
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ result: string; products?: Product[] }> {
  switch (name) {
    case 'search_products': {
      const query = (args.query as string) || '';
      const limit = (args.limit as number) || 10;

      let products: Product[];
      if (args.category) {
        const result = await productService.getProducts({
          category: args.category as string,
          active: true,
          pageSize: limit,
        });
        products = result.data;
      } else {
        products = await productService.searchProducts(query, limit);
      }

      if (products.length === 0) {
        return { result: 'No products found matching the search criteria.' };
      }

      // Prefer VERIFIED_FROM_CATALOGUE products over NEEDS_MANUAL_REVIEW and NOT_AVAILABLE
      const statusWeight: Record<string, number> = {
        VERIFIED_FROM_CATALOGUE: 1,
        verified: 1,
        NEEDS_MANUAL_REVIEW: 2,
        needs_review: 2,
        NOT_AVAILABLE: 3,
      };
      products.sort((a, b) => {
        const weightA = statusWeight[a.data_status] || 2;
        const weightB = statusWeight[b.data_status] || 2;
        return weightA - weightB;
      });

      const summary = products.map((p, idx) => {
        const parts = [`${idx + 1}. Code: ${p.code}`, `Category: ${p.category}`];
        if (p.name) parts.push(`Name: ${p.name}`);
        if (p.source_page) parts.push(`Catalogue Page: ${p.source_page}`);
        if (p.material) parts.push(`Material: ${p.material}`);
        if (p.capacity) parts.push(`Capacity: ${p.capacity}`);
        if (p.colors && p.colors.length > 0) parts.push(`Colors: ${p.colors.join(', ')}`);
        if (p.description) parts.push(`Description: ${p.description}`);
        if (p.price_inr !== null && p.price_inr !== undefined) {
          parts.push(`Price: ₹${p.price_inr}`);
        } else {
          parts.push('Price: Not available');
        }
        const demoInfo = getDemoProductPrice(p.code, p.category);
        parts.push(`Demo Price (PoC testing only): ₹${demoInfo.demoUnitPrice}/unit`);

        let statusStr = 'VERIFIED_FROM_CATALOGUE (Verified catalogue facts)';
        if (p.data_status === 'NEEDS_MANUAL_REVIEW' || p.data_status === 'needs_review') {
          statusStr = 'NEEDS_MANUAL_REVIEW (Details need sales team confirmation)';
        } else if (p.data_status === 'NOT_AVAILABLE') {
          statusStr = 'NOT_AVAILABLE (Specifications not printed in catalogue; details currently unavailable)';
        }
        parts.push(`Data Status: ${statusStr}`);

        return parts.join(' | ');
      });

      return {
        result: `Found ${products.length} product(s):\n${summary.join('\n')}\n\nNote: Official catalogue price is not available and requires sales team confirmation. Demo prices are provided strictly for PoC testing.`,
        products,
      };
    }

    case 'get_product_details': {
      const code = (args.code as string) || '';
      const product = await productService.getProductByCode(code.trim());

      if (!product) {
        return { result: `No product found with code "${code}".` };
      }

      let statusDescription = 'VERIFIED_FROM_CATALOGUE — Verified catalogue facts';
      if (product.data_status === 'NEEDS_MANUAL_REVIEW' || product.data_status === 'needs_review') {
        statusDescription = 'NEEDS_MANUAL_REVIEW — Uncertain fields need confirmation by sales team';
      } else if (product.data_status === 'NOT_AVAILABLE') {
        statusDescription = 'NOT_AVAILABLE — Specifications are not available in the catalogue. Do not fabricate details.';
      }

      const demoInfo = getDemoProductPrice(product.code, product.category);

      const details = [
        `Product Code: ${product.code}`,
        `Category: ${product.category}`,
        `Catalogue Page: ${product.source_page || 'Not listed'}`,
        product.name ? `Name: ${product.name}` : `Name: Not available`,
        product.material ? `Material: ${product.material}` : `Material: Not available`,
        product.capacity ? `Capacity: ${product.capacity}` : `Capacity: Not available`,
        product.colors && product.colors.length > 0
          ? `Available Colors: ${product.colors.join(', ')}`
          : `Colors: Not available`,
        product.description ? `Description: ${product.description}` : `Description: Not available`,
        product.price_inr !== null && product.price_inr !== undefined
          ? `Official Price: ₹${product.price_inr}`
          : 'Official Price: Not available in database',
        `Demo Price (PoC testing only): ₹${demoInfo.demoUnitPrice}/unit (Sample testing price, not official commercial price)`,
        `Data Status: ${statusDescription}`,
      ].join('\n');

      return { result: details, products: [product] };
    }

    case 'compare_products': {
      const codes = (args.codes as string[]) || [];
      if (!Array.isArray(codes) || codes.length === 0) {
        return { result: 'Please provide at least two product codes to compare.' };
      }

      const products: Product[] = [];
      const comparisonRows: string[] = [];

      for (const code of codes) {
        const product = await productService.getProductByCode(code.trim());
        if (product) {
          products.push(product);
          let statusText = 'VERIFIED_FROM_CATALOGUE';
          if (product.data_status === 'NEEDS_MANUAL_REVIEW' || product.data_status === 'needs_review') {
            statusText = 'NEEDS_MANUAL_REVIEW (Needs confirmation)';
          } else if (product.data_status === 'NOT_AVAILABLE') {
            statusText = 'NOT_AVAILABLE (Specs not in catalogue)';
          }

          const demoInfo = getDemoProductPrice(product.code, product.category);

          const fields = [
            `Product Code: ${product.code}`,
            `Category: ${product.category}`,
            `Catalogue Page: ${product.source_page || 'Not listed'}`,
            `Name: ${product.name || 'Not available'}`,
            `Material: ${product.material || 'Not available'}`,
            `Capacity: ${product.capacity || 'Not available'}`,
            `Colors: ${product.colors && product.colors.length > 0 ? product.colors.join(', ') : 'Not available'}`,
            `Description: ${product.description || 'Not available'}`,
            `Official Price: ${product.price_inr !== null && product.price_inr !== undefined ? `₹${product.price_inr}` : 'Not available'}`,
            `Demo Price (PoC): ₹${demoInfo.demoUnitPrice}/unit`,
            `Status: ${statusText}`,
          ];
          comparisonRows.push(fields.join(' | '));
        } else {
          comparisonRows.push(`Product Code: ${code} | Not found in database`);
        }
      }

      return {
        result: `Product Comparison (${products.length} products found):\n${comparisonRows.join('\n')}\n\nNote: Fields marked "Not available" are missing from the catalogue. Do not infer or invent missing specifications. Official prices are not available and require sales team confirmation. Demo prices are for PoC testing only.`,
        products,
      };
    }

    case 'calculate_demo_quotation': {
      const code = ((args.product_code as string) || '').trim().toUpperCase();
      const quantity = (args.quantity as number) || 100;
      const brandingType = (args.branding_type as string) || 'none';

      if (!code) {
        return { result: 'Error: Product code is required to generate a demo quotation.' };
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return { result: `Error: Quantity must be a positive number greater than 0 (received: ${quantity}).` };
      }

      const product = await productService.getProductByCode(code);
      const quote = calculateQuotation({
        productCode: code,
        productName: product?.name,
        category: product?.category,
        quantity,
        brandingType,
        useDemoPricing: true,
      });

      const productName = quote.productName || (product ? product.name : null) || 'Corporate Gifting Item';
      const unitPriceStr = quote.unitPrice != null ? `₹${quote.unitPrice.toLocaleString('en-IN')}` : 'N/A';
      const subtotalStr = quote.subtotal != null ? `₹${quote.subtotal.toLocaleString('en-IN')}` : 'N/A';
      const brandingCostStr = quote.brandingCost != null ? `₹${quote.brandingCost.toLocaleString('en-IN')}` : '₹0';
      const subtotalPlusBranding = ((quote.subtotal || 0) + (quote.brandingCost || 0)).toLocaleString('en-IN');
      const gstStr = quote.gstAmount != null ? `₹${quote.gstAmount.toLocaleString('en-IN')}` : 'N/A';
      const totalStr = quote.total != null ? `₹${quote.total.toLocaleString('en-IN')}` : 'N/A';

      const output = [
        `POC Demo Quote`,
        `${quote.productCode} (${productName}) × ${quote.quantity}`,
        `Demo product price: ${unitPriceStr} × ${quote.quantity} = ${subtotalStr}`,
        `Demo branding (${quote.brandingType}): ₹${quote.brandingRatePerUnit} × ${quote.quantity} = ${brandingCostStr}`,
        `Demo subtotal: ₹${subtotalPlusBranding}`,
        `Demo GST (18%): ${gstStr}`,
        `Demo total: ${totalStr}`,
        ``,
        `⚠️ This is a demo quotation for PoC testing only, not a commercial quote. Prices shown are sample/demo prices for testing only and are not official Mudhra Branding Solutions prices.`,
      ].join('\n');

      return {
        result: output,
        products: product ? [product] : undefined,
      };
    }

    case 'get_categories': {
      const categories = await productService.getCategories();
      const list = categories
        .map((c) => `${c.name}: ${c.productCount} products`)
        .join('\n');
      return { result: `Available categories:\n${list}` };
    }

    case 'escalate_to_human': {
      const reason = (args.reason as string) || 'Customer requested human support';
      return {
        result: `Escalation requested: ${reason}. The customer should be connected to a human sales representative.`,
      };
    }

    default:
      return { result: `Unknown tool: ${name}` };
  }
}

// ============================================================
// Main chat function
// ============================================================
export async function chat(
  conversationId: string | undefined,
  userMessage: string,
  channel: string = 'web_poc',
  customerId?: string
): Promise<ChatResponse> {
  // 1. Create conversation if needed
  let convId = conversationId;
  if (!convId) {
    const conv = await conversationService.createConversation(channel, customerId);
    convId = conv.id;
  }

  // 2. Build prior message history BEFORE adding current user message (preserves turn order)
  const priorMessages = await conversationService.getRecentMessages(convId, 30);
  const history = priorMessages.map((m) => ({
    role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  }));

  // 3. Store user message in conversation log
  await conversationService.addMessage(convId, 'inbound', userMessage);

  // 4. Dispatch to active AI provider (Gemini)
  const provider = getAIProvider();
  const { reply, collectedProducts } = await provider.chat({
    systemPrompt: getSystemPrompt(),
    history,
    userMessage,
    tools: TOOLS,
    executeTool,
  });

  // 5. Store assistant response
  await conversationService.addMessage(convId, 'outbound', reply, {
    products: collectedProducts.map((p) => p.code),
  });

  // 6. Build suggested actions (preserve interactive View Product and Send Enquiry)
  const suggestedActions: SuggestedAction[] = [];
  if (collectedProducts.length > 0) {
    // Top product action
    suggestedActions.push({
      type: 'view_product',
      label: `View ${collectedProducts[0].code}`,
      data: { code: collectedProducts[0].code },
    });
    suggestedActions.push({
      type: 'enquire',
      label: `Enquire (${collectedProducts[0].code})`,
      data: { code: collectedProducts[0].code },
    });

    // If second product was also discussed
    if (collectedProducts.length > 1) {
      suggestedActions.push({
        type: 'view_product',
        label: `View ${collectedProducts[1].code}`,
        data: { code: collectedProducts[1].code },
      });
    }
  }

  return {
    conversationId: convId,
    reply,
    products: collectedProducts.length > 0 ? collectedProducts : undefined,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
  };
}
