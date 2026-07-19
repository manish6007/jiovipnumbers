// Supabase "Send SMS" Auth Hook → MSG91 (cheapest India OTP delivery).
//
// Supabase Phone Auth generates the OTP and calls this function with:
//   { user: { phone, ... }, sms: { otp } }
// We forward it to MSG91's Flow API using a DLT-approved transactional template.
//
// Deploy + configure: see README.md in this folder.
// Runtime: Deno (Supabase Edge Functions). This file is NOT part of the Next build.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface HookPayload {
  user: { phone?: string | null };
  sms: { otp: string };
}

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";

/**
 * Every deployed Supabase Edge Function automatically gets SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY injected — these are reserved names, you do NOT
 * `supabase secrets set` them yourself (the CLI rejects that). Used here only
 * to write an audit_logs row per send attempt, same pattern the rest of the
 * app uses via lib/notifications.ts's audit(). Never logs the OTP itself.
 */
function auditClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

async function logAttempt(mobile: string, ok: boolean, detail?: string) {
  const client = auditClient();
  if (!client) return; // best-effort only — never blocks OTP delivery
  try {
    await client.from("audit_logs").insert({
      action: ok ? "otp.sms.sent" : "otp.sms.failed",
      entity_type: "phone",
      metadata: { phone_last4: mobile.slice(-4), provider: "msg91", detail: detail?.slice(0, 200) },
    });
  } catch (e) {
    console.error("audit log insert failed:", e);
  }
}

Deno.serve(async (req) => {
  try {
    const raw = await req.text();

    // 1) Verify the request really came from your Supabase project (recommended).
    //    The hook secret looks like "v1,whsec_...."; standardwebhooks wants the base64 part.
    const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
    let payload: HookPayload;
    if (hookSecret) {
      const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));
      payload = wh.verify(raw, Object.fromEntries(req.headers)) as HookPayload;
    } else {
      payload = JSON.parse(raw) as HookPayload;
    }

    const otp = payload?.sms?.otp;
    const mobile = (payload?.user?.phone ?? "").replace(/\D/g, ""); // e.g. 919876543210
    if (!otp || !mobile) {
      return json(400, "Missing phone or otp in hook payload");
    }

    // 2) Required MSG91 config (set via `supabase secrets set ...`).
    const authkey = Deno.env.get("MSG91_AUTH_KEY");
    const templateId = Deno.env.get("MSG91_TEMPLATE_ID");
    const sender = Deno.env.get("MSG91_SENDER_ID"); // optional; usually set in the flow
    const otpVar = Deno.env.get("MSG91_OTP_VAR") ?? "otp"; // must match your flow variable
    if (!authkey || !templateId) {
      return json(500, "MSG91_AUTH_KEY / MSG91_TEMPLATE_ID not configured");
    }

    // 3) Send via MSG91 Flow API.
    const body: Record<string, unknown> = {
      template_id: templateId,
      short_url: "0",
      recipients: [{ mobiles: mobile, [otpVar]: otp }],
    };
    if (sender) body.sender = sender;

    const res = await fetch(MSG91_FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", authkey },
      body: JSON.stringify(body),
    });
    const text = await res.text();

    // MSG91 returns 200 with { type: "success" | "error", message }.
    if (!res.ok || /"type"\s*:\s*"error"/.test(text)) {
      console.error("MSG91 send failed:", res.status, text);
      await logAttempt(mobile, false, text);
      return json(500, `MSG91 error: ${text.slice(0, 300)}`);
    }

    await logAttempt(mobile, true);
    return new Response("{}", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-sms-msg91 hook error:", err);
    return json(500, err instanceof Error ? err.message : "Unknown error");
  }
});

/** Supabase auth hooks read errors from this shape on a non-200 response. */
function json(code: number, message: string): Response {
  return new Response(
    JSON.stringify({ error: { http_code: code, message } }),
    { status: code, headers: { "Content-Type": "application/json" } },
  );
}
