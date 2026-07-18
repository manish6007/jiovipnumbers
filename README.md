# JioVIPNumber.com

A production-ready, multi-vendor marketplace for premium **VIP mobile numbers**.
Verified partners list their inventory, customers browse/search and book numbers,
and the platform owner earns a commission on every successful sale.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Supabase** (Postgres + Auth + Storage) and **Razorpay**.

![Tech](https://img.shields.io/badge/Next.js-15.4-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

> **Status:** actively being refined. This README documents the app as it stands today —
> functionality, design system, and known follow-ups — so the next session (human or
> Claude) can pick up context quickly.

---

## Screenshots

### Storefront

| Home | Search | Number detail |
| --- | --- | --- |
| ![Home](docs/screenshots/home.png) | ![Search](docs/screenshots/search.png) | ![Number detail](docs/screenshots/number-detail.png) |

| About | Contact | Login |
| --- | --- | --- |
| ![About](docs/screenshots/about.png) | ![Contact](docs/screenshots/contact.png) | ![Login](docs/screenshots/login.png) |

### Customer

| Dashboard | Orders | Wishlist | Profile |
| --- | --- | --- | --- |
| ![Customer dashboard](docs/screenshots/customer-dashboard.png) | ![Customer orders](docs/screenshots/customer-orders.png) | ![Customer wishlist](docs/screenshots/customer-wishlist.png) | ![Customer profile](docs/screenshots/customer-profile.png) |

### Partner (seller)

| Register | Dashboard | Listings | Add number |
| --- | --- | --- | --- |
| ![Register partner](docs/screenshots/register-partner.png) | ![Partner dashboard](docs/screenshots/partner-dashboard.png) | ![Partner listings](docs/screenshots/partner-listings.png) | ![Add number](docs/screenshots/partner-add-number.png) |

| Bulk upload | Orders | Earnings | Profile |
| --- | --- | --- | --- |
| ![Bulk upload](docs/screenshots/partner-bulk-upload.png) | ![Partner orders](docs/screenshots/partner-orders.png) | ![Partner earnings](docs/screenshots/partner-earnings.png) | ![Partner profile](docs/screenshots/partner-profile.png) |

### Super admin

| Dashboard | Partners | Listings | Orders |
| --- | --- | --- | --- |
| ![Admin dashboard](docs/screenshots/admin-dashboard.png) | ![Admin partners](docs/screenshots/admin-partners.png) | ![Admin listings](docs/screenshots/admin-listings.png) | ![Admin orders](docs/screenshots/admin-orders.png) |

| Customers | Commission | Banners | Audit logs |
| --- | --- | --- | --- |
| ![Admin customers](docs/screenshots/admin-customers.png) | ![Admin commission](docs/screenshots/admin-commission.png) | ![Admin banners](docs/screenshots/admin-banners.png) | ![Admin audit](docs/screenshots/admin-audit.png) |

---

## ✨ Features

### Customer
- Mobile **OTP login** (Supabase Phone Auth)
- Storefront: hero search, featured / trending / new / business / lucky sections, category pills, admin-managed banners
- **Search & filters** — starts-with, ends-with, contains, repeated digits, ascending, descending, mirror pattern, price range, state, circle, category
- **Number detail page** with pattern analysis, seller rating & verification badge, WhatsApp enquiry, **Buy Now**, related numbers, SEO + JSON-LD
- Dashboard: orders, wishlist, profile
- Payment: **Razorpay online** or manual (UPI / bank / cash) with screenshot upload

### Partner (Seller)
- OTP registration + **KYC** (business, GST/PAN, address, UPI, bank, logo/photo) → admin approval
- Dashboard with live stats (active listings, sold, pending orders, earnings, commission paid)
- Add a number (automatic pattern detection & duplicate check), edit, pause/activate, change price, delete
- Listings can be **prepared while KYC is pending** — they just don't go live publicly until both the partner and the listing are approved
- **Bulk CSV / Excel upload** with template + validation
- Orders management (confirm / complete / cancel) and earnings breakdown

### Super Admin
- Overview dashboard (partners, customers, numbers, orders, revenue, commission, pending queues)
- Approve / reject **partners** and **listings** (with reason)
- Manage orders (verify manual payments, advance status), customers (block/unblock)
- Global **commission** settings (percentage or fixed) with live preview
- Homepage **banner** management
- **Audit logs** — every state-changing action (register, approve, list, order, payment) is recorded

### Platform
- Role-based access via middleware + Postgres **RLS**
- Commission **snapshotted server-side** at order time (never trusts the client)
- Duplicate-number detection, secure server actions, audit logging
- SEO: metadata, OpenGraph, JSON-LD Product schema, dynamic `sitemap.xml`, `robots.txt`

---

## 🎨 Design system

The UI was redesigned around the actual product — vanity phone numbers — instead of
generic "premium marketplace" defaults (blue gradients, glassmorphism, gold crown/diamond
badges). The new direction is a **telephone-exchange / directory** aesthetic:

- **Palette** — warm directory-paper ivory background, ink-brown text, brass/copper
  primary, terracotta-vermillion accent, and a deep switchboard-slate for dark surfaces.
  Defined once as CSS variables in [`globals.css`](src/app/globals.css) and via Tailwind
  color-scale overrides in [`tailwind.config.ts`](tailwind.config.ts), so the whole app
  reskins consistently.
- **Typography** — [Fraunces](https://fonts.google.com/specimen/Fraunces) (serif display
  headlines), [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) (body/UI),
  and [Space Mono](https://fonts.google.com/specimen/Space+Mono) (the digit face), loaded
  in [`layout.tsx`](src/app/layout.tsx).
- **Signature element** — [`FlapDigits`](src/components/marketplace/flap-digits.tsx)
  renders every phone number as individual **split-flap departure-board tiles**, since the
  digits themselves are the product. Used in the hero, every number card, and the number
  detail page.
- **Shared component classes** (`.glass`, `.glass-strong`, `.glass-nav`, `.gradient-text`,
  `.gold-text`) were repainted in place rather than renamed, so the redesign propagates
  through every card/nav/badge across the app without touching each call site.

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

Full provisioning steps (Supabase project, Test OTP for local dev, SMS provider for
production, Razorpay, storage, making yourself admin) are in
**[docs/SETUP.md](docs/SETUP.md)**.

> ⚠️ Don't run `npm run build` while `npm run dev` is also running against the same
> `.next` directory — they clobber each other's cache. Stop the dev server first, or
> build in a separate checkout.

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
    marketplace/    NumberCard, FlapDigits, SearchFilters, WhatsAppButton, BuyNowDialog, BannerCarousel…
    dashboard/      DashboardShell, StatCard, NumberForm, BulkUpload, ReviewActions…
    shared/         SiteHeader, SiteFooter, Logo, UserMenu, ImageUpload
    auth/           LoginForm, PartnerRegisterForm, OtpInput
  lib/
    supabase/       server / client / admin clients
    patterns.ts     VIP pattern analysis (mirrors the DB trigger)
    commission.ts   Commission engine
    razorpay.ts     Gateway + signature verification
    queries.ts      Storefront read layer
    brand.ts        Logo mark SVG generator (favicon / apple-icon / OG image)
    constants.ts validators.ts notifications.ts whatsapp.ts utils.ts
  types/database.ts Hand-maintained DB types
  middleware.ts     Role-based route protection
supabase/migrations/ 0001_init · 0002_rls · 0003_storage · 0004_admin_bootstrap
docs/               SETUP.md · DATABASE.md · API.md · screenshots/
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

---

## 🛠 Known follow-ups (as of this pass)

Things intentionally left for a future session:

- No Razorpay keys configured locally — online checkout is untested end-to-end here.
- `next.config.mjs` image remote patterns should be double-checked after any Supabase
  project URL change.
- The dashboard areas (customer/partner/admin) got the new color system but haven't had
  the same layout/typography pass as the public storefront (headings still use the
  default sans weight rather than `font-display`).
- Consider replacing the Fraunces/Plex/Space Mono trio with self-hosted fonts if
  `next/font/google`'s build-time fetch ever becomes a problem in CI.

---

Documentation: **[SETUP](docs/SETUP.md)** · **[DATABASE](docs/DATABASE.md)** · **[API](docs/API.md)**
