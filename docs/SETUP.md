# JioVIPNumber.com — Full Setup & Integration Guide

A complete, click-by-click walkthrough to take this repo from zero to a live site.
No prior DevOps experience assumed. Follow the sections in order.

> Provider dashboards change their wording and layout over time — menu labels here
> may differ slightly. When in doubt, search the provider's help for the term in **bold**.

---

## 0. What it costs (free vs paid)

| Piece | Free to start? | When you pay |
| --- | --- | --- |
| **Supabase** (DB, auth, storage) | ✅ Free tier | Only at scale (paid plan from ~$25/mo) |
| **Vercel** (hosting) | ✅ Hobby free | Only for teams / heavy traffic |
| **OTP SMS — development** | ✅ Free (Supabase **Test OTP**) | Never (dev only) |
| **OTP SMS — production** | ❌ Paid per SMS | ~₹0.12–0.25 / SMS (MSG91, India) once live |
| **Razorpay** (online payments) | ✅ Free to create | 2% + GST per successful payment |
| **WhatsApp enquiry button** | ✅ Free (wa.me link) | Never |

**You can launch cheaply:** the site works with **manual payments** (UPI / bank / cash + screenshot
verification — no Razorpay needed) and **WhatsApp enquiries**. The only unavoidable running cost at
go-live is **SMS for real OTP**, and this guide points you at the **cheapest working option (MSG91)**.
During development you spend **₹0** using Test OTP.

---

## 1. Prerequisites

- **Node.js 20+** and npm — https://nodejs.org
- A **GitHub** account (to deploy from) — the repo is already at `manish6007/jiovipnumbers`
- Accounts you'll create below: **Supabase**, **Vercel**, **MSG91** (for prod SMS), **Razorpay**
  (optional, for online payments)

Clone + install locally:

```bash
git clone https://github.com/manish6007/jiovipnumbers.git
cd jiovipnumbers
npm install
cp .env.example .env.local     # you'll fill this in as you go
```

---

## 2. Create the Supabase project

1. Go to https://supabase.com → **Start your project** → sign in with GitHub.
2. **New project** (inside an organization — create one if prompted, the free plan is fine).
3. Fill in:
   - **Name:** `jiovipnumber`
   - **Database Password:** click **Generate a password** and **save it** somewhere safe.
   - **Region:** **South Asia (Mumbai) — `ap-south-1`** (lowest latency for Indian users).
   - **Plan:** Free.
4. Click **Create new project** and wait ~2 minutes for it to provision.

---

## 3. Get your API keys → `.env.local`

In your project: **Project Settings** (gear icon) → **API**.

| Copy this | Into this `.env.local` variable | Notes |
| --- | --- | --- |
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` | e.g. `https://abcd1234.supabase.co` |
| **Project API keys → `anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | safe for the browser |
| **Project API keys → `service_role` `secret`** | `SUPABASE_SERVICE_ROLE_KEY` | **secret — never expose client-side** |

Also set, for now:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=919243111100   # your support WhatsApp, digits only, 91 = India
```

> `anon` respects Row-Level Security (safe in the browser). `service_role` bypasses all security and
> is used only by trusted server code — keep it out of `NEXT_PUBLIC_*` and out of git.

---

## 4. Set up the database (run the migrations)

The schema lives in `supabase/migrations/`. Easiest path — the **SQL Editor**:

1. Supabase → **SQL Editor** → **New query**.
2. Open `supabase/migrations/0001_init.sql` from the repo, copy **all** of it, paste, click **Run**.
3. Repeat for **`0002_rls.sql`**, then **`0003_storage.sql`** — **in this exact order.**
4. Leave `0004_admin_bootstrap.sql` for **§7** (after your first login).

What each file does:
- **0001_init** — all tables, enums, triggers (VIP-pattern detection, `updated_at`, auto-create a
  `profiles` row on signup), and seeds the categories + a default **10% commission**.
- **0002_rls** — Row-Level Security policies + helpers `is_admin()`, `current_partner_id()`.
- **0003_storage** — creates the storage buckets + their access policies.

**Verify:** **Table Editor** should list `profiles`, `partners`, `numbers`, `orders`, etc.
**Storage** should list the 6 buckets from §6.

