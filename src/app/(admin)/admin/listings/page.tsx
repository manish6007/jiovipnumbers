import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlatformSettings } from "@/app/actions/bids";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ReviewActions } from "@/components/dashboard/review-actions";
import { AdminListingDelete } from "@/components/dashboard/admin-listing-delete";
import { AuctionControls } from "@/components/dashboard/auction-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatINR, formatMobile, timeAgo } from "@/lib/utils";
import type { VipNumber, Partner } from "@/types/database";

export const metadata = { title: "Manage Listings" };

const TABS = ["pending", "approved", "rejected", "all"] as const;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("numbers")
    .select("*, partner:partners(business_name, verification_status)")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("listing_status", status);
  const [{ data }, settings] = await Promise.all([query, getPlatformSettings()]);

  const numbers = (data ?? []) as unknown as (VipNumber & {
    partner: Pick<Partner, "business_name" | "verification_status"> | null;
  })[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Listings</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/listings?status=${t}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              status === t ? "bg-primary text-primary-foreground" : "glass hover:text-primary",
            )}
          >
            {t}
          </Link>
        ))}
      </div>

      {numbers.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            No {status !== "all" ? status : ""} listings.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {numbers.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/number/${n.slug}`}
                      className="vip-number text-lg font-bold hover:text-primary"
                    >
                      {formatMobile(n.mobile_number)}
                    </Link>
                    <StatusBadge status={n.listing_status} />
                    <StatusBadge status={n.status} />
                  </div>
                  <p className="text-sm font-semibold gradient-text">
                    {n.auction_status === "active"
                      ? `Current bid ${formatINR(n.current_bid ?? n.starting_bid ?? 0)} · ${n.bid_count} bids`
                      : formatINR(n.selling_price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {n.partner?.business_name || "—"} · {n.operator} ·{" "}
                    {n.circle || "—"} · {timeAgo(n.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {n.listing_status === "pending" && (
                    <ReviewActions entity="listing" id={n.id} />
                  )}
                  {settings.bidding_enabled && n.listing_status === "approved" && (
                    <AuctionControls
                      numberId={n.id}
                      isAuctionActive={n.auction_status === "active"}
                      fallbackPrice={n.selling_price}
                    />
                  )}
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/number/${n.slug}`}>View</Link>
                  </Button>
                  <AdminListingDelete id={n.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
