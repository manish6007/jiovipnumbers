"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(
  numberId: string,
): Promise<{ saved?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("customer_id", user.id)
    .eq("number_id", numberId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("wishlist").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/wishlist");
    return { saved: false };
  }

  const { error } = await supabase
    .from("wishlist")
    .insert({ customer_id: user.id, number_id: numberId });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/wishlist");
  return { saved: true };
}

/** Set of number ids the current user has wishlisted (for card state). */
export async function getWishlistIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("wishlist")
    .select("number_id")
    .eq("customer_id", user.id);
  return new Set((data ?? []).map((r) => r.number_id as string));
}
