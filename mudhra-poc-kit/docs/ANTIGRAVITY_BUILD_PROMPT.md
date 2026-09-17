# Antigravity build prompt

You are a senior full-stack engineer. Build the Mudhra AI Catalogue PoC.

## Business
Mudhra Branding Solutions is a corporate gifting company. The supplied 135-page PDF is the source catalogue. It contains categories including Water Bottles, Mugs, Electronics, Table Tops, Pens, Key Chains, Notebooks, VC Card Holders, Acrylic Stands, ID Card Holders and Gift Sets.

## Goal
Build a polished web chat that simulates the future WhatsApp sales assistant. Do NOT integrate WhatsApp yet.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- OpenAI API

## Features
1. Home/catalogue page with category cards.
2. Product listing with filters.
3. Product detail page.
4. Chat UI.
5. Natural-language product search.
6. Enquiry flow: product -> quantity -> branding -> company -> delivery location -> contact.
7. Enquiry stored in Supabase.
8. Simple admin page for products and prices.
9. Basic quotation preview.
10. Clear fallback to human sales support.

## AI safety/data rules
- Never hallucinate product codes, prices, specifications, stock, colours, or images.
- AI may interpret intent but must retrieve facts from Supabase using server-side functions.
- If a requested fact is missing or unverified, say it is not currently available.
- Do not expose service-role keys to the browser.
- Validate all user input server-side.

## Architecture
Keep business logic independent from the UI so a WhatsApp adapter can be added later. Create services such as productSearch, conversationService, enquiryService and aiService.

## Data
Use `data/products.csv` as the starter import dataset. Treat rows with `data_status=needs_review` as non-customer-facing until verified. Do not create fake products to fill gaps.

## UX
Make it look like a modern premium corporate-gifting catalogue, mobile-first because the final channel will be WhatsApp.

## Deliverables
- Working app
- Supabase schema
- Seed/import instructions
- `.env.example`
- README
- Unit tests for product search and AI tool validation
- E2E tests for browse -> product -> enquiry
- No hardcoded prices


## Catalogue review dataset
Use `data/products_review.csv` as the current review dataset. Do not expose rows with `data_status=needs_review` to end customers. Preserve `source_code` and `source_page` for verification. The dataset contains OCR-assisted candidates only; do not fill missing values or prices from assumptions.
