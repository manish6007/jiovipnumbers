import { createAdminClient } from "@/lib/supabase/admin";
import { BannerManager } from "@/components/dashboard/banner-manager";
import type { Banner } from "@/types/database";

export const metadata = { title: "Homepage Banners" };

export default async function AdminBannersPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("banners").select("*").order("sort_order");
  const banners = (data as Banner[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Homepage Banners</h1>
        <p className="text-sm text-muted-foreground">
          Manage hero banners shown on the storefront.
        </p>
      </div>
      <BannerManager banners={banners} />
    </div>
  );
}
