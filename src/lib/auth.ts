import { createClient } from "@/lib/supabase/server";
import type { Profile, Partner } from "@/types/database";

/** Current auth user + profile (or nulls when signed out). */
export async function getCurrentUser(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { userId: user.id, profile: (profile as Profile) ?? null };
}

/** Partner record for the current user, if any. */
export async function getCurrentPartner(): Promise<Partner | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as Partner) ?? null;
}
