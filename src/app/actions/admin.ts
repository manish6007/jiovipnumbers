"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { commissionSchema } from "@/lib/validators";
import { notify, audit } from "@/lib/notifications";
import type { CommissionType, VerificationStatus, ListingStatus } from "@/types/database";

/** Guard: require an admin caller. */
async function requireAdmin() {
  const { profile } = await getCurrentUser();
  if (!profile || profile.role !== "admin") {
    return { error: "Admin access required." as const };
  }
  return { admin: profile };
}

export async function reviewPartner(
  partnerId: string,
  decision: VerificationStatus,
  reason?: string,
): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  const admin = createAdminClient();

  const { data: partner } = await admin
    .from("partners")
    .select("user_id, business_name")
    .eq("id", partnerId)
    .maybeSingle();
  if (!partner) return { error: "Partner not found." };

  await admin
    .from("partners")
    .update({ verification_status: decision, rejection_reason: reason || null })
    .eq("id", partnerId);

  await notify([
    {
      userId: partner.user_id as string,
      type: "partner.review",
      title: decision === "approved" ? "Partner account approved 🎉" : "Partner application rejected",
      body:
        decision === "approved"
          ? "You can now list VIP numbers."
          : reason || "Please contact support for details.",
      link: "/partner",
    },
  ]);
  await audit({
    actorId: guard.admin.id,
    action: `partner.${decision}`,
    entityType: "partner",
    entityId: partnerId,
  });

  revalidatePath("/admin/partners");
  return { ok: true };
}

export async function reviewListing(
  numberId: string,
  decision: ListingStatus,
  reason?: string,
): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  const admin = createAdminClient();

  const { data: number } = await admin
    .from("numbers")
    .select("mobile_number, partner:partners(user_id)")
    .eq("id", numberId)
    .maybeSingle();

  await admin
    .from("numbers")
    .update({ listing_status: decision, rejection_reason: reason || null })
    .eq("id", numberId);

  const partnerUserId = (number?.partner as { user_id?: string } | null)?.user_id;
  if (partnerUserId) {
    await notify([
      {
        userId: partnerUserId,
        type: "listing.review",
        title: decision === "approved" ? "Listing approved" : "Listing rejected",
        body: `Your number ${number?.mobile_number} was ${decision}.`,
        link: "/partner/listings",
      },
    ]);
  }
  await audit({
    actorId: guard.admin.id,
    action: `listing.${decision}`,
    entityType: "number",
    entityId: numberId,
  });

  revalidatePath("/admin/listings");
  return { ok: true };
}

export async function adminDeleteListing(
  numberId: string,
): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  const admin = createAdminClient();
  const { error } = await admin.from("numbers").delete().eq("id", numberId);
  if (error) return { error: error.message };
  await audit({ actorId: guard.admin.id, action: "listing.delete", entityType: "number", entityId: numberId });
  revalidatePath("/admin/listings");
  return { ok: true };
}

export async function updateCommission(input: {
  type: CommissionType;
  value: number;
}): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  const parsed = commissionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  if (parsed.data.type === "percentage" && parsed.data.value > 100) {
    return { error: "Percentage cannot exceed 100." };
  }

  const admin = createAdminClient();
  // Deactivate current, insert new active row (keeps history).
  await admin.from("commission_settings").update({ is_active: false }).eq("is_active", true);
  const { error } = await admin.from("commission_settings").insert({
    type: parsed.data.type,
    value: parsed.data.value,
    is_active: true,
    updated_by: guard.admin.id,
  });
  if (error) return { error: error.message };
  await audit({ actorId: guard.admin.id, action: "commission.update", metadata: parsed.data });
  revalidatePath("/admin/commission");
  return { ok: true };
}

export async function toggleBlockCustomer(
  userId: string,
  blocked: boolean,
): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ is_blocked: blocked }).eq("id", userId);
  if (error) return { error: error.message };
  await audit({
    actorId: guard.admin.id,
    action: blocked ? "customer.block" : "customer.unblock",
    entityType: "profile",
    entityId: userId,
  });
  revalidatePath("/admin/customers");
  return { ok: true };
}

// ----- Banners -----
export async function saveBanner(input: {
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  if (!input.imageUrl) return { error: "Banner image is required." };
  const admin = createAdminClient();
  const payload = {
    title: input.title || null,
    subtitle: input.subtitle || null,
    image_url: input.imageUrl,
    link_url: input.linkUrl || null,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
  };
  const { error } = input.id
    ? await admin.from("banners").update(payload).eq("id", input.id)
    : await admin.from("banners").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<{ ok?: boolean; error?: string }> {
  const guard = await requireAdmin();
  if ("error" in guard) return { error: guard.error };
  const admin = createAdminClient();
  const { error } = await admin.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  return { ok: true };
}
