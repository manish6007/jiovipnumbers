"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateCommission, DEFAULT_COMMISSION } from "@/lib/commission";
import { minNextBid } from "@/lib/bidding";
import { bidSchema } from "@/lib/validators";
import { notify, audit, getAdminIds } from "@/lib/notifications";
import type { PlatformSettings } from "@/types/database";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

/** Global platform toggles (bidding, login methods). Public read, admin-only write. */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("platform_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  return (data as PlatformSettings) ?? {
    id: SETTINGS_ID,
    bidding_enabled: false,
    phone_otp_enabled: true,
    email_otp_enabled: false,
    google_oauth_enabled: false,
    updated_by: null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Close out an auction whose deadline has passed. No-op otherwise. Called
 * lazily wherever an auction listing is read or bid on — this codebase has
 * no cron/scheduled-job mechanism, so settlement happens on next access
 * rather than exactly at the deadline.
 */
export async function maybeSettleAuction(numberId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: number } = await admin
    .from("numbers")
    .select(
      "id, selling_price, partner_id, mobile_number, slug, auction_status, auction_ends_at, current_bid, highest_bidder_id",
    )
    .eq("id", numberId)
    .maybeSingle();

  if (!number) return;
  if (number.auction_status !== "active") return;
  if (!number.auction_ends_at || new Date(number.auction_ends_at) > new Date()) return;

  if (!number.highest_bidder_id || !number.current_bid) {
    // No bids — silently fall back to the normal fixed-price listing.
    await admin.from("numbers").update({ auction_status: "ended" }).eq("id", numberId);
    return;
  }

  // Winning bid — create an order the same way createBooking does, minus a
  // chosen payment method (the winner picks that afterward on /dashboard/orders).
  const { data: setting } = await admin
    .from("commission_settings")
    .select("type, value")
    .eq("is_active", true)
    .maybeSingle();
  const commissionSetting = setting ?? DEFAULT_COMMISSION;
  const split = calculateCommission(number.current_bid, commissionSetting);

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      number_id: number.id,
      customer_id: number.highest_bidder_id,
      partner_id: number.partner_id,
      price: split.customerPays,
      commission_amount: split.commissionAmount,
      partner_earning: split.partnerEarning,
      commission_type: commissionSetting.type,
      commission_value: commissionSetting.value,
      status: "pending",
      payment_status: "unpaid",
    })
    .select("id, order_code")
    .single();

  if (orderErr || !order) return;

  await admin
    .from("numbers")
    .update({ status: "reserved", auction_status: "ended" })
    .eq("id", numberId);

  const { data: partner } = await admin
    .from("partners")
    .select("user_id")
    .eq("id", number.partner_id)
    .maybeSingle();
  const adminIds = await getAdminIds();
  await notify([
    {
      userId: number.highest_bidder_id,
      type: "auction.won",
      title: "You won the auction! 🎉",
      body: `${number.mobile_number} is yours for ${split.customerPays}. Complete payment to confirm your booking.`,
      link: "/dashboard/orders",
    },
    ...(partner
      ? [
          {
            userId: partner.user_id as string,
            type: "auction.ended",
            title: "Auction ended — sold",
            body: `${number.mobile_number} sold for ${split.customerPays} via bidding.`,
            link: "/partner/orders",
          },
        ]
      : []),
    ...adminIds.map((id) => ({
      userId: id,
      type: "auction.ended",
      title: "Auction ended — sold",
      body: `${number.mobile_number} sold for ${split.customerPays} via bidding.`,
      link: "/admin/orders",
    })),
  ]);
  await audit({
    action: "auction.won",
    entityType: "order",
    entityId: order.id,
    metadata: { numberId: number.id, amount: number.current_bid },
  });

  revalidatePath(`/number/${number.slug}`);
}

export async function placeBid(input: {
  numberId: string;
  amount: number;
}): Promise<{ ok?: boolean; error?: string; minNext?: number }> {
  const parsed = bidSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to place a bid." };

  // Settle first so a bid can't land on an already-expired auction.
  await maybeSettleAuction(parsed.data.numberId);

  const admin = createAdminClient();
  const { data: number } = await admin
    .from("numbers")
    .select(
      "id, listing_status, status, partner_id, mobile_number, slug, auction_status, auction_ends_at, starting_bid, current_bid, highest_bidder_id, bid_count",
    )
    .eq("id", parsed.data.numberId)
    .maybeSingle();

  if (!number) return { error: "Number not found." };
  if (number.listing_status !== "approved" || number.auction_status !== "active") {
    return { error: "This auction is not active." };
  }
  if (!number.auction_ends_at || new Date(number.auction_ends_at) <= new Date()) {
    return { error: "This auction has ended." };
  }
  if (number.partner_id === (await getCurrentPartnerIdFor(user.id))) {
    return { error: "You can't bid on your own listing." };
  }

  const base = number.current_bid ?? number.starting_bid ?? 0;
  const minNext = minNextBid(base);
  if (parsed.data.amount < minNext) {
    return { error: `Minimum next bid is ${minNext}.`, minNext };
  }

  const previousBidderId = number.highest_bidder_id;

  const { error: bidErr } = await admin.from("bids").insert({
    number_id: number.id,
    bidder_id: user.id,
    amount: parsed.data.amount,
  });
  if (bidErr) return { error: bidErr.message };

  await admin
    .from("numbers")
    .update({
      current_bid: parsed.data.amount,
      highest_bidder_id: user.id,
      bid_count: (number.bid_count ?? 0) + 1,
    })
    .eq("id", number.id);

  const { data: partner } = await admin
    .from("partners")
    .select("user_id")
    .eq("id", number.partner_id)
    .maybeSingle();
  await notify([
    ...(previousBidderId && previousBidderId !== user.id
      ? [
          {
            userId: previousBidderId,
            type: "bid.outbid",
            title: "You've been outbid",
            body: `Someone bid higher on ${number.mobile_number}.`,
            link: `/number/${number.slug}`,
          },
        ]
      : []),
    ...(partner
      ? [
          {
            userId: partner.user_id as string,
            type: "bid.new",
            title: "New bid on your number",
            body: `${number.mobile_number} now has a bid of ${parsed.data.amount}.`,
            link: "/partner/listings",
          },
        ]
      : []),
  ]);
  await audit({
    actorId: user.id,
    action: "bid.place",
    entityType: "number",
    entityId: number.id,
    metadata: { amount: parsed.data.amount },
  });

  revalidatePath(`/number/${number.slug}`);
  return { ok: true };
}

async function getCurrentPartnerIdFor(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("partners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.id as string) ?? null;
}
