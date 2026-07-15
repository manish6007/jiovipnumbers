"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerRegistrationSchema, type PartnerRegistrationInput } from "@/lib/validators";
import { notify, audit, getAdminIds } from "@/lib/notifications";

/**
 * Complete partner registration for the currently signed-in (OTP-verified)
 * user: upgrades their role to 'partner' and creates a pending KYC record.
 */
export async function registerPartner(
  input: PartnerRegistrationInput,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = partnerRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid details" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please verify your mobile number first." };

  const admin = createAdminClient();

  // Already a partner?
  const { data: existing } = await admin
    .from("partners")
    .select("id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return { error: "You have already registered as a partner." };
  }

  // Upgrade role + set name.
  await admin
    .from("profiles")
    .update({ role: "partner", full_name: data.fullName })
    .eq("id", user.id);

  const { data: partner, error } = await admin
    .from("partners")
    .insert({
      user_id: user.id,
      business_name: data.businessName,
      gst_number: data.gstNumber || null,
      pan_number: data.panNumber || null,
      address: data.address,
      upi_id: data.upiId || null,
      bank_account_name: data.bankAccountName || null,
      bank_account_number: data.bankAccountNumber || null,
      bank_ifsc: data.bankIfsc || null,
      logo_url: data.logoUrl || null,
      photo_url: data.photoUrl || null,
      verification_status: "pending",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const adminIds = await getAdminIds();
  await notify(
    adminIds.map((id) => ({
      userId: id,
      type: "partner.new",
      title: "New partner registration",
      body: `${data.businessName} is awaiting KYC approval.`,
      link: "/admin/partners",
    })),
  );
  await audit({
    actorId: user.id,
    action: "partner.register",
    entityType: "partner",
    entityId: partner!.id,
  });

  revalidatePath("/partner");
  return { ok: true };
}
