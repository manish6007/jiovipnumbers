# `send-email-resend` — Supabase Send Email Auth Hook → Resend

Delivers Supabase email OTP codes via **Resend** (free tier, 3,000 emails/month). Resend is
not a native Supabase SMTP provider we rely on here — instead this Edge Function bridges
Supabase's **"Send Email" hook** to Resend's HTTP API, so the email always contains the
actual code (Supabase's default templates only include a magic link). Note: this project's
email OTP length is **8 digits**, not 6 — `OtpInput`'s `length` prop is set per-method in
`login-form.tsx`/`partner-register-form.tsx` to match (check Auth settings if you change it).

## Prerequisites

1. A Resend account + API key (`re_...`) — already stored as a Supabase secret, see Deploy below.
2. **Before any real user can receive an email**: verify your own sending domain in Resend
   (Resend dashboard → Domains → add domain → add the DNS records it gives you), then set
   `RESEND_FROM_EMAIL` to an address on that domain (e.g.
   `JioVIPNumber <noreply@yourdomain.com>`). **Until you do this, Resend's sandbox mode only
   delivers to the Resend account owner's own email address** — every other recipient gets
   rejected with a `403 validation_error` ("You can only send testing emails to your own
   email address"). This isn't a bug in the function; it's Resend's anti-abuse restriction on
   unverified accounts.

## Deploy

```bash
npx supabase link --project-ref <your-project-ref>

npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
npx supabase secrets set RESEND_FROM_EMAIL="JioVIPNumber <noreply@yourdomain.com>"   # optional
npx supabase secrets set SEND_EMAIL_HOOK_SECRET=$(openssl rand -hex 32)             # save this value

npx supabase functions deploy send-email-resend --no-verify-jwt
```

Function URL: `https://<project-ref>.functions.supabase.co/send-email-resend`

> `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected into every deployed Edge
> Function — don't set them yourself. Used here only to write a best-effort `audit_logs` row
> per send attempt (`otp.email.sent` / `otp.email.failed`, email domain only — never the code).

## Wire it into Supabase Auth

Supabase → **Authentication → Hooks → Send Email hook** → **Enable** → type **HTTPS** →
paste the function URL → **Secret** = the same `SEND_EMAIL_HOOK_SECRET` value → **Save**.

Once this hook is enabled, Supabase stops sending emails itself entirely for
auth events (signup confirmation, magic link / OTP, password recovery) — this
function is now fully responsible, so there's no need to edit the dashboard's
Email Templates at all.

## Test

```bash
# simulate the hook payload (only works when SEND_EMAIL_HOOK_SECRET is unset):
curl -X POST https://<project-ref>.functions.supabase.co/send-email-resend \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"you@example.com"},"email_data":{"token":"123456","email_action_type":"signup"}}'

# logs:
npx supabase functions logs send-email-resend
```