<details>
<summary>Alternative: Supabase CLI</summary>

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>   # ref is in Project Settings → General
supabase db push                                  # applies everything in supabase/migrations
```
</details>

---

## 5. Phone OTP login — the important part

The app logs users in by **mobile OTP** (Supabase Phone Auth). Do **A (free)** now; do **B** before
you accept real users.

### A. Development — Test OTP (free, no SMS) ✅ do this first

1. Supabase → **Authentication** → **Providers** (or **Sign In / Providers**) → **Phone** → toggle
   **Enable phone provider ON**.
2. Scroll to **Test OTP** → add mappings of a phone number to a fixed code, e.g.
   `919999999999 → 123456`. **Save.**
3. Run the app (`npm run dev`), open `/login`, enter that number, and use the fixed code.
   No SMS is sent, nothing is charged. Use this to build/test the whole flow end-to-end.

> Keep the phone provider **enabled** — Test OTP just short-circuits SMS for the numbers you list.

### B. Production — cheapest real SMS (MSG91 via a "Send SMS" hook)

Supabase's built-in SMS providers are **Twilio / Twilio Verify / MessageBird / Vonage / Textlocal**.
**MSG91 is not built in**, but it has the **lowest per-SMS rates for India**, so we connect it through
Supabase's **"Send SMS" Auth Hook** using the Edge Function shipped in this repo
(`supabase/functions/send-sms-msg91/`).

**B.1 — Create MSG91 + DLT (India regulatory requirement)**
1. Sign up at https://msg91.com.
2. Complete **DLT** registration (TRAI requirement for Indian SMS):
   - Register/So a **Sender ID** (a 6-char header, e.g. `JIOVIP`).
   - Create a **Transactional template** containing your OTP variable, e.g.
     `Your JioVIPNumber OTP is ##OTP##. Do not share it.` (MSG91 shows the DLT template ID).
3. In MSG91 → **Flow** (or **Send OTP → Flow**) create/note a **Flow / Template** that maps to the DLT
   template; copy its **Template ID**.
4. MSG91 → your profile → copy your **Auth Key**.

**B.2 — Deploy the Edge Function** (from the repo root)
```bash
supabase login
supabase link --project-ref <your-project-ref>

# secrets the function reads (never committed):
supabase secrets set MSG91_AUTH_KEY=xxxxxxxxxxxxxxxxxxxx
supabase secrets set MSG91_TEMPLATE_ID=your_flow_template_id
supabase secrets set MSG91_SENDER_ID=JIOVIP
supabase secrets set SEND_SMS_HOOK_SECRET=$(openssl rand -hex 32)   # save this value

supabase functions deploy send-sms-msg91 --no-verify-jwt
```
Your function URL is:
`https://<project-ref>.functions.supabase.co/send-sms-msg91`

**B.3 — Point Supabase auth at it**
1. Supabase → **Authentication** → **Hooks** (Beta) → **Send SMS hook** → **Enable**.
2. Type: **HTTPS** → paste the function URL.
3. **Secret:** paste the same `SEND_SMS_HOOK_SECRET` value from B.2. **Save.**
4. Remove your dev **Test OTP** numbers (or keep one for support) and send yourself a real OTP.

See `supabase/functions/send-sms-msg91/README.md` for the exact DLT variable name + a curl test.

### C. Which provider? (cheapest → easiest)

| Provider | Native to Supabase? | India cost/SMS* | Effort |
| --- | --- | --- | --- |
| **MSG91** | No (this repo's hook) | ~₹0.12–0.20 | Medium (DLT + deploy function) — **cheapest** |
| **Fast2SMS** | No (same hook pattern) | ~₹0.15–0.25 | Medium |
| **Textlocal** | ✅ Yes (paste keys) | ~₹0.20–0.30 | Low |
| **Twilio** | ✅ Yes (paste keys) | ~₹5–7 (₹ / intl SMS) | Lowest effort — **most expensive** |

\* Indicative only — check current pricing. For India volume, **MSG91 is the cheapest working option**;
**Twilio** is the zero-code fallback if you don't want to deploy a function.

### D. Free alternatives to SMS — Email OTP and Google Sign-In

Phone OTP costs money per SMS regardless of provider. Email OTP and Google OAuth are
both built into Supabase at **no extra cost**, and this app lets admin toggle all
three independently from **Admin → Commission → Login Methods** (phone can be turned
off entirely once traffic doesn't need it).

**Email OTP** — no setup required. Supabase's built-in email sending works out of the
box (low-volume; add a custom SMTP provider under **Authentication → Settings → SMTP**
before real traffic, same "test now, scale later" shape as MSG91 for phone).

**Google Sign-In**:
1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services →
   Credentials** → **Create OAuth client ID** (type: Web application).
2. **Authorized redirect URI**: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Copy the **Client ID** and **Client Secret**.
4. Supabase → **Authentication → Providers → Google** → enable → paste both → **Save**.
5. Supabase → **Authentication → URL Configuration → Redirect URLs** → add
   `https://your-domain.com/auth/callback` (and `http://localhost:3000/auth/callback`
   for local dev).
6. In **Admin → Commission → Login Methods**, turn on **Google Sign-In**.

---

## 6. Storage buckets

`0003_storage.sql` already created these (verify under **Storage**):

| Bucket | Visibility | Use |
| --- | --- | --- |
| `number-images` | public | listing photos |
| `avatars` | public | customer/partner photos |
| `logos` | public | business logos |
| `banners` | public | homepage banners |
| `kyc-docs` | private | PAN/GST (served via signed URLs) |
| `payment-screenshots` | private | manual payment proofs (signed URLs) |

If any are missing, create them with the exact **name** and **public/private** setting above.

---

## 7. Make yourself the admin

1. Start the app (`npm run dev`), open `/login`, and sign in with **your** mobile via OTP
   (Test OTP is fine). This creates your `profiles` row.
2. Open `supabase/migrations/0004_admin_bootstrap.sql`, set your number in **E.164 without `+`**
   (e.g. `919876543210`), and **Run** it in the SQL Editor.
3. Refresh — you now have `/admin`.

---

## 8. Razorpay (online payments) — optional

You can **skip this entirely at launch** (manual UPI/bank/cash already works). Add it when you want
card/UPI online checkout.

**8.1 Test mode**
1. Create an account at https://razorpay.com (business KYC needed for live payouts).
2. Dashboard → **Settings → API Keys → Generate Test Key**. Copy into `.env.local`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=your_test_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx   # same as RAZORPAY_KEY_ID
   ```
3. Dashboard → **Settings → Webhooks → Add New Webhook**:
   - **URL:** `https://YOUR_DOMAIN/api/razorpay/webhook` (use your Vercel/prod URL; for local testing
     expose it with a tunnel like `ngrok`).
   - **Secret:** any strong string → also put it in `.env.local` as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active events:** `payment.captured` and `order.paid`.
4. Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

**8.2 Go live**
Activate your account (KYC) → **Settings → API Keys** switch to **Live** → regenerate **live** keys →
update the env vars in Vercel → add a **live webhook** with the live URL + a new secret.

---

## 9. Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```
Production build check: `npm run build && npm run start`.

---

## 10. Deploy to Vercel

1. Push your branch to GitHub (already done for `claude/jiovipnumber-marketplace-ucb7t3`).
2. https://vercel.com → **Add New → Project** → **Import** `manish6007/jiovipnumbers`.
3. Framework preset auto-detects **Next.js**. Before deploying, open **Environment Variables** and add
   **every** key from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL for now)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - Razorpay keys (if using): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
     `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. **Deploy.** You'll get `https://your-project.vercel.app`.

