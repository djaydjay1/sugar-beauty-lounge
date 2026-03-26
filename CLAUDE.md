# Sugar Beauty Lounge — AI Business Operating System

First Ordana Labs client project. Build once, templatize, repeat for every client.

## Business Context

- **Client:** Sugar Beauty Lounge — premium beauty salon, Dubai
- **Locations:** Mall of the Emirates, Dubai Sports City, Bawabat AlSharq (Abu Dhabi), HQ Rania Business Center
- **Contact:** +971 4 452 0989 · info@sugarbeautylounge.com · @sugarbeautylounge (17K IG)
- **Current booking:** Fresha (to be replaced by this system)
- **Pricing model:** AED 1,000–3,000/month all-in (Ordana Labs subscription)

## Stack

Next.js 15 + React 19 + Tailwind 4 + Framer Motion + Supabase + Claude Haiku (WhatsApp AI + chat) + Twilio (WhatsApp) + Stripe (invoicing)

## File Structure

```
src/app/
├── page.tsx                  # Marketing website (public)
├── booking/page.tsx          # 4-step booking flow (public)
├── dashboard/
│   ├── layout.tsx            # Sidebar nav
│   ├── page.tsx              # KPI overview + today's schedule
│   ├── appointments/page.tsx # Full appointment manager
│   ├── clients/page.tsx      # CRM — client profiles
│   ├── staff/page.tsx        # Staff cards + doc expiry alerts
│   ├── inventory/page.tsx    # Stock management + alerts
│   ├── finance/page.tsx      # Invoices + expenses + VAT
│   ├── hr/page.tsx           # Leave requests + shifts
│   └── marketing/page.tsx    # Reviews + social posts + promos
└── api/
    ├── booking/route.ts      # Server-side booking endpoint
    ├── ai/route.ts           # Claude chat (edge, SSE)
    └── whatsapp/route.ts     # Twilio WhatsApp AI webhook
```

## Brand Palette — Blush & Gold

| Role | Var | Hex |
|------|-----|-----|
| Background | --color-bg | #FAF7F5 |
| Card | --color-card | #FFFFFF |
| Accent (primary) | --color-plum | #6B3D5E |
| Accent (gold) | --color-gold | #C9A84C |
| Accent (blush) | --color-blush | #E8B4B8 |

Typography: Cormorant Garamond (headings) + DM Sans (body)

## Supabase

- Create a new Supabase project (separate from Ordana Labs)
- Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
- Tables: locations, service_categories, services, clients, client_preferences, staff, staff_services, shifts, leave_requests, appointments, invoices, invoice_items, expenses, inventory_items, inventory_transactions, reviews, social_posts, promotions, waitlist, whatsapp_conversations
- Auto-increment invoice numbers: SBL-1001, SBL-1002, ...
- Auto-updates inventory stock on transaction insert
- RLS enabled — public can read services/locations/staff, insert appointments/clients/reviews

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
# Twilio WhatsApp (when ready):
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_WHATSAPP_NUMBER=
```

## Development

```bash
npm run dev    # http://localhost:3000
npm run build
```

## What's Built

- [x] Marketing website (hero, services, locations, reviews, CTA)
- [x] 4-step online booking flow (service → datetime + staff → contact → confirm)
- [x] Owner dashboard with 8 modules
- [x] Full Supabase schema (20 tables)
- [x] WhatsApp AI receptionist (Claude Haiku + Twilio)
- [x] Chat API (streaming, edge runtime)

## What's Next

- [ ] Seed services + staff from owner (get real data)
- [ ] Create Supabase project + run migration
- [ ] Set env vars + deploy to Coolify
- [ ] Add Stripe payment links to invoices
- [ ] Build invoice PDF generation
- [ ] Add availability calendar (block booked slots in booking flow)
- [ ] Implement loyalty points logic (earn on visit, redeem on booking)
- [ ] WhatsApp: activate when Twilio upgraded
- [ ] Domain: sugarbeautylounge.com (or subdomain)
