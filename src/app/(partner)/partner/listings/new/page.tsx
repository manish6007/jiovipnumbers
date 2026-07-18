import { createClient } from "@/lib/supabase/server";
import { getPlatformSettings } from "@/app/actions/bids";
import { NumberForm } from "@/components/dashboard/number-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/types/database";

export const metadata = { title: "Add VIP Number" };

export default async function NewListingPage() {
  const supabase = await createClient();
  const [{ data }, settings] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    getPlatformSettings(),
  ]);
  const categories = (data as Category[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add VIP Number</h1>
        <p className="text-sm text-muted-foreground">
          New listings are reviewed by an admin before going live.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NumberForm categories={categories} biddingEnabled={settings.bidding_enabled} />
        </CardContent>
      </Card>
    </div>
  );
}
