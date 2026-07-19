"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateCommission, DEFAULT_COMMISSION } from "@/lib/commission";
import { notify, audit, getAdminIds } from "@/lib/notifications";
import { getRazorpay, verifyPaymentSignature } from "@/lib/razorpay";
import { getCurrentUser, getCurrentPartner } from "@/lib/auth";
import { resolveCoupon } from "@/app/actions/coupons";
import type { OrderStatus, PaymentMethod } from "@/types/database";

interface CreateBookingInput {
  numberId: string;
  paymentMethod: PaymentMethod;
  customerNote?: string;
  couponCode?: string;
}

/**
 * Customer Buy Now. Snapshots the commission split server-side from the active
 * commission_settings row, reserves the number, and notifies partner + admins.
 * For Razorpay it also creates a gateway order and returns it to the client.
 */
export async function createBooking(input: CreateBookingInput): Promise<{
  orderId?: string;
  orderCode?: string;
  razorpay?: { orderId: string; amount: number; keyId: string } | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to book this number." };

  // Load the listing (must be publicly buyable) via service role for a
  // consistent read of partner + price.
  const admin = createAdminClient();
  const { data: number } = await admin
    .from("numbers")
    .select("id, selling_price, status, listing_status, partner_id, mobile_number, slug")
    .eq("id", input.numberId)
    .maybeSingle();

  if (!number) return { error: "Number not found." };
  if (number.listing_status !== "approved" || number.status !== "available") {
    return { error: "This number is no longer available." };
  }

  // Coupon (optional) — resolved and re-validated server-side; never trust a
  // client-supplied discount. Reduces the price before commission is
  // calculated, so the partner's earning is recomputed from the discounted
  // price exactly like any other price change.
  let discountAmount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const resolved = await resolveCoupon(input.couponCode, number.selling_price);
    if (!resolved.ok) return { error: resolved.error };
    discountAmount = resolved.result.discountAmount;
    couponId = resolved.result.coupon.id;
  }
  const discountedPrice = number.selling_price - discountAmount;

  // Active commission snapshot.
  const { data: setting } = await admin
    .from("commission_settings")
    .select("type, value")
    .eq("is_active", true)
    .maybeSingle();
  const commissionSetting = setting ?? DEFAULT_COMMISSION;
  const split = calculateCommission(discountedPrice, commissionSetting);

  // Create the order + reserve the number.
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      number_id: number.id,
      customer_id: user.id,
      partner_id: number.partner_id,
      price: split.customerPays,
      commission_amount: split.commissionAmount,
      partner_earning: split.partnerEarning,
      commission_type: commissionSetting.type,
      commission_value: commissionSetting.value,
      status: "pending",
      payment_method: input.paymentMethod,
      payment_status:
        input.paymentMethod === "razorpay" ? "unpaid" : "awaiting_verification",
      customer_note: input.customerNote ?? null,
      coupon_id: couponId,
      discount_amount: discountAmount,
    })
    .select("id, order_code")
    .single();

  if (orderErr || !order) return { error: orderErr?.message ?? "Could not create booking." };

  if (couponId) {
    await admin.from("coupon_redemptions").insert({
      coupon_id: couponId,
      order_id: order.id,
      customer_id: user.id,
      discount_amount: discountAmount,
    });
    const { data: couponRow } = await admin
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .maybeSingle();
    if (couponRow) {
      await admin
        .from("coupons")
        .update({ used_count: couponRow.used_count + 1 })
        .eq("id", couponId);
    }
  }

  await admin.from("numbers").update({ status: "reserved" }).eq("id", number.id);

  // Notifications: partner + all admins + customer confirmation.
  const { data: partner } = await admin
    .from("partners")
    .select("user_id")
    .eq("id", number.partner_id)
    .maybeSingle();
  const adminIds = await getAdminIds();
  await notify([
    ...(partner
      ? [
          {
            userId: partner.user_id as string,
            type: "order.new",
            title: "New booking request",
            body: `Booking ${order.order_code} for ${number.mobile_number}.`,
            link: "/partner/orders",
          },
        ]
      : []),
    ...adminIds.map((id) => ({
      userId: id,
      type: "order.new",
      title: "New booking request",
      body: `Booking ${order.order_code} received.`,
      link: "/admin/orders",
    })),
    {
      userId: user.id,
      type: "order.confirmation",
      title: "Booking placed",
      body: `Your booking ${order.order_code} is pending confirmation.`,
      link: "/dashboard/orders",
    },
  ]);
  await audit({
    actorId: user.id,
    action: "order.create",
    entityType: "order",
    entityId: order.id,
    metadata: { numberId: number.id, method: input.paymentMethod },
  });

  // Razorpay: create gateway order.
  let razorpay: { orderId: string; amount: number; keyId: string } | null = null;
  if (input.paymentMethod === "razorpay") {
    const rzp = getRazorpay();
    if (!rzp) {
      return {
        orderId: order.id,
        orderCode: order.order_code,
        error: "Online payment is not configured. Please choose another method.",
      };
    }
    const rzpOrder = await rzp.orders.create({
      amount: split.customerPays * 100,
      currency: "INR",
      receipt: order.order_code,
      notes: { orderId: order.id },
    });
    await admin
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", order.id);
    razorpay = {
      orderId: rzpOrder.id,
      amount: split.customerPays * 100,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    };
  }

  revalidatePath("/dashboard/orders");
  return { orderId: order.id, orderCode: order.order_code, razorpay };
}

