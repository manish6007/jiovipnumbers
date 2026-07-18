"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentPartner } from "@/lib/auth";
import { numberListingSchema, type NumberListingInput } from "@/lib/validators";
import { numberSlug } from "@/lib/utils";
import { audit, notify, getAdminIds } from "@/lib/notifications";
import { AUCTION_DURATION_HOURS, type AuctionDurationKey } from "@/lib/bidding";
import type { NumberStatus } from "@/types/database";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Ensure the caller has a partner account; returns partner or an error.
 * Pending partners may still prepare listings — public visibility already
 * requires both the partner and the listing to be approved (see
 * `searchNumbers` / `fetchSection`), so gating creation here would just be
 * redundant with what the dashboard banner already tells them.
 */
async function requirePartner() {
  const partner = await getCurrentPartner();
  if (!partner) return { error: "Partner account required." as const };
  return { partner };
}

export async function createNumber(
  input: NumberListingInput & {
    imageUrls?: string[];
    isAuction?: boolean;
    auctionDuration?: AuctionDurationKey;
  },
): Promise<{ ok?: boolean; error?: string; id?: string }> {
  const parsed = numberListingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const pr = await requirePartner();
  if ("error" in pr) return { error: pr.error };
  const partner = pr.partner;

  const supabase = await createClient();
  const digits = parsed.data.mobileNumber.replace(/\D/g, "").slice(-10);

  // Duplicate detection.
  const { data: dupe } = await supabase
    .from("numbers")
    .select("id")
    .eq("mobile_number", digits)
    .maybeSingle();
  if (dupe) return { error: "This number is already listed on the platform." };

  // Auction is opt-in and gated by the global toggle — re-checked server-side,
  // never trusted from the client. The clock doesn't start yet: the listing
  // isn't publicly visible until admin approval, so `reviewListing` is what
  // actually activates auction_status/auction_ends_at.
  let auctionDurationHours: number | null = null;
  if (input.isAuction && input.auctionDuration) {
    const admin = createAdminClient();
    const { data: settings } = await admin
      .from("platform_settings")
      .select("bidding_enabled")
      .eq("id", SETTINGS_ID)
      .maybeSingle();
    if (settings?.bidding_enabled) {
      auctionDurationHours = AUCTION_DURATION_HOURS[input.auctionDuration];
    }
  }

  const { data: created, error } = await supabase
    .from("numbers")
    .insert({
      partner_id: partner.id,
      mobile_number: digits,
      slug: numberSlug(digits),
      operator: parsed.data.operator,
      state: parsed.data.state || null,
      circle: parsed.data.circle || null,
      category_id: parsed.data.categoryId || null,
      selling_price: parsed.data.sellingPrice,
      description: parsed.data.description || null,
      status: "available",
      listing_status: "pending",
      starting_bid: auctionDurationHours ? parsed.data.sellingPrice : null,
      auction_duration_hours: auctionDurationHours,
    })
    .select("id")
    .single();

  if (error || !created) return { error: error?.message ?? "Could not create listing." };

  if (input.imageUrls?.length) {
    await supabase.from("number_images").insert(
      input.imageUrls.map((url, i) => ({
        number_id: created.id,
        url,
        sort_order: i,
      })),
    );
  }

  const adminIds = await getAdminIds();
  await notify(
    adminIds.map((id) => ({
      userId: id,
      type: "listing.new",
      title: "New listing pending approval",
      body: `${partner.business_name} listed ${digits}.`,
      link: "/admin/listings",
    })),
  );
  await audit({ actorId: partner.user_id, action: "listing.create", entityType: "number", entityId: created.id });

  revalidatePath("/partner/listings");
  return { ok: true, id: created.id };
}

export async function updateNumber(
  id: string,
  input: NumberListingInput,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = numberListingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  const pr = await requirePartner();
  if ("error" in pr) return { error: pr.error };

  const supabase = await createClient();
  const digits = parsed.data.mobileNumber.replace(/\D/g, "").slice(-10);

  const { error } = await supabase
    .from("numbers")
    .update({
      mobile_number: digits,
      slug: numberSlug(digits),
      operator: parsed.data.operator,
      state: parsed.data.state || null,
      circle: parsed.data.circle || null,
      category_id: parsed.data.categoryId || null,
      selling_price: parsed.data.sellingPrice,
      description: parsed.data.description || null,
      // Editing a listing re-queues it for approval.
      listing_status: "pending",
    })
    .eq("id", id)
    .eq("partner_id", pr.partner.id);

  if (error) return { error: error.message };
  revalidatePath("/partner/listings");
  return { ok: true };
}

