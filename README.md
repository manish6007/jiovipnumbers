# JioVIPNumber.com

A production-ready, multi-vendor marketplace for premium **VIP mobile numbers**.
Verified partners list their inventory, customers browse/search and book numbers,
and the platform owner earns a commission on every successful sale.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Supabase** (Postgres + Auth + Storage) and **Razorpay**.

![Tech](https://img.shields.io/badge/Next.js-15-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

---

## ✨ Features

### Customer
- Mobile **OTP login** (Supabase Phone Auth)
- Premium glassmorphism storefront: hero search, featured / trending / new / business / lucky sections, category pills, admin-managed banners
- Powerful **search & filters** — starts-with, ends-with, contains, repeated digits, ascending, descending, mirror pattern, price range, state, circle, category
- Rich **number detail page** with pattern analysis, seller rating & verification badge, WhatsApp enquiry, **Buy Now**, related numbers, SEO + JSON-LD
- Dashboard: orders, wishlist, profile
- Payment: **Razorpay online** or manual (UPI / bank / cash) with screenshot upload

### Partner (Seller)
- OTP registration + **KYC** (business, GST/PAN, address, UPI, bank, logo/photo) → admin approval
- Dashboard with live stats (active listings, sold, pending orders, earnings, commission paid)
- Add a number (with automatic pattern detection & duplicate check), edit, pause/activate, change price, delete
- **Bulk CSV / Excel upload** with template + validation
- Orders management (confirm / complete / cancel) and earnings breakdown

### Super Admin
- Overview dashboard (partners, customers, numbers, orders, revenue, commission, pending queues)
- Approve / reject **partners** and **listings** (with reason)
- Manage orders (verify manual payments, advance status), customers (block/unblock)
- Global **commission** settings (percentage or fixed) with live preview
- Homepage **banner** management
- **Audit logs**

### Platform
- Role-based access via middleware + Postgres **RLS**
- Commission **snapshotted server-side** at order time (never trusts the client)
- Duplicate-number detection, secure server actions, audit logging
- SEO: metadata, OpenGraph, JSON-LD Product schema, dynamic `sitemap.xml`, `robots.txt`

---

## 🚀 Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your keys

# 3. Set up the database (see docs/SETUP.md)
#    Run the SQL in supabase/migrations/ in order (0001 → 0004)

# 4. Run
npm run dev                  # http://localhost:3000
```

Full provisioning steps (Supabase project, SMS provider for OTP, Razorpay,
storage, making yourself admin) are in **[docs/SETUP.md](docs/SETUP.md)**.

---

## 📁 Project structure

```
src/
  app/
    (public)/       Storefront: home, search, number/[slug], about, contact, terms, privacy
    (auth)/         login, register/partner
    (customer)/     dashboard, orders, wishlist, profile
    (partner)/      dashboard, listings (+new/edit), bulk-upload, orders, earnings, profile
    (admin)/        dashboard, partners, listings, orders, customers, commission, banners, audit
    actions/        Server actions (wishlist, orders, numbers, partner, admin, profile)
    api/razorpay/   webhook
    sitemap.ts robots.ts layout.tsx not-found.tsx
  components/
    ui/             shadcn-style primitives (button, card, dialog, select, toast, table…)
    marketplace/    NumberCard, SearchFilters, WhatsAppButton, BuyNowDialog, BannerCarousel…
    dashboard/      DashboardShell, StatCard, NumberForm, BulkUpload, ReviewActions…
    shared/         SiteHeader, SiteFooter, Logo, UserMenu, ImageUpload
    auth/           LoginForm, PartnerRegisterForm, OtpInput
  lib/
    supabase/       server / client / admin clients
    patterns.ts     VIP pattern analysis (mirrors the DB trigger)
    commission.ts   Commission engine
    razorpay.ts     Gateway + signature verification
    queries.ts      Storefront read layer
    constants.ts validators.ts notifications.ts whatsapp.ts utils.ts
  types/database.ts Hand-maintained DB types
  middleware.ts     Role-based route protection
supabase/migrations/ 0001_init · 0002_rls · 0003_storage · 0004_admin_bootstrap
docs/               SETUP.md · DATABASE.md · API.md
```

---

## 🧾 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## 🔒 Notes on scope

- **OTP** uses Supabase Phone Auth. Develop for free with Supabase **Test OTP**
  numbers. For production, Supabase's *native* SMS providers are Twilio / Twilio
  Verify / MessageBird / Vonage / Textlocal; the **cheapest for India is MSG91**,
  wired via Supabase's "Send SMS" hook using the Edge Function in
  `supabase/functions/send-sms-msg91/`. Full walkthrough in **docs/SETUP.md §5**.
- **Payments** support both Razorpay (online) and manual methods (UPI / bank /
  cash) with admin verification.
- The repo ships **no dummy listings** (per spec). Reference categories and a
  default commission row are seeded by the migration.
- Legal pages (Terms, Privacy) are templates — have them reviewed before launch.

Documentation: **[SETUP](docs/SETUP.md)** · **[DATABASE](docs/DATABASE.md)** · **[API](docs/API.md)**