/** Confirm a Razorpay payment from the client callback (signature verified). */
export async function confirmRazorpayPayment(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const valid = verifyPaymentSignature({
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
    signature: input.razorpaySignature,
  });
  if (!valid) return { error: "Payment verification failed." };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, customer_id, razorpay_order_id")
    .eq("id", input.orderId)
    .maybeSingle();
  if (!order || order.customer_id !== user.id) return { error: "Order not found." };
  if (order.razorpay_order_id !== input.razorpayOrderId)
    return { error: "Order mismatch." };

  await admin
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
    })
    .eq("id", order.id);

  await audit({
    actorId: user.id,
    action: "order.paid.razorpay",
    entityType: "order",
    entityId: order.id,
  });
  revalidatePath("/dashboard/orders");
  return { ok: true };
}

/**
 * Advance an order's status. Callable by the owning partner or an admin.
 * Side effects: `completed` marks the number sold; `cancelled` releases the
 * number back to available.
 */
export async function advanceOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ ok?: boolean; error?: string }> {
  const { profile } = await getCurrentUser();
  if (!profile) return { error: "Not authenticated." };
  const isAdmin = profile.role === "admin";
  const partner = isAdmin ? null : await getCurrentPartner();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, number_id, partner_id, customer_id, order_code")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Order not found." };

  // Authorize: admin, or the partner who owns this order.
  if (!isAdmin && (!partner || partner.id !== order.partner_id)) {
    return { error: "Not authorized." };
  }

  await admin.from("orders").update({ status }).eq("id", orderId);

  if (status === "completed") {
    await admin.from("numbers").update({ status: "sold" }).eq("id", order.number_id);
  } else if (status === "cancelled") {
    await admin.from("numbers").update({ status: "available" }).eq("id", order.number_id);
  } else if (status === "confirmed") {
    await admin.from("numbers").update({ status: "reserved" }).eq("id", order.number_id);
  }

  await notify([
    {
      userId: order.customer_id,
      type: "order.update",
      title: `Order ${status}`,
      body: `Your booking ${order.order_code} is now ${status}.`,
      link: "/dashboard/orders",
    },
  ]);
  await audit({
    actorId: profile.id,
    action: `order.${status}`,
    entityType: "order",
    entityId: orderId,
  });

  revalidatePath("/partner/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
  return { ok: true };
}

/**
 * Auction winners get an order with no payment_method yet (they didn't pick one
 * up front like Buy Now). This lets them choose one afterward from
 * /dashboard/orders. Razorpay isn't wired into this path in v1 — manual
 * methods only.
 */
export async function chooseWonOrderPaymentMethod(
  orderId: string,
  method: Exclude<PaymentMethod, "razorpay">,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, customer_id, payment_method")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.customer_id !== user.id) return { error: "Order not found." };
  if (order.payment_method) return { error: "Payment method already set." };

  const { error } = await admin
    .from("orders")
    .update({ payment_method: method, payment_status: "awaiting_verification" })
    .eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/orders");
  return { ok: true };
}

/** Admin verifies a manual payment (marks paid + confirms). */
export async function verifyManualPayment(
  orderId: string,
): Promise<{ ok?: boolean; error?: string }> {
  const { profile } = await getCurrentUser();
  if (!profile || profile.role !== "admin") return { error: "Admin only." };
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, customer_id, order_code")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Order not found." };

  await admin
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("id", orderId);
  await notify([
    {
      userId: order.customer_id,
      type: "payment.verified",
      title: "Payment verified",
      body: `Your payment for ${order.order_code} was verified. Order confirmed.`,
      link: "/dashboard/orders",
    },
  ]);
  await audit({ actorId: profile.id, action: "payment.verify", entityType: "order", entityId: orderId });
  revalidatePath("/admin/orders");
  return { ok: true };
}

/** Customer uploads a manual payment screenshot (stored path). */
export async function submitPaymentProof(input: {
  orderId: string;
  screenshotUrl: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("orders")
    .update({
      payment_screenshot_url: input.screenshotUrl,
      payment_status: "awaiting_verification",
    })
    .eq("id", input.orderId)
    .eq("customer_id", user.id);
  if (error) return { error: error.message };

  const adminIds = await getAdminIds();
  await notify(
    adminIds.map((id) => ({
      userId: id,
      type: "payment.proof",
      title: "Payment proof uploaded",
      body: "A customer uploaded a payment screenshot for verification.",
      link: "/admin/orders",
    })),
  );
  revalidatePath("/dashboard/orders");
  return { ok: true };
}
