"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/types/database";

export interface ResolvedCoupon {
  coupon: Coupon;
  discountAmount: number;
}

/**
 * Internal validation shared by previewCoupon (read-only) and createBooking
 * (which actually redeems it). Never trust a client-supplied discount amount
 * — this is the only place that computes one.
 */
export async function resolveCoupon(
  rawCode: string,
  price: number,
): Promise<{ ok: true; result: ResolvedCoupon } | { ok: false; error: string }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a coupon code." };

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!coupon) return { ok: false, error: "Invalid coupon code." };
  if (!coupon.is_active) return { ok: false, error: "This coupon is no longer active." };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, error: "This coupon isn't active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, error: "This coupon has expired." };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (coupon.min_order_value !== null && price < coupon.min_order_value) {
    return {
      ok: false,
      error: `This coupon requires a minimum order of ${coupon.min_order_value}.`,
    };
  }

  const rawDiscount =
    coupon.discount_type === "percentage"
      ? Math.round((price * Number(coupon.discount_value)) / 100)
      : Math.round(Number(coupon.discount_value));
  const discountAmount = Math.min(Math.max(0, rawDiscount), price);

  return { ok: true, result: { coupon: coupon as Coupon, discountAmount } };
}

/** Customer-facing preview — no redemption side effects. */
export async function previewCoupon(
  code: string,
  price: number,
): Promise<{ discountAmount?: number; finalPrice?: number; error?: string }> {
  const resolved = await resolveCoupon(code, price);
  if (!resolved.ok) return { error: resolved.error };
  return {
    discountAmount: resolved.result.discountAmount,
    finalPrice: price - resolved.result.discountAmount,
  };
}
