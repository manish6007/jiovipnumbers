# `send-sms-msg91` — Supabase Send SMS Auth Hook → MSG91

Delivers Supabase phone-auth OTPs via **MSG91** (cheapest per-SMS for India). MSG91 is not a native
Supabase SMS provider, so this Edge Function bridges Supabase's **"Send SMS" hook** to MSG91's Flow
API. Full context is in [`docs/SETUP.md` §5B](../../../docs/SETUP.md).

## Prerequisites (MSG91 + DLT)

1. MSG91 account → complete **DLT** (TRAI requirement in India):
   - Register a **Sender ID** (6 chars, e.g. `JIOVIP`).
   - Create a **Transactional template** with an OTP variable, e.g.
     `Your JioVIPNumber OTP is ##OTP##. Do not share it.`
2. In MSG91 **Flow**, create a flow bound to that DLT template. Note:
   - the **Template/Flow ID** → `MSG91_TEMPLATE_ID`
   - the **variable name** you used for the OTP (e.g. `otp`) → `MSG91_OTP_VAR`
3. Copy your account **Auth Key** → `MSG91_AUTH_KEY`.

## Deploy

```bash
supabase login
supabase link --project-ref <your-project-ref>

supabase secrets set MSG91_AUTH_KEY=xxxxxxxxxxxxxxxx
supabase secrets set MSG91_TEMPLATE_ID=your_flow_template_id
supabase secrets set MSG91_SENDER_ID=JIOVIP           # optional (usually set in the flow)
supabase secrets set MSG91_OTP_VAR=otp                # must match the flow variable name
supabase secrets set SEND_SMS_HOOK_SECRET=$(openssl rand -hex 32)   # save this value

supabase functions deploy send-sms-msg91 --no-verify-jwt
```

Function URL: `https://<project-ref>.functions.supabase.co/send-sms-msg91`

## Wire it into Supabase Auth

Supabase → **Authentication → Hooks → Send SMS hook** → **Enable** → type **HTTPS** →
paste the function URL → **Secret** = the same `SEND_SMS_HOOK_SECRET` value → **Save**.

> If you set `SEND_SMS_HOOK_SECRET`, the function verifies every request (recommended). If you leave it
> unset, verification is skipped — fine for a quick test, not for production.

## Test

```bash
# simulate the hook payload (only works when SEND_SMS_HOOK_SECRET is unset):
curl -X POST https://<project-ref>.functions.supabase.co/send-sms-msg91 \
  -H "Content-Type: application/json" \
  -d '{"user":{"phone":"919876543210"},"sms":{"otp":"123456"}}'

# logs:
supabase functions logs send-sms-msg91
```

Locally: `supabase functions serve send-sms-msg91 --no-verify-jwt` (needs the Supabase CLI + Docker).
Type-check: `deno check index.ts`.

## Payload contract

Supabase sends `{ user: { phone }, sms: { otp } }`. The function strips non-digits from `phone`
(→ `919876543210`) and POSTs to MSG91 Flow:
`{ template_id, short_url:"0", recipients:[{ mobiles, <MSG91_OTP_VAR>: otp }] }`.

## Swapping MSG91 for Fast2SMS (also cheap)

Same hook shape — change only the outbound call in `index.ts` to Fast2SMS's API
(`https://www.fast2sms.com/dev/bulkV2`) with your `authorization` key and a DLT template. Everything
else (secret verification, payload parsing) stays.
