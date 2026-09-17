# Mudhra AI Catalogue PoC

A web-based PoC for the future Mudhra WhatsApp catalogue/sales assistant.

## Goal
Prove this flow before integrating WhatsApp:

Customer -> catalogue -> product search -> product details -> quantity -> branding -> enquiry -> quotation.

## Source catalogue
`All Gifting Products Cateloge.pdf` is a 135-page visual catalogue. The starter CSV in `data/products.csv` is OCR-assisted and **must be verified** before production. Prices are intentionally blank.

## Rules
- Never invent a product code, price, specification, stock status, or image.
- Product database is the source of truth.
- AI interprets customer intent and calls product-search functions; it does not calculate or invent catalogue facts.
- WhatsApp integration comes after the web PoC.

## Suggested stack
Next.js + TypeScript + Tailwind + Supabase/PostgreSQL + OpenAI API.

## Database
Run `database/schema.sql` in Supabase SQL Editor.

## Import
Set environment variables from `.env.example`, then run the TypeScript import script from the application project.

## Data status
Use `needs_review` until each product is verified against the source PDF. Only verified products should be enabled for customer-facing AI responses.


## Catalogue extraction update
`data/products_review.csv` contains the latest OCR-assisted review dataset. It is intentionally not customer-facing until rows are visually verified. `docs/catalogue_verification.md` explains coverage and possible OCR gaps.
