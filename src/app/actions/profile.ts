"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";

export async function updateProfile(input: {
  fullName: string;
  email?: string;
  avatarUrl?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email || null,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return { ok: true };
}
