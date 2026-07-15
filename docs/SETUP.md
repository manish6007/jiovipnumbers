# Setup Guide

End-to-end steps to run JioVIPNumber.com against your own infrastructure.

## 1. Prerequisites

- Node.js 20+ and npm
- A [Supabase](https://supabase.com) project (free tier is fine to start)
- A [Razorpay](https://razorpay.com) account (test mode for development)
- An SMS provider supported by Supabase for phone OTP (e.g. **MSG91**, **Twilio**)

## 2. Install & configure

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` key (**secret**) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://jiovipnumber.com`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay → Settings → Webhooks (create one) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same value as `RAZORPAY_KEY_ID` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Your support number, e.g. `919243111100` |

## 3. Database

In the Supabase **SQL Editor**, run the migration files in order:

1. `supabase/migrations/0001_init.sql` — tables, enums, triggers (pattern
   detection, updated_at, profile-on-signup), seed categories + default 10%
   commission.
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies + helper
   functions (`is_admin`, `current_partner_id`).
3. `supabase/migrations/0003_storage.sql` — storage buckets + policies.
4. `supabase/migrations/0004_admin_bootstrap.sql` — **run later** (step 6).

> Using the Supabase CLI instead? `supabase db push` after linking your project,
> or `supabase migration up`.

## 4. Auth — Phone OTP

1. Supabase → **Authentication → Providers → Phone** → enable.
2. Choose an SMS provider (MSG91 for India / Twilio) and enter its credentials.
3. For India, configure DLT-approved templates with your provider as required.
4. (Dev) You can add **test OTP** numbers under Auth → Phone for local testing
   without sending real SMS.

## 5. Storage

The migration creates these buckets automatically:

| Bucket | Visibility | Use |
| --- | --- | --- |
| `number-images` | public | listing photos |
| `avatars` | public | customer/partner photos |
| `logos` | public | business logos |
| `banners` | public | homepage banners |
| `kyc-docs` | private | PAN/GST (signed URLs) |
| `payment-screenshots` | private | manual payment proofs (signed URLs) |

If you prefer to create them via the dashboard, match these names + visibility.

## 6. Create your admin

1. Run the app, open `/login`, and sign in with **your** mobile via OTP. This
   creates your `profiles` row.
2. Edit `supabase/migrations/0004_admin_bootstrap.sql`, set your phone number
   (E.164 without `+`, e.g. `919876543210`), and run it in the SQL editor.
3. Refresh — you now have access to `/admin`.

## 7. Razorpay

1. Razorpay Dashboard → **Settings → API Keys** → generate test keys.
2. **Settings → Webhooks** → add `https://YOUR_DOMAIN/api/razorpay/webhook`,
   set the secret to `RAZORPAY_WEBHOOK_SECRET`, and subscribe to
   `payment.captured` and `order.paid`.

## 8. Run

```bash
npm run dev      # development
npm run build && npm run start   # production
```

## 9. Deploy (Vercel)

1. Push the repo to GitHub and import into Vercel.
2. Add all environment variables from `.env.local` in the Vercel project.
3. Deploy. Update `NEXT_PUBLIC_SITE_URL` and the Razorpay webhook URL to your
   production domain.

## Smoke test (end-to-end)

1. OTP login as a customer.
2. Register as a partner (new number) → admin approves under `/admin/partners`.
3. Partner adds a number → admin approves under `/admin/listings`.
4. Customer searches/filters, opens the number, clicks **Buy Now**:
   - Razorpay test payment (card `4111 1111 1111 1111`) → order auto-confirmed.
   - Or a manual method → upload screenshot → admin verifies under `/admin/orders`.
5. Confirm commission split on the order matches your commission setting.
6. WhatsApp button opens chat with the pre-filled enquiry message.
