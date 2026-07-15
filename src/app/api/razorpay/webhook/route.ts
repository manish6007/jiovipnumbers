import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Razorpay webhook. Configure the endpoint + secret in the Razorpay dashboard.
 * Verifies the signature, then reconciles the matching order to `paid`.
 * Events handled: payment.captured, order.paid.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature") || "";
  const body = await request.text();

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string } };
      order?: { entity?: { id?: string } };
    };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const rzpOrderId =
    event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id;
  const rzpPaymentId = event.payload?.payment?.entity?.id;

  if (
    (event.event === "payment.captured" || event.event === "order.paid") &&
    rzpOrderId
  ) {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", rzpOrderId)
      .maybeSingle();

    if (order && order.payment_status !== "paid") {
      await admin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          razorpay_payment_id: rzpPaymentId ?? null,
        })
        .eq("id", order.id);
      await admin.from("audit_logs").insert({
        action: "order.paid.webhook",
        entity_type: "order",
        entity_id: order.id,
        metadata: { event: event.event },
      });
    }
  }

  return NextResponse.json({ received: true });
}