---

## 11. Custom domain + DNS

1. Buy a domain (e.g. `jiovipnumber.com`) from any registrar.
2. Vercel → your project → **Settings → Domains** → **Add** your domain → follow the shown records
   (usually an **A record** to Vercel's IP for the apex, and a **CNAME** `www → cname.vercel-dns.com`).
3. After DNS verifies, update these to the real domain:
   - Vercel env `NEXT_PUBLIC_SITE_URL=https://jiovipnumber.com` → redeploy.
   - Supabase → **Authentication → URL Configuration** → set **Site URL** (and add the domain to
     **Redirect URLs**).
   - Razorpay webhook URL → `https://jiovipnumber.com/api/razorpay/webhook`.

---

## 12. Troubleshooting

| Symptom | Fix |
| --- | --- |
| **OTP never arrives (prod)** | DLT template/sender not approved yet; wrong `MSG91_*` secret; check the function logs: `supabase functions logs send-sms-msg91`. Use Test OTP meanwhile. |
| **"new row violates row-level security"** | You're writing with the `anon` client where a server action should run, or you're not logged in / not the owner. Confirm you ran `0002_rls.sql` and are signed in. |
| **Admin/partner writes fail silently** | `SUPABASE_SERVICE_ROLE_KEY` is missing/incorrect in the environment — server actions need it. |
| **Images don't load** | The Supabase host must be allowed by `next.config.mjs` (`NEXT_PUBLIC_SUPABASE_URL` derives it) — set the env var and redeploy. |
| **Razorpay "signature verification failed"** | Webhook secret in the dashboard ≠ `RAZORPAY_WEBHOOK_SECRET`; make them identical. |
| **`/admin` bounces to home** | Your profile `role` isn't `admin` — rerun `0004_admin_bootstrap.sql` with the exact phone (E.164, no `+`). |

---

## 13. Go-live checklist

- [ ] Migrations `0001–0003` run; buckets present; admin created (`0004`).
- [ ] **Test OTP numbers removed**; MSG91 hook live, DLT approved, real OTP received.
- [ ] Razorpay in **Live** mode (if used); live webhook set; a real ₹1 test order verified.
- [ ] All env vars set in Vercel; `NEXT_PUBLIC_SITE_URL` = real domain.
- [ ] Supabase Auth **Site URL/redirects** = real domain; consider raising **rate limits** sensibly.
- [ ] `service_role` key only in server env (never client), keys rotated if ever exposed.
- [ ] Review legal pages (`/terms`, `/privacy`) with counsel; set support email/number.
- [ ] Supabase **backups** enabled (paid plan) before serious traffic.

---

Related docs: **[DATABASE.md](DATABASE.md)** (schema + RLS) · **[API.md](API.md)** (server actions +
webhook) · repo **[README](../README.md)**.
