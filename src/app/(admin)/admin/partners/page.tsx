import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ReviewActions } from "@/components/dashboard/review-actions";
import { Card, CardContent } from "@/components/ui/card";
import { cn, timeAgo } from "@/lib/utils";
import type { Partner, Profile } from "@/types/database";

export const metadata = { title: "Manage Partners" };

const TABS = ["pending", "approved", "rejected", "all"] as const;

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("partners")
    .select("*, profile:profiles(full_name, phone, email)")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("verification_status", status);
  const { data } = await query;
  const partners = (data ?? []) as unknown as (Partner & {
    profile: Pick<Profile, "full_name" | "phone" | "email"> | null;
  })[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Partners</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/partners?status=${t}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              status === t
                ? "bg-primary text-primary-foreground"
                : "glass hover:text-primary",
            )}
          >
            {t}
          </Link>
        ))}
      </div>

      {partners.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            No {status !== "all" ? status : ""} partners.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{p.business_name}</p>
                    <StatusBadge status={p.verification_status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {p.profile?.full_name || "—"} · {p.contact_phone || p.profile?.phone || "—"}
                    {p.profile?.email ? ` · ${p.profile.email}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PAN {p.pan_number || "—"} · GST {p.gst_number || "—"} · UPI {p.upi_id || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bank {p.bank_account_number || "—"} ({p.bank_ifsc || "—"}) · Registered {timeAgo(p.created_at)}
                  </p>
                  {p.address && (
                    <p className="text-xs text-muted-foreground">Address: {p.address}</p>
                  )}
                </div>
                {p.verification_status === "pending" && (
                  <ReviewActions entity="partner" id={p.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
