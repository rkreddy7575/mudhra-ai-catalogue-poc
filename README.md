# Mudhra AI Catalogue PoC

A production-quality Proof of Concept for **Mudhra Branding Solutions** — a web-based AI-powered corporate gifting catalogue that simulates the future WhatsApp sales assistant.

## 🎯 What This Is

A modern web application that lets corporate buyers:
- **Browse** a curated catalogue of 300+ branded products across 11 categories
- **Search** using natural language powered by AI
- **Chat** with an AI sales assistant that only answers from the product database
- **Enquire** about products with a guided flow (product → quantity → branding → delivery → contact)

The architecture is designed so **WhatsApp Cloud API** can be integrated later without rewriting business logic.

## 🏗️ Architecture

```
Channels (Web UI / WhatsApp / Admin)
         ↓
   Channel Adapter Layer
         ↓
   Business Logic Services
   (product, enquiry, conversation, AI, import)
         ↓
   Supabase (PostgreSQL + Storage)
```

**Key design decisions:**
- **Channel Adapter Pattern** — All business logic in `/src/services/`. Both web UI and future WhatsApp call the same services.
- **Strict data integrity** — AI never invents product codes, prices, specs, or availability.
- **Data verification workflow** — Products imported as `needs_review`, verified against source PDF before going live.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o with function calling |
| Icons | Lucide React |
| Validation | Zod |

## 📦 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema migrations in the Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

### 3. Configure environment
```bash
cp .env.example .env.local
```
Fill in your Supabase and OpenAI credentials.

### 4. Import product data
Upload the CSV from the admin panel at `/admin/import`, or use the kit CSV:
```
mudhra-poc-kit/data/products.csv
```

### 5. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── types/           # TypeScript interfaces (database + API)
├── lib/             # Supabase clients, OpenAI, utilities
├── services/        # Business logic (channel-agnostic)
│   ├── product.service.ts
│   ├── enquiry.service.ts
│   ├── conversation.service.ts
│   ├── ai.service.ts
│   └── import.service.ts
├── components/      # Reusable UI components
│   ├── layout/      # Header, Footer
│   ├── catalogue/   # CategoryCard, ProductCard, ProductGrid, SearchBar
│   ├── chat/        # ChatWindow, ChatMessage, ChatInput
│   ├── enquiry/     # EnquiryForm (multi-step)
│   └── ui/          # Button, Input, Badge, EmptyState
└── app/             # Next.js pages + API routes
    ├── api/         # REST API endpoints
    ├── catalogue/   # Browse products
    ├── product/     # Product detail
    ├── chat/        # AI assistant
    ├── enquiry/     # Enquiry form
    └── admin/       # Dashboard, enquiries, products, import
```

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `products` | Product catalogue (code, category, specs, data_status) |
| `customers` | Customer records (phone, name, company) |
| `enquiries` | Enquiry submissions with branding/delivery details |
| `conversations` | Chat session tracking |
| `messages` | Chat message history (inbound/outbound) |
| `quotations` | Quotation records linked to enquiries |

## 🤖 AI Safety Rules

The AI assistant **never invents** product information:
- Only references products found in the database
- If data is missing, says "not currently available"
- Flags `needs_review` products as "being verified"
- Offers to connect with human sales support when stuck
- Uses low temperature (0.3) for factual accuracy

## 📊 Data Status Workflow

```
catalogue_ocr → needs_review → verified → (archived)
```

- **`needs_review`**: OCR-extracted, not yet verified against source PDF
- **`verified`**: Manually confirmed against the 135-page catalogue
- Products with `needs_review` show a warning badge in the UI

## 🔮 WhatsApp Integration (Future)

The codebase is ready for WhatsApp Cloud API integration:
1. Create a new channel adapter in `src/services/`
2. Map WhatsApp webhook events to existing service calls
3. Business logic (product search, enquiry, AI) works unchanged
4. The `channel` field on enquiries/conversations already supports `'whatsapp'`

## 📜 Source Data

The starter dataset comes from `mudhra-poc-kit/`:
- **299 product codes** across 7 categories (OCR-extracted)
- 4 categories pending extraction (Key Chains, Table Tops, VC Card Holders, Acrylic Stands)
- Pages 80-135 need manual review
- Prices intentionally blank — to be added after verification

## 🧪 Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript strict checking
```
