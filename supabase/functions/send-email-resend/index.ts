// Supabase "Send Email" Auth Hook → Resend (free tier, no custom SMTP needed).
//
// Supabase Auth generates the OTP/token and calls this function with:
//   { user: { email, ... }, email_data: { token, email_action_type, ... } }
// We send the actual email ourselves via Resend's API — full control over
// content, so the email always shows the 6-digit code (no fighting with
// Supabase's default magic-link-only templates).
//
// Deploy + configure: see README.md in this folder.
// Runtime: Deno (Supabase Edge Functions). This file is NOT part of the Next build.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface HookPayload {
  user: { email?: string | null };
  email_data: {
    token: string;
    email_action_type: string; // "signup" | "magiclink" | "recovery" | "email_change" | ...
  };
}

const RESEND_URL = "https://api.resend.com/emails";

/** Same reserved-env-var pattern as send-sms-msg91: auto-injected, never set manually. */
function auditClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

async function logAttempt(email: string, ok: boolean, detail?: string) {
  const client = auditClient();
  if (!client) return;
  try {
    await client.from("audit_logs").insert({
      action: ok ? "otp.email.sent" : "otp.email.failed",
      entity_type: "email",
      metadata: { email_domain: email.split("@")[1] ?? "", provider: "resend", detail: detail?.slice(0, 200) },
    });
  } catch (e) {
    console.error("audit log insert failed:", e);
  }
}

function subjectAndIntro(actionType: string): { subject: string; intro: string } {
  switch (actionType) {
    case "signup":
      return { subject: "Confirm your JioVIPNumber account", intro: "Your confirmation code is" };
    case "recovery":
      return { subject: "Reset your JioVIPNumber password", intro: "Your password reset code is" };
    default:
      return { subject: "Your JioVIPNumber login code", intro: "Your login code is" };
  }
}

Deno.serve(async (req) => {
  try {
    const raw = await req.text();

    // 1) Verify the request really came from your Supabase project (recommended).
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    let payload: HookPayload;
    if (hookSecret) {
      const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));
      payload = wh.verify(raw, Object.fromEntries(req.headers)) as HookPayload;
    } else {
      payload = JSON.parse(raw) as HookPayload;
    }

    const email = payload?.user?.email ?? "";
    const token = payload?.email_data?.token;
    if (!email || !token) {
      return json(400, "Missing email or token in hook payload");
    }

    // 2) Required Resend config.
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "JioVIPNumber <onboarding@resend.dev>";
    if (!apiKey) {
      return json(500, "RESEND_API_KEY not configured");
    }

    const { subject, intro } = subjectAndIntro(payload.email_data.email_action_type);
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="margin-bottom: 8px;">${subject}</h2>
        <p style="color: #555;">${intro}</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${token}</p>
        <p style="color: #888; font-size: 13px;">This code expires shortly. If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });
    const text = await res.text();

    if (!res.ok) {
      console.error("Resend send failed:", res.status, text);
      await logAttempt(email, false, text);
      return json(500, `Resend error: ${text.slice(0, 300)}`);
    }

    await logAttempt(email, true);
    return new Response("{}", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email-resend hook error:", err);
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
