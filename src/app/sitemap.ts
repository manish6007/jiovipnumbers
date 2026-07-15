import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jiovipnumber.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/register/partner",
    "/login",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Approved listings (best-effort; skipped if Supabase isn't configured).
  let numberRoutes: MetadataRoute.Sitemap = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("numbers")
      .select("slug, updated_at")
      .eq("listing_status", "approved")
      .neq("status", "paused")
      .limit(5000);
    numberRoutes = (data ?? []).map((n) => ({
      url: `${siteUrl}/number/${n.slug}`,
      lastModified: new Date(n.updated_at as string),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // no-op when SUPABASE_SERVICE_ROLE_KEY is absent (e.g. at build time)
  }

  return [...staticRoutes, ...numberRoutes];
}