export async function setNumberStatus(
  id: string,
  status: NumberStatus,
): Promise<{ ok?: boolean; error?: string }> {
  const pr = await requirePartner();
  if ("error" in pr) return { error: pr.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("numbers")
    .update({ status })
    .eq("id", id)
    .eq("partner_id", pr.partner.id);
  if (error) return { error: error.message };
  revalidatePath("/partner/listings");
  return { ok: true };
}

export async function changePrice(
  id: string,
  price: number,
): Promise<{ ok?: boolean; error?: string }> {
  const pr = await requirePartner();
  if ("error" in pr) return { error: pr.error };
  if (!price || price <= 0) return { error: "Enter a valid price." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("numbers")
    .update({ selling_price: Math.round(price) })
    .eq("id", id)
    .eq("partner_id", pr.partner.id);
  if (error) return { error: error.message };
  revalidatePath("/partner/listings");
  return { ok: true };
}

export async function deleteNumber(
  id: string,
): Promise<{ ok?: boolean; error?: string }> {
  const pr = await requirePartner();
  if ("error" in pr) return { error: pr.error };
  const supabase = await createClient();
  // Guard: cannot delete a number that has an active order.
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("number_id", id)
    .in("status", ["pending", "confirmed"]);
  if ((count ?? 0) > 0) {
    return { error: "Cannot delete — this number has active orders." };
  }
  const { error } = await supabase
    .from("numbers")
    .delete()
    .eq("id", id)
    .eq("partner_id", pr.partner.id);
  if (error) return { error: error.message };
  revalidatePath("/partner/listings");
  return { ok: true };
}

/** Bulk create from parsed CSV/Excel rows. Skips duplicates and invalid rows. */
export async function bulkCreateNumbers(
  rows: {
    mobileNumber: string;
    operator?: string;
    state?: string;
    circle?: string;
    sellingPrice: number;
    description?: string;
    categorySlug?: string;
  }[],
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const pr = await requirePartner();
  if ("error" in pr && pr.error) {
    return { inserted: 0, skipped: 0, errors: [pr.error] };
  }
  const partner = pr.partner!;
  const supabase = await createClient();

  const { data: categories } = await supabase.from("categories").select("id, slug");
  const catMap = new Map((categories ?? []).map((c) => [c.slug, c.id]));

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];
  const seen = new Set<string>();

  const valid: Record<string, unknown>[] = [];
  for (const row of rows) {
    const digits = String(row.mobileNumber ?? "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      skipped++;
      continue;
    }
    if (seen.has(digits)) {
      skipped++;
      continue;
    }
    seen.add(digits);
    const price = Math.round(Number(row.sellingPrice));
    if (!price || price <= 0) {
      skipped++;
      continue;
    }
    valid.push({
      partner_id: partner.id,
      mobile_number: digits,
      slug: digits,
      operator: row.operator || "Jio",
      state: row.state || null,
      circle: row.circle || null,
      category_id: row.categorySlug ? catMap.get(row.categorySlug) ?? null : null,
      selling_price: price,
      description: row.description || null,
      status: "available",
      listing_status: "pending",
    });
  }

  if (valid.length) {
    // Filter out numbers already present in the DB.
    const { data: existing } = await supabase
      .from("numbers")
      .select("mobile_number")
      .in(
        "mobile_number",
        valid.map((v) => v.mobile_number as string),
      );
    const existingSet = new Set((existing ?? []).map((e) => e.mobile_number));
    const toInsert = valid.filter((v) => !existingSet.has(v.mobile_number as string));
    skipped += valid.length - toInsert.length;

    if (toInsert.length) {
      const { error, count } = await supabase
        .from("numbers")
        .insert(toInsert, { count: "exact" });
      if (error) errors.push(error.message);
      else inserted = count ?? toInsert.length;
    }
  }

  revalidatePath("/partner/listings");
  return { inserted, skipped, errors };
}
